using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class FnbProfile : Profile
    {
        public FnbProfile()
        {
            CreateMap<Fnb, FnbResponseDTO>();
            CreateMap<FnbRequestDTO, Fnb>();
        }
    }
}
