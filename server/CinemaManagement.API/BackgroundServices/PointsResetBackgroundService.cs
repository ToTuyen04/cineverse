
using CinemaManagement.API.Configuration;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.BackgroundServices
{
    public class PointsResetBackgroundService : BackgroundService
    {
        private readonly ILogger<PointsResetBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private Timer _timer;

        public PointsResetBackgroundService(ILogger<PointsResetBackgroundService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Dịch vụ reset điểm tích lũy đã khởi động");

            ScheduleNextRun(stoppingToken);
            return Task.CompletedTask;
        }

        private void ScheduleNextRun(CancellationToken stoppingToken)
        {
            var nextRunTime = GetNextExecutionTime();
            var delay = nextRunTime - DateTime.Now;

            _logger.LogInformation("Lịch trình reset điểm tiếp theo vào {NextRunTime}", nextRunTime.ToString("dd/MM/yyyy HH:mm:ss"));

            _timer = new Timer(async _ => await DoCheckAndResetPoints(stoppingToken), null, delay, Timeout.InfiniteTimeSpan);
        }

        private DateTime GetNextExecutionTime()
        {
            var now = DateTime.Now;
            var nextRun = now.Date.AddDays(1).AddMinutes(1); // Chạy vào 00:01 sáng hôm sau
            //var nextRun = now.AddSeconds(10);
            return nextRun;
        }

        private async Task DoCheckAndResetPoints(CancellationToken stoppingToken)
        {
            if (stoppingToken.IsCancellationRequested)
                return;

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var configHolder = scope.ServiceProvider.GetRequiredService<ConfigurationHolder>();
                    var userService = scope.ServiceProvider.GetRequiredService<IUserService>();

                    // Lấy cấu hình ngày reset từ database
                    var (resetDay, resetMonth) = configHolder.GetPointsResetDate();
                    var today = DateTime.Now;

                    if (today.Day == resetDay && today.Month == resetMonth)
                    {
                        _logger.LogInformation("Bắt đầu reset điểm tích lũy cho tất cả khách hàng");

                        int affectedCustomers = await userService.ResetAllCustomerPoints();

                        _logger.LogInformation("Đã reset điểm tích lũy cho {Count} khách hàng", affectedCustomers);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực hiện reset điểm tích lũy");
            }
            finally
            {
                ScheduleNextRun(stoppingToken); // Lên lịch chạy lần tiếp theo
            }
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Dịch vụ reset điểm tích lũy đang dừng");

            _timer?.Change(Timeout.Infinite, 0);

            return base.StopAsync(cancellationToken);
        }

        public override void Dispose()
        {
            _timer?.Dispose();
            base.Dispose();
        }
    }
}
