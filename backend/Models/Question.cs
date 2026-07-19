using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Online_Quiz_Platform.Models
{
    public class Question
    {
        [Key]
        public int QuestionId { get; set; }

        [Required]
        public int QuizId { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string QuestionType { get; set; } = "MultipleChoice"; // MultipleChoice, TrueFalse

        [Required]
        public int Marks { get; set; } = 1;

        // Navigation properties
        [ForeignKey("QuizId")]
        public Quiz? Quiz { get; set; }

        public ICollection<Option> Options { get; set; } = new List<Option>();
    }
}
