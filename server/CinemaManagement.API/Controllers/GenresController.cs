using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly IGenresService _service;

        public GenresController(IGenresService service)
        {
            _service = service;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string name)
        {
            var genres = await _service.SearchListAsync(name);
            return Ok(genres);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var genres = await _service.GetAllAsync();
            return Ok(genres);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var genre = await _service.GetByIdAsync(id);
            if (genre == null)
            {
                return NotFound();
            }
            return Ok(genre);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] GenresRequestDTO request)
        {
            await _service.AddAsync(request);
            //return CreatedAtAction(nameof(GetById), new { id = request.GenresId }, request);
            return null;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] GenresRequestDTO request)
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