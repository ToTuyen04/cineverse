namespace CinemaManagement.API.DTOs.Request
{
    public class FnbRequestDTO
    {
        public string? FnbName { get; set; }
      
        public string? FnbType { get; set; }
      
        public decimal? FnbListPrice { get; set; }

        public bool? FnbAvailable { get; set; } 

    }
}
