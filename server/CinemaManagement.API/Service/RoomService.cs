using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol.Core.Types;
using System.Text.Json;

namespace CinemaManagement.API.Service
{
    public class RoomService : IRoomService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<RoomService> _logger;
        private readonly IMapper _mapper;
        public RoomService(IUnitOfWork unitOfWork, ILogger<RoomService> logger, IMapper mapper) 
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<RoomResponseDTO> GetByIdAsync(int id)
        {
            var room = await _unitOfWork.RoomRepo.GetByIdAsync(id) 
                ?? throw new NotFoundException($"Không tìm thấy phòng với ID: {id}"); 
            return _mapper.Map<RoomResponseDTO>(room);
        }


        public async Task<RoomResponseDTO> AddAsync(RoomRequestDTOs.RoomCreateDTO request)
        {
            if (request == null)
                throw new ValidationException("Dữ liệu không hợp lệ");

            if (await _unitOfWork.RoomRepo.ExistsByNameInTheaterAsync(request.RoomTheaterId, null, request.RoomName))
            {
                throw new ValidationException($"'{request.RoomName}' đã tồn tại trong rạp này");
            }

            try
            {
                var room = _mapper.Map<Room>(request);
                var createdRoom = await _unitOfWork.RoomRepo.AddAsync(room);
                
                await _unitOfWork.SaveChangesAsync();

                createdRoom = await _unitOfWork.RoomRepo.GetByIdAsync(createdRoom.RoomId);

                _logger.LogInformation(
                   "Tạo mới phòng thành công. ID: {RoomId}, Tên: {RoomName}, Rạp: {TheaterId}",
                   createdRoom.RoomId,
                   createdRoom.RoomName,
                   createdRoom.RoomTheaterId);


                return _mapper.Map<RoomResponseDTO>(createdRoom);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo phòng mới. Data: {RequestData}",
           JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo phòng mới. Data: {RequestData}",
            JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task<RoomResponseDTO> UpdateAsync(int id, RoomRequestDTOs.RoomUpdateDTO request)
        {

            var existingRoom = await _unitOfWork.RoomRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy phòng với ID: {id}");

            if (await _unitOfWork.RoomRepo.ExistsByNameInTheaterAsync(existingRoom.RoomTheaterId!.Value, existingRoom.RoomId, request.RoomName))
            {
                throw new ValidationException($"'{request.RoomName}' đã tồn tại trong rạp này");
            }

            try
            {
                existingRoom.RoomName = request.RoomName;
                existingRoom.RoomChairAmount = request.RoomChairAmount;
                existingRoom.RoomScreenTypeId = request.RoomScreenTypeId;

                var updatedRoom = await _unitOfWork.RoomRepo.UpdateAsync(existingRoom);
                await _unitOfWork.SaveChangesAsync();
                updatedRoom = await _unitOfWork.RoomRepo.GetByIdAsync(updatedRoom.RoomId);

                _logger.LogInformation(
               "Cập nhật phòng thành công. ID: {0}, Tên: {1}, Số lượng ghế: {2}, Loại màn hình {3}", id, updatedRoom.RoomName, updatedRoom.RoomChairAmount, updatedRoom?.RoomScreenType?.ScreenTypeName);

                return _mapper.Map<RoomResponseDTO>(updatedRoom);

            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi cập nhật phòng {RoomId}", id);
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Lỗi không xác định khi cập nhật phòng {RoomId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task DeleteAsync(int id)
        {
            var room = await _unitOfWork.RoomRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy phòng với ID: {id}");


            if (await _unitOfWork.RoomRepo.HasActiveOrUpcomingShowtimesAsync(id))
            {
                throw new ValidationException("Không thể xóa phòng đang có hoặc sắp có lịch chiếu");
            }

            try
            {
                await _unitOfWork.RoomRepo.DeleteAsync(room);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa phòng có ID: {id}");
                }

                _logger.LogInformation("Xóa phòng thành công. ID: {RoomId}", id);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi xóa phòng {RoomId}", id);
                throw new Exception("Có lỗi xảy ra khi xóa dữ liệu");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xóa phòng {RoomId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task<IEnumerable<RoomResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.RoomRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<RoomResponseDTO>>(entities);
        }
    }
}
