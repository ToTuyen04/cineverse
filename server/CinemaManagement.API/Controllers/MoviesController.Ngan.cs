using CinemaManagement.API.DTOs.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    public partial class MoviesController : ControllerBase
    {
        [HttpGet ("{movieId}/schedules")]
        public async Task<ActionResult<SuccessResponse<dynamic>>> GetMovieSchedules(int movieId)
        {
            var schedules = await _service.GetMovieSchedulesAsync(movieId);
            return Ok(SuccessResponse<dynamic>.Create(schedules));
        }
    }
}
