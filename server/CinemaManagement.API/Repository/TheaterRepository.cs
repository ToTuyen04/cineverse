using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Mapper;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class TheaterRepository : GenericRepository<Theater>, ITheaterRepository
    {
        
        public TheaterRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Theater>> SearchListAsync(string name)
        {
            // If search term is empty, return all theaters
            if (string.IsNullOrWhiteSpace(name))
            {
                return await _context.Theaters
                    .ToListAsync();
            }

            // Normalize the search term the same way theater names are normalized when saved
            var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(name);

            // Search using the normalized term against TheaterSearchName
            return await _context.Theaters
                .Where(x => x.TheaterSearchName.Contains(normalizedSearchTerm))
                .ToListAsync();
        }

        public async Task<(PaginatedList<Theater> PaginatedTheaters, int TotalItems)> GetPaginatedTheatersAsync(int pageIndex, int pageSize, string searchTerm = null)
        {
            var query = _context.Theaters.AsQueryable();

            // Get total count of all theaters (regardless of search)
            var totalItems = await _context.Theaters.CountAsync();

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(searchTerm);
                query = query.Where(x => x.TheaterSearchName.Contains(normalizedSearchTerm));
            }

            // Get total count for current search query
            var totalCount = await query.CountAsync();

            // Apply pagination
            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (new PaginatedList<Theater>(items, totalCount, pageIndex, pageSize), totalItems);
        }
    }
}
