using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.AuthDTOs
{
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

    }
}
