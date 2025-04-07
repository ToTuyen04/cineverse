using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Service
{
    public class ChairService : IChairService
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        public ChairService(IMapper mapper, IUnitOfWork unitOfWork ) 
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<ChairResponseDTO>> GetChairsByShowTime(int showTimeId)
        {
            var chairs = await _unitOfWork.ChairShowtimeRepo.GetChairsByShowtimesAsync(showTimeId);

            if (!chairs.Any())
            {
                throw new NotFoundException($"Không tìm thấy ghế cho suất chiếu ID: {showTimeId}");
            }
            var result = _mapper.Map<List<ChairResponseDTO>>(chairs);
            return result;
        }


        public async Task<bool> UpdateChairsAvailabilityAsync(int showtimeId, List<int> chairIds)
        {
            if (chairIds == null || !chairIds.Any())
            {
                throw new ArgumentException("Danh sách ghế không được trống.");
            }

            var existChairs = await _unitOfWork.ChairShowtimeRepo.GetChairsByShowtimesAsync(showtimeId);

            var existChairShowtimes = existChairs
                .Where(cs => cs.ShowtimeId == showtimeId && chairIds.Contains(cs.ChairId ?? 0))
                .ToList();

            var existingChairIds = existChairShowtimes.Select(cs => cs.ChairId ?? 0).ToList();
            var missingChairs = chairIds.Except(existingChairIds).ToList();
            if (missingChairs.Any())
            {
                throw new NotFoundException($"Không tìm thấy ghế có ID: {string.Join(", ", missingChairs)} cho suất chiếu {showtimeId}");
            }

            var alreadySelectedChairs = existChairShowtimes
                .Where(cs => cs.Available == false)
                .Select(cs => cs.ChairId ?? 0)
                .ToList();

            if (alreadySelectedChairs.Any())
            {
                throw new InvalidOperationException($"Ghế đã được chọn, không thể cập nhật: {string.Join(", ", alreadySelectedChairs)}");
            }

            return await _unitOfWork.ChairShowtimeRepo.UpdateChairsAvailabilityAsync(showtimeId, chairIds);
        }



    }
}

