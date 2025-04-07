using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Enums;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace CinemaManagement.API.Controllers
{
    public partial class MoviesController
    {
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SuccessResponse<MovieResponseDTO>>> Update(
            int id,
            [FromForm] MovieRequestDTO.MovieUpdateDTO updateDto)
        {
            try
            {
                var updatedMovie = await _service.UpdateAsync(id, updateDto, updateDto.GenreIds);
                return Ok(SuccessResponse<MovieResponseDTO>.Create(updatedMovie, "Cập nhật phim thành công"));
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                // If you had a logger, you would log the error here
                // _logger.LogError(ex, "Lỗi khi cập nhật phim với ID: {MovieId}", id);
                return StatusCode(500, new { success = false, message = ex.Message   });
            }
        }
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<SuccessResponse<MovieResponseDTO>>> Add([FromForm] MovieRequestDTO.MovieCreateDTO movieDTO)
        {
            try
            {
                var addedMovie = await _service.AddAsync(movieDTO, movieDTO.GenreIds);
                return CreatedAtAction(nameof(GetById), new { id = addedMovie.MovieId },
                    SuccessResponse<MovieResponseDTO>.Create(addedMovie, "Thêm phim thành công"));
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                // If you had a logger, you would log the error here
                return StatusCode(500, new { success = false, message = ex.Message });
            }　
        }
        [HttpGet("{pageIndex}/{pageSize}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<PaginatedResponse<MovieResponseDTO>>> GetPaginatedMovies(
            int pageIndex = 1, 
            int pageSize = 5, 
            string searchTerm = null,
            [FromQuery] List<int> genreIds = null,
            [FromQuery] string movieSortBy = null,
            [FromQuery] string sortOrder = null) //Tên class SortOrder đặt là Enums.SortOrder bị trùng tên với thư viện Microsoft.Data.SqlClient.SortOrder
        {
            try
            {
                // Validate pagination parameters
                if (pageIndex < 1)
                {
                    return BadRequest(new { success = false, message = "Số trang phải lớn hơn 0" });
                }

                if (pageSize < 1 || pageSize > 50)
                {
                    return BadRequest(new { success = false, message = "Kích thước trang phải từ 1 đến 50" });
                }

                //Parse sortBy từ string sang enum
                MovieSortBy? sortByEnum = null;
                if (!string.IsNullOrEmpty(movieSortBy))
                {
                    if (Enum.TryParse<MovieSortBy>(movieSortBy, true, out var parsedSortBy))
                    {
                        sortByEnum = parsedSortBy;
                    }
                    else
                    {
                        return BadRequest(new { success = false, message = "Giá trị sắp xếp không hợp lệ. Hãy sử dụng: CreatedAt, StartAt, hoặc EndAt" });
                    }
                }

                // Parse sortOrder từ string sang enum
                Enums.SortOrder? sortOrderEnum = null;
                if (!string.IsNullOrEmpty(sortOrder))
                {
                    if (Enum.TryParse<Enums.SortOrder>(sortOrder, true, out var parsedSortOrder))
                    {
                        sortOrderEnum = parsedSortOrder;
                    }
                    else
                    {
                        return BadRequest(new { success = false, message = "Thứ tự sắp xếp không hợp lệ. Hãy sử dụng: Ascending hoặc Descending" });
                    }
                }

                var paginatedMovies = await _service.GetPaginatedMoviesAsync(pageIndex, pageSize, searchTerm, genreIds, sortByEnum, sortOrderEnum);
                return Ok(paginatedMovies);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                // Check if movie is associated with any showtimes
                // This logic would require a new method in your service or repository
                

                await _service.DeleteAsync(id);
                return Ok(SuccessResponse<object>.Create(null, "Xóa phim thành công"));
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && sqlEx.Number == 547)
            {
                // Foreign key constraint violation
                return BadRequest(new { success = false, message = "Không thể xóa phim vì đang được sử dụng bởi dữ liệu khác" });
            }
            catch (Exception ex)
            {
                // If you have a logger, log the exception here
                // _logger.LogError(ex, "Lỗi khi xóa phim với ID: {MovieId}", id);
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra trong quá trình xử lý" });
            }
        }
    }
}
