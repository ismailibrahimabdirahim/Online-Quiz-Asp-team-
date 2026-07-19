using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Online_Quiz_Platform.Models
{
    public class Student
    {
        [Key]
        public int StudentId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string RegistrationNumber { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public ICollection<QuizAttempt>? QuizAttempts { get; set; }
        public ICollection<Result>? Results { get; set; }
    }
}
