using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IRoomRepository : IGenericRepository<Room>
    {
        new Task<Room> AddAsync(Room room);
        new Task DeleteAsync(Room room);
        new Task<Room> UpdateAsync(Room room);
        Task<bool> ExistsAsync(int id);
        Task<bool> HasActiveOrUpcomingShowtimesAsync(int id);
        Task<bool> ExistsByNameInTheaterAsync(int theaterId, int? roomId, string name);
    }
}
