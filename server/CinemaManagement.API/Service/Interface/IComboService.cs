using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service.Interface
{
    public interface IComboService : ISearchService<ComboResponseDTO>
    {
        Task<ComboResponseDTO> CreateComboWithDetailsAsync(ComboRequestDTO.CreateComboDTO dto);

        Task<ComboResponseDTO> UpdateComboWithDetailsAsync(int id, ComboRequestDTO.UpdateComboDTO dto);
        
        Task<bool> DeleteComboWithDetailsAsync(int id);
        
        Task<IEnumerable<ComboResponseDTO>> GetAllAsync();

        Task<ComboResponseDTO> GetByIdAsync(int id);

        Task<ComboResponseDTO> AddAsync(ComboRequestDTO.CreateComboDTO request);

        Task<ComboResponseDTO> UpdateAsync(int id, ComboRequestDTO.UpdateComboDTO request);

        Task DeleteAsync(int id);
    }
}
