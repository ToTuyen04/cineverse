using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class TheaterController : ControllerBase
    {
        private readonly ITheaterService _service;

        public TheaterController(ITheaterService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var theater = await _service.GetByIdAsync(id);
            if (theater == null)
            {
                return NotFound();
            }
            return Ok(theater);
        }

        [HttpGet("search/{name}")]
        public async Task<IActionResult> SearchByTheaterName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest();
            }
            var theaters = await _service.SearchListAsync(name);
            if (theaters == null)
            {
                return NotFound();
            }
            return Ok(theaters);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTheature()
        {
            var theaters = await _service.GetAllAsync();
            return Ok(theaters);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] TheaterRequestDTO request)
        {
            await _service.AddAsync(request);
            //return CreatedAtAction(nameof(GetById), new { id = request.TheaterId }, request);
            return Created();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TheaterRequestDTO request)
        {
            await _service.UpdateAsync(id, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
