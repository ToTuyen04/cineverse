using Autofac.Core;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Service;
using CinemaManagement.API.Service.Interface;
using CinemaManagement.API.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShowtimeController : ControllerBase
    {
        private readonly IShowtimeService _showtimeService;
        private readonly IChairShowtimeService _chairService;
        private readonly IComboService _comboService;
        private readonly ILogger<ShowtimeController> _logger;

        public ShowtimeController(IShowtimeService service, IChairShowtimeService chairService, IComboService comboService, ILogger<ShowtimeController> logger)
        {
            _showtimeService = service;
            _chairService = chairService;
            _comboService = comboService;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SuccessResponse<IEnumerable<ShowtimeResponseDTOs>>>> GetAll()
        {
            try
            {
                var showtimes = await _showtimeService.GetAllShowtimesAsync();
                return base.Ok(SuccessResponse<IEnumerable<ShowtimeResponseDTOs>>.Create(showtimes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while getting all showtimes.");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        [HttpGet("{theatureId}/{movieId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetShowtimes(int theatureId, int movieId)
        {
            var showtimes = await _showtimeService.GetShowtimeAsync(theatureId, movieId);
            return base.Ok(SuccessResponse<IEnumerable<ShowtimeResponseDTOs>>.Create(showtimes));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ShowtimeResponseDTOs>> GetById(int id)
        {
            var showtime = await _showtimeService.GetShowtimeByIdAsync(id);
            return base.Ok(SuccessResponse<ShowtimeResponseDTOs>.Create(showtime));
        }
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ShowtimeResponseDTOs>> Create([FromBody] ShowtimeRequestDTO.ShowtimeCreateDTO createDTO)
        {
            var createdShowtime = await _showtimeService.AddAsync(createDTO);
            return base.CreatedAtAction(
                nameof(GetById),
                new { id = createdShowtime.ShowtimeId },
                SuccessResponse<ShowtimeResponseDTOs>.Create(createdShowtime, "Tạo suất chiếu thành công")
                );
        }


        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SuccessResponse<ShowtimeResponseDTOs>>> Update(
        int id,
        [FromBody] ShowtimeRequestDTO.ShowtimeUpdateDTO updateDto)
        {
            try
            {
                var updatedShowtime = await _showtimeService.UpdateAsync(id, updateDto);
                return Ok(SuccessResponse<ShowtimeResponseDTOs>.Create(updatedShowtime, "Cập nhật suất chiếu thành công"));
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật suất chiếu ID: {ShowtimeId}", id);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }


        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete(int id)
        {
            await _showtimeService.DeleteAsync(id);
            return Ok(SuccessResponse<object>.Create(null, "Xóa suất chiếu thành công"));
        }

        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SuccessResponse<IEnumerable<ShowtimeResponseDTOs>>>> Search([FromQuery] string searchTerm)
        {
            try
            {
                var showtimes = await _showtimeService.SearchShowtimesAsync(searchTerm);
                return base.Ok(SuccessResponse<IEnumerable<ShowtimeResponseDTOs>>.Create(showtimes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while searching showtimes.");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        [HttpGet("paginated")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SuccessResponse<PaginatedResponse<ShowtimeResponseDTOs>>>> GetPaginatedShowtimes(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string searchTerm = null,
            [FromQuery] int? movieId = null,
            [FromQuery] int? theaterId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
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

                var paginatedShowtimes = await _showtimeService.GetPaginatedShowtimesAsync(
                    pageIndex, pageSize, searchTerm, movieId, theaterId, fromDate, toDate);

                return base.Ok(SuccessResponse<PaginatedResponse<ShowtimeResponseDTOs>>.Create(paginatedShowtimes));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving paginated showtimes.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }

        [HttpGet("Booking/{showtimeId}")]
        public async Task<IActionResult> GetShowtimeDetails(int showtimeId)
        {
            var chairs = await _chairService.GetChairsByShowtimes(showtimeId);
            var combos = await _comboService.GetAllAsync();

            var response = new
            {
                Chairs = chairs,
                Combos = combos.ToList()
            };
            return Ok(response);
        }

    }
}
