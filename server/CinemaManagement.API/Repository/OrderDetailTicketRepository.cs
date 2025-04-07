using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class OrderDetailTicketRepository : GenericRepository<OrderDetailTicket>, IOrderDetailTicketRepository
    {
        public OrderDetailTicketRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Ticket> GetFirstTicketByOrderIdAsync(int orderId)
        {
            return await _dbSet
                .Where(o => o.OrderId == orderId)
                .Select(o => o.Ticket)
                .FirstOrDefaultAsync();
        }

        public async Task AddRangeAsync(List<OrderDetailTicket> orderDetails)
        {
            await _context.OrderDetailTickets.AddRangeAsync(orderDetails);
        }

    }
}
