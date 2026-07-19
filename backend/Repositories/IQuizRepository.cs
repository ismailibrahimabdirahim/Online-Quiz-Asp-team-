using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Repositories
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        Task<Quiz?> GetQuizWithDetailsAsync(int quizId);
        Task<IEnumerable<Quiz>> GetPublishedQuizzesAsync();
        Task<IEnumerable<Quiz>> GetQuizzesByTeacherIdAsync(int teacherId);
    }
}
