using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Response
{
    public class ChairShowtimeResponseDTO
    {
        public int ChairShowtimeId { get; set; }
        public int? ChairId { get; set; }
        public int? ShowtimeId { get; set; }
        public bool Available { get; set; }

        [Timestamp]
        public byte[] Version { get; set; }
        public string? ChairName { get; set; }
        public string? ChairPosition { get; set; }
        public string? ChairTypeName { get; set; }
        public decimal? ChairPrice { get; set; }
    }
}
