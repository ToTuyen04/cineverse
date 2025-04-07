namespace CinemaManagement.API.DTOs.Response
{
    public class ComboResponseDTO
    {
        public int ComboId { get; set; }

        public string? ComboName { get; set; }

        public string? ComboImage { get; set; }

        public string? ComboType { get; set; }

        public DateTime? ComboCreatedAt { get; set; }

        public int? ComboCreatedBy { get; set; }

        public string? ComboDescription { get; set; }

        public double? ComboDiscount { get; set; }

        public bool? ComboAvailable { get; set; }

        public double? ComboPrice { get; set; }

        public List<ComboDetailResponseDTO>? ComboDetails { get; set; }
    }
}
