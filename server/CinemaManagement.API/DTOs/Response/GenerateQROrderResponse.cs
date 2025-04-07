namespace CinemaManagement.API.DTOs.Response
{
    public class GenerateQROrderResponse
    {
        public int OrderId { get; set; }
        public int TransactionNo { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerName { get; set; }
        public string MovieName { get; set; }
        public DateTime ShowTime { get; set; }
        public string RoomName { get; set; }
        public string TheaterName { get; set; }
        public List<OrderDetailDTO> SeatNumbers { get; set; }
        public List<OrderDetailDTO> Combos { get; set; }
    }
}
