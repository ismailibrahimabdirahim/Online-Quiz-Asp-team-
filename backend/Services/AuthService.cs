using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<bool> RegisterStudentAsync(RegisterDto dto)
        {
            try
            {
                var existingUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
                if (existingUser) return false;

                var studentRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Student");
                if (studentRole == null)
                    throw new Exception("Student role not found in the database. Please contact the admin.");

                var user = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    RoleId = studentRole.RoleId,
                    CreatedAt = DateTime.UtcNow
                };
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                // Auto-generate registration number if not provided
                var regNumber = string.IsNullOrWhiteSpace(dto.RegistrationNumber)
                    ? $"STU-{DateTime.UtcNow:yyyyMMdd}-{user.UserId:D4}"
                    : dto.RegistrationNumber;

                var student = new Student
                {
                    UserId = user.UserId,
                    RegistrationNumber = regNumber
                };

                await _context.Students.AddAsync(student);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.InnerException?.Message ?? ex.Message);
            }
        }

        public async Task<bool> CreateTeacherAsync(CreateTeacherDto dto)
        {
            try
            {
                var existingUser = await _context.Users.AnyAsync(u => u.Email == dto.Email);
                if (existingUser) return false;

                var teacherRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Teacher");
                if (teacherRole == null) return false;

                var user = new User
                {
                    FullName = string.IsNullOrWhiteSpace(dto.FullName) ? dto.Email.Split('@')[0] : dto.FullName,
                    Email = dto.Email,
                    RoleId = teacherRole.RoleId,
                    CreatedAt = DateTime.UtcNow
                };
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                var teacher = new Teacher { UserId = user.UserId };
                await _context.Teachers.AddAsync(teacher);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                // Re-throw so controller can surface the real error
                throw new InvalidOperationException($"Teacher creation failed: {ex.InnerException?.Message ?? ex.Message}", ex);
            }
        }

        public async Task<User?> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null) return null;

            var isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isValid) return null;

            return user;
        }
    }
}
