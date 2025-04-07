using CinemaManagement.API.Service.Interface;
using MimeKit;
using System.Text;
using MailKit.Security;
using MimeKit.Utils;
using CinemaManagement.API.DTOs.Response;
using System.Net.Mail;


namespace CinemaManagement.API.Service
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly IQRCodeService _qRCodeService;
        private readonly ILogger<EmailService> _logger;
        private readonly string _templatePath;

        public EmailService(IConfiguration configuration, IQRCodeService qRCodeService, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _qRCodeService = qRCodeService;
            _templatePath = Path.Combine(Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)!.Parent!.Parent!.Parent!.FullName, "Templates", "OrderConfirmation.html");
            _logger = logger;
        }
        //Ngân
        public async Task SendOrderConfirmationEmailAsync(GenerateQROrderResponse order)
        {
            try
            {
                string qrCodeBase64 = await GenerateOrderQRCodeAsBase64(order.OrderId);

                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_configuration["EmailSettings:Mail"]));
                email.To.Add(MailboxAddress.Parse(order.CustomerEmail));
                email.Subject = $"Xác nhận đặt vé - Mã Thanh toán {order.TransactionNo}";



                var builder = new BodyBuilder();

                // Thêm QR code như một resource được liên kết
                var qrImage = builder.LinkedResources.Add("qr_code.png", Convert.FromBase64String(qrCodeBase64));
                qrImage.ContentId = MimeUtils.GenerateMessageId(); //Tạo ID duy nhất
                qrImage.ContentType.MediaType = "image";
                qrImage.ContentType.MediaSubtype = "png";
                qrImage.ContentDisposition = new ContentDisposition(ContentDisposition.Inline);

                // Tạo nội dung email với tham chiếu đến QR code qua CID
                builder.HtmlBody = GenerateEmailTemplate(order, qrImage.ContentId);

                email.Body = builder.ToMessageBody();

                using var smtp = new MailKit.Net.Smtp.SmtpClient();
                await smtp.ConnectAsync(
                    _configuration["EmailSettings:Host"],
                    int.Parse(_configuration["EmailSettings:Port"]!),
                    SecureSocketOptions.StartTls
                );

                await smtp.AuthenticateAsync(
                    _configuration["EmailSettings:Mail"],
                    _configuration["EmailSettings:Password"]
                );

                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                _logger.LogInformation("Email xác nhận đã được gửi cho đơn hàng {OrderId}", order.OrderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email xác nhận cho đơn hàng {OrderId}", order.OrderId);
                throw new Exception("Không thể gửi email xác nhận", ex);
            }

        }

        private async Task<string> GenerateOrderQRCodeAsBase64(int orderId)
        {
            return await _qRCodeService.GenerateQRCodeAsBase64(orderId);

        }

        //Ngân
        private string GenerateEmailTemplate(GenerateQROrderResponse order, string qrCodeContentId)
        {
            var template = File.ReadAllText(_templatePath);
            var orderDetails = new StringBuilder();
            int stt = 1;
            decimal totalAmount = 0;

            // Thêm thông tin vé
            foreach (var seatNumber in order.SeatNumbers)
            {
                totalAmount += seatNumber.Quantity * seatNumber.Price;
                orderDetails.AppendLine($@"
                <tr>
                    <td>{stt++}</td>
                    <td>Ghế {seatNumber.Name}</td>
                    <td>{seatNumber.Quantity}</td>
                    <td>{seatNumber.Price:N0}</td>
                    <td>{(seatNumber.Quantity * seatNumber.Price):N0}</td>
                </tr>");
            }

            // Thêm phần thông tin combo nếu có
            if (order.Combos != null && order.Combos.Any())
            {
                foreach (var combo in order.Combos)
                {
                    totalAmount += combo.Quantity * combo.Price;
                    orderDetails.AppendLine($@"
                <tr>
                    <td>{stt++}</td>
                    <td>{combo.Name}</td>
                    <td>{combo.Quantity}</td>
                    <td>{combo.Price:N0}</td>
                    <td>{(combo.Price * combo.Quantity):N0}</td>
                </tr>");
                }
            }

            // Thay thế các placeholder trong template
            return template
                .Replace("{TheaterName}", order.TheaterName)
                .Replace("{OrderId}", order.OrderId.ToString())
                .Replace("{MovieName}", order.MovieName)
                .Replace("{ShowTime}", order.ShowTime.ToString("dd/MM/yyyy HH:mm"))
                .Replace("{RoomName}", order.RoomName)
                .Replace("{SeatCount}", order.SeatNumbers.Count.ToString())
                .Replace("{QRCodeContentId}", qrCodeContentId)
                .Replace("{OrderDetails}", orderDetails.ToString())
                .Replace("{TotalAmount}", totalAmount.ToString("N0"));
        }

        public async Task SendEmailAsync(string email, string subject, string message)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");

                using (var client = new System.Net.Mail.SmtpClient())
                {
                    client.Host = emailSettings["Host"]!;
                    client.Port = int.Parse(emailSettings["Port"]!);
                    client.EnableSsl = true;
                    client.Credentials = new System.Net.NetworkCredential(emailSettings["Mail"], emailSettings["Password"]);

                    using (var mailMessage = new MailMessage())
                    {
                        mailMessage.From = new MailAddress(emailSettings["Mail"]!, emailSettings["DisplayName"]);
                        mailMessage.To.Add(email);
                        mailMessage.Subject = subject;
                        mailMessage.Body = message;
                        mailMessage.IsBodyHtml = true;

                        await client.SendMailAsync(mailMessage);
                    }
                }
                _logger.LogTrace($"Email gửi thành công tới {email}");

            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi gửi email tới {email}: {ex.Message}");
                throw;
            }
        }

        public async Task SendAccountConfirmationEmailAsync(string email, string confirmationToken, string customerName)
        {
            var subject = "Xác nhận tài khoản Cinema Management";
            var confirmationLink = $"https://localhost:7212/api/Auth/confirm-email?token={confirmationToken}";

            var htmlContent = $@"
                <h2>Xin chào {customerName}!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại Cinema Management.</p>
                <p>Vui lòng click vào link sau để xác nhận tài khoản của bạn:</p>
                <p><a href='{confirmationLink}'>{confirmationLink}</a></p>
                <p>Link này sẽ hết hạn sau 24 giờ.</p>
                <p>Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.</p>
            ";

            await SendEmailAsync(email, subject, htmlContent);
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken, string customerName)
        {
            var subject = "Đặt lại mật khẩu Cinema Management";
            var resetLink = $"https://localhost:7212/reset-password?token={resetToken}";

            var htmlContent = $@"
                <h2>Xin chào {customerName}!</h2>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Vui lòng click vào link sau để đặt lại mật khẩu:</p>
                <p><a href='{resetLink}'>{resetLink}</a></p>
                <p>Link này sẽ hết hạn sau 1 giờ.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            ";

            await SendEmailAsync(email, subject, htmlContent);
        }

    }
}
