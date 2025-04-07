namespace CinemaManagement.API.DTOs.Response
{
    public class OrderResponseDTO
    {
        public int OrderId { get; set; }
        public DateTime OrderCreateAt { get; set; }
        public int? UserId { get; set; }
        public int? VoucherId { get; set; }
        public string OrderName { get; set; }
        public string OrderPhone { get; set; }
        public string OrderEmail { get; set; }
        public string OrderStatus { get; set; }
        public decimal PaymentPrice { get; set; }
        public decimal DiscountPrice { get; set; }
        public decimal TotalPrice { get; set; }

        public List<OrderDetailDTO> ComboDetails { get; set; } = new List<OrderDetailDTO>();

    }

    public class OrderDetailDTO
    {
        public string Name { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class OrderReportDTO
    {
        public int OrderId { get; set; }
        public DateTime? OrderCreateAt { get; set; }
        public int? UserId { get; set; }
        public string OrderStatus { get; set; }
        public string OrderName { get; set; }
        public string OrderEmail { get; set; }
        public string OrderPhone { get; set; }
        public string MovieName { get; set; }
        public string TheaterName { get; set; }
        public string RoomName { get; set; }
        public DateTime? StartTime { get; set; }

        public decimal TicketTotal { get; set; }
        public decimal ComboTotal { get; set; }

        public decimal OrderTotal => TicketTotal + ComboTotal;
    }
}
