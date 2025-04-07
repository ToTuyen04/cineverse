using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class MovieProfile : Profile
    {
        public MovieProfile()
        {
            CreateMap<Movie, MovieResponseDTO>()
                .ForMember(dest => dest.Genres, opt => opt.MapFrom(src => src.MovieGenres.Select(mg => new GenresResponseDTO
                {
                    GenresId = mg.Genres.GenresId,
                    GenresName = mg.Genres.GenresName,
                    GenresContent = mg.Genres.GenresContent,
                })));

            CreateMap<MovieRequestDTO, Movie>();

            // Handle nested request DTOs
            CreateMap<MovieRequestDTO.MovieCreateDTO, Movie>();
            CreateMap<MovieRequestDTO.MovieUpdateDTO, Movie>();

            // Handle reverse mapping if needed
            CreateMap<Movie, MovieRequestDTO.MovieUpdateDTO>()
                .ForMember(dest => dest.GenreIds, opt => opt.MapFrom(src =>
                    src.MovieGenres.Select(mg => mg.GenresId.Value)));

        }
    }
}
