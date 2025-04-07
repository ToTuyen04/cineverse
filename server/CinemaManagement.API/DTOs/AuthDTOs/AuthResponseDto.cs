namespace CinemaManagement.API.DTOs.AuthDTOs
{
    public class AuthResponseDto
    {
        public bool IsSuccessful { get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public DateTime? Expiration { get; set; }
        public string UserEmail { get; set; }
        public string UserFullName { get; set; }
        public bool IsStaff { get; set; }
        public string? Role { get; set; }
    }
}
