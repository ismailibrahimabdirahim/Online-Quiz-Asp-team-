using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Repositories
{
    public class QuizRepository : Repository<Quiz>, IQuizRepository
    {
        public QuizRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Quiz?> GetQuizWithDetailsAsync(int quizId)
        {
            return await _context.Quizzes
                .Include(q => q.Teacher)
                .ThenInclude(t => t!.User)
                .Include(q => q.Questions)
                .ThenInclude(qu => qu.Options)
                .FirstOrDefaultAsync(q => q.QuizId == quizId);
        }

        public async Task<IEnumerable<Quiz>> GetPublishedQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.Teacher)
                .ThenInclude(t => t!.User)
                .Where(q => q.Status == "Published")
                .ToListAsync();
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByTeacherIdAsync(int teacherId)
        {
            return await _context.Quizzes
                .Include(q => q.Questions)
                .Where(q => q.TeacherId == teacherId)
                .ToListAsync();
        }
    }
}
