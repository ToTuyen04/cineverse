using CinemaManagement.API.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IMovieGenreRepository
    {
        Task AddAsync(MovieGenre movieGenre);
        Task RemoveRangeAsync(IEnumerable<MovieGenre> movieGenres);
        Task<IEnumerable<MovieGenre>> GetByMovieIdAsync(int movieId);
    }
}