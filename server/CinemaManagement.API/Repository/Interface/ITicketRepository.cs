using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface ITicketRepository : IGenericRepository<Ticket>
    {
        Task<List<Ticket>> GenerateTicketsForOrderAsync(int orderId, int showtimeId, List<OrderChairRequestDTO> selectedChairs);
        Task<List<Ticket>> GetTicketsByOrderIdAsync(int orderId);
        Task<Ticket> GetTicketWithDetailsAsync(int ticketId);

        Task ActivateTicketsForOrderAsync(int orderId);
    }
}
