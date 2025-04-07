using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;

namespace CinemaManagement.API.Service
{
    public partial class MovieService
    {
        public async Task<dynamic> GetMovieSchedulesAsync(int movieId)
        {
            var movie = await _unitOfWork.MovieRepo.GetByIdAsync(movieId) 
                ?? throw new NotFoundException($"Không tìm thấy phim với ID: {movieId}");

            var showtimes = await _unitOfWork.ShowtimeRepo.GetAllByMovieIdWithDetailsAsync(movieId, _configurationHolder.GetAdvanceTicketingDays());

            var movieInfoDetail = _mapper.Map<MovieResponseDTO>(movie);
            
            var movieInfo = new
            {
                movie_id = movieInfoDetail.MovieId,
                movie_name = movieInfoDetail.MovieName,
                movie_poster = movieInfoDetail.MoviePoster,
                movie_trailer = movieInfoDetail.MovieTrailer,
                movie_start_at = movieInfoDetail.MovieStartAt,
                movie_end_at = movieInfoDetail.MovieEndAt,
                movie_actor = movieInfoDetail.MovieActor,
                movie_director = movieInfoDetail.MovieDirector,
                movie_brand = movieInfoDetail.MovieBrand,
                movie_duration = movieInfoDetail.MovieDuration,
                movie_content = movieInfoDetail.MovieContent,
                movie_genres = string.Join(", ", movieInfoDetail.Genres.Select(g => g.GenresName))
        };

            var schedules = showtimes
                .GroupBy(s => DateOnly.FromDateTime(s.ShowtimeStartAt.Value))
                .OrderBy(g => g.Key)
                .Select(dateGroup => new
                {
                    date = dateGroup.Key.ToString("dd/MM/yyyy"),
                    schedule = dateGroup
                        .Select(s => new
                        {
                            time = s.ShowtimeStartAt.Value.ToString("HH:mm"),
                            showtime_id = s.ShowtimeId,
                            theater_id = s.ShowtimeRoom.RoomTheaterId,
                            theater_name = s.ShowtimeRoom.RoomTheater.TheaterName,
                            room_id = s.ShowtimeRoomId,
                            room_name = s.ShowtimeRoom.RoomName,
                            screen_type_id = s.ShowtimeRoom.RoomScreenTypeId,
                            screen_type_name = s.ShowtimeRoom.RoomScreenType.ScreenTypeName,
                            screen_type_price = s.ShowtimeRoom.RoomScreenType.ScreenPrice
                        })
                        .OrderBy(s => s.time)
                        .ToList()
                })
                .ToList();
            return new
            {
                movieData = movieInfo,
                showtimesData = schedules,
            };
        }
    }
}
