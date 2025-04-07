using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.Enums
{
    public enum ConfigType
    {
        [Display(Name = "Thời gian nghỉ giữa suất chiếu")]
        RoomBreakTime = 1,

        [Display(Name = "Thời gian hoàn tất đặt vé")]
        BookingTimeout = 2,

        [Display(Name = "Số ngày mở bán vé trước")]
        AdvanceTicketingDays = 3,

        [Display(Name = "Tỷ lệ tích điểm")]
        PointsPerThousand = 4,

        [Display(Name = "Ngày reset điểm tích lũy")]
        PointsResetDate = 5
    }
}
