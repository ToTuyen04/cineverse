using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashBoardController : ControllerBase
    {
        private readonly IDashboardReportService _dashboardReportService;
        private readonly ILogger<DashBoardController> _logger;

        public DashBoardController(IDashboardReportService dashboardReportService, ILogger<DashBoardController> logger)
        {
            _dashboardReportService = dashboardReportService;
            _logger = logger;
        }

        [HttpGet("order-dashboard/{theater}/{time}")]
        public async Task<IActionResult> GetOrderDashboards(string theater, string time)
        {
            try
            {
                var result = await _dashboardReportService.GetDashboards(theater, time);

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu bảng điều khiển đơn hàng");
                return StatusCode(500, "Đã xảy ra lỗi khi lấy dữ liệu bảng điều khiển đơn hàng. Vui lòng thử lại sau.");
            }
        }


    }
}
