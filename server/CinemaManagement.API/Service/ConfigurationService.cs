using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CinemaManagement.API.Service
{
    public class ConfigurationService : IConfigurationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ConfigurationService> _logger;
        private readonly IMapper _mapper;

        public ConfigurationService(IUnitOfWork unitOfWork, ILogger<ConfigurationService> logger, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<ConfigurationResponseDTO> AddAsync(ConfigurationRequestDTO.AddConfigRequestDTO config)
        {
            if (config == null)
                throw new ValidationException("Dữ liệu không hợp lệ");

            var existing = await _unitOfWork.ConfigurationRepo.GetByNameAsync(config.ConfigurationName);

            if (existing is not null)
                throw new ValidationException($"'Cấu hình {config.ConfigurationName}' đã tồn tại trong hệ thống này");

            try
            {
                var entity = _mapper.Map<Entities.Configuration>(config);
                var createdConfig = await _unitOfWork.ConfigurationRepo.AddAsync(entity);

                await _unitOfWork.SaveChangesAsync();

                createdConfig = await _unitOfWork.ConfigurationRepo.GetByIdAsync(createdConfig.ConfigurationId);

                return _mapper.Map<ConfigurationResponseDTO>(createdConfig);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo phòng mới. Data: {RequestData}",
           JsonSerializer.Serialize(config));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo phòng mới. Data: {RequestData}",
            JsonSerializer.Serialize(config));
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task<IEnumerable<ConfigurationResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.ConfigurationRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<ConfigurationResponseDTO>>(entities);
        }

        public async Task<ConfigurationResponseDTO> GetByIdAsync(int id)
        {
            var config = await _unitOfWork.ConfigurationRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy phòng với ID: {id}");
            return _mapper.Map<ConfigurationResponseDTO>(config);
        }

        public async Task<IEnumerable<ConfigurationResponseDTO>> UpdateAllConfigsAsync(List<ConfigurationRequestDTO.UpdateConfigRequestDTO> configList)
        {
            var existingConfigs = await _unitOfWork.ConfigurationRepo.GetAllByIdsAsync(configList.Select(c => c.ConfigurationId).ToList());
            var configDictionary = configList.ToDictionary(c => c.ConfigurationId, c => c.ConfigurationContent);

            try
            {
                foreach (var config in existingConfigs)
                {
                    config.ConfigurationContent = configDictionary[config.ConfigurationId];
                }
                await _unitOfWork.ConfigurationRepo.UpdateRangeAsync(existingConfigs.ToList());
                
                await _unitOfWork.SaveChangesAsync();

                return _mapper.Map<IEnumerable<ConfigurationResponseDTO>>(existingConfigs);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi cập nhật cấu hình.");
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, "Lỗi không xác định khi cập nhật cấu hình");
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }
    }
}
