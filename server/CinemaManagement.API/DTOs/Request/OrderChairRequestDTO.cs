using System.ComponentModel.DataAnnotations;

namespace CinemaManagement.API.DTOs.Request
{
    public class OrderChairRequestDTO
    {
        public int ChairId { get; set; }

        [Timestamp]
        public byte[] Version { get; set; }


    }


}
