namespace CinemaManagement.API.DTOs.Response
{
    public class ChairResponseDTO
    {
        public int ChairId { get; set; }
        public string? ChairName { get; set; }
        public bool? Available { get; set; }
        public string? ChairPosition { get; set; }
        public string? ChairTypeName { get; set; }
        public decimal? ChairPrice { get; set; }
    }
}
