using AutoMapper;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class ChairShowtimeProfile : Profile
    {
        public ChairShowtimeProfile()
        {
            CreateMap<ChairShowtime, ChairShowtimeResponseDTO>()
                .ForMember(dest => dest.ChairName, opt => opt.MapFrom(src => src.Chair!.ChairName))
                .ForMember(dest => dest.ChairPosition, opt => opt.MapFrom(src => src.Chair!.ChairPosition))
                .ForMember(dest => dest.ChairTypeName, opt => opt.MapFrom(src => src.Chair!.ChairType!.ChairTypeName))
                .ForMember(dest => dest.ChairPrice, opt => opt.MapFrom(src => src.Chair!.ChairType!.ChairPrice))
                .ReverseMap();
        }

    }
}
