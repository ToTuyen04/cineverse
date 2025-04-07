using CinemaManagement.API.Entities;
using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class OrderDetailComboRequestDto
    {
        [Required(ErrorMessage = "Order ID không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Order ID phải lớn hơn 0")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Danh sách combo không được để trống")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 combo")]
        public List<ComboDetailRequestDto> ComboDetails { get; set; }
    }

    public class ComboDetailRequestDto
    {
        [Required(ErrorMessage = "Combo ID không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Combo ID phải lớn hơn 0")]
        public int ComboId { get; set; }

        [Required(ErrorMessage = "Số lượng không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng combo phải lớn hơn 0")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Giá không được để trống")]
        [Range(0, int.MaxValue, ErrorMessage = "Giá combo không được âm")]
        public decimal Price { get; set; }
    }
}
