using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChairController : ControllerBase
    {
        private readonly IChairService _service;
        public ChairController(IChairService service)
        {
            _service = service;
        }

        [HttpGet("showTime/{showTimeId}")]
        public async Task<IActionResult> GetChairsByShowTime(int showTimeId)
        {
           
                var chairs = await _service.GetChairsByShowTime(showTimeId);
                return Ok(chairs);
            
        }

        [HttpPost("select-chairs/{showtimeId}")]
        public async Task<IActionResult> SelectChairs(int showtimeId, [FromBody] List<int> chairIds)
        {

            await _service.UpdateChairsAvailabilityAsync(showtimeId, chairIds);
            return Ok(new { message = "Ghế đã được chọn thành công!" });

        }
    }
}
