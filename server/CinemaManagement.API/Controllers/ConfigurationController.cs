using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Service;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CinemaManagement.API.Controllers
{
    [Route("api/configurations")]
    [ApiController]
    public class ConfigurationController : ControllerBase
    {
        private readonly IConfigurationService _configurationService;

        public ConfigurationController(IConfigurationService configurationService)
        {
            _configurationService = configurationService;
        }
        [HttpGet]
        public async Task<ActionResult<SuccessResponse<IEnumerable<ConfigurationResponseDTO>>>> GetConfigs()
        {
            var configs = await _configurationService.GetAllAsync();
            return Ok(SuccessResponse<IEnumerable<ConfigurationResponseDTO>>.Create(configs));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SuccessResponse<ConfigurationResponseDTO>>> GetConfigById(int id)
        {
            var config = await _configurationService.GetByIdAsync(id);
            return Ok(SuccessResponse<ConfigurationResponseDTO>.Create(config));
        }

        [HttpPost]
        public async Task<ActionResult<SuccessResponse<ConfigurationResponseDTO>>> CreateRoom([FromBody] ConfigurationRequestDTO.AddConfigRequestDTO request)
        {
            var config = await _configurationService.AddAsync(request);
            return CreatedAtAction(
                nameof(GetConfigById),
                new { id = config.ConfigurationId },
                SuccessResponse<ConfigurationResponseDTO>.Create(config, "Thêm cấu hình thành công.")
                );
        }

        [HttpPut]
        public async Task<ActionResult<SuccessResponse<IEnumerable<ConfigurationResponseDTO>>>> UpdateRoom(
        [FromBody] List<ConfigurationRequestDTO.UpdateConfigRequestDTO> updateDto)
        {
            var configs = await _configurationService.UpdateAllConfigsAsync(updateDto);
            return Ok(SuccessResponse<IEnumerable<ConfigurationResponseDTO>>.Create(configs, "Cập nhật cấu hình thành công."));
        }
    }
}
