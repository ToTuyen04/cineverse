using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class VoucherRepository : GenericRepository<Voucher>, IVoucherRepository
    {
        public VoucherRepository(ApplicationDbContext context) : base(context)
        {
        }

        // Get voucher by code
        public async Task<Voucher> GetByCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return null;
            
            var currentTime = DateTime.Now;
            
            return await _context.Vouchers
                .FirstOrDefaultAsync(v => v.VoucherCode == code && 
                                        v.VoucherStartAt <= currentTime && 
                                        v.VoucherEndAt >= currentTime);
        }

        // Search vouchers
        public async Task<List<Voucher>> SearchListAsync(string name)
        {
            var query = _context.Vouchers.AsQueryable();
            
            if (!string.IsNullOrWhiteSpace(name))
            {
                var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(name);
                query = query.Where(v => v.VoucherSearchName.Contains(normalizedSearchTerm));
            }

            return await query.ToListAsync();
        }

        // Get paginated vouchers
        public async Task<(PaginatedList<Voucher> PaginatedVoucher, int TotalItems)> GetPaginatedVouchersAsync(int pageIndex, int pageSize, string searchTerm = null)
        {
            // Get all vouchers
            var query = _context.Vouchers.AsQueryable();

            // Get total count of all vouchers
            var totalItems = await _context.Vouchers.CountAsync();

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(searchTerm);
                query = query.Where(v => v.VoucherSearchName.Contains(normalizedSearchTerm));
            }

            // Get total count for current search query
            var totalCount = await query.CountAsync();

            // Apply pagination
            var items = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Return paginated vouchers
            return (new PaginatedList<Voucher>(items, totalCount, pageIndex, pageSize), totalItems);
        }
    }
}
