using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IPaymentService
    {
        public Task<PaymentUrlResponseDTO> CreatePaymentUrlAsync(PaymentRequestDTO request); 

        public Task<PaymentResultResponseDTO> ProcessPaymentCallbackAsync(PaymentCallbackRequestDTO callbackData);
        public Task<OrderStatusResponseDTO> GetOrderStatusAsync(int orderId);

    }
}
