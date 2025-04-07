using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class TicketRepository : GenericRepository<Ticket>, ITicketRepository
    {
        public TicketRepository(ApplicationDbContext context) : base(context)
        {
        }

        //Tạo vé cho từng ghế được chọn trong đơn hàng
        public async Task<List<Ticket>> GenerateTicketsForOrderAsync(int orderId, int showtimeId, List<OrderChairRequestDTO> selectedChairs)
        {

            //Get order and order detail tickets
            var order = await _context.Orders
                .Include(o => o.OrderDetailTickets)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new Exception($"Không tìm thấy đơn hàng ID: {orderId}");
            var tickets = new List<Ticket>();

            //Get showtime and chair to create ticket
            var orderDetails = await _context.OrderDetailTickets
                .Where(odt => odt.OrderId == orderId && odt.TicketId == null)
                .ToListAsync();


            //Create ticket for each showtime and chair
            for (int i = 0; i < selectedChairs.Count; i++)
            {
                var chairRequest = selectedChairs[i];
                var orderDetail = orderDetails[i];

                var chairShowtime = await _context.ChairShowtimes
                    .FirstOrDefaultAsync(s => s.ChairId == chairRequest.ChairId && s.ShowtimeId == showtimeId);

                if (chairShowtime == null)
                    throw new NotFoundException($"Không tìm thấy thông tin ghế {chairRequest.ChairId} trong suất chiếu {showtimeId}");

                var ticket = new Ticket
                {
                    ShowtimeId = showtimeId,
                    ChairId = chairRequest.ChairId,
                    TicketCode = null
                };
                //save into Database
                await _context.Tickets.AddAsync(ticket);

                //Update ticket for order and detail ticket
                orderDetail.TicketId = ticket.TicketId;
                orderDetail.OrderDetailTicketPrice = chairShowtime.Chair.ChairType.ChairPrice;
                _context.OrderDetailTickets.Update(orderDetail);

                tickets.Add(ticket);
            }

            return tickets;

        }

        //Lấy danh sách vé theo orderId
        public async Task<List<Ticket>> GetTicketsByOrderIdAsync(int orderId)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Showtime)
                .ThenInclude(s => s.ShowtimeMovie)
                .Include(t => t.Showtime)
                .ThenInclude(s => s.ShowtimeRoom)
                .ThenInclude(r => r.RoomTheater)
                .Where(t => t.OrderDetailTickets.Any(odt => odt.OrderId == orderId))
                .ToListAsync();

            // Lấy danh sách ChairShowtime từ ChairId và ShowtimeId
            foreach (var ticket in tickets)
            {
                if (ticket.ChairId.HasValue && ticket.ShowtimeId.HasValue)
                {
                    var chairShowtime = await _context.ChairShowtimes
                        .Include(cs => cs.Chair)
                        .ThenInclude(c => c.ChairType)
                        .FirstOrDefaultAsync(cs => cs.ChairId == ticket.ChairId && cs.ShowtimeId == ticket.ShowtimeId);

                    // Gán ChairShowtime vào ticket
                    _context.Entry(ticket).Reference(t => t.ChairShowtime).CurrentValue = chairShowtime;
                }
            }

            return tickets;
        }

        //Lấy thông tin chi tiết của vé
        public async Task<Ticket?> GetTicketWithDetailsAsync(int ticketId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Showtime)
                .ThenInclude(s => s.ShowtimeMovie)
                .Include(t => t.Showtime)
                .ThenInclude(s => s.ShowtimeRoom)
                .ThenInclude(r => r.RoomTheater)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);

            if(ticket != null && ticket.ChairId.HasValue && ticket.ShowtimeId.HasValue)
            {
                var chairShowtime = await _context.ChairShowtimes
                    .Include(cs => cs.Chair)
                    .ThenInclude(c => c.ChairType)
                    .FirstOrDefaultAsync(cs => cs.ChairId == ticket.ChairId && cs.ShowtimeId == ticket.ShowtimeId);
                _context.Entry(ticket).Reference(t => t.ChairShowtime).CurrentValue = chairShowtime;
            }    
            return ticket;
        }

        //Tạo mã ticket cho từng vé
        public async Task ActivateTicketsForOrderAsync(int orderId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.OrderDetailTickets.Any(odt => odt.OrderId == orderId))
                .ToListAsync();

            if (!tickets.Any())
            {
                throw new NotFoundException("Không tìm thấy vé.");
            }

            int nextNumber = await GetNextTicketNumberAsync();

            foreach (var t in tickets)
            {
                if (string.IsNullOrEmpty(t.TicketCode))
                {
                    t.TicketCode = $"TK{nextNumber:D3}";
                    nextNumber++;
                    _context.Tickets.Update(t);
                }
            }
        }


        //Lấy số thứ tự tiếp theo cho mã vé
        private async Task<int> GetNextTicketNumberAsync()
        {
            var lastTicket = await _context.Tickets
        .Where(t => t.TicketCode != null && t.TicketCode.StartsWith("TK"))
        .OrderByDescending(t => t.TicketId)
        .Select(t => t.TicketCode)
        .FirstOrDefaultAsync();

            int nextNumber = 1;

            if (lastTicket != null && lastTicket.StartsWith("TK"))
            {
                string numberPart = lastTicket.Substring(2);
                if (int.TryParse(numberPart, out int currentNumber))
                {
                    nextNumber = currentNumber + 1;
                }
            }

            return nextNumber;
        }
    }
}
