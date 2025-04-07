using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;

namespace CinemaManagement.API.Repository
{
    public partial class OrderRepository : GenericRepository<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<string> GetOrderStatusAsync(int orderId)
        {
            var order = await _dbSet.FindAsync(orderId);
            return order?.OrderStatus;
        }
        public async Task<Order> CreatePendingOrderAsync(Order order)
        {
            await _context.Orders.AddAsync(order);
            return order;
        }
        public async Task<Order> GetOrderByPhoneAsync(string phone)
        {
            var order = await _dbSet
        .Where(c => c.OrderPhone!.Equals(phone))
        .OrderByDescending(c => c.OrderCreateAt)
        .FirstOrDefaultAsync();

            return order!;
        }

        public async Task<Order?> GetOrderWithDetailsAsync(int orderId)
        {
            //return await _context.Orders
            //    .Include(o => o.User)
            //    .Include(o => o.OrderDetailTickets)
            //    .ThenInclude(odt => odt.Ticket)
            //    .ThenInclude(t => t.ChairShowtime)
            //    .ThenInclude(cs => cs.Chair)
            //    .ThenInclude(c => c.ChairType)
            //    .Include(o => o.OrderDetailTickets)
            //    .ThenInclude(odt => odt.Ticket)
            //    .ThenInclude(t => t.Showtime)
            //    .ThenInclude(s => s.ShowtimeMovie)
            //    .Include(o => o.OrderDetailTickets)
            //    .ThenInclude(odt => odt.Ticket)
            //    .ThenInclude(t => t.Showtime)
            //    .ThenInclude(s => s.ShowtimeRoom)
            //    .ThenInclude(r => r.RoomTheater)
            //    .FirstOrDefaultAsync(o => o.OrderId == orderId);
            throw new NotImplementedException();

        }

        public async Task<OrderDetailResponseDTO?> GetOrderDetailAysnc(int orderId)
        {
            decimal discount = 0;
            decimal ticketPrice = 0;
            decimal comboPrice = 0;
            decimal payment = 0;
            decimal discountPrice = 0;
            decimal total = 0;
            var order = await _context.Orders
                .Include(o => o.OrderDetailTickets)
                .Include(o => o.OrderDetailCombos)
                .Include(o => o.Voucher)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
                ticketPrice = order.OrderDetailTickets.Sum(odt => odt.OrderDetailTicketPrice ?? 0);
                comboPrice = order.OrderDetailCombos.Sum(odc => odc.OrderDetailComboPrice * odc.OrderDetailComboQuantity ?? 0);
                payment = ticketPrice + comboPrice;
            if (order?.VoucherId != null)
            {
                discount = (decimal)order.Voucher.VoucherDiscount;
                discountPrice = discount * payment;
                if (discountPrice > order.Voucher.VoucherMaxValue)
                {
                    discountPrice = order.Voucher.VoucherMaxValue ?? 0;
                }
            }
                total = payment - discountPrice;



            return await _context.Orders
                .Where(o => o.OrderId == orderId)
                .Select(o => new OrderDetailResponseDTO
                {
                    OrderId = o.OrderId,
                    OrderCreateAt = (DateTime)o.OrderCreateAt,
                    UserId = o.UserId,
                    VoucherId = o.VoucherId ?? 0,
                    OrderStatus = o.OrderStatus,
                    OrderName = o.OrderName ?? "",
                    OrderEmail = o.OrderEmail ?? "",
                    OrderPhone = o.OrderPhone ?? "",
                    PaymentPrice = payment,
                    DiscountPrice = discountPrice,
                    TotalPrice = total,
                    showtimeInfos = o.OrderDetailTickets.Select(odt => new ShowtimeInfoDTO
                    {
                        ShowtimeId = odt.Ticket.Showtime.ShowtimeId,
                        MovieName = odt.Ticket.Showtime.ShowtimeMovie.MovieName,
                        TheaterName = odt.Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName,
                        RoomName = odt.Ticket.Showtime.ShowtimeRoom.RoomName,
                        StartTime = odt.Ticket.Showtime.ShowtimeStartAt
                    }).GroupBy(s => s.ShowtimeId)
                    .Select(s => s.First())
                    .ToList(),
                    OrderDetails = o.OrderDetailTickets.Select(odt => new OrderDetailItemDTO
                    {
                        OrderDetailId = odt.OrderDetailTicketId,
                        TicketId = odt.TicketId,
                        TicketCode = odt.Ticket.TicketCode ?? "",
                        ChairId = odt.Ticket.ChairShowtime.ChairId,
                        ChairName = odt.Ticket.ChairShowtime.Chair.ChairName,
                        ChairType = odt.Ticket.ChairShowtime.Chair.ChairType.ChairTypeName ?? "",
                        ChairPosition = odt.Ticket.ChairShowtime.Chair.ChairPosition,
                        Price = odt.OrderDetailTicketPrice ?? 0,
                        Version = odt.Ticket.ChairShowtime.Version
                    }).ToList(),
                    orderComboItems = o.OrderDetailCombos.Select(odc => new OrderComboItemDTO
                    {
                        ComboName = odc.Combo.ComboName,
                        ComboQuantity = odc.OrderDetailComboQuantity ?? 0,
                        ComboPrice = (int)odc.OrderDetailComboPrice
                    }).ToList()
                }).FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            var Order = await _context.Orders.FindAsync(orderId);
            if (Order == null)
            {
                var order = await _dbSet.FindAsync(orderId);
                if (order == null)
                    return false;
            }

            Order.OrderStatus = status;

            return true;
        }

        public async Task<List<Order>> GetOrdersByStatusAsync(string status)
        {
            return await _context.Orders
                .Where(o => o.OrderStatus == status)
                .ToListAsync();
        }


    }
}
