using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Online_Quiz_Platform.Models
{
    public class Option
    {
        [Key]
        public int OptionId { get; set; }

        [Required]
        public int QuestionId { get; set; }

        [Required]
        [StringLength(500)]
        public string OptionText { get; set; } = string.Empty;

        [Required]
        public bool IsCorrect { get; set; }

        // Navigation properties
        [ForeignKey("QuestionId")]
        public Question? Question { get; set; }
    }
}
