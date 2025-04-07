namespace CinemaManagement.API.DTOs.Response
{
    public class PaymentResultResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string TransactionNo { get; set; }
        public int OrderId { get; set; }
        public OrderDetailResponseDTO OrderDetail { get; set; }
    }
}
