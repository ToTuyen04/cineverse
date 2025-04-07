using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service.Interface
{
    public partial interface ITheaterService : IGenericService<Theater, TheaterRequestDTO, TheaterResponseDTO>, ISearchService<TheaterResponseDTO>
    {

    }
}
