using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Models;
using Online_Quiz_Platform.Services;

namespace Online_Quiz_Platform.Controllers
{
    /// <summary>
    /// Admin API endpoints: dashboard stats, teacher/student management,
    /// quiz oversight, results, audit logs, and platform settings.
    /// </summary>
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly IAuthService _authService;
        private readonly IAuditService _auditService;
        private readonly AppDbContext _context;

        public AdminController(IQuizService quizService, IAuthService authService, IAuditService auditService, AppDbContext context)
        {
            _quizService = quizService;
            _authService = authService;
            _auditService = auditService;
            _context = context;
        }

        /// <summary>
        /// Get admin dashboard statistics (total users, quizzes, attempts, etc.).
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _quizService.GetAdminDashboardStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Get list of all teachers.
        /// </summary>
        [HttpGet("teachers")]
        public async Task<IActionResult> GetTeachersList()
        {
            var teachers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role != null && u.Role.RoleName == "Teacher")
                .Select(u => new
                {
                    u.UserId,
                    u.FullName,
                    u.Email,
                    CreatedAt = u.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                })
                .ToListAsync();

            return Ok(teachers);
        }

        /// <summary>
        /// Create a new teacher account.
        /// </summary>
        [HttpPost("create-teacher")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _authService.CreateTeacherAsync(dto);
                if (!success)
                {
                    return BadRequest(new { message = "Email already in use or Teacher role not found in database." });
                }

                var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                try
                {
                    await _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, $"Admin Created Teacher: {dto.Email}", ip);
                }
                catch { /* Ignore audit failure so we still return Ok */ }

                return Ok(new { message = "Teacher account created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a teacher by user ID.
        /// </summary>
        [HttpDelete("delete-teacher/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            // Load user + teacher + quizzes
            var user = await _context.Users
                .Include(u => u.Teacher)
                .ThenInclude(t => t!.Quizzes!)
                    .ThenInclude(q => q.Questions)
                        .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null) return NotFound(new { message = "Teacher not found." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (user.Teacher != null && user.Teacher.Quizzes != null && user.Teacher.Quizzes.Any())
                {
                    var quizIds = user.Teacher.Quizzes.Select(q => q.QuizId).ToList();

                    // Step 1: Delete QuizAttempts (has Restrict on Quiz)
                    var attempts = _context.QuizAttempts.Where(a => quizIds.Contains(a.QuizId));
                    _context.QuizAttempts.RemoveRange(attempts);
                    await _context.SaveChangesAsync();

                    // Step 2: Delete Results (has Restrict on Quiz)
                    var results = _context.Results.Where(r => quizIds.Contains(r.QuizId));
                    _context.Results.RemoveRange(results);
                    await _context.SaveChangesAsync();

                    // Step 3: Delete Options inside each Question
                    foreach (var quiz in user.Teacher.Quizzes)
                    {
                        foreach (var question in quiz.Questions ?? new List<Question>())
                        {
                            _context.Options.RemoveRange(question.Options ?? new List<Option>());
                        }
                    }
                    await _context.SaveChangesAsync();

                    // Step 4: Delete Questions
                    foreach (var quiz in user.Teacher.Quizzes)
                    {
                        _context.Questions.RemoveRange(quiz.Questions ?? new List<Question>());
                    }
                    await _context.SaveChangesAsync();

                    // Step 5: Delete the Quizzes themselves
                    _context.Quizzes.RemoveRange(user.Teacher.Quizzes);
                    await _context.SaveChangesAsync();
                }

                // Step 6: Delete AuditLogs BEFORE touching Teacher/User (cascade would trigger FK violation)
                var auditLogs = _context.AuditLogs.Where(a => a.UserId == user.UserId);
                _context.AuditLogs.RemoveRange(auditLogs);
                await _context.SaveChangesAsync();

                // Step 7: Delete the Teacher profile (must be before User due to FK)
                if (user.Teacher != null)
                {
                    _context.Teachers.Remove(user.Teacher);
                    await _context.SaveChangesAsync();
                }

                // Step 7.5: Delete RefreshTokens
                var tokens = _context.RefreshTokens.Where(t => t.UserId == user.UserId);
                _context.RefreshTokens.RemoveRange(tokens);
                await _context.SaveChangesAsync();

                // Step 8: Delete the User
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                await _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, $"Admin Deleted Teacher: {user.Email}", ip);

                return Ok(new { message = "Teacher deleted successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Delete failed: {ex.InnerException?.Message ?? ex.Message}" });
            }
        }

        /// <summary>
        /// Delete a student by user ID.
        /// </summary>
        [HttpDelete("delete-student/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null) return NotFound(new { message = "User not found." });

            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == id);
            if (student == null) return BadRequest(new { message = "User is not a student." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Step 1: Delete QuizAttempts
                var attempts = _context.QuizAttempts.Where(qa => qa.StudentId == student.StudentId);
                _context.QuizAttempts.RemoveRange(attempts);

                // Step 2: Delete Results
                var results = _context.Results.Where(r => r.StudentId == student.StudentId);
                _context.Results.RemoveRange(results);

                // Step 3: Delete AuditLogs BEFORE touching Student/User
                var logs = _context.AuditLogs.Where(a => a.UserId == user.UserId);
                _context.AuditLogs.RemoveRange(logs);

                // Step 3.5: Delete RefreshTokens
                var tokens = _context.RefreshTokens.Where(t => t.UserId == user.UserId);
                _context.RefreshTokens.RemoveRange(tokens);

                // Step 4: Delete the Student profile
                _context.Students.Remove(student);

                // Step 5: Delete the User
                _context.Users.Remove(user);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                await _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, $"Admin Deleted Student: {user.Email}", ip);

                return Ok(new { message = "Student deleted successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Delete failed: {ex.InnerException?.Message ?? ex.Message}" });
            }
        }

        /// <summary>
        /// Get list of all students.
        /// </summary>
        [HttpGet("students")]
        public async Task<IActionResult> GetStudentsList()
        {
            var students = await _context.Students
                .Include(s => s.User)
                .Select(s => new
                {
                    s.StudentId,
                    UserId = s.UserId,
                    FullName = s.User != null ? s.User.FullName : "Student",
                    Email = s.User != null ? s.User.Email : "Unknown",
                    s.RegistrationNumber,
                    CreatedAt = s.User != null ? s.User.CreatedAt.ToString("yyyy-MM-dd") : "—"
                })
                .ToListAsync();
            return Ok(students);
        }

        /// <summary>
        /// Get all quizzes across all teachers.
        /// </summary>
        [HttpGet("quizzes")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var quizzes = await _quizService.GetAllQuizzesAsync();
            var data = quizzes.Select(q => new
            {
                q.QuizId,
                q.Title,
                q.Duration,
                q.Status,
                CreatedAt = q.CreatedAt.ToString("yyyy-MM-dd"),
                TeacherName = q.Teacher?.User?.FullName ?? "Unknown",
                QuestionsCount = q.Questions?.Count ?? 0
            });
            return Ok(data);
        }

        /// <summary>
        /// Delete a quiz by ID (admin override — any quiz).
        /// </summary>
        [HttpDelete("delete-quiz/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var success = await _quizService.DeleteQuizAsync(id, null);
            if (!success)
            {
                return BadRequest(new { message = "Quiz not found or could not be deleted." });
            }

            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, $"Admin Deleted Quiz ID: {id}", ip);

            return Ok(new { message = "Quiz deleted successfully." });
        }

        /// <summary>
        /// Get all student results across all quizzes.
        /// </summary>
        [HttpGet("results")]
        public async Task<IActionResult> GetAllResults()
        {
            var results = await _context.Results
                .Include(r => r.Student)
                .ThenInclude(s => s!.User)
                .Include(r => r.Quiz)
                .OrderByDescending(r => r.ResultId)
                .Select(r => new
                {
                    r.ResultId,
                    StudentName = r.Student != null && r.Student.User != null ? r.Student.User.FullName : "Student",
                    RegNum = r.Student != null && r.Student.User != null ? r.Student.User.Email : "Unknown",
                    QuizTitle = r.Quiz != null ? r.Quiz.Title : "Quiz",
                    r.Percentage,
                    r.Grade,
                    AttemptedAt = "N/A"
                })
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// Get the global student leaderboard.
        /// </summary>
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var leaderboard = await _quizService.GetGlobalLeaderboardAsync();
            return Ok(leaderboard);
        }

        /// <summary>
        /// Get recent audit logs.
        /// </summary>
        [HttpGet("logs")]
        public async Task<IActionResult> GetAuditLogs()
        {
            var logs = await _auditService.GetRecentLogsAsync(100);
            var logsData = logs.Select(a => new
            {
                a.Id,
                User = a.User != null ? a.User.FullName : "System",
                a.Action,
                Timestamp = a.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                a.IPAddress
            });
            return Ok(logsData);
        }

        /// <summary>
        /// Clear all audit logs.
        /// </summary>
        [HttpDelete("logs/clear")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> ClearAuditLogs()
        {
            await _auditService.ClearAllLogsAsync();

            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, "Admin Cleared All Audit Logs", ip);

            return Ok(new { message = "All audit logs cleared successfully." });
        }

        /// <summary>
        /// Delete a single audit log.
        /// </summary>
        [HttpDelete("logs/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteAuditLog(int id)
        {
            await _auditService.DeleteLogAsync(id);

            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, $"Admin Deleted Audit Log #{id}", ip);

            return Ok(new { message = "Audit log deleted successfully." });
        }

        private static readonly string SettingsFilePath = Path.Combine(Directory.GetCurrentDirectory(), "platform-settings.json");

        /// <summary>
        /// Get platform settings.
        /// </summary>
        [HttpGet("settings")]
        public IActionResult GetSettings()
        {
            try
            {
                if (!System.IO.File.Exists(SettingsFilePath))
                {
                    var defaults = new { studentReg = true, publicLb = true, maintenance = false };
                    System.IO.File.WriteAllText(SettingsFilePath, System.Text.Json.JsonSerializer.Serialize(defaults));
                    return Ok(defaults);
                }
                var json = System.IO.File.ReadAllText(SettingsFilePath);
                var settings = System.Text.Json.JsonSerializer.Deserialize<object>(json);
                return Ok(settings);
            }
            catch { return Ok(new { studentReg = true, publicLb = true, maintenance = false }); }
        }

        /// <summary>
        /// Update platform settings.
        /// </summary>
        [HttpPut("settings")]
        [AutoValidateAntiforgeryToken]
        public IActionResult UpdateSettings([FromBody] System.Text.Json.JsonElement dto)
        {
            try
            {
                System.IO.File.WriteAllText(SettingsFilePath, dto.ToString());
                var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                _ = _auditService.LogActivityAsync(adminId != null ? int.Parse(adminId) : null, "Admin Updated Platform Settings", ip);
                return Ok(new { message = "Settings saved." });
            }
            catch (Exception ex) { return StatusCode(500, new { message = ex.Message }); }
        }
    }
}
