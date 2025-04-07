using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CinemaManagement.API.Repository
{
    //crud (GenericRepository) + search (ISearchRepository: override lại search)
    public class GenresRepository : GenericRepository<Genre>, IGenresRepository
    {
        public GenresRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Genre>> SearchListAsync(string name)
        {
            return await _dbSet.Where(x => x.GenresName.Contains(name)).ToListAsync();
        }
        public async Task<IEnumerable<int>> GetExistingGenreIdsAsync(List<int> genreIds)
        {
            return await _context.Genres
                .Where(g => genreIds.Contains(g.GenresId))
                .Select(g => g.GenresId)
                .ToListAsync();
        }
    }
}

