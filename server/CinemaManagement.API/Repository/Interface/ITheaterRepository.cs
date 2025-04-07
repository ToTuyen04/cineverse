using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Repository.Interface
{
    public interface ITheaterRepository : IGenericRepository<Theater>, ISearchRepository<Theater>
    {
        Task<(PaginatedList<Theater> PaginatedTheaters, int TotalItems)> GetPaginatedTheatersAsync(int pageIndex, int pageSize, string searchTerm = null);

    }
}
