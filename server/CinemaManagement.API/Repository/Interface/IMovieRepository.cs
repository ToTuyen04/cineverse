using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public partial interface IMovieRepository : IGenericRepository<Movie>, ISearchRepository<Movie>
    {
        Task<bool> IsMovieNameExistAsync(string movieName);
        Task<IEnumerable<Movie>> GetAllAsync();
    }
}
