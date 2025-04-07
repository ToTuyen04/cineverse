using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IFnbService : ISearchService<FnbResponseDTO>
    {
        Task<IEnumerable<FnbResponseDTO>> GetAllAsync();

        Task<FnbResponseDTO> GetByIdAsync(int id);

        Task<FnbResponseDTO> AddAsync(FnbRequestDTO request);

        Task<FnbResponseDTO> UpdateAsync(int id, FnbRequestDTO request);

        Task DeleteAsync(int id);
    }
}
