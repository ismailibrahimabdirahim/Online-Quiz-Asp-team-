using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Repositories
{
    public interface IAuditLogRepository : IRepository<AuditLog>
    {
        Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count);
        Task<IEnumerable<AuditLog>> GetLogsByUserIdAsync(int userId);
        Task ClearAllLogsAsync();
    }
}
