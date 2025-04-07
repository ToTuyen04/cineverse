using static CinemaManagement.API.DTOs.Response.QRResponseDtos;

namespace CinemaManagement.API.Service.Interface
{
    public interface IQRCodeService
    {
        /// <summary>
        /// Tạo QR code cho đơn hàng - tự động xác định nếu đơn hàng có combo
        /// </summary>
        /// <param name="orderId">ID của đơn hàng</param>
        /// <returns>Chuỗi base64 đại diện cho QR code</returns>
        Task<string> GenerateOrderQRCodeAsync(int orderId);

        /// <summary>
        /// Xác thực nội dung QR code
        /// </summary>
        /// <param name="qrContent">Nội dung QR code đã được mã hóa</param>
        /// <returns>Kết quả xác thực</returns>
        Task<OrderVerificationResult> VerifyQRContent(string qrContent);
        
        /// <summary>
        /// Đánh dấu đơn hàng đã in vé (cập nhật trạng thái)
        /// </summary>
        /// <param name="orderId">ID của đơn hàng</param>
        /// <returns>True nếu cập nhật thành công</returns>
        Task<bool> MarkOrderAsPrintedAsync(int orderId);

        Task<byte[]> GenerateQRCodeAsync(string content);

        Task<string> GenerateQRCodeAsBase64(int orderId);

    }
}
