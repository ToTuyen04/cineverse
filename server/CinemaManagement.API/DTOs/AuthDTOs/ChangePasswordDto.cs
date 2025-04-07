using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.AuthDTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) used for changing the user's password.
    /// </summary>
    public class ChangePasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; }
    }
}
