using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IDashboardRepository
    {
        Task<decimal> GetTicketToday();
        Task<List<OrderDashboardDTO>> GetPaidOrdersDashBoard();
        Task<List<GenresDashboardDTO>> GetGenresDashBoard();
        Task<List<MovieDashboardDTO>> GetMovieDashBoard();
        Task<List<ComboDashboardDTO>> GetComboDashBoard();
    }
}
