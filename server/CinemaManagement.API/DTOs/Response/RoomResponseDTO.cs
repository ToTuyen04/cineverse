namespace CinemaManagement.API.DTOs.Response
{
    public class RoomResponseDTO
    {
        public int RoomId { get; set; }
        public string? RoomName { get; set; }
        public int? RoomChairAmount { get; set; }
        public int? RoomScreenTypeId { get; set; }
        public string? RoomScreenTypeName { get; set; }
        public int? RoomTheaterId { get; set; }
        public string? RoomTheaterName { get; set; }
    }
}
