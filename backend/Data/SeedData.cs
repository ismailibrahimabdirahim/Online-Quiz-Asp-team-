// Migration commands are run via Package Manager Console, not inside code
using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var context = new AppDbContext(
                serviceProvider.GetRequiredService<DbContextOptions<AppDbContext>>());

            // Ensure database is created/migrated
            await context.Database.MigrateAsync();

            // Seed Roles if empty
            if (!await context.Roles.AnyAsync())
            {
                await context.Roles.AddRangeAsync(
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "Teacher" },
                    new Role { RoleName = "Student" }
                );
                await context.SaveChangesAsync();
            }

            // Seed Admin User (upsert – always ensure correct password hash)
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
            if (adminRole != null)
            {
                var adminEmail = "admin@quizmaster.com";
                var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);

                if (adminUser == null)
                {
                    // Create fresh admin
                    adminUser = new User
                    {
                        FullName = "QuizMaster Admin",
                        Email = adminEmail,
                        RoleId = adminRole.RoleId,
                        CreatedAt = DateTime.UtcNow
                    };
                    adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
                    await context.Users.AddAsync(adminUser);
                }
                else
                {
                    // Always re-hash to ensure password is correct
                    adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
                    context.Users.Update(adminUser);
                }
                await context.SaveChangesAsync();
            }

            // Ensure every admin-created teacher has a Teachers profile row
            var teacherRole = await context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Teacher");
            if (teacherRole != null)
            {
                var usersMissingProfile = await context.Users
                    .Where(u => u.RoleId == teacherRole.RoleId &&
                                !context.Teachers.Any(t => t.UserId == u.UserId))
                    .Select(u => u.UserId)
                    .ToListAsync();

                if (usersMissingProfile.Count > 0)
                {
                    foreach (var userId in usersMissingProfile)
                    {
                        await context.Teachers.AddAsync(new Teacher { UserId = userId });
                    }
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
