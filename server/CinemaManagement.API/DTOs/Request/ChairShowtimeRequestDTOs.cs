using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class ChairShowtimeRequestDTOs
    {
        public class ChairBookingDTO
        {
            public int ChairShowtimeId { get; set; }

            [Timestamp]
            public byte[] Version { get; set; }
        }
    }
}
