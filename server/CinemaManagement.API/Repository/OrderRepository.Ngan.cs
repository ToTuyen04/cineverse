using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public partial class OrderRepository
    {
        public async Task<List<OrderReportDTO>> GetPaidOrdersByPeriodAsync(DateTime startDate, DateTime endDate, int? theaterId)
        {
            // 1. Lọc đơn hàng theo thời gian trước
            var query = _dbSet
                .Where(o => (o.OrderStatus == OrderStatus.Completed.ToString() ||
                                o.OrderStatus == OrderStatus.Printed.ToString()) &&
                            o.OrderCreateAt >= startDate &&
                            o.OrderCreateAt <= endDate);

            // 2. Lọc theo rạp nếu cần
            if (theaterId.HasValue)
            {
                query = query.Where(o => o.OrderDetailTickets
                    .Any(odt => odt.Ticket!.Showtime!.ShowtimeRoom!.RoomTheater!.TheaterId == theaterId));
            }

            // 3. Sử dụng projection để lấy chỉ dữ liệu cần thiết
            var result = await query
                .Select(o => new OrderReportDTO
                {
                    OrderId = o.OrderId,
                    OrderCreateAt = o.OrderCreateAt,
                    UserId = o.UserId,
                    OrderStatus = o.OrderStatus,
                    OrderName = o.OrderName,
                    OrderEmail = o.OrderEmail,
                    OrderPhone = o.OrderPhone,
                    // Lấy thông tin từ vé đầu tiên (nếu có)
                    MovieName = o.OrderDetailTickets
                        .Select(t => t.Ticket.Showtime.ShowtimeMovie.MovieName)
                        .FirstOrDefault(),
                    RoomName = o.OrderDetailTickets
                        .Select(t => t.Ticket.Showtime.ShowtimeRoom.RoomName)
                        .FirstOrDefault(),
                    TheaterName = o.OrderDetailTickets
                        .Select(t => t.Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName)
                        .FirstOrDefault(),
                    StartTime = o.OrderDetailTickets
                        .Select(t => t.Ticket.Showtime.ShowtimeStartAt)
                        .FirstOrDefault(),
                    TicketTotal = o.OrderDetailTickets.Sum(t => t.OrderDetailTicketPrice ?? 0),
                    ComboTotal = o.OrderDetailCombos.Sum(c => (c.OrderDetailComboPrice ?? 0) * (c.OrderDetailComboQuantity ?? 1))
                })
                .AsSplitQuery()
                .ToListAsync();

            return result;
        }
    }
}
