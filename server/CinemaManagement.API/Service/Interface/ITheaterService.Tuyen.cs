using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Service.Interface
{
    public partial interface ITheaterService
    {
        Task<PaginatedResponse<TheaterResponseDTO>> GetPaginatedTheatersAsync(int pageIndex, int pageSize, string searchTerm = null);
        Task<TheaterResponseDTO> AddAsync(TheaterRequestDTO request);
        Task<TheaterResponseDTO> UpdateAsync(int id, TheaterRequestDTO request);
    }
}
