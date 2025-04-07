using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using OfficeOpenXml.Drawing.Chart;
using OfficeOpenXml.Style;
using System.Drawing;

namespace CinemaManagement.API.Service
{
    public class ExportExcelFileService : IExportExcelFileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ExportExcelFileService>? _logger;

        public ExportExcelFileService(IUnitOfWork unitOfWork, ILogger<ExportExcelFileService>? logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;

            // Đặt license để sử dụng EPPlus (LicenseContext.NonCommercial cho dự án phi thương mại)
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public async Task<FileContentResult> ExportAllTheatersRevenueReport(ExportExcelFileRequestDTO.RevenueReportRequestDTO request)
        {
            try
            {
                // Lấy dữ liệu đã được tính toán từ repository
                var orderReports = await _unitOfWork.OrderRepo.GetPaidOrdersByPeriodAsync(
                    request.StartDate, request.EndDate, null);

                // Tạo báo cáo Excel từ dữ liệu đã tính toán
                var fileContent = GenerateExcelReportFromDTO(orderReports, request, "Báo cáo doanh thu tất cả các rạp");

                // Đặt tên file
                string fileName = $"BaoCaoDoanhThu_TatCaRap_{request.ReportPeriod}_{DateTime.Now:yyyyMMdd}.xlsx";

                return new FileContentResult(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                {
                    FileDownloadName = fileName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất báo cáo doanh thu tất cả các rạp");
                throw;
            }
        }

        public async Task<FileContentResult> ExportTheaterRevenueReport(ExportExcelFileRequestDTO.RevenueReportRequestDTO request)
        {
            if (request.TheaterId == null)
            {
                throw new ArgumentException("Cần phải có TheaterId để xuất báo cáo của một rạp cụ thể");
            }

            try
            {
                // Lấy dữ liệu đã được tính toán từ repository

                var orderReports = await _unitOfWork.OrderRepo.GetPaidOrdersByPeriodAsync(
                    request.StartDate, request.EndDate, request.TheaterId.Value);

                // Tạo báo cáo Excel từ dữ liệu đã tính toán
                var fileContent = GenerateExcelReportFromDTO(orderReports, request, $"Báo cáo doanh thu rạp : {orderReports.First().TheaterName}");

                // Đặt tên file
                string fileName = $"BaoCaoDoanhThu_Rap{orderReports.First().TheaterName}_{request.ReportPeriod}_{DateTime.Now:yyyyMMdd}.xlsx";

                return new FileContentResult(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                {
                    FileDownloadName = fileName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xuất báo cáo doanh thu của rạp ID: {TheaterId}", request.TheaterId);
                throw;
            }
        }

        private byte[] GenerateExcelReportFromDTO(List<OrderReportDTO> orders, ExportExcelFileRequestDTO.RevenueReportRequestDTO request, string reportTitle)
        {
            using (var package = new ExcelPackage())
            {
                //Tạo worksheet
                var worksheet = package.Workbook.Worksheets.Add("Báo cáo doanh thu");

                // Tạo list tiêu đề cột
                string[] headers = {
                    "STT", "Mã ĐH", "Ngày tạo", "Mã KH", "Trạng thái",
                    "Tên khách hàng", "Email", "Số điện thoại",
                    "Tên phim", "Rạp", "Phòng", "Giờ chiếu",
                    "Tiền vé", "Tiền combo", "Tổng tiền"
                };

                int maxWidth = headers.Length;

                //Thiết lập tiêu đề
                worksheet.Cells[1, 1].Value = reportTitle;
                worksheet.Cells[1, 1, 1, maxWidth].Merge = true;
                worksheet.Cells[1, 1].Style.Font.Bold = true;
                worksheet.Cells[1, 1].Style.Font.Size = 16;
                worksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Thời gian báo cáo
                worksheet.Cells[2, 1].Value = $"Thời gian: Từ {request.StartDate:dd/MM/yyyy} đến {request.EndDate:dd/MM/yyyy}";
                worksheet.Cells[2, 1, 2, maxWidth].Merge = true;
                worksheet.Cells[2, 1].Style.Font.Bold = true;
                worksheet.Cells[2, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Loại báo cáo
                string timeframeText = "";
                switch (request.ReportPeriod)
                {
                    case Enums.ReportPeriod.Week: timeframeText = "Tuần"; break;
                    case Enums.ReportPeriod.Month: timeframeText = "Tháng"; break;
                    case Enums.ReportPeriod.Quarter: timeframeText = "Quý"; break;
                    case Enums.ReportPeriod.Year: timeframeText = "Năm"; break;
                }
                worksheet.Cells[3, 1].Value = $"Loại báo cáo: Theo {timeframeText}";
                worksheet.Cells[3, 1, 3, maxWidth].Merge = true;
                worksheet.Cells[3, 1].Style.Font.Bold = true;
                worksheet.Cells[3, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                // Thiết lập tiêu đề cột
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[5, i + 1].Value = headers[i];
                    worksheet.Cells[5, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[5, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[5, i + 1].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                    worksheet.Cells[5, i + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    worksheet.Cells[5, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                }

                // Điền dữ liệu
                int row = 6;
                decimal totalRevenue = 0;

                for (int i = 0; i < orders.Count; i++)
                {
                    var order = orders[i];

                    decimal orderTotal = order.OrderTotal;
                    totalRevenue += orderTotal;

                    // Điền thông tin vào Excel
                    int col = 1;
                    worksheet.Cells[row, col++].Value = i + 1;
                    worksheet.Cells[row, col++].Value = order.OrderId;
                    worksheet.Cells[row, col++].Value = order.OrderCreateAt?.ToString("dd/MM/yyyy HH:mm:ss");
                    worksheet.Cells[row, col++].Value = order.UserId;
                    worksheet.Cells[row, col++].Value = order.OrderStatus;
                    worksheet.Cells[row, col++].Value = order.OrderName;
                    worksheet.Cells[row, col++].Value = order.OrderEmail;
                    worksheet.Cells[row, col++].Value = order.OrderPhone;
                    worksheet.Cells[row, col++].Value = order.MovieName;
                    worksheet.Cells[row, col++].Value = order.TheaterName;
                    worksheet.Cells[row, col++].Value = order.RoomName;
                    worksheet.Cells[row, col++].Value = order.StartTime?.ToString("dd/MM/yyyy HH:mm");
                    worksheet.Cells[row, col++].Value = order.TicketTotal;
                    worksheet.Cells[row, col++].Value = order.ComboTotal;
                    worksheet.Cells[row, col++].Value = orderTotal;

                    // Định dạng số tiền
                    worksheet.Cells[row, 13].Style.Numberformat.Format = "#,##0";
                    worksheet.Cells[row, 14].Style.Numberformat.Format = "#,##0";
                    worksheet.Cells[row, 15].Style.Numberformat.Format = "#,##0";

                    // Định dạng border và alignment cho tất cả ô
                    for (int j = 1; j <= maxWidth; j++)
                    {
                        worksheet.Cells[row, j].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                        if (j == 1 || j == 2 || j == 4 || j == 5)
                        {
                            worksheet.Cells[row, j].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        }
                        else if (j == 13 || j == 14 || j == 15)
                        {
                            worksheet.Cells[row, j].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        }
                    }

                    row++;
                }

                // Tổng doanh thu
                worksheet.Cells[row + 1, 1].Value = "TỔNG DOANH THU:";
                worksheet.Cells[row + 1, 1, row + 1, maxWidth - 1].Merge = true;
                worksheet.Cells[row + 1, 1].Style.Font.Bold = true;
                worksheet.Cells[row + 1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                worksheet.Cells[row + 1, 15].Value = totalRevenue;
                worksheet.Cells[row + 1, 15].Style.Font.Bold = true;
                worksheet.Cells[row + 1, 15].Style.Numberformat.Format = "#,##0";
                worksheet.Cells[row + 1, 15].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                worksheet.Cells[row + 1, 15].Style.Border.BorderAround(ExcelBorderStyle.Thin);

                // Thiết lập độ rộng các cột
                worksheet.Column(1).Width = 7;      // STT
                worksheet.Column(2).Width = 10;      // Mã đơn hàng
                worksheet.Column(3).Width = 20;     // Ngày tạo
                worksheet.Column(4).Width = 10;      // Mã KH
                worksheet.Column(5).Width = 14;     // Trạng thái
                worksheet.Column(6).Width = 20;     // Tên khách hàng
                worksheet.Column(7).Width = 25;     // Email
                worksheet.Column(8).Width = 15;     // Số điện thoại
                worksheet.Column(9).Width = 30;     // Tên phim
                worksheet.Column(10).Width = 25;    // Rạp
                worksheet.Column(11).Width = 18;    // Phòng
                worksheet.Column(12).Width = 18;    // Giờ chiếu
                worksheet.Column(13).Width = 15;    // Tiền vé
                worksheet.Column(14).Width = 15;    // Tiền combo
                worksheet.Column(15).Width = 15;    // Tổng tiền

                // Kiểm tra nếu là báo cáo tất cả các rạp (TheaterId == null) thì tạo thêm worksheet biểu đồ
                if (request.TheaterId == null)
                {
                    // ===== Tạo worksheet cho biểu đồ =====
                    var chartWorksheet = package.Workbook.Worksheets.Add("Biểu đồ doanh thu");

                    // Nhóm và tính tổng doanh thu theo rạp
                    var revenueByTheater = orders
                        .Where(o => !string.IsNullOrEmpty(o.TheaterName))
                        .GroupBy(o => o.TheaterName)
                        .Select(g => new
                        {
                            TheaterName = g.Key,
                            Revenue = g.Sum(o => o.OrderTotal)
                        })
                        .OrderByDescending(x => x.Revenue)
                        .ToList();

                    // Thiết lập tiêu đề cho trang biểu đồ
                    chartWorksheet.Cells[1, 1].Value = "BIỂU ĐỒ DOANH THU THEO RẠP";
                    chartWorksheet.Cells[1, 1, 1, 3].Merge = true;
                    chartWorksheet.Cells[1, 1].Style.Font.Bold = true;
                    chartWorksheet.Cells[1, 1].Style.Font.Size = 16;
                    chartWorksheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Thời gian báo cáo
                    chartWorksheet.Cells[2, 1].Value = $"Thời gian: Từ {request.StartDate:dd/MM/yyyy} đến {request.EndDate:dd/MM/yyyy}";
                    chartWorksheet.Cells[2, 1, 2, 3].Merge = true;
                    chartWorksheet.Cells[2, 1].Style.Font.Bold = true;
                    chartWorksheet.Cells[2, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

                    // Tạo bảng dữ liệu cho biểu đồ
                    chartWorksheet.Cells[4, 1].Value = "STT";
                    chartWorksheet.Cells[4, 2].Value = "Rạp";
                    chartWorksheet.Cells[4, 3].Value = "Doanh thu (VNĐ)";

                    // Định dạng tiêu đề
                    for (int i = 1; i <= 3; i++)
                    {
                        chartWorksheet.Cells[4, i].Style.Font.Bold = true;
                        chartWorksheet.Cells[4, i].Style.Fill.PatternType = ExcelFillStyle.Solid;
                        chartWorksheet.Cells[4, i].Style.Fill.BackgroundColor.SetColor(Color.LightGray);
                        chartWorksheet.Cells[4, i].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                        chartWorksheet.Cells[4, i].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    }

                    // Điền dữ liệu cho bảng
                    int chartRow = 5;
                    for (int i = 0; i < revenueByTheater.Count; i++)
                    {
                        var item = revenueByTheater[i];

                        chartWorksheet.Cells[chartRow, 1].Value = i + 1;
                        chartWorksheet.Cells[chartRow, 2].Value = item.TheaterName;
                        chartWorksheet.Cells[chartRow, 3].Value = item.Revenue;

                        // Định dạng dữ liệu
                        chartWorksheet.Cells[chartRow, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        chartWorksheet.Cells[chartRow, 3].Style.Numberformat.Format = "#,##0";
                        chartWorksheet.Cells[chartRow, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                        // Định dạng border
                        for (int j = 1; j <= 3; j++)
                        {
                            chartWorksheet.Cells[chartRow, j].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                        }

                        chartRow++;
                    }

                    // Tổng doanh thu
                    chartWorksheet.Cells[++chartRow, 1].Value = "TỔNG DOANH THU:";
                    chartWorksheet.Cells[chartRow, 1, chartRow, 2].Merge = true;
                    chartWorksheet.Cells[chartRow, 1].Style.Font.Bold = true;
                    chartWorksheet.Cells[chartRow, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    chartWorksheet.Cells[chartRow, 3].Value = totalRevenue;
                    chartWorksheet.Cells[chartRow, 3].Style.Font.Bold = true;
                    chartWorksheet.Cells[chartRow, 3].Style.Numberformat.Format = "#,##0";
                    chartWorksheet.Cells[chartRow, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                    chartWorksheet.Cells[chartRow, 3].Style.Border.BorderAround(ExcelBorderStyle.Thin);

                    // Thiết lập độ rộng cột
                    chartWorksheet.Column(1).Width = 5;      // STT
                    chartWorksheet.Column(2).Width = 25;     // Tên rạp
                    chartWorksheet.Column(3).Width = 20;     // Doanh thu

                    // Tạo biểu đồ cột
                    if (revenueByTheater.Any())
                    {
                        var range = chartWorksheet.Cells[5, 2, 4 + revenueByTheater.Count, 3];

                        // Tạo biểu đồ tròn
                        var pieChart = chartWorksheet.Drawings.AddChart("DoanhThuTheoRap_Pie", eChartType.Pie) as OfficeOpenXml.Drawing.Chart.ExcelPieChart;
                        pieChart.Series.Add(range.Offset(0, 1, revenueByTheater.Count, 1), range.Offset(0, 0, revenueByTheater.Count, 1));
                        pieChart.Title.Text = "Tỷ lệ doanh thu theo rạp";
                        pieChart.SetPosition(3, 0, 4, 0);
                        pieChart.SetSize(500, 400);
                        pieChart.DataLabel.ShowPercent = true;
                    }
                }

                // Chuyển ExcelPackage thành byte array để trả về
                return package.GetAsByteArray();
            }
        }




    }
}
