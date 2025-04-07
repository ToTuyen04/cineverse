namespace CinemaManagement.API.DTOs.Response
{
    public abstract class ApiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }

    }
}
