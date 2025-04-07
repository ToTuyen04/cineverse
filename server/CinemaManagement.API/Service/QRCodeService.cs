using CinemaManagement.API.Enums;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.DataProtection;
using QRCoder;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using static CinemaManagement.API.DTOs.Response.QRResponseDtos;

namespace CinemaManagement.API.Service
{
    public class QRCodeService : IQRCodeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDataProtector _protector;
        private readonly ILogger<QRCodeService> _logger;
        private readonly IConfiguration _configuration;
        private readonly byte[] _signatureKey;

        private const string TYPE_ORDER = "FULL";
        private const string TYPE_TICKET = "TICKET";

        public QRCodeService(
            IUnitOfWork unitOfWork,
            IDataProtectionProvider dataProtectionProvider,
            ILogger<QRCodeService> logger,
            IConfiguration configuration)
        {
            _configuration = configuration;
            string protectionKey = configuration["QRProtection:Key"] ?? "JboV4oNUmLKX2";
            _protector = dataProtectionProvider.CreateProtector(protectionKey);
            _logger = logger;
            _unitOfWork = unitOfWork;

            string signKey = configuration["QRProtection:SignatureKey"] ?? "YourSecureSigningKeyHereMakeSureItIsLongEnough";
            _signatureKey = Encoding.UTF8.GetBytes(signKey);
        }

        public async Task<string> GenerateQRCodeAsBase64(int orderId)
        {
            try
            {
                // Lấy nội dung QR code đã mã hóa
                string protectedPayload = await GenerateOrderQRCodeAsync(orderId);

                // Tạo QR code từ nội dung đã mã hóa
                using var qrGenerator = new QRCodeGenerator();
                using var qrCodeData = qrGenerator.CreateQrCode(protectedPayload, QRCodeGenerator.ECCLevel.H);
                using var qrCode = new PngByteQRCode(qrCodeData);

                // Tạo hình ảnh QR code với kích thước lớn và độ tương phản cao
                var qrCodeImage = qrCode.GetGraphic(20);
                return Convert.ToBase64String(qrCodeImage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo mã QR code base64");
                throw new Exception("Không thể tạo mã QR code");
            }
        }
        public async Task<string> GenerateOrderQRCodeAsync(int orderId)
        {
            try
            {
                bool hasCombo = await _unitOfWork.OrderDetailComboRepo.HasCombosByOrderIdAsync(orderId);

                // Tính thời hạn hết hiệu lực dựa trên suất chiếu
                var expiresAt = await CalculateExpirationTimeAsync(orderId);

                var expirationTimestamp = new DateTimeOffset(expiresAt.ToUniversalTime()).ToUnixTimeSeconds(); // ExpiresAt (Unix timestamp)

                var nonce = Guid.NewGuid().ToString("N").Substring(0, 12);

                string dataToSign = $"{orderId}|{(hasCombo ? "F" : "T")}|{expirationTimestamp}|{nonce}";
                string signature = CreateSignature(dataToSign);

                //Tạo payload
                var payload = new CompactOrderQRPayload
                {
                    OrderId = orderId,
                    Type = hasCombo ? "F" : "T",
                    ExpiresAt = expirationTimestamp,
                    Nonce = nonce,
                    Signature = signature
                };

                // Chuyển đối tượng sang JSON
                string jsonPayload = JsonSerializer.Serialize(payload);

                // Bảo vệ dữ liệu đã nén
                string protectedPayload = _protector.Protect(jsonPayload);

                //Tạo QR Code
                return protectedPayload;
            }
            catch (Exception ex) when (!(ex is NotFoundException))
            {
                _logger.LogError(ex, "Lỗi khi tạo mã QR cho đơn hàng {OrderId}", orderId);
                throw new Exception($"Không thể tạo mã QR cho đơn hàng #{orderId}");
            }
        }

        public async Task<OrderVerificationResult> VerifyQRContent(string qrContent)
        {
            // Kết quả mặc định
            var result = new OrderVerificationResult
            {
                IsValid = false,
                ErrorMessage = "Mã QR không hợp lệ hoặc đã bị sửa đổi",
                IsExpired = true,
                IsUsed = false,
            };

            try
            {
                // Giải mã nội dung QR bằng protector
                string decryptedJson = _protector.Unprotect(qrContent);

                //Giải nén nội dung
                var payload = JsonSerializer.Deserialize<CompactOrderQRPayload>(decryptedJson)
                    ?? throw new Exception("Dữ liệu QR không hợp lệ");

                //Kiểm tra chữ ký
                string dataToVerify = $"{payload.OrderId}|{payload.Type}|{payload.ExpiresAt}|{payload.Nonce}";
                string expectedSignature = CreateSignature(dataToVerify);

                if (payload.Signature != expectedSignature)
                {
                    result.ErrorMessage = "Mã QR không hợp lệ (chữ ký không khớp)";
                    _logger.LogWarning("expectedSignature: " + expectedSignature);
                    _logger.LogWarning("payloadSignature: " + payload.Signature);
                    return result;
                }

                // Kiểm tra trạng thái đơn hàng - nếu đã in (printed) thì QR đã sử dụng
                string orderStatus = await _unitOfWork.OrderRepo.GetOrderStatusAsync(payload.OrderId);
                if (orderStatus == OrderStatus.Printed.ToString())
                {
                    result.IsValid = false;
                    result.IsUsed = true;
                    result.ErrorMessage = "Mã QR đã được sử dụng (vé đã được in)";
                    return result;
                }



                // Chuyển Unix timestamp thành DateTime
                DateTime expiresAt = DateTimeOffset.FromUnixTimeSeconds(payload.ExpiresAt).UtcDateTime;

                // Kiểm tra hạn sử dụng
                if (DateTime.UtcNow > expiresAt)
                {
                    result.ErrorMessage = "Mã QR đã hết hạn (phim đã kết thúc)";
                    return result;
                }

                // Tạo đối tượng tương thích với hệ thống
                var orderPayload = new OrderQRPayload
                {
                    OrderId = payload.OrderId,
                    Type = payload.Type == "F" ? TYPE_ORDER : TYPE_TICKET,
                    ExpiresAt = expiresAt
                };

                // QR hợp lệ
                result.IsValid = true;
                result.IsExpired = false;
                result.OrderInfo = orderPayload;
                result.PayloadType = payload.Type == "F" ? TYPE_ORDER : TYPE_TICKET;
                result.ErrorMessage = null;
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xác thực mã QR: {Message}", ex.Message);
                return result;
            }
        }

        public async Task<bool> MarkOrderAsPrintedAsync(int orderId)
        {
            try
            {
                return await _unitOfWork.OrderRepo.UpdateOrderStatusAsync(orderId, OrderStatus.Printed.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái đơn hàng {OrderId}", orderId);
                return false;
            }
        }

        /// <summary>
        /// Tạo chữ ký số cho dữ liệu QR
        /// </summary>
        private string CreateSignature(string data)
        {
            using (var hmac = new HMACSHA256(_signatureKey))
            {
                byte[] hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
                return Convert.ToBase64String(hashBytes);
            }
        }

        /// <summary>
        /// Phương thức hỗ trợ để tính thời hạn hết hiệu lực từ suất chiếu
        /// </summary>
        /// <returns>Trả về thời điểm mã QR hết hạn</returns>
        /// <exception cref="NotFoundException">Nếu không tìm thấy bất kì vé nào của orderId</exception>
        private async Task<DateTime> CalculateExpirationTimeAsync(int orderId)
        {
            var ticket = await _unitOfWork.OrderDetailTicketRepo.GetFirstTicketByOrderIdAsync(orderId)
                ?? throw new NotFoundException($"Không tìm thấy vé nào trong đơn hàng #{orderId}");
            // Nếu không tìm thấy vé, đây là tình huống lỗi
            _logger.LogInformation("Tìm thấy vé trong đơn hàng #{OrderId}", orderId);

            // Lấy thông tin suất chiếu và phim
            var showtime = await _unitOfWork.ShowtimeRepo.GetByIdAsync(ticket.ShowtimeId!.Value);
            var movie = await _unitOfWork.MovieRepo.GetByIdAsync(showtime.ShowtimeMovieId!.Value);

            // Tính thời điểm hết hạn: thời điểm phim chiếu + thời lượng phim + 10 phút
            return showtime.ShowtimeStartAt!.Value.AddMinutes(movie.MovieDuration!.Value + 10);
        }

        public async Task<byte[]> GenerateQRCodeAsync(string content)
        {
            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(content, QRCodeGenerator.ECCLevel.H);
            using var qrCode = new PngByteQRCode(qrCodeData);
            return await Task.FromResult(qrCode.GetGraphic(20));
        }

    }
}
