using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class OrderRequestDTO
    {
       
        [Required]
        public int ShowtimeId { get; set; }
        [Required]
        public List<OrderChairRequestDTO> SelectedChairs { get; set; }
        public int? userId { get; set; }
        public GuestCheckOutRequestDTO GuestCheckOutRequest { get; set; }

        public int? VoucherId { get; set; }

        public List<ComboItemRequestDTO> SelectedCombos { get; set; } = new ();


        public class ComboItemRequestDTO
        {
            public int ComboId { get; set; }
            public int Quantity { get; set; }
            public decimal Price { get; set; }
        }
    }
}
