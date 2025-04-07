using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public partial class MovieRepository
    {
        public async Task<Movie> AddAsync(Movie movie, List<int> genreIds)
        {
            if (movie == null)
                throw new ArgumentNullException(nameof(movie));
            try
            {
                // Add the movie
                await _dbSet.AddAsync(movie);
                return movie;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi thêm phim và thể loại: {ex.Message}", ex);
            }
        }
        public async Task<Movie> UpdateAsync(Movie movie)
        {
            if (movie == null)
                throw new ArgumentNullException(nameof(movie));

            // Start a transaction to ensure all operations succeed or fail together
            try
            {
                // First update the movie properties
                var existingMovie = await _context.Movies.FindAsync(movie.MovieId) ?? 
                    throw new InvalidOperationException($"Không tìm thấy phim với ID: {movie.MovieId}");

                // Update movie properties
                _dbSet.Entry(existingMovie).CurrentValues.SetValues(movie);
                //_dbSet.Entry(existingMovie).State = EntityState.Modified;
                // Return the updated movie with its genres
                return existingMovie;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật phim và thể loại: {ex.Message}", ex);
            }
        }
        public async Task<(PaginatedList<Movie> PaginatedMovies, int TotalItems)> GetPaginatedMoviesAsync(
            int pageIndex, 
            int pageSize, 
            string searchTerm = null,
            List<int> genreIds = null,
            MovieSortBy? sortBy = null,
            SortOrder? sortOrder = null)
        {
            var query = _context.Movies
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genres)
                .AsQueryable();

            // Get total count of all movies (regardless of search)
            var totalItems = await _context.Movies.CountAsync();

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalized = TextHelper.ToSearchFriendlyText(searchTerm);
                query = query.Where(x => x.MovieSearchName.Contains(normalized));
            }

            //Apply filter genre
            if (genreIds != null && genreIds.Any())
            {
                //query = query.Where(m => m.MovieGenres.Any(mg => genreIds.Contains(mg.GenresId.Value)));
                // Với mỗi genreId trong danh sách, phim phải có ít nhất một MovieGenre với genreId đó
                foreach (var genreId in genreIds)
                {
                    query = query.Where(m => m.MovieGenres.Any(mg => mg.GenresId == genreId));
                }
            }

            // Get total count for current search query
            var totalCount = await query.CountAsync();

            if (sortBy.HasValue)
            {
                bool isDescending = sortOrder == SortOrder.Descending;
                switch (sortBy.Value)
                {
                    case MovieSortBy.CreatedAt:
                        query = isDescending
                            ? query.OrderByDescending(m => m.MovieCreatAt)
                            : query.OrderBy(m => m.MovieCreatAt);
                        break;

                    case MovieSortBy.StartAt:
                        query =  isDescending
                            ? query.OrderByDescending(m => m.MovieStartAt)
                            : query.OrderBy(m => m.MovieStartAt);
                        break;

                    case MovieSortBy.EndAt:
                        query = isDescending
                            ? query.OrderByDescending(m => m.MovieEndAt)
                            : query.OrderBy(m => m.MovieEndAt);
                        break;

                    default:
                        query = query.OrderByDescending(m => m.MovieCreatAt);
                        break;
                }
            } else
            {
                query = query.OrderByDescending(m => m.MovieCreatAt);
            }

                // Apply pagination
                var items = await query
                    .Skip((pageIndex - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            return (new PaginatedList<Movie>(items, totalCount, pageIndex, pageSize), totalItems);
        }
        public async Task<int> GetTotalMovieCountAsync()
        {
            return await _context.Movies.CountAsync();
        }
        //public async Task<bool> HasActiveShowtimesAsync(int movieId)
        //{
        //    return await _context.Showtimes
        //        .AnyAsync(s => s.ShowtimeMovieId == movieId);
        //}
        public async Task<List<int>> GetActiveShowtimeIdsAsync(int movieId)
        {
            return await _context.Showtimes
                .Where(s => s.ShowtimeMovieId  == movieId)
                .Select(s => s.ShowtimeId)
                .ToListAsync();
        }

    }
}
