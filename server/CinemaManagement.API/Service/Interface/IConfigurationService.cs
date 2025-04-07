using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IConfigurationService
    {
        Task<IEnumerable<ConfigurationResponseDTO>> GetAllAsync();
        Task<ConfigurationResponseDTO> GetByIdAsync(int id);
        Task<ConfigurationResponseDTO> AddAsync(ConfigurationRequestDTO.AddConfigRequestDTO config);
        Task<IEnumerable<ConfigurationResponseDTO>> UpdateAllConfigsAsync(List<ConfigurationRequestDTO.UpdateConfigRequestDTO> configList);
    }
}
