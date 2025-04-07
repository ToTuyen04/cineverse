using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Service.Interface
{
    public interface IShowtimeService
    {
        Task<List<ShowtimeResponseDTOs>> GetAllShowtimesAsync();
        Task<ShowtimeResponseDTOs> GetShowtimeByIdAsync(int id);
        Task<List<ShowtimeResponseDTOs>> GetShowtimeAsync(int theaterId, int movieId);
        Task<ShowtimeResponseDTOs> AddAsync(ShowtimeRequestDTO.ShowtimeCreateDTO request);
        Task<ShowtimeResponseDTOs> UpdateAsync(int id, ShowtimeRequestDTO.ShowtimeUpdateDTO request);
        Task DeleteAsync(int showtimeId);
        Task<IEnumerable<ShowtimeResponseDTOs>> SearchShowtimesAsync(string searchTerm);
        Task<PaginatedResponse<ShowtimeResponseDTOs>> GetPaginatedShowtimesAsync(
            int pageIndex,
            int pageSize,
            string searchTerm = null,
            int? movieId = null,
            int? theaterId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null);
    }
}
