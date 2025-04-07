using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class ShowtimeProfile : Profile
    {
        public ShowtimeProfile()
        {
            //Request->Entity
            CreateMap<ShowtimeRequestDTO, Showtime>();

            CreateMap<ShowtimeRequestDTO.ShowtimeCreateDTO, Showtime>()
            .ForMember(dest => dest.ShowtimeMovieId, opt => opt.MapFrom(src => src.ShowtimeMovieId))
            .ForMember(dest => dest.ShowtimeStartAt, opt => opt.MapFrom(src => src.ShowtimeStartAt))
            .ForMember(dest => dest.ShowtimeCreatedBy, opt => opt.MapFrom(src => src.ShowtimeCreatedBy))
            .ForMember(dest => dest.ShowtimeRoomId, opt => opt.MapFrom(src => src.ShowtimeRoomId));

            CreateMap<ShowtimeRequestDTO.ShowtimeUpdateDTO, Showtime>()
            .ForMember(dest => dest.ShowtimeMovieId, opt => opt.MapFrom(src => src.ShowtimeMovieId))
            .ForMember(dest => dest.ShowtimeStartAt, opt => opt.MapFrom(src => src.ShowtimeStartAt))
            .ForMember(dest => dest.ShowtimeCreatedBy, opt => opt.MapFrom(src => src.ShowtimeCreatedBy))
            .ForMember(dest => dest.ShowtimeRoomId, opt => opt.Ignore());

            //Entity->Response
            CreateMap<Showtime, ShowtimeResponseDTOs>()
                .ForMember(dest => dest.RoomId, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomId))
                .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomName))
                .ForMember(dest => dest.RoomChairAmount, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomChairAmount))
                .ForMember(dest => dest.RoomScreenTypeId, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomScreenTypeId))
                .ForMember(dest => dest.RoomScreenTypeName, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomScreenType.ScreenTypeName))
                .ForMember(dest => dest.RoomTheaterId, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomTheaterId))
                .ForMember(dest => dest.RoomTheaterName, opt => opt.MapFrom(src => src.ShowtimeRoom.RoomTheater.TheaterName))
                .ForMember(dest => dest.MovieId, opt => opt.MapFrom(src => src.ShowtimeMovie.MovieId))
                .ForMember(dest => dest.MovieName, opt => opt.MapFrom(src => src.ShowtimeMovie.MovieName));
        }
    }
}
