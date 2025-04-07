using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace CinemaManagement.API.Service
{
    public class FnbService : IFnbService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<FnbService> _logger;

        public FnbService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<FnbService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<FnbResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.FnbRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<FnbResponseDTO>>(entities);
        }

        public async Task<FnbResponseDTO> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.FnbRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy FnB với ID: {id}");

            return _mapper.Map<FnbResponseDTO>(entity);
        }

        public async Task<List<FnbResponseDTO>> SearchListAsync(string name)
        {
            var fnbs = await _unitOfWork.FnbRepo.SearchListAsync(name);
            return _mapper.Map<List<FnbResponseDTO>>(fnbs);
        }

        public async Task<FnbResponseDTO> AddAsync(FnbRequestDTO request)
        {
            if (request == null)
                throw new ValidationException("Dữ liệu không hợp lệ");

            try
            {
                // Kiểm tra tên FNB đã tồn tại chưa
                if (!string.IsNullOrEmpty(request.FnbName))
                {
                    bool isNameExists = await _unitOfWork.FnbRepo.IsFnbNameExistsAsync(request.FnbName);
                    if (isNameExists)
                    {
                        _logger.LogWarning("Tên FNB '{FnbName}' đã tồn tại trong hệ thống", request.FnbName);
                        throw new ValidationException($"Tên FNB '{request.FnbName}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
                    }
                }

                var entity = _mapper.Map<Fnb>(request);
                
                // Set FnbSearchName before saving
                if (!string.IsNullOrEmpty(entity.FnbName))
                {
                    entity.FnbSearchName = TextHelper.ToSearchFriendlyText(entity.FnbName);
                }
                
                var addedEntity = await _unitOfWork.FnbRepo.AddAsync(entity);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation(
                    "Tạo mới FnB thành công. ID: {FnbId}, Tên: {FnbName}",
                    addedEntity.FnbId,
                    addedEntity.FnbName);

                return _mapper.Map<FnbResponseDTO>(addedEntity);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo FnB mới. Data: {RequestData}",
                    JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo FnB mới. Data: {RequestData}",
                    JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task<FnbResponseDTO> UpdateAsync(int id, FnbRequestDTO request)
        {
            var existingFnb = await _unitOfWork.FnbRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy FnB với ID: {id}");

            try
            {
                // Kiểm tra tên FNB đã tồn tại chưa (trừ FNB hiện tại)
                if (!string.IsNullOrEmpty(request.FnbName) && request.FnbName != existingFnb.FnbName)
                {
                    bool isNameExists = await _unitOfWork.FnbRepo.IsFnbNameExistsAsync(request.FnbName, id);
                    if (isNameExists)
                    {
                        _logger.LogWarning("Tên FNB '{FnbName}' đã tồn tại trong hệ thống", request.FnbName);
                        throw new ValidationException($"Tên FNB '{request.FnbName}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
                    }
                }
                
                _mapper.Map(request, existingFnb);
                
                // Set FnbSearchName before saving
                if (!string.IsNullOrEmpty(existingFnb.FnbName))
                {
                    existingFnb.FnbSearchName = TextHelper.ToSearchFriendlyText(existingFnb.FnbName);
                }
                
                var updatedEntity = await _unitOfWork.FnbRepo.UpdateAsync(existingFnb);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation(
                    "Cập nhật FnB thành công. ID: {FnbId}, Tên: {FnbName}",
                    updatedEntity.FnbId,
                    updatedEntity.FnbName);

                return _mapper.Map<FnbResponseDTO>(updatedEntity);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi cập nhật FnB. ID: {FnbId}, Data: {RequestData}",
                    id, JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi cập nhật FnB. ID: {FnbId}, Data: {RequestData}",
                    id, JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task DeleteAsync(int id)
        {
            var fnb = await _unitOfWork.FnbRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy FnB với ID: {id}");

            try
            {
                // Kiểm tra xem FnB có liên quan đến combo nào không
                if (fnb.ComboDetails.Count > 0)
                {
                    throw new ValidationException("Không thể xóa FnB đang được sử dụng trong combo");
                }

                await _unitOfWork.FnbRepo.DeleteAsync(id);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa FnB có ID: {id}");
                }

                _logger.LogInformation("Xóa FnB thành công. ID: {FnbId}, Tên: {FnbName}",
                    id, fnb.FnbName);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi xóa FnB {FnbId}", id);
                throw new Exception("Có lỗi xảy ra khi xóa dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xóa FnB {FnbId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }
    }
}
