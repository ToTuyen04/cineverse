namespace CinemaManagement.API.DTOs.Response
{
    public class PaymentStatusResponseDTO
    {
        public int OrderId { get; set; }
        public string PaymentStatus { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
    }
}
