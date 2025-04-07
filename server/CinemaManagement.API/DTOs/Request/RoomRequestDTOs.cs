using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class RoomRequestDTOs
    {
        public class RoomCreateDTO
        {
            [Required(ErrorMessage = "Tên phòng không được để trống")]
            [RegularExpression(@"^[Pp]hòng[\p{L}0-9 ]{0,10}$",
        ErrorMessage = "Tên phòng phải bắt đầu bằng 'Phòng' và theo sau bởi 10 ký tự")]
            public string RoomName { get; set; }
            [Required(ErrorMessage = "Số lượng ghế không được để trống")]
            [Range(1, int.MaxValue, ErrorMessage = "Số lượng ghế phải lớn hơn 0")]
            public int RoomChairAmount { get; set; }
            [Required(ErrorMessage = "Loại màn hình không được để trống")]
            public int RoomScreenTypeId { get; set; }
            [Required(ErrorMessage = "Rạp không được để trống")]
            public int RoomTheaterId { get; set; }
        }

        public class RoomUpdateDTO
        {
            [Required(ErrorMessage = "Tên phòng không được để trống")]
            [RegularExpression(@"^[Pp]hòng[\p{L}0-9 ]{0,10}$",
        ErrorMessage = "Tên phòng phải bắt đầu bằng 'Phòng' và theo sau bởi 10 ký tự")]
            public string RoomName { get; set; }

            [Required(ErrorMessage = "Số lượng ghế không được để trống")]
            [Range(1, int.MaxValue, ErrorMessage = "Số lượng ghế phải lớn hơn 0")]
            public int RoomChairAmount { get; set; }

            [Required(ErrorMessage = "Loại màn hình không được để trống")]
            public int RoomScreenTypeId { get; set; }
        }
    }
}
