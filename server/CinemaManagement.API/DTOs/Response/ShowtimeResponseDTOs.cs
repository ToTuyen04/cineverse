namespace CinemaManagement.API.DTOs.Response
{
    public class ShowtimeResponseDTOs
    {

        public int ShowtimeId { get; set; }
        public DateTime? ShowtimeStartAt { get; set; }
        //thêm thời điểm kết thúc suất chiếu
        public DateTime? ShowtimeEndAt { get; set; }
        public int? ShowtimeCreatedBy { get; set; }
        public int MovieId { get; set; }
        public string? MovieName { get; set; }
        public int RoomId { get; set; }
        public string? RoomName { get; set; }
        public int? RoomChairAmount { get; set; }
        public int? RoomScreenTypeId { get; set; }
        public string? RoomScreenTypeName { get; set; }
        public int? RoomTheaterId { get; set; }
        public string? RoomTheaterName { get; set; }
        public bool? ShowtimeAvailable { get; set; }
        public bool CanUpdate { get; set; }
    }
}
