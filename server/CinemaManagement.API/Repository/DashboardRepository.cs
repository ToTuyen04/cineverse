using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;
        protected readonly DbSet<Order> _dbSet;

        public DashboardRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<Order>();

        }
        public async Task<List<OrderDashboardDTO>> GetPaidOrdersDashBoard()
        {
            var query = _dbSet
                .Where(o => o.OrderStatus == OrderStatus.Completed.ToString() ||
                            o.OrderStatus == OrderStatus.Printed.ToString());
            var result = await query
                .Select(o => new OrderDashboardDTO
                {
                    OrderId = o.OrderId,
                    OrderCreateAt = o.OrderCreateAt,
                    TicketTotal = o.OrderDetailTickets.Sum(t => t.OrderDetailTicketPrice ?? 0),
                    ComboTotal = o.OrderDetailCombos.Sum(c => (c.OrderDetailComboPrice ?? 0) * (c.OrderDetailComboQuantity ?? 1)),
                    TheaterName = o.OrderDetailTickets
                        .Select(t => t.Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName) 
                        .FirstOrDefault()
                })
                .AsSplitQuery()
                .ToListAsync();
            return result;
        }
        public async Task<List<GenresDashboardDTO>> GetGenresDashBoard()
        {
            var result = await _dbSet
                .Where(o => o.OrderStatus == OrderStatus.Completed.ToString() ||
                            o.OrderStatus == OrderStatus.Printed.ToString())
                .Include(o => o.OrderDetailTickets) // Load các quan hệ cần thiết
                    .ThenInclude(odt => odt.Ticket)
                        .ThenInclude(t => t.Showtime)
                            .ThenInclude(s => s.ShowtimeMovie)
                                .ThenInclude(m => m.MovieGenres)
                                    .ThenInclude(mg => mg.Genres)
                .Include(o => o.OrderDetailTickets) // Load thêm TheaterName
                    .ThenInclude(odt => odt.Ticket)
                        .ThenInclude(t => t.Showtime)
                            .ThenInclude(s => s.ShowtimeRoom)
                                .ThenInclude(r => r.RoomTheater)
                .AsSplitQuery() // Tối ưu query nếu dữ liệu lớn
                .SelectMany(o => o.OrderDetailTickets)
                .Select(odt => new
                {
                    odt.Order.OrderCreateAt,
                    odt.Ticket.Showtime.ShowtimeMovie.MovieGenres,
                    TheaterName = odt.Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName // Lấy tên rạp phim
                })
                .SelectMany(x => x.MovieGenres, (x, mg) => new
                {
                    x.OrderCreateAt,
                    x.TheaterName,
                    mg.Genres.GenresId,
                    mg.Genres.GenresName
                })
                .GroupBy(x => new
                {
                    x.OrderCreateAt,
                    x.TheaterName,
                    x.GenresId,
                    x.GenresName
                })
                .OrderByDescending(g => g.Key.OrderCreateAt)
                .ThenByDescending(g => g.Count())
                .Select(g => new GenresDashboardDTO
                {
                    OrderCreateAt = g.Key.OrderCreateAt,
                    TheaterName = g.Key.TheaterName, // Thêm TheaterName vào DTO
                    GenresId = g.Key.GenresId,
                    GenresName = g.Key.GenresName,
                    TotalOrders = g.Count()
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<MovieDashboardDTO>> GetMovieDashBoard()
        {
            var result = await _dbSet
                .Where(o => o.OrderStatus == OrderStatus.Completed.ToString() ||
                            o.OrderStatus == OrderStatus.Printed.ToString())
                .Include(o => o.OrderDetailTickets)
                    .ThenInclude(odt => odt.Ticket)
                        .ThenInclude(t => t.Showtime)
                            .ThenInclude(s => s.ShowtimeMovie)
                .Include(o => o.OrderDetailTickets)
                    .ThenInclude(odt => odt.Ticket)
                        .ThenInclude(t => t.Showtime)
                            .ThenInclude(s => s.ShowtimeRoom)
                                .ThenInclude(r => r.RoomTheater)
                .AsSplitQuery()
                .SelectMany(o => o.OrderDetailTickets)
                .Select(odt => new
                {
                    odt.Order.OrderCreateAt,
                    odt.Ticket.Showtime.ShowtimeMovie.MovieId,
                    odt.Ticket.Showtime.ShowtimeMovie.MovieName,
                    TheaterName = odt.Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName
                })
                .GroupBy(x => new
                {
                    x.OrderCreateAt,
                    x.MovieId,
                    x.MovieName,
                    x.TheaterName
                })
                .OrderByDescending(g => g.Key.OrderCreateAt)
                .ThenByDescending(g => g.Count())
                .Select(g => new MovieDashboardDTO
                {
                    OrderCreateAt = g.Key.OrderCreateAt,
                    MovieId = g.Key.MovieId,
                    MovieName = g.Key.MovieName,
                    TheaterName = g.Key.TheaterName,
                    TotalOrders = g.Count()
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<ComboDashboardDTO>> GetComboDashBoard()
        {
            var result = await _dbSet
                .Where(o => o.OrderStatus == OrderStatus.Completed.ToString() ||
                            o.OrderStatus == OrderStatus.Printed.ToString())
                .Include(o => o.OrderDetailCombos)
                    .ThenInclude(odc => odc.Combo)
                .Include(o => o.OrderDetailTickets)
                    .ThenInclude(odt => odt.Ticket)
                        .ThenInclude(t => t.Showtime)
                            .ThenInclude(s => s.ShowtimeRoom)
                                .ThenInclude(r => r.RoomTheater)
                .AsSplitQuery()
                .SelectMany(o => o.OrderDetailCombos)
                .Select(odc => new
                {
                    odc.Order.OrderCreateAt,
                    odc.Combo.ComboId,
                    odc.Combo.ComboName,
                    TheaterName = odc.Order.OrderDetailTickets
                        .Select(odt => odt.Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName)
                        .FirstOrDefault()
                })
                .GroupBy(x => new
                {
                    x.OrderCreateAt,
                    x.ComboId,
                    x.ComboName,
                    x.TheaterName
                })
                .OrderByDescending(g => g.Key.OrderCreateAt)
                .ThenByDescending(g => g.Count())
                .Select(g => new ComboDashboardDTO
                {
                    OrderCreateAt = g.Key.OrderCreateAt,
                    ComboId = g.Key.ComboId,
                    ComboName = g.Key.ComboName,
                    TheaterName = g.Key.TheaterName,
                    TotalOrders = g.Count()
                })
                .ToListAsync();

            return result;
        }

        public async Task<decimal> GetTicketToday()
        {
            var result = await _dbSet
                .Where(o => (o.OrderStatus == OrderStatus.Completed.ToString() ||
                             o.OrderStatus == OrderStatus.Printed.ToString()) &&
                            o.OrderCreateAt.HasValue &&
                            o.OrderCreateAt.Value.Date == DateTime.Now.Date)
                .Include(o => o.OrderDetailTickets)
                .SelectMany(o => o.OrderDetailTickets)
                .CountAsync();
            return result;
        }


    }
}
