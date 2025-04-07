using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service.Interface
{
    //thằng này có crud và search -> kế thừa crud và search
    public interface IGenresService : IGenericService<Genre, GenresRequestDTO, GenresResponseDTO>, ISearchService<GenresResponseDTO>
    {
    }
    
}
