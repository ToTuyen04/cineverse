using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static CinemaManagement.API.DTOs.Request.ExportExcelFileRequestDTO;

namespace CinemaManagement.API.Controllers
{
    [Route("api/export-excel-file")]
    [ApiController]
    public class ExportExcelFileController : ControllerBase
    {
        private readonly IExportExcelFileService _reportService;
        private readonly ILogger<ExportExcelFileController> _logger;

        public ExportExcelFileController(IExportExcelFileService reportService, ILogger<ExportExcelFileController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Xuất báo cáo doanh thu của tất cả các rạp
        /// </summary>
        [HttpPost("revenue/all-theaters")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportAllTheatersRevenueReport([FromBody] RevenueReportRequestDTO request)
        {
            try
            {
                // Kiểm tra thời gian hợp lệ
                if (request.StartDate > request.EndDate)
                {
                    return BadRequest("Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc");
                }

                // Không cần kiểm tra TimeframeType nữa vì đã dùng enum

                var result = await _reportService.ExportAllTheatersRevenueReport(request);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất báo cáo doanh thu tất cả các rạp");
                return StatusCode(500, "Đã xảy ra lỗi khi xuất báo cáo. Vui lòng thử lại sau.");
            }
        }

        /// <summary>
        /// Xuất báo cáo doanh thu của một rạp cụ thể
        /// </summary>
        [HttpPost("revenue/theater")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportTheaterRevenueReport([FromBody] RevenueReportRequestDTO request)
        {
            try
            {
                // Kiểm tra có TheaterId chưa
                if (request.TheaterId == null)
                {
                    return BadRequest("Cần phải có TheaterId để xuất báo cáo của một rạp cụ thể");
                }

                // Kiểm tra thời gian hợp lệ
                if (request.StartDate > request.EndDate)
                {
                    return BadRequest("Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc");
                }

                // Không cần kiểm tra TimeframeType nữa vì đã dùng enum

                var result = await _reportService.ExportTheaterRevenueReport(request);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất báo cáo doanh thu của rạp ID: {TheaterId}", request.TheaterId);
                return StatusCode(500, "Đã xảy ra lỗi khi xuất báo cáo. Vui lòng thử lại sau.");
            }
        }
    }
}
