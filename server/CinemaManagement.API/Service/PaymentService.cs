using AutoMapper;
using CinemaManagement.API.Configuration;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Helpers;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CinemaManagement.API.Service
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderService _orderService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly ConfigurationHolder _configurationHolder;

        public PaymentService(IUnitOfWork unitOfWork, IOrderService orderService, IMapper mapper, IConfiguration configuration, IUserService userService, ConfigurationHolder configurationHolder)
        {
            _unitOfWork = unitOfWork;
            _orderService = orderService;
            _mapper = mapper;
            _configuration = configuration;
            _userService = userService;
            _configurationHolder = configurationHolder;
        }

        public async Task<PaymentUrlResponseDTO> CreatePaymentUrlAsync(PaymentRequestDTO request)
        {
            //Lấy thông tin đơn hàng
            var orderDetail = await _unitOfWork.OrderRepo.GetOrderDetailAysnc(request.OrderId);
            if (orderDetail == null)
                throw new NotFoundException($"Không tìm thấy đơn hàng ID: {request.OrderId}");

            //Kiểm tra trạng thái đơn hàng
            if (orderDetail.OrderStatus != OrderStatus.Pending.ToString())
                throw new BadRequestException("Đơn hàng không ở trạng thái chờ thanh toán");

            //Kiểm tra thời gian hết hạn

            if (await IsOrderExpiredAsync(orderDetail))
            {
                var order = await _unitOfWork.OrderRepo.GetByIdAsync(orderDetail.OrderId);
                // Cập nhật trạng thái đơn hàng thành "Failed"
                if(order != null)
                {
                    order.OrderStatus = OrderStatus.Failed.ToString();
                    await _unitOfWork.OrderRepo.UpdateAsync(order);
                }

                throw new BadRequestException("Đơn hàng đã hết hạn thanh toán");
            }

            //Tính tổng tiền
            //decimal totalPrice = 0;
            //decimal discountPrice = 0;
            //decimal paymentPrice = 0;
            //if (order.OrderDetailTickets != null && order.OrderDetailTickets.Any())
            //{
            //    var voucher = await _unitOfWork.VoucherRepo.GetByIdAsync(order.VoucherId.Value);
            //    paymentPrice = (decimal)order.OrderDetailTickets.Sum(odt => odt.OrderDetailTicketPrice);
            //    discountPrice = (decimal)voucher.VoucherDiscount * paymentPrice;
            //    totalPrice = paymentPrice - discountPrice;
            //    if (discountPrice > voucher.VoucherMaxValue)
            //    {
            //        discountPrice = order.Voucher.VoucherMaxValue ?? 0;
            //        totalPrice = paymentPrice - discountPrice;
            //    }

            //}
            //thời gian còn lại

            DateTime expiryTime = await GetOrderExpiryTimeAsync(orderDetail);
            //Tạo URL thanh toán VNPay
            string paymentUrl = CreateVnPayUrl(request.OrderId, orderDetail.TotalPrice, expiryTime);
            await _unitOfWork.SaveChangesAsync();
            //Trả về response
            Console.WriteLine("total price: " + orderDetail.TotalPrice);
            Console.WriteLine("Payment price: " + orderDetail.PaymentPrice);
            Console.WriteLine("discount price: " + orderDetail.DiscountPrice);
            return new PaymentUrlResponseDTO
            {
                PaymentUrl = paymentUrl,
                OrderId = request.OrderId,
                DiscountPrice = orderDetail.DiscountPrice,
                PaymentPrice = orderDetail.PaymentPrice,
                TotalPrice = orderDetail.TotalPrice,
                RemainingSeconds = (int)Math.Max(0, (expiryTime - DateTime.Now).TotalSeconds)
            };
        }

        public async Task<PaymentResultResponseDTO> ProcessPaymentCallbackAsync(PaymentCallbackRequestDTO callbackData)
        {
            try
            {
                //Xác định đơn hàng từ callback data
                string orderIdStr = callbackData.vnp_TxnRef?.Split('_')[0];
                if (!int.TryParse(orderIdStr, out int orderId))
                {
                    return new PaymentResultResponseDTO
                    {
                        Success = false,
                        Message = "Mã đơn hàng không hợp lệ",
                        OrderId = 0
                    };
                }

                //Kiểm tra trạng thái thanh toán
                bool paymentSuccess = callbackData.vnp_ResponseCode == "00" &&
                                    callbackData.vnp_TransactionStatus == "00";
                //Lấy thông tin đơn hàng
                var order = await _unitOfWork.OrderRepo.GetByIdAsync(orderId);
                if (!paymentSuccess)
                {
                    //Cập nhật thông tin đơn hàng
                    order.OrderStatus = OrderStatus.Canceled.ToString();
                    await _unitOfWork.OrderRepo.UpdateAsync(order);
                    await _unitOfWork.SaveChangesAsync();
                    return new PaymentResultResponseDTO
                    {
                        Success = false,
                        Message = "Thanh toán không thành công",
                        OrderId = orderId
                    };
                }

                
                if (order == null)
                {
                    return new PaymentResultResponseDTO
                    {
                        Success = false,
                        Message = "Không tìm thấy đơn hàng",
                        OrderId = orderId
                    };
                }

                //Kiểm tra trạng thái đơn hàng
                if (order.OrderStatus != OrderStatus.Pending.ToString())
                {
                    return new PaymentResultResponseDTO
                    {
                        Success = false,
                        Message = "Đơn hàng không ở trạng thái chờ thanh toán",
                        OrderId = orderId
                    };
                }

                //Kiểm tra thời gian hết hạn
 
                if (await IsOrderExpiredAsync(order))
                {
                    return new PaymentResultResponseDTO
                    {
                        Success = false,
                        Message = "Đơn hàng đã hết hạn thanh toán",
                        OrderId = orderId
                    };
                }

                //Cập nhật thông tin đơn hàng
                order.OrderStatus = OrderStatus.Completed.ToString();
                await _unitOfWork.OrderRepo.UpdateAsync(order);
                await _unitOfWork.SaveChangesAsync();

                //Kích hoạt vé (tạo mã TicketCode)
                await _unitOfWork.TicketRepo.ActivateTicketsForOrderAsync(orderId);
                await _unitOfWork.SaveChangesAsync();


                //Lấy thông tin chi tiết đơn hàng đã cập nhật
                var orderDetail = await _orderService.GetOrderDetailsAsync(orderId);
                //if (order.UserId.HasValue)
                //{
                //    await _userService.AddUserPointsAsync(order.User.UserEmail, orderDetail.PaymentPrice);
                //    await _unitOfWork.SaveChangesAsync();
                //}
                string transactionId = callbackData.vnp_TransactionNo;
                return new PaymentResultResponseDTO
                {
                    Success = true,
                    Message = "Thanh toán thành công",
                    TransactionNo = transactionId,
                    OrderId = orderId,
                    OrderDetail = orderDetail
                };
            }
            catch (Exception ex)
            {
                return new PaymentResultResponseDTO
                {
                    Success = false,
                    Message = $"Lỗi xử lý thanh toán: {ex.Message}",
                    OrderId = 0
                };
            }
        }

        public async Task<OrderStatusResponseDTO> GetOrderStatusAsync(int orderId)
        {
            //Lấy thông tin đơn hàng
            var order = await _unitOfWork.OrderRepo.GetByIdAsync(orderId);
            if (order == null)
                throw new NotFoundException($"Không tìm thấy đơn hàng ID: {orderId}");


            var orderStatusDto = _mapper.Map<OrderStatusResponseDTO>(order);

            if (order.OrderStatus == OrderStatus.Pending.ToString())
            {
                //Cập nhật trạng thái đơn hàng nếu đã hết hạn
                await MarkOrderAsFailedIfExpiredAsync(order);

                //Chưa hết hạn
                if (order.OrderStatus == OrderStatus.Pending.ToString())
                {
                    var expiryTime = await GetOrderExpiryTimeAsync(order);
                    var timeLeft = expiryTime - DateTime.Now;
                    orderStatusDto.RemainingSeconds = (int)Math.Max(0, timeLeft.TotalSeconds);
                }
                else
                {
                    // Cập nhật lại status từ entity nếu đã thay đổi
                    orderStatusDto.Status = order.OrderStatus;
                }
            }

            return orderStatusDto;

        }

        private string CreateVnPayUrl(int orderId, decimal amount, DateTime timeLeft)
        {
            // Lấy cấu hình VNPay từ appsettings.json
            string vnp_Url = _configuration["Payment:VnPay:PaymentUrl"];
            string vnp_TmnCode = _configuration["Payment:VnPay:TmnCode"];
            string vnp_HashSecret = _configuration["Payment:VnPay:HashSecret"];
            string vnp_ReturnUrl = _configuration["Payment:VnPay:ReturnUrl"];

            TimeZoneInfo vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); 
            DateTime expireDateInVN = TimeZoneInfo.ConvertTime(timeLeft, vnTimeZone);
            string vnpExpireDate = expireDateInVN.ToString("yyyyMMddHHmmss");

            var vnpay = new VnPayLibrary();
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode);
            vnpay.AddRequestData("vnp_Amount", ((long)(amount * 100)).ToString());
            vnpay.AddRequestData("vnp_BankCode", "");
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_IpAddr", "::1");
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toan ve xem phim #{orderId}");
            vnpay.AddRequestData("vnp_OrderType", "250000");
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", $"{orderId}_{DateTime.Now.Ticks}");
            vnpay.AddRequestData("vnp_ExpireDate", vnpExpireDate);
            return vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);
        }

        //Lấy thời gian hết hạn của đơn hàng
        private DateTime GetOrderExpiryTime(DateTime orderCreateAt)
        {
            var paymentTimeoutMinutes = _configurationHolder.GetBookingTimeoutMinutes();
            return orderCreateAt.AddMinutes(paymentTimeoutMinutes);
        }

        //Kiểm tra xem đơn hàng đã hết hạn chưa
        private bool IsOrderExpired(DateTime orderCreateAt)
        {
            var expiryTime = GetOrderExpiryTime(orderCreateAt);
            return DateTime.Now > expiryTime;
        }

        //Cập nhật trạng thái đơn hàng nếu đã hết hạn
        private async Task MarkOrderAsFailedIfExpiredAsync(Order order)
        {
            var orderDetail = await _unitOfWork.OrderRepo.GetOrderDetailAysnc(order.OrderId);
            if (order.OrderStatus == OrderStatus.Pending.ToString() && orderDetail != null && await IsOrderExpiredAsync(orderDetail))
            {
                order.OrderStatus = OrderStatus.Failed.ToString();
                await _unitOfWork.OrderRepo.UpdateAsync(order);
                await _unitOfWork.SaveChangesAsync();
            }
        }

        private async Task<DateTime> GetOrderExpiryTimeAsync(Order order)
        {
            return GetOrderExpiryTime(order.OrderCreateAt ?? DateTime.Now);
        }

        private async Task<DateTime> GetOrderExpiryTimeAsync(OrderDetailResponseDTO orderDetail)
        {
            return GetOrderExpiryTime(orderDetail.OrderCreateAt);
        }

        private async Task<bool> IsOrderExpiredAsync(Order order)
        {
            return IsOrderExpired(order.OrderCreateAt ?? DateTime.Now);
        }

        private async Task<bool> IsOrderExpiredAsync(OrderDetailResponseDTO orderDetail)
        {
            return IsOrderExpired(orderDetail.OrderCreateAt);
        }
    }
}