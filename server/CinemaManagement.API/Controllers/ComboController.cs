using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using CinemaManagement.API.ExceptionHandler;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComboController : ControllerBase
    {
        private readonly IComboService _service;
        private readonly ILogger<ComboController> _logger;

        public ComboController(IComboService service, ILogger<ComboController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var combos = await _service.GetAllAsync();
            return Ok(combos);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string name)
        {
            var combo = await _service.SearchListAsync(name);
            return Ok(combo);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var combo = await _service.GetByIdAsync(id);
            if (combo == null)
            {
                return NotFound();
            }
            return Ok(combo);
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] ComboRequestDTO.CreateComboDTO request)
        {
            try
            {
                _logger.LogInformation("Bắt đầu xử lý yêu cầu tạo combo: {RequestData}", 
                    JsonSerializer.Serialize(request));
                    
                var combo = await _service.CreateComboWithDetailsAsync(request);
                
                _logger.LogInformation("Tạo combo thành công với ID: {ComboId}", combo.ComboId);
                return CreatedAtAction(nameof(GetById), new { id = combo.ComboId }, combo);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Lỗi validation khi tạo combo: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Lỗi nghiệp vụ khi tạo combo: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo combo: {Message}, Inner: {InnerMessage}", 
                    ex.Message, ex.InnerException?.Message);
                return StatusCode(500, new { 
                    error = "Lỗi khi lưu dữ liệu vào database. Chi tiết: " + ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo combo: {Message}, Stack: {StackTrace}", 
                    ex.Message, ex.StackTrace);
                    
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner Exception: {Type}, {Message}", 
                        ex.InnerException.GetType().Name, 
                        ex.InnerException.Message);
                }
                
                return StatusCode(500, new { 
                    error = "Lỗi khi tạo combo. Chi tiết: " + ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ComboRequestDTO.UpdateComboDTO request)
        {
            try
            {
                _logger.LogInformation("Bắt đầu cập nhật combo với ID {ComboId}: {RequestData}", 
                    id, JsonSerializer.Serialize(request));
                
                var updatedCombo = await _service.UpdateComboWithDetailsAsync(id, request);
                
                _logger.LogInformation("Cập nhật combo thành công với ID: {ComboId}", updatedCombo.ComboId);
                return Ok(updatedCombo);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Không tìm thấy combo với ID {ComboId}", id);
                return NotFound(new { error = ex.Message });
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Lỗi validation khi cập nhật combo: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogError(ex, "Lỗi nghiệp vụ khi cập nhật combo: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi cập nhật combo: {Message}", ex.Message);
                return StatusCode(500, new { error = "An error occurred while updating the combo. Please try again later." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation("Bắt đầu xóa combo với ID {ComboId}", id);
                
                var result = await _service.DeleteComboWithDetailsAsync(id);
                if (!result)
                {
                    _logger.LogWarning("Không tìm thấy combo với ID {ComboId}", id);
                    return NotFound();
                }
                
                _logger.LogInformation("Xóa combo thành công với ID {ComboId}", id);
                return NoContent();
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Lỗi validation khi xóa combo: {Message}", ex.Message);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xóa combo: {Message}", ex.Message);
                return StatusCode(500, new { error = "An error occurred while deleting the combo. Please try again later." });
            }
        }
    }
}
