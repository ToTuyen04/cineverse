using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.BackgroundServices
{
    public class PointBackgroundService
    {
        private readonly ILogger<PointBackgroundService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IServiceProvider _serviceProvider;
        public PointBackgroundService(ILogger<PointBackgroundService> logger, IUnitOfWork unitOfWork, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
            _serviceProvider = serviceProvider;
        }

        public async Task CheckAndResetPoint()
        {
            var userService = _serviceProvider.GetRequiredService<IUserService>();
            _logger.LogInformation("Bắt đầu kiểm tra và reset điểm tích lũy...");
            var affectedCustomers = await userService.ResetAllCustomerPoints();
            _logger.LogInformation("Đã reset điểm cho {Count} khách hàng", affectedCustomers);
        }
    }
}
