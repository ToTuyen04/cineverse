using Autofac.Core;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Enums;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Utils;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;

namespace CinemaManagement.API.Service
{
    public partial class MovieService
    {
        public async Task<MovieResponseDTO> AddAsync(MovieRequestDTO.MovieCreateDTO movieDTO, List<int> genreIds)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var movie = _mapper.Map<Movie>(movieDTO);

                if (movieDTO.MoviePoster != null)
                {
                    var imgUrl = await _cloudinaryService.UploadImageAsync(movieDTO.MoviePoster);
                    movie.MoviePoster = imgUrl;
                }
                if (await CheckMovieNameDuplicated(movie.MovieName))
                {
                    throw new ValidationException($"Tên phim {movie.MovieName} đã tồn tại trong hệ thống! Vui lòng chọn tên phim khác!");

                }

                //gán giá trị cho thuộc tính MovieSearchName trước khi lưu xuống db
                if (!string.IsNullOrEmpty(movie.MovieName))
                {
                    movie.MovieSearchName = TextHelper.ToSearchFriendlyText(movie.MovieName);
                }

                movie.MovieCreatAt = DateTime.Now;
                if (movieDTO.MovieStartAt < DateTime.Now)
                {
                    throw new ValidationException("Ngày bắt đầu phim không thể nhỏ hơn ngày hiện tại");
                }
                if (movieDTO.MovieEndAt < movieDTO.MovieStartAt)
                {
                    throw new ValidationException("Ngày kết thúc không thể nhỏ hơn ngày bắt đầu");
                }

                movie.MovieAvailable = false;
                //movie được tạo bởi ai? sửa id của admin/staff vào đây
                movie.MovieCreatedBy = 1;

                var addedMovie = await _unitOfWork.MovieRepo.AddAsync(movie, genreIds);
                await _unitOfWork.SaveChangesAsync();

                if (genreIds != null && genreIds.Any())
                {
                    var existingGenreIds = await _unitOfWork.GenresRepo.GetExistingGenreIdsAsync(genreIds);
                    if (existingGenreIds.Count() != genreIds.Count)
                    {
                        var nonExistingIds = genreIds.Except(existingGenreIds);
                        throw new NotFoundException($"Không tìm thấy các thể loại với ID: {string.Join(", ", nonExistingIds)}");
                    }
                    foreach (var genreId in genreIds)
                    {
                        await _unitOfWork.MovieGenreRepo.AddAsync(new MovieGenre
                        {
                            MovieId = addedMovie.MovieId,
                            GenresId = genreId
                        });
                    }
                }
                //Lưu thay đổi
                await _unitOfWork.SaveChangesAsync();

                //Commit transaction sau khi lưu thành công
                await _unitOfWork.CommitTransactionAsync();

                var movieWithGenres = await _unitOfWork.MovieRepo.GetByIdAsync(addedMovie.MovieId);
                return _mapper.Map<MovieResponseDTO>(movieWithGenres);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Lỗi khi thêm phim: {ex.Message}", ex);
            }
        }
        public async Task<MovieResponseDTO> UpdateAsync(int id, MovieRequestDTO.MovieUpdateDTO request, List<int> genreIds)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var existingMovie = await _unitOfWork.MovieRepo.GetByIdAsync(id);
                if (existingMovie == null)
                    throw new NotFoundException($"Không tìm thấy phim với ID: {id}");
                if (request.MovieName != existingMovie.MovieName && await CheckMovieNameDuplicated(request.MovieName))
                {
                    throw new ValidationException($"Tên phim {request.MovieName} đã tồn tại trong hệ thống! Vui lòng chọn tên phim khác!");

                }
                existingMovie.MovieName = request.MovieName;

                existingMovie.MovieStartAt = request.MovieStartAt;
                if (request.MovieEndAt < request.MovieStartAt)
                {
                    throw new ValidationException("Ngày kết thúc không thể nhỏ hơn ngày bắt đầu");
                }
                existingMovie.MovieEndAt = request.MovieEndAt;

                existingMovie.MovieTrailer = request.MovieTrailer;
                existingMovie.MovieActor = request.MovieActor;
                existingMovie.MovieDirector = request.MovieDirector;
                existingMovie.MovieBrand = request.MovieBrand;
                existingMovie.MovieDuration = request.MovieDuration;
                //existingMovie.MovieVersion = request.MovieVersion;
                existingMovie.MovieContent = request.MovieContent;
                existingMovie.MovieAvailable = request.MovieAvailable;

                if (request.MoviePoster != null)
                {
                    var posterUrl = await _cloudinaryService.UploadImageAsync(request.MoviePoster);
                    existingMovie.MoviePoster = posterUrl;
                }
                existingMovie.MovieSearchName = TextHelper.ToSearchFriendlyText(existingMovie.MovieName);
                existingMovie.MovieUpdateBy = 1; // Thay bằng id của admin/staff

                await _unitOfWork.MovieRepo.UpdateAsync(existingMovie);

                await _unitOfWork.SaveChangesAsync();

                if (genreIds != null)
                {
                    var existingGenreIds = await _unitOfWork.GenresRepo.GetExistingGenreIdsAsync(genreIds);
                    if (existingGenreIds.Count() != genreIds.Count)
                    {
                        var nonExistingIds = genreIds.Except(existingGenreIds);
                        throw new NotFoundException($"Không tìm thấy các thể loại với ID: {string.Join(", ", nonExistingIds)}");
                    }
                    var currentGenres = await _unitOfWork.MovieGenreRepo.GetByMovieIdAsync(id);
                    await _unitOfWork.MovieGenreRepo.RemoveRangeAsync(currentGenres);

                    foreach (var genreId in genreIds)
                    {
                        await _unitOfWork.MovieGenreRepo.AddAsync(new MovieGenre
                        {
                            MovieId = id,
                            GenresId = genreId
                        });
                    }
                }
                await _unitOfWork.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();
                //lấy ra movie vừa mới được cập nhật từ DB(gồm các genre)
                existingMovie = await _unitOfWork.MovieRepo.GetByIdAsync(id);
                return _mapper.Map<MovieResponseDTO>(existingMovie);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Lỗi khi cập nhật phim: {ex.Message}", ex);
            }
        }
        public async Task<IEnumerable<MovieResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.MovieRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<MovieResponseDTO>>(entities);
        }
        public async Task<MovieResponseDTO> GetByIdAsync(int id)
        {
            var movie = await _unitOfWork.MovieRepo.GetByIdAsync(id);
            return _mapper.Map<MovieResponseDTO>(movie);
        }
        public async Task<PaginatedResponse<MovieResponseDTO>> GetPaginatedMoviesAsync(
            int pageIndex,
            int pageSize,
            string searchTerm = null,
            List<int> genreIds = null,
            MovieSortBy? sortBy = null,
            Enums.SortOrder? sortOrder = null)
        {
            try
            {
                var (paginatedMovies, totalItems) = await _unitOfWork.MovieRepo.GetPaginatedMoviesAsync(pageIndex, pageSize, searchTerm, genreIds, sortBy, sortOrder);

                var movieDtos = _mapper.Map<List<MovieResponseDTO>>(paginatedMovies.Items);

                return new PaginatedResponse<MovieResponseDTO>
                {
                    PageIndex = paginatedMovies.PageIndex,
                    PageSize = paginatedMovies.PageSize,
                    TotalCount = paginatedMovies.TotalCount,
                    TotalPages = paginatedMovies.TotalPages,
                    TotalItems = totalItems,    // Add the total items count here
                    HasPreviousPage = paginatedMovies.HasPreviousPage,
                    HasNextPage = paginatedMovies.HasNextPage,
                    Items = movieDtos
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Có lỗi xảy ra khi lấy danh sách phim phân trang", ex);
            }
        }
        //public async Task<bool> HasActiveShowtimesAsync(int movieId)
        //{
        //    // You may need to adjust this implementation based on your actual data relationships
        //    return await _unitOfWork.MovieRepo.HasActiveShowtimesAsync(movieId);
        //}
        //public async Task<List<int>> GetActiveShowtimeIdsAsync(int movieId)
        //{
        //    return await _unitOfWork.MovieRepo.GetActiveShowtimeIdsAsync(movieId);
        //}
        public async Task DeleteAsync(int id)
        {

            var movie = await _unitOfWork.MovieRepo.GetByIdAsync(id);
            if (movie == null)
            {
                throw new NotFoundException($"Không tìm thấy phim với ID: {id}");
            }
            var activeShowtimeIds = await _unitOfWork.MovieRepo.GetActiveShowtimeIdsAsync(id);
            if (activeShowtimeIds.Any())
            {
                //return BadRequest(new { success = false, message = $"Không thể xóa phim đang có lịch chiếu. Suất chiếu ID: {string.Join(", ", activeShowtimeIds)}" });
                throw new ValidationException($"Không thể xóa phim đang có lịch chiếu.");
            }
            try
            {
                await _unitOfWork.MovieRepo.DeleteAsync(id);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa phim có ID: {id}");
                }
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && sqlEx.Number == 547)
            {
                // Foreign key constraint violation
                throw new ValidationException("Không thể xóa phim vì đang được sử dụng bởi dữ liệu khác");
            }
            catch (Exception ex)
            {
                throw new Exception($"Có lỗi xảy ra khi xóa phim: {ex.Message}", ex);
            }


        }

        //nếu phim tạo mới/ cập nhật có thê trùng vs tên đã có trong hệ thống thì return về true, ngược lại là false
        private async Task<bool> CheckMovieNameDuplicated(string name)
        {
            List<Movie> list = (List<Movie>)await _unitOfWork.MovieRepo.GetAllAsync();
            //foreach (var m in list)
            //{
            //    if (name.Equals(m.MovieName))
            //    {
            //        return true;
            //    }
            //}
            //return false;
            return list.Any(m => m.MovieName.Equals(name, StringComparison.OrdinalIgnoreCase));
        }
    }
}
