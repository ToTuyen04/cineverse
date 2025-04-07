using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Request
{
    public class ShowtimeRequestDTO
    {
        public class ShowtimeCreateDTO
        {
            //Movie Id
            public int? ShowtimeMovieId { get; set; }
            //Start time (hour)
            public DateTime? ShowtimeStartAt { get; set; }
            //Who created this showtime
            public int? ShowtimeCreatedBy { get; set; }
            //Room Id
            public int? ShowtimeRoomId { get; set; }
            public bool? ShowtimeAvailable { get; set; }

        }

        public class ShowtimeUpdateDTO
        {
            //Movie Id
            public int? ShowtimeMovieId { get; set; }
            //Start time (hour)
            public DateTime? ShowtimeStartAt { get; set; }
            //Who created this showtime
            public int? ShowtimeCreatedBy { get; set; }
            //Room Id
            public int? ShowtimeRoomId { get; set; }
            public bool? ShowtimeAvailable { get; set; }
        }
        
    }
}
