using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;

namespace CinemaManagement.API.Service.Interface
{
    public interface IVoucherService : ISearchService<VoucherResponseDTO>
    {
        Task<List<VoucherResponseDTO>> GetAllAsync();

        Task<VoucherResponseDTO> GetByIdAsync(int id);

        Task<VoucherResponseDTO> AddAsync(VoucherRequestDTO.VoucherCreateDTO request);
        
        Task<VoucherResponseDTO> UpdateAsync(int id, VoucherRequestDTO.VoucherUpdateDTO request);
        
        // Get voucher by code (only available vouchers)
        Task<VoucherSimplifiedResponseDTO> GetByCodeAsync(string code);
        
        //Task<PaginatedResponse<VoucherResponseDTO>> GetPaginatedVouchersAsync(int pageIndex, int pageSize, string searchTerm = null);

        Task DeleteAsync(int id);
    }
}
