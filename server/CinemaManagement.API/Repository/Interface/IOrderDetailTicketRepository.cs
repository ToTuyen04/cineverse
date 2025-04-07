using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IOrderDetailTicketRepository : IGenericRepository<OrderDetailTicket>
    {
        Task<Ticket> GetFirstTicketByOrderIdAsync(int orderId);
        public Task AddRangeAsync(List<OrderDetailTicket> ticket); 
    }
}
