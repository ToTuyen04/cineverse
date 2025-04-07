using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.AuthDTOs
{
    /// <summary>
    /// Data Transfer Object (DTO) used for requesting a password reset.
    /// </summary>
    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
