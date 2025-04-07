namespace CinemaManagement.API.DTOs.Response
{
    public class ComboDetailResponseDTO
    {
        public int ComboDetailId { get; set; }
        
        public int? Quantity { get; set; }
        
        public string? FnbName { get; set; }
        
        public decimal? FnbPrice { get; set; }
    }
}
