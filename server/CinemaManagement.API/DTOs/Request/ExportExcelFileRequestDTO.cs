using CinemaManagement.API.Enums;
using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class ExportExcelFileRequestDTO
    {
        public class RevenueReportRequestDTO
        {
            [Required]
            public ReportPeriod ReportPeriod { get; set; } // "Week", "Month", "Quarter", "Year"

            [Required]
            public DateTime StartDate { get; set; }

            [Required]
            public DateTime EndDate { get; set; }

            public int? TheaterId { get; set; } // Null nếu là báo cáo tất cả rạp
        }
    }
}
