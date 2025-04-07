using CinemaManagement.API.Entities;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IShowtimeRepository : IGenericRepository<Showtime>
    {
        Task<List<Showtime>> GetShowtimeAsync(int theaterId, int movieId);
        Task<List<Showtime>> GetShowtimesByRoomIdAsync(int theaterId, int roomId);
        Task<IEnumerable<Showtime>> GetAllAsync();
        Task<Showtime> GetByIdAsync(int id);
        Task<IEnumerable<Showtime>> SearchShowtimesAsync(string searchTerm);
        Task<(PaginatedList<Showtime> PaginatedShowtimes, int TotalItems)> GetPaginatedShowtimesAsync(
            int pageIndex,
            int pageSize,
            string searchTerm = null,
            int? movieId = null,
            int? theaterId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);
        Task<List<Showtime>> GetAllByMovieIdWithDetailsAsync(int movieId, int AdvanceTicketingDays);
    }
    
}
