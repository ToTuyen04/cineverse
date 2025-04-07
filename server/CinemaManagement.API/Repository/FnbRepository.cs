using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class FnbRepository : GenericRepository<Fnb>, IFnbRepository
    {
        public FnbRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<Fnb>> SearchListAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return await _context.Fnbs
                    .ToListAsync();
            }

            var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(name);

            return await _context.Fnbs
                .Where(f => f.FnbSearchName.Contains(normalizedSearchTerm))
                .ToListAsync();
        }

        public async Task<bool> IsFnbNameExistsAsync(string fnbName, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(fnbName))
                return false;

            var normalizedName = TextHelper.ToSearchFriendlyText(fnbName);
            
            var query = _context.Fnbs.AsQueryable();
            
            if (excludeId.HasValue)
            {
                // Nếu là cập nhật, loại trừ FNB hiện tại
                query = query.Where(f => f.FnbId != excludeId.Value);
            }
            
            return await query.AnyAsync(f => f.FnbSearchName == normalizedName);
        }
    }
}
