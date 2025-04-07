namespace CinemaManagement.API.DTOs.Response
{
    public class GuestCheckOutResponseDTO
    {
        public string SessionId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
    }
}
