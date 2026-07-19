using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Services
{
    public interface IAuthService
    {
        Task<bool> RegisterStudentAsync(RegisterDto dto);
        Task<bool> CreateTeacherAsync(CreateTeacherDto dto);
        Task<User?> LoginAsync(LoginDto dto);
    }
}
