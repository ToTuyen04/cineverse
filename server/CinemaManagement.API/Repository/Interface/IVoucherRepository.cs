using CinemaManagement.API.Entities;
using CinemaManagement.API.Utils;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IVoucherRepository : IGenericRepository<Voucher>, ISearchRepository<Voucher>
    {
        // Get voucher by code
        Task<Voucher> GetByCodeAsync(string code);
        
        // Get paginated vouchers
        //Task<(PaginatedList<Voucher> PaginatedVoucher, int TotalItems)> GetPaginatedVouchersAsync(int pageIndex, int pageSize, string searchTerm = null);
    }
}
