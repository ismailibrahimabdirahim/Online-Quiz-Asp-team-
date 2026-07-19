using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Online_Quiz_Platform.Data;
using Online_Quiz_Platform.DTOs;
using Online_Quiz_Platform.Models;
using Online_Quiz_Platform.Services;

namespace Online_Quiz_Platform.Controllers
{
    /// <summary>
    /// Teacher API endpoints: quiz creation/management, question management, and viewing results/attempts.
    /// </summary>
    [ApiController]
    [Route("api/teacher")]
    [Authorize(Roles = "Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly IAuditService _auditService;
        private readonly AppDbContext _context;

        public TeacherController(IQuizService quizService, IAuditService auditService, AppDbContext context)
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

        private async Task<int> GetCurrentTeacherIdAsync()
        {
            var userId = GetCurrentUserId();
            if (userId == 0) return 0;

            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.UserId == userId);
            if (teacher != null) return teacher.TeacherId;

            if (!User.IsInRole("Teacher")) return 0;

            teacher = new Teacher { UserId = userId };
            await _context.Teachers.AddAsync(teacher);
            await _context.SaveChangesAsync();
            return teacher.TeacherId;
        }

        /// <summary>
        /// Get dashboard statistics for the teacher (total quizzes, total attempts, etc.).
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var userId = GetCurrentUserId();
            var stats = await _quizService.GetTeacherDashboardStatsAsync(userId);
            return Ok(stats);
        }

        /// <summary>
        /// Get all quizzes created by this teacher.
        /// </summary>
        [HttpGet("quizzes")]
        public async Task<IActionResult> GetQuizzes()
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            if (teacherId == 0) return BadRequest(new { message = "Teacher not found." });

            var quizzes = await _quizService.GetTeacherQuizzesAsync(teacherId);
            var result = quizzes.Select(q => new {
                q.QuizId,
                q.Title,
                q.Description,
                q.Duration,
                q.Status,
                q.CreatedAt,
                questionsCount = q.Questions.Count
            });
            return Ok(result);
        }

        /// <summary>
        /// Create a new quiz.
        /// </summary>
        [HttpPost("create-quiz")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var teacherId = await GetCurrentTeacherIdAsync();
            if (teacherId == 0) return BadRequest(new { message = "Teacher not found." });

            var quiz = await _quizService.CreateQuizAsync(dto, teacherId);
            if (quiz == null) return BadRequest(new { message = "Failed to create quiz." });

            var userId = GetCurrentUserId();
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Teacher Created Quiz: {quiz.Title}", ip);

            return Ok(new
            {
                quiz.QuizId,
                quiz.Title,
                quiz.Description,
                quiz.Duration,
                quiz.Status,
                quiz.CreatedAt
            });
        }

        /// <summary>
        /// Edit an existing quiz.
        /// </summary>
        [HttpPut("edit-quiz/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> EditQuiz(int id, [FromBody] CreateQuizDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var teacherId = await GetCurrentTeacherIdAsync();
            if (teacherId == 0) return BadRequest(new { message = "Teacher not found." });

            var success = await _quizService.EditQuizAsync(id, dto, teacherId);
            if (!success) return BadRequest(new { message = "Failed to edit quiz or unauthorized." });

            var userId = GetCurrentUserId();
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Teacher Edited Quiz ID: {id}", ip);

            return Ok(new { message = "Quiz updated successfully." });
        }

        /// <summary>
        /// Delete a quiz.
        /// </summary>
        [HttpDelete("delete-quiz/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            if (teacherId == 0) return BadRequest(new { message = "Teacher not found." });

            var success = await _quizService.DeleteQuizAsync(id, teacherId);
            if (!success) return BadRequest(new { message = "Failed to delete quiz or unauthorized." });

            var userId = GetCurrentUserId();
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Teacher Deleted Quiz ID: {id}", ip);

            return Ok(new { message = "Quiz deleted successfully." });
        }

        /// <summary>
        /// Publish a quiz to make it available to students.
        /// </summary>
        [HttpPost("publish-quiz/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> PublishQuiz(int id)
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            if (teacherId == 0) return BadRequest(new { message = "Teacher not found." });

            var success = await _quizService.ChangeQuizStatusAsync(id, "Published", teacherId);
            if (!success) return BadRequest(new { message = "Failed to publish quiz." });

            var userId = GetCurrentUserId();
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Teacher Published Quiz ID: {id}", ip);

            return Ok(new { message = "Quiz published successfully." });
        }

        /// <summary>
        /// Unpublish a quiz.
        /// </summary>
        [HttpPost("unpublish-quiz/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> UnpublishQuiz(int id)
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            if (teacherId == 0) return BadRequest(new { message = "Teacher not found." });

            var success = await _quizService.ChangeQuizStatusAsync(id, "Unpublished", teacherId);
            if (!success) return BadRequest(new { message = "Failed to unpublish quiz." });

            var userId = GetCurrentUserId();
            var ip = Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            await _auditService.LogActivityAsync(userId, $"Teacher Unpublished Quiz ID: {id}", ip);

            return Ok(new { message = "Quiz unpublished successfully." });
        }

        /// <summary>
        /// Get all questions for a specific quiz.
        /// </summary>
        [HttpGet("quizzes/{id}/questions")]
        public async Task<IActionResult> GetQuizQuestions(int id)
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            var quiz = await _quizService.GetQuizWithDetailsAsync(id);
            if (quiz == null || quiz.TeacherId != teacherId)
                return NotFound(new { message = "Quiz not found." });

            var questions = quiz.Questions.Select(q => new
            {
                q.QuestionId,
                q.QuestionText,
                q.QuestionType,
                q.Marks,
                Options = q.Options.Select(o => new { o.OptionId, o.OptionText, o.IsCorrect })
            });

            return Ok(new {
                title = quiz.Title,
                questions = questions
            });
        }

        /// <summary>
        /// Add a question to a quiz.
        /// </summary>
        [HttpPost("quizzes/{id}/questions")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> AddQuestion(int id, [FromBody] CreateQuestionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var teacherId = await GetCurrentTeacherIdAsync();
            var quiz = await _quizService.GetQuizWithDetailsAsync(id);
            if (quiz == null || quiz.TeacherId != teacherId)
                return NotFound(new { message = "Quiz not found." });

            var question = await _quizService.AddQuestionAsync(id, dto);
            if (question == null) return BadRequest(new { message = "Failed to add question." });

            return Ok(new
            {
                question.QuestionId,
                question.QuestionText,
                question.QuestionType,
                question.Marks
            });
        }

        /// <summary>
        /// Edit an existing question.
        /// </summary>
        [HttpPut("questions/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> EditQuestion(int id, [FromBody] CreateQuestionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var teacherId = await GetCurrentTeacherIdAsync();
            var question = await _context.Questions.Include(q => q.Quiz).FirstOrDefaultAsync(q => q.QuestionId == id);
            if (question?.Quiz == null || question.Quiz.TeacherId != teacherId)
                return NotFound(new { message = "Question not found." });

            var success = await _quizService.EditQuestionAsync(id, dto);
            if (!success) return BadRequest(new { message = "Failed to edit question." });

            return Ok(new { message = "Question updated successfully." });
        }

        /// <summary>
        /// Delete a question.
        /// </summary>
        [HttpDelete("questions/{id}")]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            var question = await _context.Questions.Include(q => q.Quiz).FirstOrDefaultAsync(q => q.QuestionId == id);
            if (question?.Quiz == null || question.Quiz.TeacherId != teacherId)
                return NotFound(new { message = "Question not found." });

            var success = await _quizService.DeleteQuestionAsync(id);
            if (!success) return BadRequest(new { message = "Failed to delete question." });

            return Ok(new { message = "Question deleted successfully." });
        }

        /// <summary>
        /// Get student results for a specific quiz.
        /// </summary>
        [HttpGet("quizzes/{id}/results")]
        public async Task<IActionResult> GetQuizResults(int id)
        {
            var teacherId = await GetCurrentTeacherIdAsync();
            var quiz = await _quizService.GetQuizWithDetailsAsync(id);
            if (quiz == null || quiz.TeacherId != teacherId)
                return NotFound(new { message = "Quiz not found." });

            var results = await _quizService.GetQuizResultsAsync(id);
            var resultsData = results.Select(r => new
            {
                r.ResultId,
                StudentName = r.Student != null && r.Student.User != null ? r.Student.User.FullName : "Student",
                RegNum = r.Student?.RegistrationNumber ?? "",
                r.Percentage,
                r.Grade
            });
            return Ok(resultsData);
        }

        /// <summary>
        /// Get all student attempts for this teacher's quizzes.
        /// </summary>
        [HttpGet("attempts")]
        public async Task<IActionResult> GetAttempts()
        {
            var userId = GetCurrentUserId();
            var attempts = await _quizService.GetTeacherAttemptsAsync(userId);
            return Ok(attempts);
        }

        /// <summary>
        /// Get all results across all quizzes for this teacher.
        /// </summary>
        [HttpGet("results")]
        public async Task<IActionResult> GetAllResults()
        {
            var userId = GetCurrentUserId();
            var results = await _quizService.GetTeacherAllResultsAsync(userId);
            return Ok(results);
        }
    }
}
