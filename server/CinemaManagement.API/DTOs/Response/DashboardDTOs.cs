using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.DTOs.Response
{
    public class DashboardDTOs
    {
        public decimal totalMoive { get; set; }
        public decimal totalTheater { get; set; }
        public List<String> theaterNames { get; set; }
        public decimal ticketToday { get; set; }
        public decimal totalTicket { get; set; }
        public decimal totalCombo { get; set; }
        public List<OrderDashboardDTO> orderDashboards { get; set; }
        public List<GenresDashboardDTO> genresDashboards { get; set; }
        public List<MovieDashboardDTO> movieDashboards { get; set; }
        public List<ComboDashboardDTO> comboDashboards { get; set; }
    }

    public class OrderDashboardDTO 
    {
        public int OrderId { get; set; }
        public DateTime? OrderCreateAt { get; set; }
        public string OrderCreateAtFormatted => OrderCreateAt?.ToString("yyyy-MM-dd");
        public decimal TicketTotal { get; set; }
        public decimal ComboTotal { get; set; }
        public string? TheaterName { get; set; }
        public decimal OrderTotal => TicketTotal + ComboTotal;
    }
    public class GenresDashboardDTO 
    {
        public DateTime? OrderCreateAt { get; set; }
        public string OrderCreateAtFormatted => OrderCreateAt?.ToString("yyyy-MM-dd");
        public int GenresId { get; set; }
        public string? GenresName { get; set; }
        public string? TheaterName { get; set; }
        public int TotalOrders { get; set; }
    }
    public class MovieDashboardDTO 
    {
        public DateTime? OrderCreateAt { get; set; }
        public string OrderCreateAtFormatted => OrderCreateAt?.ToString("yyyy-MM-dd");
        public int MovieId { get; set; }
        public string? MovieName { get; set; }
        public string? TheaterName { get; set; }
        public int TotalOrders { get; set; }
    }
    public class ComboDashboardDTO 
    {
        public DateTime? OrderCreateAt { get; set; }
        public string OrderCreateAtFormatted => OrderCreateAt?.ToString("yyyy-MM-dd");
        public int ComboId { get; set; }
        public string? ComboName { get; set; }
        public string? TheaterName { get; set; }
        public int TotalOrders { get; set; }
    }
}
