using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Services
{
    public interface IAuditService
    {
        Task LogActivityAsync(int? userId, string action, string ipAddress);
        Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count);
        Task ClearAllLogsAsync();
        Task DeleteLogAsync(int id);
    }
}
