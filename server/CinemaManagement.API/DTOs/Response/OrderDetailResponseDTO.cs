namespace CinemaManagement.API.DTOs.Response
{
    public class OrderDetailResponseDTO
    {
        public int OrderId { get; set; }
        public DateTime OrderCreateAt { get; set; }
        public int? UserId { get; set; }
        public int VoucherId { get; set; }
        public string OrderStatus { get; set; }
        public decimal PaymentPrice { get; set; }
        public decimal DiscountPrice { get; set; }
        public decimal TotalPrice { get; set; }


        public string OrderName { get; set; }
        public string OrderEmail { get; set; }
        public string OrderPhone { get; set; }

        public List<ShowtimeInfoDTO> showtimeInfos { get; set; }


        public List<OrderDetailItemDTO> OrderDetails { get; set; }

        public List<OrderComboItemDTO> orderComboItems { get; set; }
    }


    public class OrderDetailItemDTO
    {
        public int OrderDetailId { get; set; }
        public int? TicketId { get; set; }
        public string TicketCode { get; set; }
        public int? ChairId { get; set; }
        public string ChairName { get; set; }
        public string ChairType { get; set; }
        public string ChairPosition { get; set; }
        public decimal Price { get; set; }
        public byte[] Version { get; set; }

    }

    public class ShowtimeInfoDTO
    {
        public int ShowtimeId { get; set; }
        public string MovieName { get; set; }
        public string TheaterName { get; set; }
        public string RoomName { get; set; }
        public DateTime? StartTime { get; set; }
    }

    public class OrderComboItemDTO
    {
        public string ComboName { get; set; }
        public int ComboQuantity { get; set; }
        public int ComboPrice { get; set; }
    }
}

