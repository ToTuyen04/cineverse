using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.AuthDTOs
{
    public class CreateStaffDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        public string Password { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public int RoleId { get; set; } // 1: Admin, 2: Staff

        public string PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public byte? Gender { get; set; }

        //public int? TheaterId { get; set; }
    }
}
