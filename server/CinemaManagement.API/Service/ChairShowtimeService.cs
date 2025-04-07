using AutoMapper;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.Service
{
    public class ChairShowtimeService : IChairShowtimeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public ChairShowtimeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<ChairShowtimeResponseDTO>> GetChairsByShowtimes(int showtimeId)
        {
            var chairs = await _unitOfWork.ChairShowtimeRepo.GetChairsByShowtimesAsync(showtimeId) 
                ?? throw new NotFoundException($"Không tìm thấy ghế nào cho suất chiếu với ID: {showtimeId}");
            return _mapper.Map<List<ChairShowtimeResponseDTO>>(chairs);
        }

        public async Task<ChairShowtime> GetChairShowtime(int showtimeId, int chairShowtimeId)
        {
            var chair = await _unitOfWork.ChairShowtimeRepo.GetChairShowtimeAsync(showtimeId, chairShowtimeId);
            return chair;
        }
    }
}
