using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using static CinemaManagement.API.DTOs.Request.OrderRequestDTO;

namespace CinemaManagement.API.Service.Interface
{
    public interface IOrderDetailComboService 
    {
        Task<OrderDetailComboResponseDto> AddRangeAsync(OrderDetailComboRequestDto request);
        Task<OrderDetailComboResponseDto> AddCombosToOrderAysnc(int orderId, List<ComboItemRequestDTO> comboItemRequests);
    }
}
