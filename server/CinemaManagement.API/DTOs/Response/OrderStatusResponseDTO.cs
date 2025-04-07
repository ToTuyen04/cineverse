namespace CinemaManagement.API.DTOs.Response
{
    public class OrderStatusResponseDTO
    {
        public int OrderId { get; set; }
        public string Status { get; set; }
        public int RemainingSeconds { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string TransactionId { get; set; }
        public string PaymentMethod { get; set; }
    }
}
