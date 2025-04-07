using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class ConfigurationRequestDTO
    {
        public class AddConfigRequestDTO
        {
            [Required(ErrorMessage = "Tên cấu hình không được để trống")]
            [StringLength(255, ErrorMessage = "Tên cấu hình không được vượt quá 255 ký tự")]
            public string ConfigurationName { get; set; }

            [Required(ErrorMessage = "Giá trị cấu hình không được để trống")]
            [StringLength(255, ErrorMessage = "Giá trị cấu hình không được vượt quá 255 ký tự")]
            public string ConfigurationContent { get; set; }

            [Required(ErrorMessage = "Đơn vị cấu hình không được để trống")]
            [StringLength(20, ErrorMessage = "Đơn vị cấu hình không được vượt quá 20 ký tự")]
            public string ConfigurationUnit { get; set; }

            [Required(ErrorMessage = "Miêu tả cấu hình không được để trống")]
            [StringLength(255, ErrorMessage = "Miêu tả không được vượt quá 255 ký tự")]
            public string ConfigurationDescription { get; set; }
        }

        public class UpdateConfigRequestDTO
        {
            [Required(ErrorMessage = "ID cấu hình không được để trống")]
            [Range(1, int.MaxValue, ErrorMessage = "ID cấu hình phải lớn hơn 0")]
            public int ConfigurationId { get; set; }
            [Required(ErrorMessage = "Giá trị cấu hình không được để trống")]
            [StringLength(255, ErrorMessage = "Giá trị cấu hình không được vượt quá 255 ký tự")]
            public string ConfigurationContent { get; set; }
        }
    }
}
