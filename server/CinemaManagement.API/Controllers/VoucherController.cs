using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _service;

        // Constructor
        public VoucherController(IVoucherService service)
        {
            _service = service;
        }

        // GET: api/Voucher
        [HttpGet]
        public async Task<IActionResult> GetAllVoucher()
        {
            var vouchers = await _service.GetAllAsync();
            return Ok(vouchers);
        }

        // GET: api/Voucher/id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
            {
                return BadRequest();
            }

            var voucher = await _service.GetByIdAsync(id);
            if (voucher == null)
            {
                return NotFound();
            }
            return Ok(voucher);
        }

        // GET: api/Voucher/code/{code}
        [HttpGet("code/{code}")]
        public async Task<IActionResult> GetByCode(string code)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                {
                    return BadRequest(new { error = "Mã voucher không được để trống" });
                }

                var voucher = await _service.GetByCodeAsync(code);
                return Ok(voucher);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { error = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }

        // GET: api/Voucher/search?name=...
        [HttpGet("search")]
        public async Task<IActionResult> SearchByVoucherName([FromQuery] string name)
        {
            var vouchers = await _service.SearchListAsync(name);
            return Ok(vouchers);
        }

        // POST: api/Voucher
        [HttpPost]
        public async Task<ActionResult<SuccessResponse<VoucherResponseDTO>>> Add([FromBody] VoucherRequestDTO.VoucherCreateDTO request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest();
                }

                var createdVoucher = await _service.AddAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = createdVoucher.VoucherId }, SuccessResponse<VoucherResponseDTO>.Create(createdVoucher, "Thêm voucher thành công"));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }

        // PUT: api/Voucher/id
        [HttpPut("{id}")]
        public async Task<ActionResult<SuccessResponse<VoucherResponseDTO>>> Update(int id, [FromBody] VoucherRequestDTO.VoucherUpdateDTO request)
        {
            try
            {
                var updatedVoucher = await _service.UpdateAsync(id, request);
                return Ok(SuccessResponse<VoucherResponseDTO>.Create(updatedVoucher, "Cập nhật voucher thành công"));
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
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }

        // DELETE: api/Voucher/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new {success = false, message = "ID không hợp lệ."});
            }
            
            var exists = await _service.GetByIdAsync(id);
            if (exists == null)
            {
                return NotFound(new { success = false, message = $"Không tìm thấy voucher với ID: {id}" });
            }

            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
