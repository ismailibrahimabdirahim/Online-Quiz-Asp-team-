using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Services;

namespace Online_Quiz_Platform.Controllers
{
    /// <summary>
    /// Student API endpoints: view available quizzes, take quizzes, view results and performance.
    /// </summary>
    [ApiController]
    [Route("api/student")]
    [Authorize(Roles = "Student")]
    public class StudentController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly IAuditService _auditService;
        private readonly AppDbContext _context;

        public StudentController(IQuizService quizService, IAuditService auditService, AppDbContext context)
        {
            _quizService = quizService;
            _auditService = auditService;
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return idClaim != null ? int.Parse(idClaim.Value) : 0;
        }

        /// <summary>
        /// Get student dashboard statistics (total taken, average score).
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userId = GetCurrentUserId();
            var stats = await _quizService.GetStudentDashboardStatsAsync(userId);
            return Ok(stats);
        }

        /// <summary>
        /// Get quizzes available for the student to take (excluding already taken).
        /// </summary>
        [HttpGet("available-quizzes")]
        public async Task<IActionResult> GetAvailableQuizzes()
        {
            var quizzes = await _quizService.GetAvailableQuizzesAsync();
            var userId = GetCurrentUserId();

            // Filter out quizzes that student already took
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null) return BadRequest(new { message = "Student profile not found." });

            var takenQuizIds = await _context.Results
                .Where(r => r.StudentId == student.StudentId)
                .Select(r => r.QuizId)
                .ToListAsync();

            var filtered = quizzes
                .Where(q => !takenQuizIds.Contains(q.QuizId))
                .Select(q => new
                {
                    q.QuizId,
                    q.Title,
                    q.Description,
                    q.Duration,
                    TeacherName = q.Teacher != null && q.Teacher.User != null ? q.Teacher.User.FullName : "Teacher"
                });

            return Ok(filtered);
        }

        /// <summary>
        /// Start a quiz attempt and fetch the questions.
        /// </summary>
        [HttpPost("take-quiz/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> StartAttempt(int id)
        {
            var userId = GetCurrentUserId();
            var attempt = await _quizService.StartAttemptAsync(id, userId);
            if (attempt == null)
            {
                return BadRequest(new { message = "Unable to start quiz. You may have already taken this quiz or it is not available." });
            }

            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Student Started Quiz ID: {id}", ip);

            // Fetch quiz details for quiz UI (excluding correctness of answers)
            var quiz = await _quizService.GetQuizWithDetailsAsync(id);
            if (quiz == null) return NotFound();

            // Calculate remaining seconds
            var elapsed = (DateTime.UtcNow - attempt.StartTime).TotalSeconds;
            var remainingSeconds = Math.Max(0, (quiz.Duration * 60) - elapsed);

            // Fetch any previously saved answers (if resuming)
            var savedAnswers = await _quizService.GetSavedAnswersAsync(attempt.AttemptId);

            var quizInfo = new
            {
                AttemptId = attempt.AttemptId,
                QuizId = quiz.QuizId,
                quiz.Title,
                quiz.Duration,
                RemainingSeconds = remainingSeconds,
                SavedAnswers = savedAnswers.Select(a => new { a.QuestionId, a.SelectedOptionId }),
                Questions = quiz.Questions.Select(q => new
                {
                    q.QuestionId,
                    q.QuestionText,
                    q.QuestionType,
                    q.Marks,
                    Options = q.Options.Select(o => new { o.OptionId, o.OptionText })
                })
            };

            return Ok(quizInfo);
        }

        public class SaveAnswerDto
        {
            public int QuestionId { get; set; }
            public int SelectedOptionId { get; set; }
        }

        /// <summary>
        /// Auto-save a selected answer during a quiz attempt.
        /// </summary>
        [HttpPost("save-answer/{attemptId}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> SaveAnswer(int attemptId, [FromBody] SaveAnswerDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            var success = await _quizService.SaveAnswerAsync(attemptId, dto.QuestionId, dto.SelectedOptionId, userId);
            
            if (!success)
            {
                return BadRequest(new { message = "Failed to save answer. Attempt might be invalid or already submitted." });
            }

            return Ok(new { message = "Answer saved successfully." });
        }

        /// <summary>
        /// Submit a completed quiz attempt.
        /// </summary>
        [HttpPost("submit-quiz/{attemptId}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> SubmitAttempt(int attemptId, [FromBody] QuizSubmitDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetCurrentUserId();
            var result = await _quizService.SubmitAttemptAsync(attemptId, dto, userId);
            if (result == null)
            {
                return BadRequest(new { message = "Quiz submission failed. Attempt might be closed or invalid." });
            }

            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Student Submitted Quiz ID: {dto.QuizId}. Score: {result.Score}", ip);

            return Ok(result);
        }

        /// <summary>
        /// Get the student's quiz results.
        /// </summary>
        [HttpGet("results")]
        public async Task<IActionResult> GetResults()
        {
            var userId = GetCurrentUserId();
            var results = await _quizService.GetStudentResultsAsync(userId);
            
            // Note: Make sure Quiz is eager-loaded in GetStudentResultsAsync
            var resultsData = results.Select(r => new
            {
                r.ResultId,
                QuizTitle = r.Quiz?.Title ?? "Unknown Quiz",
                TeacherName = r.Quiz?.Teacher?.User?.FullName ?? "Unknown Teacher",
                Score = r.Percentage,
                AttemptedAt = r.Quiz?.CreatedAt ?? DateTime.UtcNow // Fallback if Result doesn't have its own timestamp
            });
            return Ok(resultsData);
        }

        /// <summary>
        /// Get the student's performance over time.
        /// </summary>
        [HttpGet("performance")]
        public async Task<IActionResult> GetPerformance()
        {
            var userId = GetCurrentUserId();
            var results = await _quizService.GetStudentResultsAsync(userId);
            var performanceData = results.Select(r => new
            {
                QuizTitle = r.Quiz?.Title ?? "Quiz",
                r.Percentage
            });
            return Ok(performanceData);
        }

        /// <summary>
        /// Get the global student leaderboard.
        /// </summary>
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var leaderboard = await _quizService.GetGlobalLeaderboardAsync();
            return Ok(leaderboard);
        }
    }
}
