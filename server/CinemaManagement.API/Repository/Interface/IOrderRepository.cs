using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        public Task<Order> CreatePendingOrderAsync(Order order);
        public Task<Order> GetOrderWithDetailsAsync(int orderId);

        public Task<List<Order>> GetOrdersByStatusAsync(string status);
        Task<string> GetOrderStatusAsync(int orderId);
        Task<bool> UpdateOrderStatusAsync(int orderId, string status);

        Task<Order> GetOrderByPhoneAsync(string phone);
        Task<List<OrderReportDTO>> GetPaidOrdersByPeriodAsync(DateTime startDate, DateTime endDate, int? theaterId);
        Task<OrderDetailResponseDTO?> GetOrderDetailAysnc(int orderId);

    }
}
