using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Repository.Interface
{
    public partial interface IMovieRepository
    {
        Task<Movie> AddAsync(Movie movie, List<int> genreIds);
        Task<Movie> UpdateAsync(Movie movie);
        Task<(PaginatedList<Movie> PaginatedMovies, int TotalItems)> GetPaginatedMoviesAsync(
            int pageIndex, 
            int pageSize, 
            string searchTerm = null, 
            List<int> genreIds = null,
            MovieSortBy? sortBy = null,
            SortOrder? sortOrder = null);
        Task<int> GetTotalMovieCountAsync();
        //Task<bool> HasActiveShowtimesAsync(int movieId);
        Task<List<int>> GetActiveShowtimeIdsAsync(int movieId);
    }
}
