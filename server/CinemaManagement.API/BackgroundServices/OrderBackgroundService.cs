using CinemaManagement.API.Enums;
using CinemaManagement.API.Repository.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using Hangfire;

namespace CinemaManagement.API.BackgroundServices
{
    public class OrderBackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<OrderBackgroundService> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public OrderBackgroundService(
            IConfiguration configuration,
            ILogger<OrderBackgroundService> logger,
            IUnitOfWork unitOfWork)
        {
            _configuration = configuration;
            _logger = logger;
            _unitOfWork = unitOfWork;
        }


        [AutomaticRetry(Attempts = 3)]
        public async Task CheckExprireOrders()
        {
            _logger.LogInformation("Bắt đầu kiểm tra đơn hàng hết hạn...");
            var paymentTimeoutMinutes = _configuration.GetValue<int>("Order:PaymentTimeoutMinutes");
            var pendingOrders = await _unitOfWork.OrderRepo.GetOrdersByStatusAsync(OrderStatus.Pending.ToString());
            var now = DateTime.Now;

            foreach (var item in pendingOrders)
            {
                var expriceTime = item.OrderCreateAt?.AddMinutes(paymentTimeoutMinutes);
                if (now > expriceTime)
                {
                    await _unitOfWork.OrderRepo.UpdateOrderStatusAsync(item.OrderId, OrderStatus.Failed.ToString());
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation($"Đã hủy đơn hàng hết hạn ID: {item.OrderId}");
                }

            }
        }

        [AutomaticRetry(Attempts = 3)]
        public async Task RemoveFailedOrders()
        {
            _logger.LogInformation("Bắt đầu xóa đơn hàng thất bại...");
            var listOrders = await _unitOfWork.OrderRepo.GetAllAsync();
            foreach (var item in listOrders)
            {
                if (item.OrderStatus == OrderStatus.Failed.ToString() || item.OrderStatus == OrderStatus.Canceled.ToString())
                {
                    await _unitOfWork.OrderRepo.DeleteAsync(item.OrderId);
                    await _unitOfWork.SaveChangesAsync();
                    _logger.LogInformation($"Đã xóa đơn hàng thất bại ID: {item.OrderId}");
                }
            }
        }

        [AutomaticRetry(Attempts = 3)]
        public async Task RemoveTickets()
        {
            _logger.LogInformation("Bắt đầu vé...");
            var listShowtime = await _unitOfWork.ShowtimeRepo.GetAllAsync();
            foreach (var item in listShowtime)
            {
                if (item.ShowtimeStartAt < DateTime.Now)
                {
                    foreach (var ticket in item.Tickets)
                    {
                        if (ticket.TicketCode == null || String.IsNullOrEmpty(ticket.TicketCode))
                        {
                            await _unitOfWork.TicketRepo.DeleteAsync(ticket.TicketId);
                            await _unitOfWork.SaveChangesAsync();
                            _logger.LogInformation($"Đã xóa vé ID: {ticket.TicketId}");
                        }
                    }
                }
            }

        }
    }
}
