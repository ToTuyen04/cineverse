using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public partial class OrderRepository
    {
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
                    ComboTotal = o.OrderDetailCombos.Sum(c => (c.OrderDetailComboPrice ?? 0) * (c.OrderDetailComboQuantity ?? 1))
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
                    .SelectMany(o => o.OrderDetailTickets)
                    .Join(_context.Tickets, ot => ot.TicketId, t => t.TicketId, (ot, t) => new { ot.Order, t })
                    .Join(_context.Showtimes, ott => ott.t.ShowtimeId, s => s.ShowtimeId, (ott, s) => new { ott.Order, s })
                    .Join(_context.Movies, os => os.s.ShowtimeMovieId, m => m.MovieId, (os, m) => new { os.Order, m })
                    .Join(_context.MovieGenres, om => om.m.MovieId, mg => mg.MovieId, (om, mg) => new { om.Order, mg.Genres })
                    .GroupBy(x => new
                    {
                        OrderDate = x.Order.OrderCreateAt,
                        x.Genres.GenresId,
                        x.Genres.GenresName
                    })
                    .OrderByDescending(g => g.Key.OrderDate)
                    .ThenByDescending(g => g.Count())
                    .Select(g => new GenresDashboardDTO
                    {
                        OrderCreateAt = g.Key.OrderDate,
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
                .Where(o => o.OrderStatus == OrderStatus.Completed.ToString())
                .SelectMany(o => o.OrderDetailTickets)
                .Join(_context.Tickets, ot => ot.TicketId, t => t.TicketId, (ot, t) => new { ot.Order, t })
                .Join(_context.Showtimes, ott => ott.t.ShowtimeId, s => s.ShowtimeId, (ott, s) => new { ott.Order, s })
                .Join(_context.Movies, os => os.s.ShowtimeMovieId, m => m.MovieId, (os, m) => new { os.Order, m })
                .GroupBy(x => new
                {
                    OrderDate = x.Order.OrderCreateAt,
                    x.m.MovieId,
                    x.m.MovieName
                })
                .OrderByDescending(g => g.Key.OrderDate)
                .ThenByDescending(g => g.Count())
                .Select(g => new MovieDashboardDTO
                {
                    OrderCreateAt = g.Key.OrderDate,
                    MovieId = g.Key.MovieId,
                    MovieName = g.Key.MovieName,
                    TotalOrders = g.Count()
                })
                .ToListAsync();

            return result;
        }
    }
}
