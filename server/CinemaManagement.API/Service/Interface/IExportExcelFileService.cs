using CinemaManagement.API.DTOs.Request;
using Microsoft.AspNetCore.Mvc;
using static CinemaManagement.API.DTOs.Request.ExportExcelFileRequestDTO;

namespace CinemaManagement.API.Service.Interface
{
    public interface IExportExcelFileService
    {
        /// <summary>
        /// Xuất báo cáo doanh thu của tất cả các rạp
        /// </summary>
        Task<FileContentResult> ExportAllTheatersRevenueReport(ExportExcelFileRequestDTO.RevenueReportRequestDTO request);

        /// <summary>
        /// Xuất báo cáo doanh thu của một rạp cụ thể
        /// </summary>
        Task<FileContentResult> ExportTheaterRevenueReport(ExportExcelFileRequestDTO.RevenueReportRequestDTO request);
    }
}
