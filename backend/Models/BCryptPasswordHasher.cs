using Microsoft.AspNetCore.Identity;

namespace Online_Quiz_Platform.Models
{
    public class BCryptPasswordHasher : IPasswordHasher<ApplicationUser>
    {
        public string HashPassword(ApplicationUser user, string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public PasswordVerificationResult VerifyHashedPassword(ApplicationUser user, string hashedPassword, string providedPassword)
        {
            try
            {
                if (BCrypt.Net.BCrypt.Verify(providedPassword, hashedPassword))
                {
                    return PasswordVerificationResult.Success;
                }
            }
            catch
            {
                return PasswordVerificationResult.Failed;
            }
            return PasswordVerificationResult.Failed;
        }
    }
}
