using System.Collections;
using AutoMapper;
using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Hangfire;

namespace CinemaManagement.API.Service
{
    public class OrderService : IOrderService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IOrderDetailComboService _orderDetailComboService;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper, IOrderDetailComboService orderDetailComboService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _orderDetailComboService = orderDetailComboService;
        }
        public async Task<OrderResponseDTO> CreateOrderAsync(OrderRequestDTO request)
        {
            if (request.SelectedChairs == null || !request.SelectedChairs.Any())
            {
                throw new NotFoundException("Ghế chưa được chọn.");
            }

            var showtime = await _unitOfWork.ShowtimeRepo.GetByIdAsync(request.ShowtimeId);
            if (showtime == null)
            {
                throw new NotFoundException("Không tìm thấy suất chiếu.");
            }

            if (!request.userId.HasValue && request.GuestCheckOutRequest == null)
            {
                throw new NotFoundException("Vui lòng đăng nhập hoặc nhập thông tin liên hệ.");
            }

            await IsExistChair(request.ShowtimeId, request.SelectedChairs);
            await BookingChairAsync(request.ShowtimeId, request.SelectedChairs);

            var order = new Order
            {
                OrderCreateAt = DateTime.Now,
                UserId = request.userId.HasValue ? request.userId : null,
                VoucherId = request.VoucherId.HasValue ? request.VoucherId : null,
                OrderName = request.GuestCheckOutRequest?.GuestName,
                OrderPhone = request.GuestCheckOutRequest?.GuestPhoneNumber,
                OrderEmail = request.GuestCheckOutRequest?.GuestEmail,
                OrderStatus = OrderStatus.Pending.ToString(),
            };

            var createdOrder = await _unitOfWork.OrderRepo.CreatePendingOrderAsync(order);
            await _unitOfWork.SaveChangesAsync();
            var currentOrder = await _unitOfWork.OrderRepo.GetOrderByPhoneAsync(order.OrderPhone);
            //var orderDetails = new List<OrderDetailTicket>();
            //decimal paymentPrice = 0;

            //var ticketsDict = new Dictionary<int, Ticket>();

            //foreach (var chair in request.SelectedChairs)
            //{
            //    var ticket = new Ticket
            //    {
            //        ShowtimeId = request.ShowtimeId,
            //        ChairId = chair.ChairId,
            //        TicketCode = null
            //    };
            //    await _unitOfWork.TicketRepo.AddAsync(ticket);

            //    ticketsDict.Add(chair.ChairId, ticket);
            //}

            //await _unitOfWork.SaveChangesAsync();

            //var chairTypes = await _unitOfWork.ChairRepo.GetAllChairType();
            //var chairShowtime = await _unitOfWork.ChairShowtimeRepo.GetAllChairShowtimeAsync();

            //foreach (var chair in request.SelectedChairs)
            //{
            //    var price = chairTypes.FirstOrDefault(x => x.ChairTypeId ==
            //        chairShowtime.FirstOrDefault(c => c.ChairId == chair.ChairId && c.ShowtimeId == request.ShowtimeId)?.Chair?.ChairType?.ChairTypeId)?.ChairPrice ?? 0;

            //    paymentPrice += price;

            //    var orderDetail = new OrderDetailTicket
            //    {
            //        OrderId = currentOrder.OrderId,
            //        TicketId = ticketsDict[chair.ChairId].TicketId, 
            //        OrderDetailTicketPrice = price
            //    };

            //    orderDetails.Add(orderDetail);
            //}

            //await _unitOfWork.OrderDetailTicketRepo.AddRangeAsync(orderDetails);
            //await _unitOfWork.SaveChangesAsync();
            //await _unitOfWork.OrderDetailTicketRepo.AddRangeAsync(orderDetails);
            //await _unitOfWork.TicketRepo.GenerateTicketsForOrderAsync(createdOrder.OrderId, request.ShowtimeId, request.SelectedChairs);
            var ticketsDict = await CreateTicketsAsync(request.ShowtimeId, request);


            var (orderDetails, ticketPrice) = await CreateOrderDetailsAsync(currentOrder.OrderId, request.ShowtimeId, request, ticketsDict);


            // xử lý combo
            decimal comboPrice = 0;
            OrderDetailComboResponseDto comboResult = null;

            if (request.SelectedCombos != null && request.SelectedCombos.Any())
            {
                comboResult = await _orderDetailComboService.AddCombosToOrderAysnc(currentOrder.OrderId, request.SelectedCombos);
                if (comboResult != null && comboResult.comboDetails != null && comboResult.comboDetails.Any())
                {
                    comboPrice = comboResult.comboDetails.Sum(o => o.Price * o.Quantity);
                }
            }

            decimal paymentPrice = ticketPrice + comboPrice;

            BackgroundJob.Schedule(() => ReleaseChairAsync(createdOrder.OrderId, request.ShowtimeId, request.SelectedChairs), TimeSpan.FromMinutes(10));

            decimal discountPrice = 0;
            if (request.VoucherId.HasValue)
            {
                var voucher = await _unitOfWork.VoucherRepo.GetByIdAsync(request.VoucherId.Value);
                if (voucher != null)
                {
                    discountPrice = (decimal)(voucher.VoucherDiscount ?? 0) * paymentPrice;
                    if (discountPrice > voucher.VoucherMaxValue)
                    {
                        discountPrice = voucher.VoucherMaxValue ?? 0;
                    }
                }
            }
           
            var response = _mapper.Map<OrderResponseDTO>(createdOrder);
            response.PaymentPrice = paymentPrice;
            response.DiscountPrice = discountPrice;
            if (comboResult != null && comboResult.comboDetails != null && comboResult.comboDetails.Any())
            {
                response.ComboDetails = comboResult.comboDetails.Select(c => new OrderDetailDTO
                {
                    Name = c.ComboName,
                    Quantity = c.Quantity,
                    Price = c.Price,
                }).ToList();
            }
            response.TotalPrice = paymentPrice - discountPrice;


            await _unitOfWork.SaveChangesAsync();
            return response;
        }


        private async Task<Dictionary<int, Ticket>> CreateTicketsAsync(int showtimeId, OrderRequestDTO request)
        {
            var ticketsDict = new Dictionary<int, Ticket>();

            foreach (var chair in request.SelectedChairs)
            {
                var ticket = new Ticket
                {
                    ShowtimeId = showtimeId,
                    ChairId = chair.ChairId,
                    TicketCode = null
                };
                await _unitOfWork.TicketRepo.AddAsync(ticket);

                ticketsDict.Add(chair.ChairId, ticket);
            }

            await _unitOfWork.SaveChangesAsync();
            return ticketsDict;
        }


        private async Task<(List<OrderDetailTicket>, decimal)> CreateOrderDetailsAsync(int orderId, int showtimeId, OrderRequestDTO selectedChairs, Dictionary<int, Ticket> ticketsDict)
        {
            var orderDetails = new List<OrderDetailTicket>();
            decimal paymentPrice = 0;

            var chairTypes = await _unitOfWork.ChairRepo.GetAllChairType();
            var chairShowtime = await _unitOfWork.ChairShowtimeRepo.GetAllChairShowtimeAsync();

            foreach (var chair in selectedChairs.SelectedChairs)
            {
                var price = chairTypes.FirstOrDefault(x => x.ChairTypeId ==
                    chairShowtime.FirstOrDefault(c => c.ChairId == chair.ChairId && c.ShowtimeId == showtimeId)?.Chair?.ChairType?.ChairTypeId)?.ChairPrice ?? 0;

                paymentPrice += price;

                var orderDetail = new OrderDetailTicket
                {
                    OrderId = orderId,
                    TicketId = ticketsDict[chair.ChairId].TicketId,
                    OrderDetailTicketPrice = price
                };

                orderDetails.Add(orderDetail);
            }

            await _unitOfWork.OrderDetailTicketRepo.AddRangeAsync(orderDetails);
            await _unitOfWork.SaveChangesAsync();

            return (orderDetails, paymentPrice);
        }

        public async Task<OrderDetailResponseDTO> GetOrderDetailsAsync(int orderId)
        {
            var order = await _unitOfWork.OrderRepo.GetOrderDetailAysnc(orderId);
            if (order == null)
            {
                throw new NotFoundException("Không tìm thấy đơn hàng.");
            }

            var response = _mapper.Map<OrderDetailResponseDTO>(order);
            return response;
        }
        public async Task<bool> IsExistChair(int showtimeid, List<OrderChairRequestDTO> list)
        {
            foreach (var item in list)
            {
                var chair = await _unitOfWork.ChairShowtimeRepo.GetChairShowtimeAsync(showtimeid, item.ChairId);
                if (chair == null)
                {
                    throw new NotFoundException("Ghế không tồn tại.");

                }
                if (!chair.Available)
                {
                    throw new NotFoundException("Ghế đã được đặt.");

                }
            }
            return true;
        }
        public async Task ReleaseChairAsync(int orderId, int showtimeId, List<OrderChairRequestDTO> list)
        {
            var order = await _unitOfWork.OrderRepo.GetByIdAsync(orderId);

            if (order != null && order.OrderStatus == OrderStatus.Completed.ToString())
                return;
            foreach (var item in list)
            {
                await _unitOfWork.ChairShowtimeRepo.ReleaseChairAsync(showtimeId, item.ChairId);
            }
            await _unitOfWork.SaveChangesAsync();
        }
        public async Task<bool> BookingChairAsync(int showtimeId, List<OrderChairRequestDTO> list)
        {
            var flag = true;
            foreach (var item in list)
            {
                flag = await _unitOfWork.ChairShowtimeRepo.BookingChairAsync(showtimeId, item.ChairId, item.Version);
            }
            if (!flag)
            {
                throw new NotFoundException("Ghế đã được người khác đặt trước.");
            }
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
