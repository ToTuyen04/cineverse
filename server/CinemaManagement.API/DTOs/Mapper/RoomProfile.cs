using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class RoomProfile : Profile
    {
        public RoomProfile()
        {
            CreateMap<Room, RoomResponseDTO>()
                .ForMember(dest => dest.RoomScreenTypeName, opt => opt.MapFrom(src => src.RoomScreenType.ScreenTypeName))
                .ForMember(dest => dest.RoomTheaterName, opt => opt.MapFrom(src => src.RoomTheater.TheaterName));

            CreateMap<RoomRequestDTOs.RoomCreateDTO, Room>();

        }
    }
}
