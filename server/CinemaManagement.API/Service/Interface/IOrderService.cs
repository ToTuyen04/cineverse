using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IOrderService
    {
        Task<OrderResponseDTO> CreateOrderAsync(OrderRequestDTO request);
        Task<OrderDetailResponseDTO> GetOrderDetailsAsync(int orderId);
        Task<bool> IsExistChair(int showtimeid, List<OrderChairRequestDTO> list);
        Task ReleaseChairAsync(int orderId, int showtimeId, List<OrderChairRequestDTO> list);
        Task<bool> BookingChairAsync(int showtimeId, List<OrderChairRequestDTO> list);
    }
}
