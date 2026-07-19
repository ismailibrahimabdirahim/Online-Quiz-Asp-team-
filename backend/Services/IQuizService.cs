using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Models;

namespace Online_Quiz_Platform.Services
{
    public interface IQuizService
    {
        // Quiz Management
        Task<Quiz?> CreateQuizAsync(CreateQuizDto dto, int teacherId);
        Task<bool> EditQuizAsync(int quizId, CreateQuizDto dto, int teacherId);
        Task<bool> DeleteQuizAsync(int quizId, int? teacherId = null); // if teacherId is null, it's admin deleting
        Task<bool> ChangeQuizStatusAsync(int quizId, string status, int teacherId);
        Task<Quiz?> GetQuizWithDetailsAsync(int quizId);
        Task<IEnumerable<Quiz>> GetAllQuizzesAsync();
        Task<IEnumerable<Quiz>> GetTeacherQuizzesAsync(int teacherId);
        Task<IEnumerable<Quiz>> GetAvailableQuizzesAsync();

        // Question Management
        Task<Question?> AddQuestionAsync(int quizId, CreateQuestionDto dto);
        Task<bool> EditQuestionAsync(int questionId, CreateQuestionDto dto);
        Task<bool> DeleteQuestionAsync(int questionId);

        // Quiz Engine & Auto-Grading
        Task<QuizAttempt?> StartAttemptAsync(int quizId, int studentId);
        Task<bool> SaveAnswerAsync(int attemptId, int questionId, int selectedOptionId, int studentId);
        Task<IEnumerable<QuizAttemptAnswer>> GetSavedAnswersAsync(int attemptId);
        Task<QuizResultDto?> SubmitAttemptAsync(int attemptId, QuizSubmitDto dto, int studentId);
        Task<IEnumerable<QuizAttempt>> GetStudentAttemptsAsync(int studentId);
        Task<IEnumerable<Result>> GetStudentResultsAsync(int studentId);
        Task<IEnumerable<Result>> GetQuizResultsAsync(int quizId);
        Task<object> GetTeacherAttemptsAsync(int teacherUserId);
        Task<object> GetTeacherAllResultsAsync(int teacherUserId);

        // Stats & Dashboard
        Task<object> GetAdminDashboardStatsAsync();
        Task<object> GetTeacherDashboardStatsAsync(int teacherId);
        Task<object> GetStudentDashboardStatsAsync(int studentId);
        Task<object> GetGlobalLeaderboardAsync();
    }
}
