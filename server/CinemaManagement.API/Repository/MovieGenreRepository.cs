using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CinemaManagement.API.Repository
{
    public class MovieGenreRepository : IMovieGenreRepository
    {
        private readonly ApplicationDbContext _context;

        public MovieGenreRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(MovieGenre movieGenre)
        {
            await _context.MovieGenres.AddAsync(movieGenre);
        }

        public async Task RemoveRangeAsync(IEnumerable<MovieGenre> movieGenres)
        {
            _context.MovieGenres.RemoveRange(movieGenres);
        }

        public async Task<IEnumerable<MovieGenre>> GetByMovieIdAsync(int movieId)
        {
            return await _context.MovieGenres
                .Where(mg => mg.MovieId == movieId)
                .ToListAsync();
        }
    }
}