using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : Controller
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPost("create-payment-url")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PaymentUrlResponseDTO>> CreatePaymentUrlAsync([FromBody] PaymentRequestDTO request)
        {
            try
            {
                var result = await _paymentService.CreatePaymentUrlAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi tạo URL thanh toán cho đơn hàng: {request.OrderId}");
                throw;
            }
        }

        [HttpGet("process-payment-callback")]
        [ProducesResponseType(StatusCodes.Status200OK)] 
        public async Task<ActionResult<PaymentResultResponseDTO>> ProcessPaymentCallbackAsync([FromQuery] PaymentCallbackRequestDTO callbackData)
        {
            try
            {
                _logger.LogInformation("Nhận callback từ VNPay: {@CallbackData}", callbackData);
                var result = await _paymentService.ProcessPaymentCallbackAsync(callbackData);
                if (result.Success)
                {
                    //TODO: Gửi email xác nhận đơn hàng
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Lỗi khi xử lý callback thanh toán cho đơn hàng.");
                return StatusCode(StatusCodes.Status500InternalServerError, new PaymentResultResponseDTO
                {
                    Success = false,
                    Message = "Lỗi khi xử lý callback thanh toán.",
                    OrderId = 0
                });
            }
        }

        [HttpGet("check-stastus/{orderId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<OrderStatusResponseDTO>> CheckOrderStatus(int orderId)
        {
            try
            {
                var status = await _paymentService.GetOrderStatusAsync(orderId);
                return Ok(status);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi kiểm tra trạng thái đơn hàng {OrderId}", orderId);
                throw;
            }
        }

    }
}
