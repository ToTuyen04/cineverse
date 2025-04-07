using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service.Interface
{
    public interface IRoomService
    {
        Task<RoomResponseDTO> AddAsync(RoomRequestDTOs.RoomCreateDTO request);
        Task<RoomResponseDTO> UpdateAsync(int id, RoomRequestDTOs.RoomUpdateDTO request);
        Task<IEnumerable<RoomResponseDTO>> GetAllAsync();
        Task<RoomResponseDTO> GetByIdAsync(int id);
        //UI gửi yêu cầu cho BE -> dùng RequestDTO
        Task DeleteAsync(int id);
    }
}
