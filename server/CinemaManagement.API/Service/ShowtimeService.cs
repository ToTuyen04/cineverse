using AutoMapper;
using CinemaManagement.API.Configuration;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using CinemaManagement.API.Utils;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CinemaManagement.API.Service
{
    public class ShowtimeService : IShowtimeService
    {
        private readonly IMapper _mapper;
        private readonly ILogger<ShowtimeService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ConfigurationHolder _configurationHolder;

        public ShowtimeService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<ShowtimeService> logger, ConfigurationHolder configurationHolder)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _configurationHolder = configurationHolder;
        }

        public async Task<ShowtimeResponseDTOs> GetShowtimeByIdAsync(int id)
        {
            var entity = await _unitOfWork.ShowtimeRepo.GetByIdAsync(id);
            if (entity == null)
            {
                throw new NotFoundException($"Không tìm thấy suất chiếu với ID: {id}");
            }

            return _mapper.Map<ShowtimeResponseDTOs>(entity);
        }

        public async Task<List<ShowtimeResponseDTOs>> GetAllShowtimesAsync()
        {
            var showtimes = await _unitOfWork.ShowtimeRepo.GetAllAsync();
            return _mapper.Map<List<ShowtimeResponseDTOs>>(showtimes);
        }

        public async Task<List<ShowtimeResponseDTOs>> GetShowtimeAsync(int theaterId, int movieId)
        {
            var showtimes = await _unitOfWork.ShowtimeRepo.GetShowtimeAsync(theaterId, movieId)
                ?? throw new NotFoundException($"Không tìm thấy xuất chiếu của phim {movieId} tại rạp {theaterId}!");
            return _mapper.Map<List<ShowtimeResponseDTOs>>(showtimes);
        }

        public async Task<ShowtimeResponseDTOs> AddAsync(ShowtimeRequestDTO.ShowtimeCreateDTO request)
        {

            //Tạo mới cần rạp, phòng chiếu, phim, tgian-cách nhau
            if (request == null)
            {
                throw new ValidationException("Dữ liệu không hợp lệ");
            }
            //Ktra xem phim/phòng chiếu có tồn tại hay không
            var movie = await _unitOfWork.MovieRepo.GetByIdAsync(request.ShowtimeMovieId.Value) ?? throw new NotFoundException($"Không tìm thấy phim với ID: {request.ShowtimeMovieId}"); ;
            var now = DateTime.Now;
            if (movie.MovieEndAt < now)
            {
                throw new ValidationException($"Phim này đã kết thúc vào {movie.MovieEndAt}");
            }

            if (movie.MovieStartAt > request.ShowtimeStartAt)
            {
                throw new ValidationException($"Suất chiếu phải diễn ra sau khi phim được công chiếu!");
            }

            var room = await _unitOfWork.RoomRepo.GetByIdAsync(request.ShowtimeRoomId.Value) ?? throw new NotFoundException($"Không tìm thấy phòng chiếu với ID: {request.ShowtimeRoomId}");

            //Kiểm tra xem phòng chiếu đã có lịch chiếu của showtime khác trong khoảng thời gian này chưa
            var existingShowtimes = await _unitOfWork.ShowtimeRepo.GetShowtimesByRoomIdAsync(room.RoomTheaterId!.Value, request.ShowtimeRoomId.Value);

            foreach (var showtime in existingShowtimes)
            {
                if (showtime.ShowtimeStartAt < request.ShowtimeStartAt.Value.AddMinutes(movie.MovieDuration.Value).AddMinutes(_configurationHolder.GetRoomBreakTimeMinutes()) &&
                    request.ShowtimeStartAt < showtime.ShowtimeStartAt.Value.AddMinutes(showtime.ShowtimeMovie.MovieDuration.Value).AddMinutes(_configurationHolder.GetRoomBreakTimeMinutes()))
                {
                    throw new ValidationException("Thời gian suất chiếu bị trùng với suất chiếu khác");
                }
            }

            try
            {
                var showtime = _mapper.Map<Showtime>(request);
                var createdShowtime = await _unitOfWork.ShowtimeRepo.AddAsync(showtime);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Tạo mới suất chiếu thành công. ID: {ShowtimeId}, Phim: {MovieId}, Phòng: {RoomId}",
                    createdShowtime.ShowtimeId, createdShowtime.ShowtimeMovieId, createdShowtime.ShowtimeRoomId);

                return _mapper.Map<ShowtimeResponseDTOs>(createdShowtime);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo suất chiếu mới. Data: {RequestData}", JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo suất chiếu mới. Data: {RequestData}", JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }
        public async Task<ShowtimeResponseDTOs> UpdateAsync(int id, ShowtimeRequestDTO.ShowtimeUpdateDTO request)
        {
            if (request == null)
            {
                throw new ValidationException("Dữ liệu không hợp lệ");
            }
            var showtime = await _unitOfWork.ShowtimeRepo.GetByIdAsync(id) ?? throw new NotFoundException($"Không tìm thấy suất chiếu với ID: {id}");
            
            if (CanUpdateShowtime(showtime) == 1 && showtime.ShowtimeAvailable == true)
                throw new ValidationException("Không thể cập nhật suất chiếu này vì sẽ diễn ra trong vòng 4 ngày tới");
            else if (CanUpdateShowtime(showtime) == -1)
                throw new ValidationException("Không thể cập nhật suất chiếu này vì đã kết thúc");

            var movie = await _unitOfWork.MovieRepo.GetByIdAsync(request.ShowtimeMovieId.Value) ?? throw new NotFoundException($"Không tìm thấy phim với ID: {request.ShowtimeMovieId}");
            if (movie.MovieStartAt > request.ShowtimeStartAt)
            {
                throw new ValidationException($"Suất chiếu phải diễn ra sau khi phim được công chiếu!");
            }

            var room = await _unitOfWork.RoomRepo.GetByIdAsync(request.ShowtimeRoomId.Value) ?? throw new NotFoundException($"Không tìm thấy phòng chiếu với ID: {request.ShowtimeRoomId}");
            //lưu phòng mới vào suất chiếu đang cập nhật
            showtime.ShowtimeRoomId = room.RoomId;
            var existingShowtimes = await _unitOfWork.ShowtimeRepo.GetShowtimesByRoomIdAsync(room.RoomTheaterId.Value, request.ShowtimeRoomId.Value);
            foreach (var st in existingShowtimes)
            {
                if (st.ShowtimeId != id &&
                   IsShowtimeOverlapping(request.ShowtimeStartAt.Value, movie.MovieDuration.Value, st.ShowtimeStartAt.Value, st.ShowtimeMovie.MovieDuration.Value))
                {
                    throw new ValidationException("Thời gian suất chiếu bị trùng với suất chiếu khác");
                }
            }
            try
            {
                _mapper.Map(request, showtime);
                var updatedShowtime = await _unitOfWork.ShowtimeRepo.UpdateAsync(showtime);
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("Cập nhật suất chiếu thành công. ID: {ShowtimeId}, Phim: {MovieId}, Phòng: {RoomId}",
                    updatedShowtime.ShowtimeId, updatedShowtime.ShowtimeMovieId, updatedShowtime.ShowtimeRoomId);
                return _mapper.Map<ShowtimeResponseDTOs>(updatedShowtime);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi cập nhật suất chiếu. Data: {RequestData}", JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
        }

        public async Task DeleteAsync(int showtimeId)
        {
            try
            {
                var showtime = await _unitOfWork.ShowtimeRepo.GetByIdAsync(showtimeId);
                if (showtime == null)
                {
                    throw new NotFoundException($"Showtime with ID {showtimeId} not found.");
                }

                await _unitOfWork.ShowtimeRepo.DeleteAsync(showtimeId);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa suất chiếu có ID: {showtimeId}");
                }
                _logger.LogInformation("Deleted showtime with ID: {ShowtimeId}", showtimeId);
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && sqlEx.Number == 547)
            {
                // Foreign key constraint violation
                _logger.LogError(ex, "Foreign key constraint violation when deleting showtime with ID: {ShowtimeId}", showtimeId);
                throw new Exception("Cannot delete showtime because it is referenced by other records.");
            }
            catch (NotFoundException ex)
            {
                _logger.LogError(ex, "Showtime not found with ID: {ShowtimeId}", showtimeId);
                throw;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Concurrency conflict when deleting showtime with ID: {ShowtimeId}", showtimeId);
                throw new Exception("Concurrency conflict occurred while deleting the showtime. Please try again.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting showtime with ID: {ShowtimeId}", showtimeId);
                throw new Exception("An error occurred while deleting the showtime. Please try again.");
            }
        }

        public async Task<IEnumerable<ShowtimeResponseDTOs>> SearchShowtimesAsync(string searchTerm)
        {
            var showtimes = await _unitOfWork.ShowtimeRepo.SearchShowtimesAsync(searchTerm);
            return _mapper.Map<IEnumerable<ShowtimeResponseDTOs>>(showtimes);
        }
        public async Task<PaginatedResponse<ShowtimeResponseDTOs>> GetPaginatedShowtimesAsync(
            int pageIndex,
            int pageSize,
            string? searchTerm = null,
            int? movieId = null,
            int? theaterId = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            try
            {
                var (paginatedShowtimes, totalItems) = await _unitOfWork.ShowtimeRepo.GetPaginatedShowtimesAsync(
                    pageIndex, pageSize, searchTerm, movieId, theaterId, fromDate, toDate);

                //kiểm tra các suất chiếu, suất chiếu nào kết thúc thì cập nhật MovieAvailable về false
                UpdateShowtimeStatus(paginatedShowtimes.Items);
                await _unitOfWork.SaveChangesAsync();

                var showtimeDtos = _mapper.Map<List<ShowtimeResponseDTOs>>(paginatedShowtimes.Items);

                foreach (var dto in showtimeDtos)
                {
                    var showtime = paginatedShowtimes.Items.FirstOrDefault(s => s.ShowtimeId == dto.ShowtimeId);
                    if (showtime != null)
                    {
                        //nếu phim đó không khả dụng MovieAvailable = false
                        dto.ShowtimeAvailable = false;
                        //nếu được phép update thì CanUpdate = true, ngược lại là false
                        dto.CanUpdate = CanUpdateShowtime(showtime) == 0 ? true : false;
                        //tính thời điểm kết thúc của suất chiếu
                        dto.ShowtimeEndAt = CalculateShowtimeEndTime(showtime);
                    }
                }

                return new PaginatedResponse<ShowtimeResponseDTOs>
                {
                    PageIndex = paginatedShowtimes.PageIndex,
                    PageSize = paginatedShowtimes.PageSize,
                    TotalCount = paginatedShowtimes.TotalCount,
                    TotalPages = paginatedShowtimes.TotalPages,
                    TotalItems = totalItems,
                    HasPreviousPage = paginatedShowtimes.HasPreviousPage,
                    HasNextPage = paginatedShowtimes.HasNextPage,
                    Items = showtimeDtos
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving paginated showtimes");
                throw new Exception("Có lỗi xảy ra khi lấy danh sách suất chiếu phân trang", ex);
            }
        }

        //hàm ktra và cập nhật showtimeAvailable dựa vào tgian hiện tại(đã thêm config tgian nghỉ giữa các suất chiếu)
        private void UpdateShowtimeStatus(List<Showtime> showtimes)
        {
            var now = DateTime.Now;
            foreach (var s in showtimes)
            {
                if (s.ShowtimeMovie?.MovieDuration == null || s.ShowtimeStartAt == null)
                    continue;
                //tính thời điểm kết thúc của suất chiếu
                var endTime = s.ShowtimeStartAt.Value.AddMinutes(s.ShowtimeMovie.MovieDuration.Value).AddMinutes(_configurationHolder.GetRoomBreakTimeMinutes());

                //nếu suất chiếu đã kết thúc, cập nhật trạng thái thành false
                if (now > endTime && s.ShowtimeAvailable == true)
                {
                    s.ShowtimeAvailable = false;
                    _unitOfWork.ShowtimeRepo.UpdateAsync(s);
                }
            }
        }

        //hàm ktra xem suất chiếu có được phép update hay k? Chỉ được update nếu return 0 (đã thêm tgian nghỉ giữa các suất chiếu với trường hợp =-1 --suất chiếu đã kết thúc)
        private int CanUpdateShowtime(Showtime s)
        {
            var now = DateTime.Now;
            //Nếu duration và startAt có giá trị
            if (s.ShowtimeMovie?.MovieDuration != null && s.ShowtimeStartAt != null)
            {
                var endTime = s.ShowtimeStartAt.Value.AddMinutes(s.ShowtimeMovie.MovieDuration.Value).AddMinutes(_configurationHolder.GetRoomBreakTimeMinutes());
                //nếu suất chiếu đã kết thúc
                if (now > endTime)
                    return -1;
            }

            //nếu startAt có giá trị
            if (s.ShowtimeStartAt != null)
            {
                var daysAvailableBooking = _configurationHolder.GetAdvanceTicketingDays();
                //4 ngày trước khi diễn ra xuất chiếu
                var daysBeforeStart = s.ShowtimeStartAt.Value.AddDays(-daysAvailableBooking);
                if (now >= daysBeforeStart)
                    return 1;
            }
            return 0;
        }

        //hàm ktra xem lich chiếu mới có trùng với lịch chiếu cũ không(đã thêm config tgian nghỉ giữa các suất chiếu)
        private bool IsShowtimeOverlapping(DateTime newStartTime, int movieDuration, DateTime existingStartTime, int existingMovieDuration)
        {
            var newEndTime = newStartTime.AddMinutes(movieDuration);
            var existingEndTime = existingStartTime.AddMinutes(existingMovieDuration).AddMinutes(_configurationHolder.GetRoomBreakTimeMinutes());

            return newStartTime < existingEndTime && existingStartTime < newEndTime;
        }

        //hàm tính thời điểm kết thúc của suất chiếu(đã thêm config tgian nghỉ giữa các suất chiếu)
        private DateTime? CalculateShowtimeEndTime(Showtime showtime)
        {
            var breakingTimeMinutes = _configurationHolder.GetRoomBreakTimeMinutes();
            if (showtime?.ShowtimeStartAt == null || showtime.ShowtimeMovie?.MovieDuration == null)
                return null;

            return showtime.ShowtimeStartAt.Value
                .AddMinutes(showtime.ShowtimeMovie.MovieDuration.Value)
                .AddMinutes(breakingTimeMinutes);
        }
    }
}

