using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Online_Quiz_Platform.Models
{
    public class Result
    {
        [Key]
        public int ResultId { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public int QuizId { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Percentage { get; set; }

        [Required]
        [StringLength(5)]
        public string Grade { get; set; } = "F";

        // Navigation properties
        [ForeignKey("StudentId")]
        public Student? Student { get; set; }

        [ForeignKey("QuizId")]
        public Quiz? Quiz { get; set; }
    }
}
