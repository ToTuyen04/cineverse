using CinemaManagement.API.Enums;
using CinemaManagement.API.Repository;
using CinemaManagement.API.Repository.Interface;
using System.Collections.Concurrent;
using System.Globalization;

namespace CinemaManagement.API.Configuration
{
    public class ConfigurationHolder
    {
        private readonly ConcurrentDictionary<ConfigType, (string Content, ConfigUnit Unit)> _configurations;
        private readonly ILogger<ConfigurationHolder> _logger;
        private IUnitOfWork _unitOfWork;

        public ConfigurationHolder(ILogger<ConfigurationHolder> logger, IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _configurations = new ConcurrentDictionary<ConfigType, (string, ConfigUnit)>();
        }

        public async Task LoadConfigurationsAsync()
        {
            try
            {
                var configs = await _unitOfWork.ConfigurationRepo.GetAllAsync();

                _configurations.Clear();
                foreach (var config in configs)
                {
                    try
                    {
                        // Chuyển từ ID sang enum
                        var configType = ConfigTypeExtensions.FromId(config.ConfigurationId);
                        var configUnit = ConfigUnitExtensions.FromString(config.ConfigurationUnit);

                        _configurations[configType] = (config.ConfigurationContent, configUnit);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không thể tải cấu hình ID {ConfigId}: {Message}",
                            config.ConfigurationId, ex.Message);
                    }
                }

                _logger.LogInformation("Đã tải {Count} cấu hình vào bộ nhớ", _configurations.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tải cấu hình từ CSDL");
            }
        }

        public string GetConfig(ConfigType configType, string defaultValue = null)
        {
            if (_configurations.TryGetValue(configType, out var value))
            {
                return value.Content;
            }

            _logger.LogWarning("Không tìm thấy cấu hình '{ConfigName}', sử dụng giá trị mặc định", configType.GetDisplayName());
            return defaultValue;
        }

        public ConfigUnit GetConfigUnit(ConfigType configType)
        {
            if (_configurations.TryGetValue(configType, out var value))
            {
                return value.Unit;
            }

            return configType.GetDefaultUnit();
        }

        public async Task ReloadConfigurations()
        {
            await LoadConfigurationsAsync();
        }

        // Typed configuration getters
        public int GetIntValue(ConfigType configType, int defaultValue = 0)
        {
            var value = GetConfig(configType);
            if (string.IsNullOrEmpty(value) || !int.TryParse(value, out int result))
            {
                return defaultValue;
            }
            return result;
        }

        public double GetDoubleValue(ConfigType configType, double defaultValue = 0.0)
        {
            var value = GetConfig(configType);
            if (string.IsNullOrEmpty(value) ||
                !double.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out double result))
            {
                return defaultValue;
            }
            return result;
        }

        public decimal GetDecimalValue(ConfigType configType, decimal defaultValue = 0.0m)
        {
            var value = GetConfig(configType);
            if (string.IsNullOrEmpty(value) ||
                !decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal result))
            {
                return defaultValue;
            }
            return result;
        }
        public bool GetBoolValue(ConfigType configType, bool defaultValue = false)
        {
            var value = GetConfig(configType);
            if (string.IsNullOrEmpty(value) || !bool.TryParse(value, out bool result))
            {
                return defaultValue;
            }
            return result;
        }
        public DateTime? GetDateValue(ConfigType configType, string format = "dd/MM")
        {
            var value = GetConfig(configType);
            if (string.IsNullOrEmpty(value) ||
                !DateTime.TryParseExact(value, format, CultureInfo.InvariantCulture,
                DateTimeStyles.None, out DateTime result))
            {
                return null;
            }
            return result;
        }
        // Specific configuration accessors based on your current configurations
        // Specific configuration accessors
        public int GetRoomBreakTimeMinutes()
        {
            return GetIntValue(ConfigType.RoomBreakTime, 20);
        }

        public int GetBookingTimeoutMinutes()
        {
            return GetIntValue(ConfigType.BookingTimeout, 15);
        }

        public int GetAdvanceTicketingDays()
        {
            return GetIntValue(ConfigType.AdvanceTicketingDays, 4);
        }

        public decimal GetPointsPerThousand()
        {
            return GetDecimalValue(ConfigType.PointsPerThousand, 0.001m);
        }

        public (int Day, int Month) GetPointsResetDate()
        {
            var dateStr = GetConfig(ConfigType.PointsResetDate, "31/12");
            var parts = dateStr.Split('/');

            if (parts.Length == 2 &&
                int.TryParse(parts[0], out int day) &&
                int.TryParse(parts[1], out int month))
            {
                return (day, month);
            }

            return (31, 12); // Default to Dec 31
        }

        // Dictionary access for all configurations
        public Dictionary<string, (string Value, string Unit)> GetAllConfigurationsForDisplay()
        {
            return _configurations.ToDictionary(
                kvp => kvp.Key.GetDisplayName(),
                kvp => (kvp.Value.Content, kvp.Value.Unit.ToDisplayString())
            );
        }

    }
}
