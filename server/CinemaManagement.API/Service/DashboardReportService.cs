using System.Globalization;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.Service
{
    public class DashboardReportService : IDashboardReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        public DashboardReportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Task<List<ComboDashboardDTO>> FilterComboDashboard(string theater, string time)
        {
            throw new NotImplementedException();
        }

        public Task<List<GenresDashboardDTO>> FilterGenresDashboard(string theater, string time)
        {
            throw new NotImplementedException();
        }

        public Task<List<MovieDashboardDTO>> FilterMovieDashboard(string theater, string time)
        {
            throw new NotImplementedException();
        }

        public Task<List<OrderDashboardDTO>> FilterOrderDashboard(string theater, string time)
        {
            throw new NotImplementedException();
        }

        public async Task<DashboardDTOs> GetDashboards(string theater, string time)
        {
            var totalMovie = (await _unitOfWork.MovieRepo.GetAllAsync()).Count();
            var totalTheater = (await _unitOfWork.TheaterRepo.GetAllAsync()).Count();
            var todayTicket = await _unitOfWork.DashboardRepo.GetTicketToday();
            var theaterNames = (await _unitOfWork.TheaterRepo.GetAllAsync()).Select(t => t.TheaterName).ToList();

            var orderDashboards = await _unitOfWork.DashboardRepo.GetPaidOrdersDashBoard();
            var genresDashboards = await _unitOfWork.DashboardRepo.GetGenresDashBoard();
            var movieDashboards = await _unitOfWork.DashboardRepo.GetMovieDashBoard();
            var comboDashboards = await _unitOfWork.DashboardRepo.GetComboDashBoard();

            if (string.IsNullOrEmpty(time) || time.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                if (!theater.Equals("All", StringComparison.OrdinalIgnoreCase))
                {
                    // Không phân biệt thời gian, lọc theo theater
                    orderDashboards = orderDashboards.Where(x => x.TheaterName == theater).ToList();
                    genresDashboards = genresDashboards.Where(x => x.TheaterName == theater).ToList();
                    movieDashboards = movieDashboards.Where(x => x.TheaterName == theater).ToList();
                    comboDashboards = comboDashboards.Where(x => x.TheaterName == theater).ToList();
                }
            }
            else if (time.StartsWith("Q"))
            {
                // Quý
                var parts = time.Split('_');
                int quarter = int.Parse(parts[0].Substring(1));
                int year = int.Parse(parts[1]);
                int startMonth = (quarter - 1) * 3 + 1;
                int endMonth = startMonth + 2;

                if (theater.Equals("All", StringComparison.OrdinalIgnoreCase))
                {
                    orderDashboards = orderDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth).ToList();
                    genresDashboards = genresDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth).ToList();
                    movieDashboards = movieDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth).ToList();
                    comboDashboards = comboDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth).ToList();
                }
                else
                {
                    orderDashboards = orderDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth && x.TheaterName == theater).ToList();
                    genresDashboards = genresDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth && x.TheaterName == theater).ToList();
                    movieDashboards = movieDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth && x.TheaterName == theater).ToList();
                    comboDashboards = comboDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month >= startMonth && x.OrderCreateAt.Value.Month <= endMonth && x.TheaterName == theater).ToList();
                }
            }
            else if (time.Contains("_"))
            {
                // Tháng/Năm
                var parts = time.Split('_');
                int month = int.Parse(parts[0]);
                int year = int.Parse(parts[1]);

                if (theater.Equals("All", StringComparison.OrdinalIgnoreCase))
                {
                    orderDashboards = orderDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month).ToList();
                    genresDashboards = genresDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month).ToList();
                    movieDashboards = movieDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month).ToList();
                    comboDashboards = comboDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month).ToList();
                }
                else
                {
                    orderDashboards = orderDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month && x.TheaterName == theater).ToList();
                    genresDashboards = genresDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month && x.TheaterName == theater).ToList();
                    movieDashboards = movieDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month && x.TheaterName == theater).ToList();
                    comboDashboards = comboDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.OrderCreateAt.Value.Month == month && x.TheaterName == theater).ToList();
                }
            }
            else if (int.TryParse(time, out int year))
            {
                // Năm
                if (theater.Equals("All", StringComparison.OrdinalIgnoreCase))
                {
                    orderDashboards = orderDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year).ToList();
                    genresDashboards = genresDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year).ToList();
                    movieDashboards = movieDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year).ToList();
                    comboDashboards = comboDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year).ToList();
                }
                else
                {
                    orderDashboards = orderDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.TheaterName == theater).ToList();
                    genresDashboards = genresDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.TheaterName == theater).ToList();
                    movieDashboards = movieDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.TheaterName == theater).ToList();
                    comboDashboards = comboDashboards.Where(x => x.OrderCreateAt.HasValue && x.OrderCreateAt.Value.Year == year && x.TheaterName == theater).ToList();
                }
            }

            // Group orderDashboards based on the time filter
            if (time.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                orderDashboards = orderDashboards
                    .GroupBy(x => x.OrderCreateAt.Value.Year)
                    .Select(g => new OrderDashboardDTO
                    {
                        OrderCreateAt = new DateTime(g.Key, 1, 1),
                        TicketTotal = g.Sum(x => x.TicketTotal),
                        ComboTotal = g.Sum(x => x.ComboTotal),
                        TheaterName = g.First().TheaterName
                    })
                    .ToList();
            }
            else if (time.StartsWith("Q") || time.Length == 4)
            {
                orderDashboards = orderDashboards
                    .GroupBy(x => new { x.OrderCreateAt.Value.Year, x.OrderCreateAt.Value.Month })
                    .Select(g => new OrderDashboardDTO
                    {
                        OrderCreateAt = new DateTime(g.Key.Year, g.Key.Month, 1),
                        TicketTotal = g.Sum(x => x.TicketTotal),
                        ComboTotal = g.Sum(x => x.ComboTotal),
                        TheaterName = g.First().TheaterName
                    })
                    .ToList();
            }
            else if (time.Contains("_"))
            {
                orderDashboards = orderDashboards
                    .GroupBy(x => x.OrderCreateAt.Value.Date)
                    .Select(g => new OrderDashboardDTO
                    {
                        OrderCreateAt = g.Key,
                        TicketTotal = g.Sum(x => x.TicketTotal),
                        ComboTotal = g.Sum(x => x.ComboTotal),
                        TheaterName = g.First().TheaterName
                    })
                    .ToList();
            }

            var totalTicket = orderDashboards.Sum(x => x.TicketTotal);
            var totalCombo = orderDashboards.Sum(x => x.ComboTotal);

            // Group and take top 5 by total orders
            genresDashboards = genresDashboards
                .GroupBy(x => x.GenresName)
                .Select(g => new GenresDashboardDTO
                {
                    GenresName = g.Key,
                    TotalOrders = g.Sum(x => x.TotalOrders),
                    OrderCreateAt = g.First().OrderCreateAt,
                    GenresId = g.First().GenresId,
                    TheaterName = g.First().TheaterName
                })
                .OrderByDescending(x => x.TotalOrders)
                .Take(5)
                .ToList();

            movieDashboards = movieDashboards
                .GroupBy(x => x.MovieName)
                .Select(g => new MovieDashboardDTO
                {
                    MovieName = g.Key,
                    TotalOrders = g.Sum(x => x.TotalOrders),
                    OrderCreateAt = g.First().OrderCreateAt,
                    MovieId = g.First().MovieId,
                    TheaterName = g.First().TheaterName
                })
                .OrderByDescending(x => x.TotalOrders)
                .Take(5)
                .ToList();

            comboDashboards = comboDashboards
                .GroupBy(x => x.ComboName)
                .Select(g => new ComboDashboardDTO
                {
                    ComboName = g.Key,
                    TotalOrders = g.Sum(x => x.TotalOrders),
                    OrderCreateAt = g.First().OrderCreateAt,
                    ComboId = g.First().ComboId,
                    TheaterName = g.First().TheaterName
                })
                .OrderByDescending(x => x.TotalOrders)
                .Take(5)
                .ToList();

            var dashboardReports = new DashboardDTOs
            {
                totalMoive = totalMovie,
                totalTheater = totalTheater,
                theaterNames = theaterNames,
                ticketToday = todayTicket,
                totalCombo = totalCombo,
                totalTicket = totalTicket,
                orderDashboards = orderDashboards,
                genresDashboards = genresDashboards,
                movieDashboards = movieDashboards,
                comboDashboards = comboDashboards
            };
            return dashboardReports;
        }
    }
}
