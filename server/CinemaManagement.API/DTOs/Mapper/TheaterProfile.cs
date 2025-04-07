using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class TheaterProfile : Profile
    {
        public TheaterProfile()
        {
            CreateMap<TheaterRequestDTO, Theater>();
            CreateMap<Theater, TheaterResponseDTO>();
        }
    }
}
