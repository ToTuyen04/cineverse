using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IChairShowtimeRepository : IGenericRepository<ChairShowtime>
    {
        Task<List<ChairShowtime>> GetChairsByShowtimesAsync(int showtimeId);
        Task<ChairShowtime> GetChairShowtimeAsync(int showtimeId, int chairShowtimeId);
        Task<bool> BookingChairAsync(int showtimeId, int chairShowtimeId, byte[] version);
        Task<bool> ReleaseChairAsync(int showtimeId, int chairId);
        Task<bool> UpdateChairsAvailabilityAsync(int showtimeId, List<int> chairIds);
        Task<decimal> GetPriceByChairAndShowtimeAsync(int chairId, int showtimeId);
        Task<List<ChairShowtime>> GetAllChairShowtimeAsync();
    }

}
