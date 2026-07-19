using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Models;
using Online_Quiz_Platform.Repositories;

namespace Online_Quiz_Platform.Services
{
    public class QuizService : IQuizService
    {
        private readonly AppDbContext _context;
        private readonly IQuizRepository _quizRepository;

        public QuizService(AppDbContext context, IQuizRepository quizRepository)
        {
            _context = context;
            _quizRepository = quizRepository;
        }

        public async Task<Quiz?> CreateQuizAsync(CreateQuizDto dto, int teacherId)
        {
            var quiz = new Quiz
            {
                TeacherId = teacherId,
                Title = dto.Title,
                Description = dto.Description,
                Duration = dto.Duration,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow
            };

            await _context.Quizzes.AddAsync(quiz);
            await _context.SaveChangesAsync();
            return quiz;
        }

        public async Task<bool> EditQuizAsync(int quizId, CreateQuizDto dto, int teacherId)
        {
            var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.QuizId == quizId && q.TeacherId == teacherId);
            if (quiz == null) return false;

            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.Duration = dto.Duration;

            _context.Quizzes.Update(quiz);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuizAsync(int quizId, int? teacherId = null)
        {
            var query = _context.Quizzes.AsQueryable();
            if (teacherId.HasValue)
            {
                query = query.Where(q => q.TeacherId == teacherId.Value);
            }

            var quiz = await query.FirstOrDefaultAsync(q => q.QuizId == quizId);
            if (quiz == null) return false;

            // Delete Restricted relationships first
            var attempts = _context.QuizAttempts.Where(a => a.QuizId == quiz.QuizId);
            _context.QuizAttempts.RemoveRange(attempts);

            var results = _context.Results.Where(r => r.QuizId == quiz.QuizId);
            _context.Results.RemoveRange(results);

            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangeQuizStatusAsync(int quizId, string status, int teacherId)
        {
            var quiz = await _context.Quizzes.FirstOrDefaultAsync(q => q.QuizId == quizId && q.TeacherId == teacherId);
            if (quiz == null) return false;

            quiz.Status = status;
            _context.Quizzes.Update(quiz);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Quiz?> GetQuizWithDetailsAsync(int quizId)
        {
            return await _quizRepository.GetQuizWithDetailsAsync(quizId);
        }

        public async Task<IEnumerable<Quiz>> GetAllQuizzesAsync()
        {
            return await _context.Quizzes
                .Include(q => q.Teacher)
                .ThenInclude(t => t!.User)
                .Include(q => q.Questions)
                .OrderByDescending(q => q.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Quiz>> GetTeacherQuizzesAsync(int teacherId)
        {
            return await _quizRepository.GetQuizzesByTeacherIdAsync(teacherId);
        }

        public async Task<IEnumerable<Quiz>> GetAvailableQuizzesAsync()
        {
            return await _quizRepository.GetPublishedQuizzesAsync();
        }

        public async Task<Question?> AddQuestionAsync(int quizId, CreateQuestionDto dto)
        {
            var quiz = await _context.Quizzes.FindAsync(quizId);
            if (quiz == null) return null;

            var question = new Question
            {
                QuizId = quizId,
                QuestionText = dto.QuestionText,
                QuestionType = dto.QuestionType,
                Marks = dto.Marks
            };

            await _context.Questions.AddAsync(question);
            await _context.SaveChangesAsync();

            foreach (var opt in dto.Options)
            {
                var option = new Option
                {
                    QuestionId = question.QuestionId,
                    OptionText = opt.OptionText,
                    IsCorrect = opt.IsCorrect
                };
                await _context.Options.AddAsync(option);
            }

            await _context.SaveChangesAsync();
            return question;
        }

        public async Task<bool> EditQuestionAsync(int questionId, CreateQuestionDto dto)
        {
            var question = await _context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.QuestionId == questionId);

            if (question == null) return false;

            question.QuestionText = dto.QuestionText;
            question.QuestionType = dto.QuestionType;
            question.Marks = dto.Marks;

            // Remove existing options and add new ones
            _context.Options.RemoveRange(question.Options);

            foreach (var opt in dto.Options)
            {
                var option = new Option
                {
                    QuestionId = question.QuestionId,
                    OptionText = opt.OptionText,
                    IsCorrect = opt.IsCorrect
                };
                await _context.Options.AddAsync(option);
            }

            _context.Questions.Update(question);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteQuestionAsync(int questionId)
        {
            var question = await _context.Questions.FindAsync(questionId);
            if (question == null) return false;

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<QuizAttempt?> StartAttemptAsync(int quizId, int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == studentId);
            if (student == null) return null;

            var quiz = await _context.Quizzes.FindAsync(quizId);
            if (quiz == null || quiz.Status != "Published") return null;

            // Check if already completely finished
            var alreadyCompleted = await _context.Results
                .AnyAsync(r => r.StudentId == student.StudentId && r.QuizId == quizId);
            if (alreadyCompleted) return null;

            // Check for existing incomplete attempt (Resume logic)
            var existingAttempt = await _context.QuizAttempts
                .FirstOrDefaultAsync(a => a.StudentId == student.StudentId && a.QuizId == quizId && a.EndTime == null);
            
            if (existingAttempt != null)
            {
                return existingAttempt;
            }

            // Create new attempt if no incomplete one exists
            var attempt = new QuizAttempt
            {
                StudentId = student.StudentId,
                QuizId = quizId,
                StartTime = DateTime.UtcNow,
                Score = 0
            };

            await _context.QuizAttempts.AddAsync(attempt);
            await _context.SaveChangesAsync();
            return attempt;
        }

        public async Task<bool> SaveAnswerAsync(int attemptId, int questionId, int selectedOptionId, int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == studentId);
            if (student == null) return false;

            var attempt = await _context.QuizAttempts.FindAsync(attemptId);
            if (attempt == null || attempt.StudentId != student.StudentId || attempt.EndTime != null) return false;

            var existingAnswer = await _context.QuizAttemptAnswers
                .FirstOrDefaultAsync(a => a.AttemptId == attemptId && a.QuestionId == questionId);

            if (existingAnswer != null)
            {
                existingAnswer.SelectedOptionId = selectedOptionId;
                existingAnswer.SavedAt = DateTime.UtcNow;
                _context.QuizAttemptAnswers.Update(existingAnswer);
            }
            else
            {
                var answer = new QuizAttemptAnswer
                {
                    AttemptId = attemptId,
                    QuestionId = questionId,
                    SelectedOptionId = selectedOptionId,
                    SavedAt = DateTime.UtcNow
                };
                await _context.QuizAttemptAnswers.AddAsync(answer);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<QuizAttemptAnswer>> GetSavedAnswersAsync(int attemptId)
        {
            return await _context.QuizAttemptAnswers
                .Where(a => a.AttemptId == attemptId)
                .ToListAsync();
        }

        public async Task<QuizResultDto?> SubmitAttemptAsync(int attemptId, QuizSubmitDto dto, int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == studentId);
            if (student == null) return null;

            var attempt = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .FirstOrDefaultAsync(qa => qa.AttemptId == attemptId && qa.StudentId == student.StudentId);

            if (attempt == null || attempt.EndTime.HasValue) return null;

            attempt.EndTime = DateTime.UtcNow;

            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(q => q.QuizId == dto.QuizId);

            if (quiz == null) return null;

            int score = 0;
            int totalMarks = 0;

            foreach (var question in quiz.Questions)
            {
                totalMarks += question.Marks;
                var submittedAnswer = dto.Answers.FirstOrDefault(a => a.QuestionId == question.QuestionId);
                if (submittedAnswer != null)
                {
                    var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                    if (correctOption != null && correctOption.OptionId == submittedAnswer.SelectedOptionId)
                    {
                        score += question.Marks;
                    }
                }
            }

            attempt.Score = score;
            _context.QuizAttempts.Update(attempt);

            decimal percentage = totalMarks > 0 ? ((decimal)score / totalMarks) * 100 : 0;
            string grade = "F";

            if (percentage >= 90) grade = "A";
            else if (percentage >= 80) grade = "B";
            else if (percentage >= 70) grade = "C";
            else if (percentage >= 60) grade = "D";

            var result = new Result
            {
                StudentId = student.StudentId,
                QuizId = dto.QuizId,
                Percentage = percentage,
                Grade = grade
            };

            await _context.Results.AddAsync(result);
            await _context.SaveChangesAsync();

            return new QuizResultDto
            {
                AttemptId = attempt.AttemptId,
                QuizId = quiz.QuizId,
                QuizTitle = quiz.Title,
                Score = score,
                TotalMarks = totalMarks,
                Percentage = percentage,
                Grade = grade,
                StartTime = attempt.StartTime,
                EndTime = attempt.EndTime.Value
            };
        }

        public async Task<IEnumerable<QuizAttempt>> GetStudentAttemptsAsync(int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == studentId);
            if (student == null) return new List<QuizAttempt>();

            return await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Where(qa => qa.StudentId == student.StudentId)
                .OrderByDescending(qa => qa.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Result>> GetStudentResultsAsync(int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == studentId);
            if (student == null) return new List<Result>();

            return await _context.Results
                .Include(r => r.Quiz)
                    .ThenInclude(q => q!.Teacher)
                        .ThenInclude(t => t!.User)
                .Where(r => r.StudentId == student.StudentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Result>> GetQuizResultsAsync(int quizId)
        {
            return await _context.Results
                .Include(r => r.Student)
                .ThenInclude(s => s!.User)
                .Where(r => r.QuizId == quizId)
                .ToListAsync();
        }

        public async Task<object> GetTeacherAttemptsAsync(int teacherUserId)
        {
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == teacherUserId);
            if (teacher == null) return new List<object>();

            var attempts = await _context.QuizAttempts
                .Include(qa => qa.Quiz)
                .Include(qa => qa.Student)
                .ThenInclude(s => s!.User)
                .Where(qa => qa.Quiz != null && qa.Quiz.TeacherId == teacher.TeacherId)
                .OrderByDescending(qa => qa.StartTime)
                .ToListAsync();

            var results = await _context.Results
                .Where(r => r.Quiz != null && r.Quiz.TeacherId == teacher.TeacherId)
                .ToListAsync();

            return attempts.Select(qa => {
                var res = results.FirstOrDefault(r => r.StudentId == qa.StudentId && r.QuizId == qa.QuizId);
                return new
                {
                    qa.AttemptId,
                    QuizTitle = qa.Quiz?.Title ?? "Quiz",
                    StudentName = qa.Student?.User?.FullName ?? "Student",
                    RegNum = qa.Student?.RegistrationNumber ?? "",
                    qa.StartTime,
                    qa.EndTime,
                    Score = res?.Percentage ?? 0,
                    Grade = res?.Grade ?? "N/A",
                    Status = qa.EndTime.HasValue ? "Completed" : "In Progress"
                };
            }).ToList();
        }

        public async Task<object> GetTeacherAllResultsAsync(int teacherUserId)
        {
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == teacherUserId);
            if (teacher == null) return new List<object>();

            var results = await _context.Results
                .Include(r => r.Quiz)
                .Include(r => r.Student)
                .ThenInclude(s => s!.User)
                .Where(r => r.Quiz != null && r.Quiz.TeacherId == teacher.TeacherId)
                .OrderByDescending(r => r.ResultId)
                .ToListAsync();

            return results.Select(r => new
            {
                r.ResultId,
                QuizTitle = r.Quiz?.Title ?? "Quiz",
                StudentName = r.Student?.User?.FullName ?? "Student",
                RegNum = r.Student?.RegistrationNumber ?? "",
                r.Percentage,
                r.Grade
            }).ToList();
        }

        public async Task<object> GetAdminDashboardStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalTeachers = await _context.Teachers.CountAsync();
            var totalStudents = await _context.Students.CountAsync();
            var totalQuizzes = await _context.Quizzes.CountAsync();
            var totalAttempts = await _context.QuizAttempts.CountAsync();
            var totalResults = await _context.Results.CountAsync();

            var recentLogs = await _context.AuditLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .Select(a => new
                {
                    a.Id,
                    User = a.User != null ? a.User.FullName : "System",
                    a.Action,
                    Timestamp = a.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                    a.IPAddress
                })
                .ToListAsync();

            return new
            {
                TotalUsers = totalUsers,
                TotalTeachers = totalTeachers,
                TotalStudents = totalStudents,
                TotalQuizzes = totalQuizzes,
                TotalAttempts = totalAttempts,
                TotalResults = totalResults,
                RecentLogs = recentLogs,
                Leaderboard = await GetGlobalLeaderboardAsync()
            };
        }

        public async Task<object> GetTeacherDashboardStatsAsync(int teacherId)
        {
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == teacherId);
            if (teacher == null) return new { };

            var quizzes = await _context.Quizzes
                .Where(q => q.TeacherId == teacher.TeacherId)
                .ToListAsync();

            var quizIds = quizzes.Select(q => q.QuizId).ToList();

            var totalQuizzes = quizzes.Count;
            var totalQuestions = await _context.Questions.Where(q => quizIds.Contains(q.QuizId)).CountAsync();
            var totalAttempts = await _context.QuizAttempts.Where(qa => quizIds.Contains(qa.QuizId)).CountAsync();

            var results = await _context.Results
                .Include(r => r.Student)
                .ThenInclude(s => s!.User)
                .Where(r => quizIds.Contains(r.QuizId))
                .ToListAsync();

            var averageScore = results.Any() ? results.Average(r => r.Percentage) : 0;
            var highestScore = results.Any() ? results.Max(r => r.Percentage) : 0;
            var lowestScore = results.Any() ? results.Min(r => r.Percentage) : 0;

            var leaderboard = results
                .GroupBy(r => new { r.StudentId, r.Student?.User?.FullName, r.Student?.RegistrationNumber })
                .Select(g => new
                {
                    StudentId = g.Key.StudentId,
                    StudentName = g.Key.FullName ?? "Unknown",
                    RegNum = g.Key.RegistrationNumber ?? "N/A",
                    AveragePercentage = Math.Round(g.Average(r => r.Percentage), 2),
                    QuizzesTaken = g.Count()
                })
                .OrderByDescending(x => x.AveragePercentage)
                .Take(50)
                .ToList();

            var quizStats = quizzes.Select(q => new
            {
                q.QuizId,
                q.Title,
                q.Status,
                AttemptsCount = _context.QuizAttempts.Count(qa => qa.QuizId == q.QuizId),
                AveragePercentage = _context.Results.Where(r => r.QuizId == q.QuizId).Any() 
                    ? _context.Results.Where(r => r.QuizId == q.QuizId).Average(r => r.Percentage) 
                    : 0
            }).ToList();

            return new
            {
                TotalQuizzes = totalQuizzes,
                TotalQuestions = totalQuestions,
                TotalAttempts = totalAttempts,
                AverageScore = Math.Round(averageScore, 2),
                HighestScore = Math.Round(highestScore, 2),
                LowestScore = Math.Round(lowestScore, 2),
                QuizStats = quizStats,
                Leaderboard = leaderboard
            };
        }

        public async Task<object> GetStudentDashboardStatsAsync(int studentId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == studentId);
            if (student == null) return new { };

            var availableQuizzes = await _context.Quizzes
                .Where(q => q.Status == "Published" && !_context.Results.Any(r => r.StudentId == student.StudentId && r.QuizId == q.QuizId))
                .Select(q => new { q.QuizId, q.Title, q.Duration, Teacher = q.Teacher != null && q.Teacher.User != null ? q.Teacher.User.FullName : "Teacher" })
                .ToListAsync();

            var results = await _context.Results
                .Include(r => r.Quiz)
                .Where(r => r.StudentId == student.StudentId)
                .OrderByDescending(r => r.ResultId)
                .ToListAsync();

            var recentScores = results.Take(5).Select(r => new
            {
                r.ResultId,
                QuizTitle = r.Quiz?.Title ?? "Quiz",
                r.Percentage,
                r.Grade
            }).ToList();

            var performanceHistory = results.Select(r => new
            {
                QuizTitle = r.Quiz?.Title ?? "Quiz",
                r.Percentage
            }).ToList();

            var globalLeaderboard = await _context.Results
                .GroupBy(r => r.StudentId)
                .Select(g => new
                {
                    StudentId = g.Key,
                    TotalScore = g.Sum(r => r.Percentage)
                })
                .OrderByDescending(x => x.TotalScore)
                .ToListAsync();

            // FindIndex is 0-based; add 1 to get 1-based rank
            int rankIndex = globalLeaderboard.FindIndex(x => x.StudentId == student.StudentId);
            int rank = rankIndex >= 0 ? rankIndex + 1 : 0;

            return new
            {
                AvailableQuizzes = availableQuizzes,
                RecentScores = recentScores,
                PerformanceHistory = performanceHistory,
                AverageScore = results.Any() ? Math.Round(results.Average(r => r.Percentage), 2) : 0,
                StudentRank = rank  // 0 = not yet ranked (no results in leaderboard)
            };
        }

        public async Task<object> GetGlobalLeaderboardAsync()
        {
            var results = await _context.Results
                .Include(r => r.Student)
                .ThenInclude(s => s!.User)
                .ToListAsync();

            var leaderboard = results
                .GroupBy(r => new { r.StudentId, r.Student?.User?.FullName, r.Student?.RegistrationNumber })
                .Select(g => new
                {
                    StudentId = g.Key.StudentId,
                    StudentName = g.Key.FullName ?? "Unknown",
                    RegNum = g.Key.RegistrationNumber ?? "N/A",
                    AveragePercentage = Math.Round(g.Average(r => r.Percentage), 2),
                    QuizzesTaken = g.Count()
                })
                .OrderByDescending(x => x.AveragePercentage)
                .Take(100)
                .ToList();

            return leaderboard;
        }
    }
}
