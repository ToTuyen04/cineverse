using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Service
{
    public partial class TheaterService
    {
        public async Task<PaginatedResponse<TheaterResponseDTO>> GetPaginatedTheatersAsync(int pageIndex, int pageSize, string searchTerm = null)
        {
            try
            {
                var (paginatedTheaters, totalItems) = await _unitOfWork.TheaterRepo.GetPaginatedTheatersAsync(pageIndex, pageSize, searchTerm);

                var theaterDtos = _mapper.Map<List<TheaterResponseDTO>>(paginatedTheaters.Items);

                return new PaginatedResponse<TheaterResponseDTO>
                {
                    PageIndex = paginatedTheaters.PageIndex,
                    PageSize = paginatedTheaters.PageSize,
                    TotalCount = paginatedTheaters.TotalCount,
                    TotalPages = paginatedTheaters.TotalPages,
                    TotalItems = totalItems,
                    HasPreviousPage = paginatedTheaters.HasPreviousPage,
                    HasNextPage = paginatedTheaters.HasNextPage,
                    Items = theaterDtos
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Có lỗi xảy ra khi lấy danh sách rạp phân trang", ex);
            }
        }

        public async Task<TheaterResponseDTO> AddAsync(TheaterRequestDTO request)
        {
            var theater = _mapper.Map<Theater>(request);

            // Set TheaterSearchName before saving
            if (!string.IsNullOrEmpty(theater.TheaterName))
            {
                theater.TheaterSearchName = TextHelper.ToSearchFriendlyText(theater.TheaterName);
            }

            var addedTheater = await _unitOfWork.TheaterRepo.AddAsync(theater);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<TheaterResponseDTO>(addedTheater);
        }

        public async Task<TheaterResponseDTO> UpdateAsync(int id, TheaterRequestDTO request)
        {
            var theater = _mapper.Map<Theater>(request);
            theater.TheaterId = id;

            // Set TheaterSearchName before updating
            if (!string.IsNullOrEmpty(theater.TheaterName))
            {
                theater.TheaterSearchName = TextHelper.ToSearchFriendlyText(theater.TheaterName);
            }

            var updatedTheater = await _unitOfWork.TheaterRepo.UpdateAsync(theater);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<TheaterResponseDTO>(updatedTheater);
        }
    }
}
