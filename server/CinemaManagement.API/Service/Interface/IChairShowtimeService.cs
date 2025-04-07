using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service.Interface
{
    public interface IChairShowtimeService 
    {
        Task<List<ChairShowtimeResponseDTO>> GetChairsByShowtimes(int showtimeId);
        Task<ChairShowtime> GetChairShowtime(int showtimeId, int chairShowtimeId);

    }
}
