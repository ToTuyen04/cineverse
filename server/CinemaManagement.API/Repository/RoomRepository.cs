using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class RoomRepository : GenericRepository<Room>, IRoomRepository
    {
        public RoomRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Room>> GetAllAsync()
        {
            return await _dbSet
                .Include(r => r.RoomScreenType)
                .Include(r => r.RoomTheater)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Room> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(r => r.RoomScreenType)
                .Include(r => r.RoomTheater)
                .FirstOrDefaultAsync(r => r.RoomId == id);
        }

        new public async Task<Room> AddAsync(Room room)
        {
            await _dbSet.AddAsync(room);

            return room;
        }

        new public async Task DeleteAsync(Room room)
        {
            _dbSet.Remove(room);
        }

        new public async Task<Room> UpdateAsync(Room room)
        {
            _context.Entry(room).State = EntityState.Modified;

            return room;
        }
        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Rooms.AnyAsync(r => r.RoomId == id);
        }

        public async Task<bool> HasActiveOrUpcomingShowtimesAsync(int id)
        {
            var currentTime = DateTime.Now;
            return await _dbSet
                .Include(r => r.Showtimes)
                    .ThenInclude(s => s.ShowtimeMovie)
                .AnyAsync(r => r.RoomId == id &&
                    r.Showtimes.Any(s =>
                        (s.ShowtimeStartAt <= currentTime &&
                        s.ShowtimeStartAt.Value.AddMinutes(s.ShowtimeMovie.MovieDuration.Value) > currentTime)
                        ||
                        s.ShowtimeStartAt > currentTime
                    ));

        }

        public async Task<bool> ExistsByNameInTheaterAsync(int theaterId, int? roomId, string name)
        {
            if (roomId.HasValue)
            {
                // Trường hợp update: kiểm tra trùng tên với các phòng khác (trừ phòng hiện tại)
                return await _dbSet.AnyAsync(r =>
                    r.RoomId != roomId.Value
                    && r.RoomName.ToLower() == name.ToLower()
                    && r.RoomTheaterId == theaterId);
            }

            // Trường hợp create: đơn giản chỉ kiểm tra trùng tên trong cùng rạp
            return await _dbSet.AnyAsync(r =>
                r.RoomName.ToLower() == name.ToLower()
                && r.RoomTheaterId == theaterId);
        }

    }
}

