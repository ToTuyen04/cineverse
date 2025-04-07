using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Service;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public partial class MoviesController : ControllerBase
    {
        private readonly IMovieService _service;

        public MoviesController(IMovieService service)
        {
            _service = service;
        }

        [HttpGet("search/{name}")]
        public async Task<ActionResult> Search(string name)
        {
            var movies = await _service.SearchListAsync(name);
            return Ok(movies);
        }

        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            var movies = await _service.GetAllAsync();
            return Ok(SuccessResponse<IEnumerable<MovieResponseDTO>>.Create(movies));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var movie = await _service.GetByIdAsync(id);
            if (movie == null)
            {
                return NotFound();
            }
            return Ok(movie);
        }
    }
}
