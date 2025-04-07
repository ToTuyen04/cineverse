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
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace CinemaManagement.API.Service
{
    public class ComboService : IComboService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<ComboService> _logger;

        public ComboService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<ComboService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ComboResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.ComboRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<ComboResponseDTO>>(entities);
        }

        public async Task<ComboResponseDTO> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.ComboRepo.GetByIdAsync(id);
            if (entity == null) 
                throw new NotFoundException($"Không tìm thấy combo với ID: {id}");

            return _mapper.Map<ComboResponseDTO>(entity);
        }

        public async Task<List<ComboResponseDTO>> SearchListAsync(string name)
        {
            var combos = await _unitOfWork.ComboRepo.SearchListAsync(name);
            if (combos == null)
            {
                throw new NotFoundException($"Không tìm thấy combo với tên: {name}");
            }
            return _mapper.Map<List<ComboResponseDTO>>(combos);
        }

        public async Task<ComboResponseDTO> AddAsync(ComboRequestDTO.CreateComboDTO request)
        {
            if (request == null)
                throw new ValidationException("Dữ liệu không hợp lệ");

            try
            {
                // Kiểm tra tên combo đã tồn tại chưa
                if (!string.IsNullOrEmpty(request.ComboName))
                {
                    bool isNameExists = await _unitOfWork.ComboRepo.IsComboNameExistsAsync(request.ComboName);
                    if (isNameExists)
                    {
                        _logger.LogWarning("Tên combo '{ComboName}' đã tồn tại trong hệ thống", request.ComboName);
                        throw new ValidationException($"Tên combo '{request.ComboName}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
                    }
                }

                var combo = _mapper.Map<Combo>(request);
                combo.ComboCreateAt = DateTime.Now;
                
                // Set ComboSearchName before saving
                if (!string.IsNullOrEmpty(combo.ComboName))
                {
                    combo.ComboSearchName = TextHelper.ToSearchFriendlyText(combo.ComboName);
                }
                
                // Thiết lập ComboAvailable là false khi tạo mới
                combo.ComboAvailable = false;
                
                var createdCombo = await _unitOfWork.ComboRepo.AddAsync(combo);
                await _unitOfWork.SaveChangesAsync();
                
                _logger.LogInformation(
                    "Tạo mới combo cơ bản thành công. ID: {ComboId}, Tên: {ComboName}, Trạng thái: {ComboAvailable}",
                    createdCombo.ComboId,
                    createdCombo.ComboName,
                    createdCombo.ComboAvailable);
                
                return _mapper.Map<ComboResponseDTO>(createdCombo);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo combo mới. Data: {RequestData}",
                    JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo combo mới. Data: {RequestData}",
                    JsonSerializer.Serialize(request));
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task<ComboResponseDTO> UpdateAsync(int id, ComboRequestDTO.UpdateComboDTO request)
        {
            var existingCombo = await _unitOfWork.ComboRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy combo với ID: {id}");

            try
            {
                // Kiểm tra tên combo đã tồn tại chưa (trừ combo hiện tại)
                if (!string.IsNullOrEmpty(request.ComboName) && request.ComboName != existingCombo.ComboName)
                {
                    bool isNameExists = await _unitOfWork.ComboRepo.IsComboNameExistsAsync(request.ComboName, id);
                    if (isNameExists)
                    {
                        _logger.LogWarning("Tên combo '{ComboName}' đã tồn tại trong hệ thống", request.ComboName);
                        throw new ValidationException($"Tên combo '{request.ComboName}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
                    }
                }
                
                _mapper.Map(request, existingCombo);
                
                // Set ComboSearchName before saving
                if (!string.IsNullOrEmpty(existingCombo.ComboName))
                {
                    existingCombo.ComboSearchName = TextHelper.ToSearchFriendlyText(existingCombo.ComboName);
                }
                
                var updatedCombo = await _unitOfWork.ComboRepo.UpdateAsync(existingCombo);
                await _unitOfWork.SaveChangesAsync();
                
                _logger.LogInformation(
                    "Cập nhật combo cơ bản thành công. ID: {ComboId}, Tên: {ComboName}, Trạng thái: {ComboAvailable}",
                    updatedCombo.ComboId,
                    updatedCombo.ComboName,
                    updatedCombo.ComboAvailable);
                
                return _mapper.Map<ComboResponseDTO>(updatedCombo);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi cập nhật combo {ComboId}", id);
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi cập nhật combo {ComboId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task DeleteAsync(int id)
        {
            var combo = await _unitOfWork.ComboRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy combo với ID: {id}");

            try
            {
                // Kiểm tra xem combo có liên quan đến đơn hàng nào không
                if (combo.OrderDetailCombos.Any())
                {
                    throw new ValidationException("Không thể xóa combo đã được sử dụng trong đơn hàng");
                }
                
                await _unitOfWork.ComboRepo.DeleteAsync(id);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa combo có ID: {id}");
                }
                
                _logger.LogInformation("Xóa combo cơ bản thành công. ID: {ComboId}", id);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi xóa combo {ComboId}", id);
                throw new Exception("Có lỗi xảy ra khi xóa dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xóa combo {ComboId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        public async Task<ComboResponseDTO> CreateComboWithDetailsAsync(ComboRequestDTO.CreateComboDTO dto)
        {
            if (dto == null)
                throw new ValidationException("Dữ liệu không hợp lệ");

            try
            {
                _logger.LogInformation("Bắt đầu tạo combo với chi tiết. Data: {RequestData}", 
                    JsonSerializer.Serialize(dto));
                    
                // Kiểm tra tên combo đã tồn tại chưa
                if (!string.IsNullOrEmpty(dto.ComboName))
                {
                    bool isNameExists = await _unitOfWork.ComboRepo.IsComboNameExistsAsync(dto.ComboName);
                    if (isNameExists)
                    {
                        _logger.LogWarning("Tên combo '{ComboName}' đã tồn tại trong hệ thống", dto.ComboName);
                        throw new ValidationException($"Tên combo '{dto.ComboName}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
                    }
                }
                    
                // Validate that all fnb_id values exist in the fnb table
                if (dto.ComboDetails != null && dto.ComboDetails.Any())
                {
                    var fnbIds = dto.ComboDetails
                        .Where(cd => cd.FnbId.HasValue)
                        .Select(cd => cd.FnbId.Value)
                        .Distinct().ToList();
                        
                    _logger.LogInformation("Kiểm tra sự tồn tại của {FnbCount} FnB IDs: {FnbIds}", 
                        fnbIds.Count, string.Join(", ", fnbIds));
                        
                    // Check all FnB IDs exist
                    foreach (var fnbId in fnbIds)
                    {
                        var fnb = await _unitOfWork.FnbRepo.GetByIdAsync(fnbId);
                        if (fnb == null)
                        {
                            _logger.LogWarning("FnB với ID {FnbId} không tồn tại", fnbId);
                            throw new ValidationException($"FnB với ID {fnbId} không tồn tại");
                        }
                        _logger.LogDebug("FnB với ID {FnbId} tồn tại: {FnbName}", fnbId, fnb.FnbName);
                    }
                }

                // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
                await _unitOfWork.BeginTransactionAsync();
                try
                {
                    // Tạo và thêm combo
                    _logger.LogInformation("Mapping từ DTO sang Entity");
                    _logger.LogInformation("ComboCreatedBy từ DTO: {ComboCreatedBy}", dto.ComboCreatedBy);
                    var combo = _mapper.Map<Combo>(dto);
                    _logger.LogInformation("ComboCreatedBy sau khi mapping: {ComboCreatedBy}", combo.ComboCreateBy);

                    // Đảm bảo ComboCreateBy được thiết lập từ DTO
                    if (dto.ComboCreatedBy.HasValue && !combo.ComboCreateBy.HasValue)
                    {
                        combo.ComboCreateBy = dto.ComboCreatedBy;
                        _logger.LogInformation("Đã thiết lập lại ComboCreateBy: {ComboCreatedBy}", combo.ComboCreateBy);
                    }

                    combo.ComboCreateAt = DateTime.Now;
                    
                    // Tạo ComboDescription tự động nếu có ComboDetails
                    if (dto.ComboDetails != null && dto.ComboDetails.Any())
                    {
                        _logger.LogInformation("Tạo mô tả tự động cho combo từ {DetailCount} combo details", 
                            dto.ComboDetails.Count);
                        var description = await GenerateComboDescriptionAsync(dto.ComboDetails);
                        
                        // Nếu description không rỗng và không có sẵn description từ request
                        if (!string.IsNullOrEmpty(description) && string.IsNullOrEmpty(combo.ComboDescription))
                        {
                            _logger.LogDebug("Thiết lập mô tả tự động: {Description}", description);
                            combo.ComboDescription = description;
                        }
                    }
                    
                    // Set ComboSearchName before saving
                    if (!string.IsNullOrEmpty(combo.ComboName))
                    {
                        combo.ComboSearchName = TextHelper.ToSearchFriendlyText(combo.ComboName);
                        _logger.LogDebug("Thiết lập ComboSearchName: {SearchName}", combo.ComboSearchName);
                    }
                    
                    // Thiết lập ComboAvailable là false khi tạo mới
                    combo.ComboAvailable = false;
                    
                    // Lưu lại combo details để xử lý sau
                    _logger.LogInformation("Chuẩn bị xử lý combo details");
                    var comboDetails = new List<ComboDetail>();
                    
                    if (dto.ComboDetails != null)
                    {
                        foreach (var detailDto in dto.ComboDetails)
                        {
                            var detail = new ComboDetail
                            {
                                FnbId = detailDto.FnbId,
                                Quantity = detailDto.Quantity
                            };
                            comboDetails.Add(detail);
                            _logger.LogDebug("Đã map chi tiết combo: FnbId={FnbId}, Quantity={Quantity}",
                                detail.FnbId, detail.Quantity);
                        }
                    }
                    
                    combo.ComboDetails = new List<ComboDetail>(); // Xóa ComboDetails để tránh lỗi khi tạo Combo
                    
                    _logger.LogInformation("Thêm combo vào database");
                    var createdCombo = await _unitOfWork.ComboRepo.AddAsync(combo);
                    await _unitOfWork.SaveChangesAsync();
                    
                    _logger.LogInformation("Đã tạo combo với ID: {ComboId}", createdCombo.ComboId);
                    
                    // Thêm combo details nếu có
                    if (comboDetails.Any())
                    {
                        _logger.LogInformation("Gán ComboId {ComboId} cho {DetailCount} ComboDetails", 
                            createdCombo.ComboId, comboDetails.Count);
                            
                        // Gán ComboId cho tất cả ComboDetails
                        foreach (var detail in comboDetails)
                        {
                            detail.ComboId = createdCombo.ComboId;
                            _logger.LogDebug("ComboDetail: ComboId={ComboId}, FnbId={FnbId}, Quantity={Quantity}", 
                                detail.ComboId, detail.FnbId, detail.Quantity);
                        }
                            
                        // Thêm tất cả ComboDetails vào database
                        _logger.LogInformation("Thêm {DetailCount} ComboDetails vào database", comboDetails.Count);
                        
                        // Sử dụng AddAsync thay vì AddRangeAsync để kiểm tra lỗi chi tiết hơn
                        foreach (var detail in comboDetails)
                        {
                            try 
                            {
                                await _unitOfWork.ComboDetailRepo.AddAsync(detail);
                                await _unitOfWork.SaveChangesAsync();
                                _logger.LogDebug("Đã thêm ComboDetail với FnbId={FnbId}", detail.FnbId);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Lỗi khi thêm chi tiết combo. ComboId={ComboId}, FnbId={FnbId}", 
                                    detail.ComboId, detail.FnbId);
                                throw;
                            }
                        }
                    }
                    
                    // Commit transaction nếu tất cả thành công
                    await _unitOfWork.CommitTransactionAsync();
                    
                    // Lấy lại combo đã thêm với details
                    _logger.LogInformation("Lấy thông tin combo đã tạo từ database");
                    var result = await _unitOfWork.ComboRepo.GetByIdAsync(createdCombo.ComboId);
                    
                    _logger.LogInformation(
                        "Tạo mới combo với chi tiết thành công. ID: {ComboId}, Tên: {ComboName}, Số chi tiết: {DetailsCount}, Trạng thái: {ComboAvailable}",
                        result.ComboId,
                        result.ComboName,
                        result.ComboDetails.Count,
                        result.ComboAvailable);
                    
                    return _mapper.Map<ComboResponseDTO>(result);
                }
                catch (Exception ex)
                {
                    // Rollback transaction nếu có lỗi
                    _logger.LogError(ex, "Lỗi trong transaction, thực hiện rollback. Message: {Message}", ex.Message);
                    await _unitOfWork.RollbackTransactionAsync();
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi tạo combo với chi tiết. Message: {Message}, StackTrace: {StackTrace}, InnerException: {InnerException}", 
                    ex.Message, 
                    ex.StackTrace,
                    ex.InnerException?.Message);
                    
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner Exception: {Message}, {StackTrace}", 
                        ex.InnerException.Message, 
                        ex.InnerException.StackTrace);
                }
                
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu: " + ex.Message);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Lỗi validation khi tạo combo với chi tiết: {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi tạo combo với chi tiết. Message: {Message}, StackTrace: {StackTrace}, Data: {RequestData}", 
                    ex.Message, 
                    ex.StackTrace,
                    JsonSerializer.Serialize(dto));
                    
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner Exception: {Message}, {StackTrace}", 
                        ex.InnerException.Message, 
                        ex.InnerException.StackTrace);
                }
                
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý: " + ex.Message);
            }
        }

        public async Task<ComboResponseDTO> UpdateComboWithDetailsAsync(int id, ComboRequestDTO.UpdateComboDTO dto)
        {
            var existingCombo = await _unitOfWork.ComboRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy combo với ID: {id}");

            try
            {
                _logger.LogInformation("Bắt đầu cập nhật combo với ID {ComboId}. Dữ liệu: {DtoData}", 
                    id, JsonSerializer.Serialize(dto));
                    
                // Kiểm tra tên combo đã tồn tại chưa (trừ combo hiện tại)
                if (!string.IsNullOrEmpty(dto.ComboName) && dto.ComboName != existingCombo.ComboName)
                {
                    bool isNameExists = await _unitOfWork.ComboRepo.IsComboNameExistsAsync(dto.ComboName, id);
                    if (isNameExists)
                    {
                        _logger.LogWarning("Tên combo '{ComboName}' đã tồn tại trong hệ thống", dto.ComboName);
                        throw new ValidationException($"Tên combo '{dto.ComboName}' đã tồn tại trong hệ thống. Vui lòng chọn tên khác.");
                    }
                }
                    
                // Validate that all fnb_id values exist in the fnb table
                if (dto.ComboDetails != null && dto.ComboDetails.Any())
                {
                    var fnbIds = dto.ComboDetails
                        .Where(cd => cd.FnbId.HasValue)
                        .Select(cd => cd.FnbId.Value)
                        .Distinct().ToList();
                    
                    _logger.LogInformation("Kiểm tra {FnbCount} FnbIds: {FnbIds}", 
                        fnbIds.Count, string.Join(", ", fnbIds));
                        
                    // Check all FnB IDs exist
                    foreach (var fnbId in fnbIds)
                    {
                        var fnb = await _unitOfWork.FnbRepo.GetByIdAsync(fnbId);
                        if (fnb == null)
                        {
                            _logger.LogWarning("FnB với ID {FnbId} không tồn tại", fnbId);
                            throw new ValidationException($"FnB với ID {fnbId} không tồn tại");
                        }
                        _logger.LogDebug("FnB với ID {FnbId} tồn tại: {FnbName}", fnbId, fnb.FnbName);
                    }
                }
                
                // Cập nhật thông tin combo
                _mapper.Map(dto, existingCombo);
                
                // Luôn tạo ComboDescription mới nếu có ComboDetails
                if (dto.ComboDetails != null && dto.ComboDetails.Any())
                {
                    _logger.LogInformation("Tạo mô tả tự động từ {DetailCount} ComboDetails", dto.ComboDetails.Count);
                    var description = await GenerateComboDescriptionAsync(dto.ComboDetails);
                    
                    // Cập nhật mô tả bất kể có mô tả cũ hay không
                    if (!string.IsNullOrEmpty(description))
                    {
                        _logger.LogInformation("Cập nhật ComboDescription từ '{OldDesc}' thành '{NewDesc}'", 
                            existingCombo.ComboDescription, description);
                        existingCombo.ComboDescription = description;
                    }
                }
                else
                {
                    // Nếu không có ComboDetails thì xóa mô tả
                    existingCombo.ComboDescription = null;
                    _logger.LogInformation("Không có ComboDetails, xóa ComboDescription");
                }
                
                // Set ComboSearchName before saving
                if (!string.IsNullOrEmpty(existingCombo.ComboName))
                {
                    existingCombo.ComboSearchName = TextHelper.ToSearchFriendlyText(existingCombo.ComboName);
                    _logger.LogDebug("Cập nhật ComboSearchName: {SearchName}", existingCombo.ComboSearchName);
                }
                
                await _unitOfWork.BeginTransactionAsync();
                try
                {
                    // Xóa tất cả combo details cũ
                    _logger.LogInformation("Xóa ComboDetails cũ cho ComboId {ComboId}", id);
                    await _unitOfWork.ComboDetailRepo.DeleteByComboIdAsync(id);
                    
                    // Thêm combo details mới
                    if (dto.ComboDetails != null && dto.ComboDetails.Any())
                    {
                        _logger.LogInformation("Thêm {DetailCount} ComboDetails mới", dto.ComboDetails.Count);
                        var newDetails = new List<ComboDetail>();
                        
                        foreach (var detailDto in dto.ComboDetails)
                        {
                            var detail = new ComboDetail
                            {
                                ComboId = id,
                                FnbId = detailDto.FnbId,
                                Quantity = detailDto.Quantity
                            };
                            newDetails.Add(detail);
                            _logger.LogDebug("ComboDetail mới: FnbId={FnbId}, Quantity={Quantity}", 
                                detail.FnbId, detail.Quantity);
                        }
                        
                        // Thêm từng ComboDetail để dễ debug
                        foreach (var detail in newDetails)
                        {
                            try
                            {
                                await _unitOfWork.ComboDetailRepo.AddAsync(detail);
                                await _unitOfWork.SaveChangesAsync();
                                _logger.LogDebug("Đã thêm ComboDetail với FnbId={FnbId}", detail.FnbId);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Lỗi khi thêm ComboDetail. FnbId={FnbId}", detail.FnbId);
                                throw;
                            }
                        }
                    }
                    
                    // Cập nhật combo
                    _logger.LogInformation("Cập nhật Combo trong database");
                    var updatedCombo = await _unitOfWork.ComboRepo.UpdateAsync(existingCombo);
                    await _unitOfWork.SaveChangesAsync();
                    
                    await _unitOfWork.CommitTransactionAsync();
                    
                    // Lấy lại combo đã cập nhật
                    _logger.LogInformation("Lấy lại thông tin combo đã cập nhật");
                    var result = await _unitOfWork.ComboRepo.GetByIdAsync(id);
                    
                    _logger.LogInformation(
                        "Cập nhật combo thành công. ID: {ComboId}, Tên: {ComboName}, Mô tả: {Description}, Số chi tiết: {DetailsCount}",
                        result.ComboId,
                        result.ComboName,
                        result.ComboDescription,
                        result.ComboDetails.Count);
                    
                    return _mapper.Map<ComboResponseDTO>(result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi trong transaction, thực hiện rollback");
                    await _unitOfWork.RollbackTransactionAsync();
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi cập nhật combo: {Message}, Inner: {InnerMessage}", 
                    ex.Message, ex.InnerException?.Message);
                throw new Exception("Có lỗi xảy ra khi lưu dữ liệu: " + ex.Message);
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi cập nhật combo: {Message}", ex.Message);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý: " + ex.Message);
            }
        }

        public async Task<bool> DeleteComboWithDetailsAsync(int id)
        {
            var combo = await _unitOfWork.ComboRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy combo với ID: {id}");

            try
            {
                // Kiểm tra xem combo có liên quan đến đơn hàng nào không
                if (combo.OrderDetailCombos.Any())
                {
                    throw new ValidationException("Không thể xóa combo đã được sử dụng trong đơn hàng");
                }

                // Xóa tất cả combo details trước
                await _unitOfWork.ComboDetailRepo.DeleteByComboIdAsync(id);
                
                // Sau đó xóa combo
                await _unitOfWork.ComboRepo.DeleteAsync(id);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa combo có ID: {id}");
                }
                
                _logger.LogInformation("Xóa combo và chi tiết combo thành công. ID: {ComboId}", id);
                return true;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi xóa combo và chi tiết {ComboId}", id);
                throw new Exception("Có lỗi xảy ra khi xóa dữ liệu");
            }
            catch (ValidationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xóa combo và chi tiết {ComboId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        // Phương thức mới để tạo ComboDescription tự động
        private async Task<string> GenerateComboDescriptionAsync(List<ComboDetailRequestDTO> comboDetails)
        {
            var descriptionParts = new List<string>();
            
            foreach (var detail in comboDetails)
            {
                if (detail.FnbId.HasValue && detail.Quantity.HasValue && detail.Quantity.Value > 0)
                {
                    var fnb = await _unitOfWork.FnbRepo.GetByIdAsync(detail.FnbId.Value);
                    if (fnb != null && !string.IsNullOrEmpty(fnb.FnbName))
                    {
                        descriptionParts.Add($"{detail.Quantity.Value} {fnb.FnbName}");
                    }
                }
            }
            
            // Nối các phần thành một chuỗi mô tả, sử dụng " + " làm dấu phân cách
            return string.Join(" + ", descriptionParts);
        }
    }
}