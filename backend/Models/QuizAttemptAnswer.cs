using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Online_Quiz_Platform.Models
{
    public class QuizAttemptAnswer
    {
        [Key]
        public int AttemptAnswerId { get; set; }

        [Required]
        public int AttemptId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        public int SelectedOptionId { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("AttemptId")]
        public QuizAttempt? QuizAttempt { get; set; }

        [ForeignKey("QuestionId")]
        public Question? Question { get; set; }
    }
}
