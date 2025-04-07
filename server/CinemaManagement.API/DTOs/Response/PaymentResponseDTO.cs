namespace CinemaManagement.API.DTOs.Response
{
    public class PaymentResponseDTO
    {
        public string PaymentUrl { get; set; }
        public string OrderCode { get; set; }
        public decimal Amount { get; set; }
        public string Message { get; set; }
    }
}
