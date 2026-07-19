using System.ComponentModel.DataAnnotations;

namespace Online_Quiz_Platform.DTOs
{
    public class CreateQuizDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(1, 480)]
        public int Duration { get; set; } // in minutes
    }

    public class CreateQuestionDto
    {
        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string QuestionType { get; set; } = "MultipleChoice"; // MultipleChoice, TrueFalse

        [Required]
        [Range(1, 100)]
        public int Marks { get; set; } = 1;

        public List<CreateOptionDto> Options { get; set; } = new List<CreateOptionDto>();
    }

    public class CreateOptionDto
    {
        [Required]
        [StringLength(500)]
        public string OptionText { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }
    }

    public class QuizSubmitDto
    {
        [Required]
        public int QuizId { get; set; }

        public List<AnswerSubmitDto> Answers { get; set; } = new List<AnswerSubmitDto>();
    }

    public class AnswerSubmitDto
    {
        [Required]
        public int QuestionId { get; set; }

        [Required]
        public int SelectedOptionId { get; set; }
    }

    public class QuizResultDto
    {
        public int AttemptId { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalMarks { get; set; }
        public decimal Percentage { get; set; }
        public string Grade { get; set; } = "F";
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
