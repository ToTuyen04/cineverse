namespace CinemaManagement.API.DTOs.Response
{
    public class FnbResponseDTO
    {
        public int FnbId { get; set; }
        
        public string? FnbName { get; set; }
        
        public string? FnbType { get; set; }

        public decimal? FnbListPrice { get; set; }

        public bool? FnbAvailable { get; set; }
    }
}
