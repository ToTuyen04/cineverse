using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.AuthDTOs
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        public string? PhoneNumber { get; set; }

        public DateOnly? DateOfBirth { get; set; }

        public byte? Gender { get; set; }
    }   
}
