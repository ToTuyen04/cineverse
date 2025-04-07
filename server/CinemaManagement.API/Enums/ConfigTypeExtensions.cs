using Microsoft.OpenApi.Extensions;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace CinemaManagement.API.Enums
{
    public static class ConfigTypeExtensions
    {
        public static string GetDisplayName(this ConfigType configType)
        {
            var field = configType.GetType().GetField(configType.ToString());
            var attribute = field?.GetCustomAttribute<DisplayAttribute>();
            return attribute?.Name ?? configType.ToString();
        }

        public static ConfigType FromId(int id)
        {
            if (Enum.IsDefined(typeof(ConfigType), id))
            {
                return (ConfigType)id;
            }

            throw new ArgumentException($"ID cấu hình không hợp lệ: {id}");
        }

        public static ConfigType FromDisplayName(string displayName)
        {
            foreach (ConfigType type in Enum.GetValues(typeof(ConfigType)))
            {
                if (type.GetDisplayName() == displayName)
                {
                    return type;
                }
            }

            throw new ArgumentException($"Tên cấu hình không hợp lệ: {displayName}");
        }

        public static ConfigUnit GetDefaultUnit(this ConfigType configType)
        {
            return configType switch
            {
                ConfigType.RoomBreakTime => ConfigUnit.Phut,
                ConfigType.BookingTimeout => ConfigUnit.Phut,
                ConfigType.AdvanceTicketingDays => ConfigUnit.Ngay,
                ConfigType.PointsPerThousand => ConfigUnit.DiemNghin,
                ConfigType.PointsResetDate => ConfigUnit.NgayThang,
                _ => ConfigUnit.SoLuong
            };
        }
    }
}
