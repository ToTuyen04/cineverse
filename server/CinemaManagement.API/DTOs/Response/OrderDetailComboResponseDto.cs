using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Response
{
    public class OrderDetailComboResponseDto
    {

        public int? OrderId { get; set; }
        public List<ComboDetailResponseDto> comboDetails { get; set; }

    }

    public class ComboDetailResponseDto
    {
        public int OrderDetailComboId { get; set; }
        public int ComboId { get; set; }
        public string ComboName { get; set; }
        public string ComboDescription { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
