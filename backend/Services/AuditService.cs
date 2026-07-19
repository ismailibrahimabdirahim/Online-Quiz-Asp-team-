using Online_Quiz_Platform.Models;
using Online_Quiz_Platform.Repositories;

namespace Online_Quiz_Platform.Services
{
    public class AuditService : IAuditService
    {
        private readonly IAuditLogRepository _auditLogRepository;

        public AuditService(IAuditLogRepository auditLogRepository)
        {
            _auditLogRepository = auditLogRepository;
        }

        public async Task LogActivityAsync(int? userId, string action, string ipAddress)
        {
            var log = new AuditLog
            {
                UserId = userId,
                Action = action,
                IPAddress = ipAddress,
                Timestamp = DateTime.UtcNow
            };

            await _auditLogRepository.AddAsync(log);
            await _auditLogRepository.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetRecentLogsAsync(int count)
        {
            return await _auditLogRepository.GetRecentLogsAsync(count);
        }

        public async Task ClearAllLogsAsync()
        {
            await _auditLogRepository.ClearAllLogsAsync();
        }

        public async Task DeleteLogAsync(int id)
        {
            var log = await _auditLogRepository.GetByIdAsync(id);
            if (log != null)
            {
                _auditLogRepository.Remove(log);
                await _auditLogRepository.SaveChangesAsync();
            }
        }
    }
}
