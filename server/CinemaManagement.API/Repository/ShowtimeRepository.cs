using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class ShowtimeRepository : GenericRepository<Showtime>, IShowtimeRepository
    {
        public ShowtimeRepository(ApplicationDbContext context) : base(context)
        {
        }


        public async Task<List<Showtime>> GetShowtimeAsync(int theaterId, int movieId)
        {
            var query = _context.Showtimes
                .Include(s => s.ShowtimeMovie)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomScreenType)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomTheater)
                .AsQueryable();

            if (theaterId != null)
            {
                query = query.Where(s => s.ShowtimeRoom.RoomTheaterId == theaterId);
            }

            if (movieId != null)
            {
                query = query.Where(s => s.ShowtimeMovieId == movieId);
            }

            return await query.ToListAsync();
        }

        public async Task<List<Showtime>> GetShowtimesByRoomIdAsync(int theaterId, int roomId)
        {
            //var query = _context.Showtimes.AsQueryable();
            var query = _context.Showtimes
        .Include(s => s.ShowtimeRoom)
        .Include(s => s.ShowtimeMovie)
        .AsQueryable();

            if (theaterId != null)
            {
                query = query.Where(s => s.ShowtimeRoom.RoomTheaterId == theaterId);
            }

            if (roomId != null)
            {
                query = query.Where(s => s.ShowtimeRoomId == roomId);
            }

            return await query.ToListAsync();
        }

        public override async Task<Showtime> GetByIdAsync(int id)
        {
            return await _context.Showtimes
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomScreenType)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomTheater)
                .Include(s => s.ShowtimeMovie)
                .FirstOrDefaultAsync(s => s.ShowtimeId == id);
        }
        public async Task<IEnumerable<Showtime>> SearchShowtimesAsync(string searchTerm)
        {
            var query = _context.Showtimes
                .Include(s => s.ShowtimeMovie)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomScreenType)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomTheater)
                .AsQueryable();
            if(!string.IsNullOrEmpty(searchTerm))
            {
                var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(searchTerm);
                query = query.Where(s =>
                    s.ShowtimeMovie.MovieSearchName.Contains(normalizedSearchTerm) ||
                    s.ShowtimeRoom.RoomName.Contains(normalizedSearchTerm) ||
                    s.ShowtimeRoom.RoomTheater.TheaterName.Contains(normalizedSearchTerm));
            }
            return await query.ToListAsync();
        }
        public async Task<(PaginatedList<Showtime> PaginatedShowtimes, int TotalItems)> GetPaginatedShowtimesAsync(
            int pageIndex,
            int pageSize,
            string searchTerm = null,
            int? movieId = null,
            int? theaterId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var query = _context.Showtimes
                .Include(s => s.ShowtimeMovie)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomScreenType)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomTheater)
                    .AsQueryable();
            //Tính tổng các showtime
            var totalItems = await _context.Showtimes.CountAsync();

            //Apply filters
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(searchTerm);
                query = query.Where(s => 
                s.ShowtimeMovie.MovieSearchName.Contains(normalizedSearchTerm) || 
                s.ShowtimeRoom.RoomName.Contains(normalizedSearchTerm) || 
                s.ShowtimeRoom.RoomTheater.TheaterName.Contains(normalizedSearchTerm));
            }

            if (movieId.HasValue && movieId.Value > 0)
            {
                query = query.Where(s => s.ShowtimeMovieId == movieId.Value);
            }
            if(theaterId.HasValue && theaterId.Value > 0)
            {
                query = query.Where(s => s.ShowtimeRoom.RoomTheaterId == theaterId.Value);
            }

            if(fromDate.HasValue)
            {
                query = query.Where(s => s.ShowtimeStartAt >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(s => s.ShowtimeStartAt >= toDate.Value);
            }

            //Đếm danh sách showtime filter theo count
            var totalCount = await query.CountAsync();

            //Sắp xếp theo thời gian bắt đầu công chiếu (mới nhất trước)
            query = query.OrderByDescending(s => s.ShowtimeStartAt);

            //Áp dụng phân trang
            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (new PaginatedList<Showtime>(items, totalCount, pageIndex, pageSize), totalItems);
        }


        public async Task<List<Showtime>> GetAllByMovieIdWithDetailsAsync(int movieId, int advanceTicketingDays)
        {
            var now = DateTime.Now.AddMinutes(-15);
            var today = DateTime.Today;
            
            var maxDate = today.AddDays(advanceTicketingDays); 

            return await _dbSet
                .Where(s => s.ShowtimeMovieId == movieId)
                .Where(s => s.ShowtimeStartAt >= now) // Điều kiện 1: ShowtimeStartAt > thời điểm hiện tại - 15 phút
                .Where(s => s.ShowtimeStartAt < maxDate) // Điều kiện 2: Trong khoảng từ hôm nay đến advanceTicketingDays
                .Where(s => s.ShowtimeAvailable == true)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomTheater)
                .Include(s => s.ShowtimeRoom)
                    .ThenInclude(r => r.RoomScreenType)
                .OrderBy(s => s.ShowtimeStartAt)
                .ToListAsync();
        }

        public override async Task<IEnumerable<Showtime>> GetAllAsync()
        {
            return await _context.Showtimes
                .Include(s => s.ShowtimeMovie)
                .Include(s => s.ShowtimeRoom)
                .ThenInclude(r => r.RoomScreenType)
                .Include(s => s.ShowtimeRoom)
                .ThenInclude(r => r.RoomTheater)
                .Include(s => s.Tickets)
                .ToListAsync();
        }
    }
}
