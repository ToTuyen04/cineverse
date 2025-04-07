using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using CinemaManagement.API.Utils;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Service
{
    public class VoucherService : IVoucherService
    {
        // Variables
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<VoucherService> _logger;

        // Constructor
        public VoucherService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<VoucherService> logger) 
        {
            // Initialize variables
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        // Get all vouchers and update their availability
        public async Task<List<VoucherResponseDTO>> GetAllAsync()
        {
            // Get all vouchers
            var vouchers = await _unitOfWork.VoucherRepo.GetAllAsync();
            
            // Update VoucherAvailable for each voucher based on current time
            var currentTime = DateTime.Now;
            foreach (var voucher in vouchers)
            {
                voucher.VoucherAvailable = voucher.VoucherStartAt <= currentTime && voucher.VoucherEndAt >= currentTime;
            }
            
            // Map to DTOs and return as List
            return _mapper.Map<List<VoucherResponseDTO>>(vouchers);
        }

        // Get voucher by code (only available vouchers based on date)
        public async Task<VoucherSimplifiedResponseDTO> GetByCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ValidationException("Mã voucher không được để trống");
            }

            var voucher = await _unitOfWork.VoucherRepo.GetByCodeAsync(code);
            
            if (voucher == null)
            {
                throw new NotFoundException($"Không tìm thấy voucher với mã: {code} hoặc voucher không trong thời gian hiệu lực");
            }
            
            return _mapper.Map<VoucherSimplifiedResponseDTO>(voucher);
        }

        // UI send request to BE -> use RequestDTO
        public async Task<List<VoucherResponseDTO>> SearchListAsync(string name)
        {
            var voucher = await _unitOfWork.VoucherRepo.SearchListAsync(name);
            return _mapper.Map<List<VoucherResponseDTO>>(voucher);
        }

        // UI send request to BE -> use RequestDTO
        public async Task<VoucherResponseDTO> AddAsync(VoucherRequestDTO.VoucherCreateDTO request)
        {
            var voucher = _mapper.Map<Voucher>(request);

            // Set VoucherSearchName before saving
            if (!string.IsNullOrEmpty(voucher.VoucherName))
            {
                voucher.VoucherSearchName = TextHelper.ToSearchFriendlyText(voucher.VoucherName);
            }
            
            // Calculate VoucherAvailable based on start and end dates
            var currentTime = DateTime.Now;
            voucher.VoucherAvailable = voucher.VoucherStartAt <= currentTime && voucher.VoucherEndAt >= currentTime;
            
            var addedVoucher = await _unitOfWork.VoucherRepo.AddAsync(voucher);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<VoucherResponseDTO>(addedVoucher);
        }

        public async Task<VoucherResponseDTO> UpdateAsync(int id, VoucherRequestDTO.VoucherUpdateDTO request)
        {
            var existingVoucher = await _unitOfWork.VoucherRepo.GetByIdAsync(id);
            
            if (existingVoucher == null)
            {
                throw new NotFoundException($"Không tìm thấy voucher với ID: {id}");
            }

            _mapper.Map(request, existingVoucher);
            
            if (!string.IsNullOrEmpty(existingVoucher.VoucherName))
            {
                existingVoucher.VoucherSearchName = TextHelper.ToSearchFriendlyText(existingVoucher.VoucherName);
            }
            
            // Update VoucherAvailable based on start and end dates
            var currentTime = DateTime.Now;
            existingVoucher.VoucherAvailable = existingVoucher.VoucherStartAt <= currentTime && existingVoucher.VoucherEndAt >= currentTime;

            // Call the repository method to update the voucher
            var updatedVoucher = await _unitOfWork.VoucherRepo.UpdateAsync(existingVoucher);
            await _unitOfWork.SaveChangesAsync();

            // Map and return the response
            return _mapper.Map<VoucherResponseDTO>(updatedVoucher);
        }

        public async Task<VoucherResponseDTO> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.VoucherRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy voucher với ID: {id}");

            return _mapper.Map<VoucherResponseDTO>(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var voucher = await _unitOfWork.VoucherRepo.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy voucher với ID: {id}");

            try
            {
                await _unitOfWork.VoucherRepo.DeleteAsync(voucher.VoucherId);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                if (isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa voucher có ID: {id}");
                }

                _logger.LogInformation("Xóa voucher thành công. ID: {VoucherId}", id);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Lỗi database khi xóa voucher {VoucherId}", id);
                throw new Exception("Có lỗi xảy ra khi xóa dữ liệu");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi không xác định khi xóa voucher {VoucherId}", id);
                throw new Exception("Có lỗi xảy ra trong quá trình xử lý");
            }
        }

        //// UI send request to BE -> use RequestDTO
        //public async Task<PaginatedResponse<VoucherResponseDTO>> GetPaginatedVouchersAsync(int pageIndex, int pageSize, string searchTerm = null)
        //{
        //    try
        //    {
        //        var (paginatedVouchers, totalItems) = await _voucherRepository.GetPaginatedVouchersAsync(pageIndex, pageSize, searchTerm);

        //        // Map paginated vouchers to voucherDtos
        //        var voucherDtos = _mapper.Map<List<VoucherResponseDTO>>(paginatedVouchers.Items);

        //        // Return paginated response
        //        return new PaginatedResponse<VoucherResponseDTO>
        //        {
        //            PageIndex = paginatedVouchers.PageIndex,
        //            PageSize = paginatedVouchers.PageSize,
        //            TotalCount = paginatedVouchers.TotalCount,
        //            TotalPages = paginatedVouchers.TotalPages,
        //            TotalItems = totalItems,
        //            HasPreviousPage = paginatedVouchers.HasPreviousPage,
        //            HasNextPage = paginatedVouchers.HasNextPage,
        //            Items = voucherDtos
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        throw new Exception("Có lỗi xảy ra khi lấy danh sách voucher phân trang", ex);
        //    }
        //}
    }
}
