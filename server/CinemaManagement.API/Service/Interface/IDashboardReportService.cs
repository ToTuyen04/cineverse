using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IDashboardReportService
    {
        Task<DashboardDTOs> GetDashboards(string theater, string time);
        Task<List<OrderDashboardDTO>> FilterOrderDashboard(string theater, string time);
        Task<List<GenresDashboardDTO>> FilterGenresDashboard(string theater, string time);
        Task<List<MovieDashboardDTO>> FilterMovieDashboard(string theater, string time);
        Task<List<ComboDashboardDTO>> FilterComboDashboard(string theater, string time);  
    }
}
