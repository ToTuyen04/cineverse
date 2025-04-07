namespace CinemaManagement.API.DTOs.Response
{
    public class PaymentUrlResponseDTO
    {
        public string PaymentUrl { get; set; }
        public int OrderId { get; set; }
        public decimal DiscountPrice { get; set; }
        public decimal PaymentPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public int RemainingSeconds { get; set; }
        
    }
}
