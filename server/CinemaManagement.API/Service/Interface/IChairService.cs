using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service.Interface
{
    public interface IChairService 
    {

        public Task<List<ChairResponseDTO>> GetChairsByShowTime(int showTimeId);
        public Task<bool> UpdateChairsAvailabilityAsync(int showtimeId, List<int> chairIds);
    }
}
