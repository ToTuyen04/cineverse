using Azure.Core;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Service;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/test")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IQRCodeService _qrCodeService;
        private readonly IEmailService _emailService;
        private readonly IOrderDetailComboService _orderDetailComboService;
        private readonly ILogger<TestController> _logger;

        public TestController(IQRCodeService qrCodeService, IEmailService emailService, IOrderDetailComboService orderDetailComboService, ILogger<TestController> logger)
        {
            _qrCodeService = qrCodeService;
            _emailService = emailService;
            _orderDetailComboService = orderDetailComboService;
            _logger = logger;
        }

        [HttpGet("qr-generate/{orderId}")]
        public async Task<IActionResult> GenerateOrderQR(int orderId)
        {
            string qrCodeBase64 = await _qrCodeService.GenerateOrderQRCodeAsync(orderId);
            return Ok(SuccessResponse<string>.Create(qrCodeBase64, "Tạo mã QR thành công"));
        }

        [HttpPost("qr-verify")]
        public async Task<IActionResult> VerifyQRCode([FromBody] QRVerifyRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.QrContent))
            {
                return BadRequest(ErrorResponse.Create("MISSING FIELD", "Nội dung QR code không được để trống"));
            }

            var result = await _qrCodeService.VerifyQRContent(request.QrContent);

            if (result.IsValid)
            {
                if (request.MarkAsUsed)
                {
                    int orderId = ((QRResponseDtos.OrderQRPayload)result.OrderInfo).OrderId;

                    await _qrCodeService.MarkOrderAsPrintedAsync(orderId);
                    result.IsUsed = true;
                }
                return Ok(SuccessResponse<QRResponseDtos.OrderVerificationResult>.Create(result, "Mã QR hợp lệ"));
            }
            else
                return Ok(ErrorResponse.Create("INVALID QR CODE", result.ErrorMessage!));

        }

        [HttpPost("test-order-email/{orderId}")]
        public async Task<IActionResult> SendTestOrderEmail(int orderId)
        {
            try
            {
                // Tạo dữ liệu mẫu để test
                var testOrder = new GenerateQROrderResponse
                {
                    OrderId = orderId,
                    TransactionNo = 144616723,
                    CustomerEmail = "nganvhhse183096@fpt.edu.vn", 
                    CustomerName = "Khách Hàng Test",
                    MovieName = "NHÀ GIA TIỀN (T18)",
                    ShowTime = DateTime.Parse("2025-02-21 18:00"),
                    RoomName = "01",
                    TheaterName = "Cineverse Bình Dương",
                    SeatNumbers = new List<OrderDetailDTO>
                    {
                        new OrderDetailDTO
                        {
                            Name = "D10",
                            Quantity = 1,
                            Price = 45000
                        },
                        new OrderDetailDTO
                        {
                            Name = "D09",
                            Quantity = 1,
                            Price = 45000
                        } 
                    },
                    //Combos = new List<OrderDetailDTO>
                    //{
                    //    new OrderDetailDTO
                    //    {
                    //        Name = "Combo Đôi",
                    //        Quantity=2,
                    //        Price = 102000
                    //    }
                    //}
                };

                // Gửi email
                await _emailService.SendOrderConfirmationEmailAsync(testOrder);

                return Ok(SuccessResponse<string>.Create("Email đã được gửi thành công!"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email test cho đơn hàng {OrderId}", orderId);
                return StatusCode(500, new { Message = $"Lỗi khi gửi email: {ex.Message}" });
                //return StatusCode(500, new { Message = $"Lỗi khi gửi email: {ex.Message}" });
            }
        }

        /// <summary>
        /// Thêm danh sách combo vào order
        /// </summary>
        [HttpPost("add-combos")]
        public async Task<ActionResult<OrderDetailComboResponseDto>> AddCombos([FromBody] OrderDetailComboRequestDto request)
        {
            try
            {
                var result = await _orderDetailComboService.AddRangeAsync(request);
                return Ok(SuccessResponse<OrderDetailComboResponseDto>.Create(result, "Thêm combo thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Đã xảy ra lỗi khi thêm combo vào order");
            }
        }

    }
    public class QRVerifyRequest
    {
        public string QrContent { get; set; }
        public bool MarkAsUsed { get; set; } = false;
    }
}
