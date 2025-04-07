using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    //Gênres vừa có crud (IGenericRepository) vừa có search (ISearchRepository)
    //Interface hoàn chỉnh của thể loại phim - genre
    public interface IGenresRepository : IGenericRepository<Genre>, ISearchRepository<Genre>
    {
        Task<IEnumerable<int>> GetExistingGenreIdsAsync(List<int> genreIds);
    }
}
