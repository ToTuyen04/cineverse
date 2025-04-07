    using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CinemaManagement.API.Repository
{
    public partial class MovieRepository : GenericRepository<Movie>, IMovieRepository
    {
        public MovieRepository(ApplicationDbContext context) : base(context)
        {
        }

        //search theo attribute searchName chứ k phải theo movie name
        public async Task<List<Movie>> SearchListAsync(string name)
        {
            // If search term is empty, return all movies or handle as needed
            if (string.IsNullOrWhiteSpace(name))
            {
                return await _dbSet
                    .Include(m => m.MovieGenres)
                    .ThenInclude(mg => mg.Genres)
                    .ToListAsync();
            }

            // Normalize the search term the same way movie names are normalized when saved
            var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(name);

            return await _dbSet
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genres)
                .Where(x => x.MovieSearchName.Contains(normalizedSearchTerm))
                .ToListAsync();
        }

        public async Task<bool> IsMovieNameExistAsync(string movieName)
        {
            if(string.IsNullOrWhiteSpace(movieName))
            {
                return false;
            }
            return await _dbSet.AnyAsync(m => m.MovieName.ToLower() == movieName.ToLower());
        }

        public override async Task<IEnumerable<Movie>> GetAllAsync()
        {
            //return await _dbSet.ToListAsync();
            var query = _dbSet.Include(m => m.MovieGenres)
                .ThenInclude(mv => mv.Genres);
            return await query.ToListAsync();
        }

        public override async Task<Movie> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genres)
                .FirstOrDefaultAsync(m => m.MovieId == id)
                ;
        }
    }
    
}
