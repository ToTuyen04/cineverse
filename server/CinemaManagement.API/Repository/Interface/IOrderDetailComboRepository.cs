using CinemaManagement.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IOrderDetailComboRepository : IGenericRepository<OrderDetailCombo>
    {
        Task<bool> HasCombosByOrderIdAsync(int orderId);
        Task<IEnumerable<OrderDetailCombo>> AddRangeAsync(IEnumerable<OrderDetailCombo> orderDetailCombo);
        Task<IEnumerable<OrderDetailCombo>> GetOrderDetailCombosByOrderIdAsync(int orderId);
    }
}
