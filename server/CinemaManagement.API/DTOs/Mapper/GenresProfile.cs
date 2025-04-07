using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class GenresProfile : Profile
    {
        public GenresProfile()
        {
            //Entities -> DTOs

            //data đi từ db -> be
            CreateMap<Genre, GenresResponseDTO>();

            //data đi từ be -> fe
            CreateMap<GenresRequestDTO, Genre>();
        }
    }
}
