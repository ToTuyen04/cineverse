using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IEmailService
    {
        // gửi mail bình thường, gửi mã qr
        Task SendEmailAsync(string recipientEmail, string subject, string htmlContent);

        // gửi mail xác thực tài khoản
        Task SendAccountConfirmationEmailAsync(string email, string confrimationToken, string customerName);

        // gửi mail đặt lại mật khẩu
        Task SendPasswordResetEmailAsync(string email, string resetToken, string customerName);

        // gửi hóa đơn và mãi QR cho khách hàng
        Task SendOrderConfirmationEmailAsync(GenerateQROrderResponse order);
    }
}
