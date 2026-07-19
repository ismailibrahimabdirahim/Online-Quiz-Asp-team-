using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Services;

namespace Online_Quiz_Platform.Controllers
{
    /// <summary>
    /// Handles user authentication: register, login, logout, and profile management.
    /// All endpoints return JSON for the React frontend to consume.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IAuditService _auditService;
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public AuthController(IAuthService authService, IAuditService auditService, AppDbContext context, IWebHostEnvironment env)
        {
            _authService = authService;
            _auditService = auditService;
            _context = context;
            _env = env;
        }

        /// <summary>
        /// Register a new student account.
        /// </summary>
        [HttpPost("register")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var success = await _authService.RegisterStudentAsync(dto);
                if (!success)
                    return BadRequest(new { message = "Email already in use. Please use a different email." });
                await _auditService.LogActivityAsync(null, $"User Registered: {dto.Email}", Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");
                return Ok(new { message = "Registration successful." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Login with email and password. Sets an authentication cookie.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _authService.LoginAsync(dto);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Student")
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                new AuthenticationProperties { IsPersistent = true, ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7) }
            );

            await _auditService.LogActivityAsync(null, $"User Logged In: {dto.Email}", Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");

            return Ok(new
            {
                message = "Logged in successfully",
                role = user.Role?.RoleName ?? "Student",
                fullName = user.FullName,
                email = user.Email,
                avatarUrl = user.AvatarUrl
            });
        }

        /// <summary>
        /// Logout the current user and clear the authentication cookie.
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully." });
        }

        /// <summary>
        /// Get the currently authenticated user's profile info.
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUserProfile()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdStr));

            return Ok(new
            {
                userId = int.Parse(userIdStr),
                fullName = User.FindFirst(ClaimTypes.Name)?.Value,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                role = User.FindFirst(ClaimTypes.Role)?.Value,
                avatarUrl = user?.AvatarUrl
            });
        }

        /// <summary>
        /// Update the current user's profile (name and/or email).
        /// </summary>
        [HttpPut("profile")]
        [Authorize]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            // Check email uniqueness if changed
            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                var emailTaken = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.UserId != userId);
                if (emailTaken) return BadRequest(new { message = "That email address is already taken." });
                user.Email = dto.Email;
            }

            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName;

            await _context.SaveChangesAsync();

            // Re-sign the cookie so claims update
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "Student";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity),
                new AuthenticationProperties { IsPersistent = true, ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7) }
            );

            await _auditService.LogActivityAsync(userId, $"User updated profile: {user.Email}", Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");

            return Ok(new { message = "Profile updated successfully.", fullName = user.FullName, email = user.Email, avatarUrl = user.AvatarUrl });
        }

        /// <summary>
        /// Get CSRF token for frontend forms.
        /// </summary>
        [HttpGet("csrf-token")]
        public IActionResult GetCsrfToken([FromServices] IAntiforgery antiforgery)
        {
            var tokens = antiforgery.GetAndStoreTokens(HttpContext);
            return Ok(new { token = tokens.RequestToken, headerName = "X-CSRF-TOKEN" });
        }

        /// <summary>
        /// Upload a profile picture.
        /// </summary>
        [HttpPost("profile/avatar")]
        [Authorize]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            if (file.Length > 5 * 1024 * 1024) // 5MB limit
                return BadRequest(new { message = "File size exceeds 5MB limit." });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only JPG, PNG, and WebP are allowed." });

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User not found." });

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"avatar_{userId}_{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Delete old avatar if it exists (and is in the uploads folder)
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                try
                {
                    var oldFileName = Path.GetFileName(user.AvatarUrl);
                    var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
                catch (Exception) { /* Ignore deletion errors */ }
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var avatarUrl = $"/uploads/avatars/{fileName}";
            user.AvatarUrl = avatarUrl;
            await _context.SaveChangesAsync();

            await _auditService.LogActivityAsync(userId, "User uploaded a new profile picture.", Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown");

            return Ok(new { message = "Avatar uploaded successfully.", avatarUrl = avatarUrl });
        }
    }
}
