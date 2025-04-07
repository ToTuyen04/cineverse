namespace CinemaManagement.API.Configuration
{
    public class ConfigurationInitializerService : IHostedService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ConfigurationInitializerService> _logger;

        public ConfigurationInitializerService(
            IServiceProvider serviceProvider,
            ILogger<ConfigurationInitializerService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Bắt đầu tải cấu hình khi khởi động ứng dụng");
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var configHolder = scope.ServiceProvider.GetRequiredService<ConfigurationHolder>();
                await configHolder.LoadConfigurationsAsync();
                _logger.LogInformation("Đã tải xong cấu hình hệ thống");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tải cấu hình ban đầu");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
