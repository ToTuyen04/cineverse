using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FnbsController : ControllerBase
    {
        private readonly IFnbService _service;
        public FnbsController(IFnbService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
                var fnbs = await _service.GetAllAsync();
                return Ok(fnbs);         
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string name)
        {
            var fnbs = await _service.SearchListAsync(name);
            return Ok(fnbs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var fnb = await _service.GetByIdAsync(id);
            if (fnb == null)
            {
                return NotFound();
            }
            return Ok(fnb);
        }
        
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] FnbRequestDTO request)
        {
            await _service.AddAsync(request);
            return Created();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FnbRequestDTO request)
        {
            await _service.UpdateAsync(id, request);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return Ok(SuccessResponse<object>.Create(null, "Xóa đồ ăn/ thức uống thành công"));
        }
    }
}
