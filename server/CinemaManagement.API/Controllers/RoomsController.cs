using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/rooms")]
    [ApiController]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        [HttpGet]
        public async Task<ActionResult<SuccessResponse<IEnumerable<RoomResponseDTO>>>> GetRooms()
        {
            var rooms = await _roomService.GetAllAsync();
            return Ok(SuccessResponse<IEnumerable<RoomResponseDTO>>.Create(rooms));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SuccessResponse<RoomResponseDTO>>> GetRoomById(int id)
        {
            var room = await _roomService.GetByIdAsync(id);
            return Ok(SuccessResponse<RoomResponseDTO>.Create(room));
        }

        [HttpPost]
        public async Task<ActionResult<SuccessResponse<RoomResponseDTO>>> CreateRoom([FromBody] RoomRequestDTOs.RoomCreateDTO createDTO)
        {
            var createdRoom = await _roomService.AddAsync(createDTO);
            return CreatedAtAction(
                nameof(GetRoomById),
                new { id = createdRoom.RoomId },
                SuccessResponse<RoomResponseDTO>.Create(createdRoom, "Tạo phòng thành công")
                );
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<SuccessResponse<RoomResponseDTO>>> UpdateRoom(
        int id,
        [FromBody] RoomRequestDTOs.RoomUpdateDTO updateDto)
        {
            var room = await _roomService.UpdateAsync(id, updateDto);
            return Ok(SuccessResponse<RoomResponseDTO>.Create(room, "Cập nhật phòng thành công"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRoom(int id)
        {
            await _roomService.DeleteAsync(id);
            return Ok(SuccessResponse<object>.Create(null, "Xóa phòng thành công"));
        }
    }
}
