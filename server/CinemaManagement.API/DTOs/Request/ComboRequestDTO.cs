namespace CinemaManagement.API.DTOs.Request
{
    public class ComboRequestDTO
    {
        public class CreateComboDTO
        {
            public string? ComboName { get; set; }

            public string? ComboImage { get; set; }

            public string? ComboType { get; set; }

            public int? ComboCreatedBy { get; set; }

            public double? ComboDiscount { get; set; }

            public List<ComboDetailRequestDTO>? ComboDetails { get; set; }
        }

        public class UpdateComboDTO
        {
            public string? ComboName { get; set; }

            public string? ComboImage { get; set; }

            public string? ComboType { get; set; }

            public double? ComboDiscount { get; set; }

            public bool? ComboAvailable { get; set; }

            public List<ComboDetailRequestDTO>? ComboDetails { get; set; }
        }
    }
}
