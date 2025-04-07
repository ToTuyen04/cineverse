using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class ConfigurationProfile : Profile
    {
        public ConfigurationProfile()
        {
            CreateMap<ConfigurationRequestDTO.AddConfigRequestDTO, Entities.Configuration>();
            CreateMap<Entities.Configuration, ConfigurationResponseDTO>();
        }
    }
}
