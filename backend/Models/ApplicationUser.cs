using Microsoft.AspNetCore.Identity;

namespace Online_Quiz_Platform.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string FullName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? RegistrationNumber { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Teacher? Teacher { get; set; }
        public Student? Student { get; set; }
    }
}
