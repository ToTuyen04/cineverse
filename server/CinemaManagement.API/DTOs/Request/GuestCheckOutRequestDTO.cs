using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class GuestCheckOutRequestDTO
    {
        [Required]
        public string GuestName { get; set; }

        [Required]
        [EmailAddress]
        public string GuestEmail { get; set; }

        [Required]
        [Phone]
        public string GuestPhoneNumber { get; set; }
    }
}
