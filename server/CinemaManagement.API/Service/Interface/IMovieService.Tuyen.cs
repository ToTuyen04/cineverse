using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Service.Interface
{
    public partial interface IMovieService : ISearchService<MovieResponseDTO>
    {
        Task<MovieResponseDTO> AddAsync(MovieRequestDTO.MovieCreateDTO movieDTO, List<int> genreIds);
        Task<MovieResponseDTO> UpdateAsync(int id, MovieRequestDTO.MovieUpdateDTO movieDTO, List<int> genreIds);
        Task DeleteAsync(int id);
        Task<IEnumerable<MovieResponseDTO>> GetAllAsync();
        Task<MovieResponseDTO> GetByIdAsync(int id);
        Task<PaginatedResponse<MovieResponseDTO>> GetPaginatedMoviesAsync(
            int pageIndex, 
            int pageSize, 
            string searchTerm = null, 
            List<int> genreIds = null,
            MovieSortBy? sortBy = null,
            SortOrder? sortOrder = null);
        //Task<bool> HasActiveShowtimesAsync(int movieId);
        //Task<List<int>> GetActiveShowtimeIdsAsync(int movieId);
    }
}
