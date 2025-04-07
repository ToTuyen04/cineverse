using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Utils;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    public partial class TheaterController
    {
        [HttpGet("{pageIndex}/{pageSize}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PaginatedResponse<TheaterResponseDTO>>> GetPaginatedTheaters(
             int pageIndex = 1,
             int pageSize = 6,
             [FromQuery] string searchTerm = null)
        {
            try
            {
                // Validate pagination parameters
                if (pageIndex < 1)
                {
                    return BadRequest(new { success = false, message = "Số trang phải lớn hơn 0" });
                }

                if (pageSize < 1 || pageSize > 50)
                {
                    return BadRequest(new { success = false, message = "Kích thước trang phải từ 1 đến 50" });
                }

                var paginatedTheaters = await _service.GetPaginatedTheatersAsync(pageIndex, pageSize, searchTerm);
                return Ok(paginatedTheaters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }
    }
}
