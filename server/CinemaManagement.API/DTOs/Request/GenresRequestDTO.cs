using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class GenresRequestDTO
    {
        [Required(ErrorMessage = "Tên thể loại không được để trống")]
        [RegularExpression(@"^.{5,}$", ErrorMessage = "Tên thể loại phải có ít nhất 5 ký tự")]
        public string GenresName { get; set; }
        public string? GenresContent { get; set; }
    }
}
