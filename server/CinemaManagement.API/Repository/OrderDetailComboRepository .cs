using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class OrderDetailComboRepository : GenericRepository<OrderDetailCombo>, IOrderDetailComboRepository
    {
        public OrderDetailComboRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<OrderDetailCombo>> GetCombosWithDetailsAsync(int orderId)
        {
            return await _dbSet
                .Include(c => c.Combo)
                .Where(c => c.OrderId == orderId)
                .ToListAsync();
        }

        public async Task<bool> HasCombosByOrderIdAsync(int orderId)
        {
            return await _dbSet.AnyAsync(odc => odc.OrderId.Value == orderId);
        }

        public async Task<IEnumerable<OrderDetailCombo>> AddRangeAsync(IEnumerable<OrderDetailCombo> orderDetailCombos)
        {
            await _dbSet.AddRangeAsync(orderDetailCombos);
            
            return orderDetailCombos;
        }

        /// <summary>
        /// Lấy danh sách combo của order
        /// </summary>
        public async Task<IEnumerable<OrderDetailCombo>> GetOrderDetailCombosByOrderIdAsync(int orderId)
        {
            return await _dbSet
                .Include(odc => odc.Combo)
                .Where(odc => odc.OrderId == orderId)
                .ToListAsync();
        }
    }
}
