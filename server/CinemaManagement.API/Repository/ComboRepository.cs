using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Utils;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class ComboRepository : GenericRepository<Combo>, IComboRepository
    {
        public ComboRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Combo> GetByIdAsync(int id)
        {
            return await _context.Combos
                .Include(c => c.ComboDetails)
                    .ThenInclude(cd => cd.Fnb)
                .FirstOrDefaultAsync(c => c.ComboId == id);
        }

        public override async Task<IEnumerable<Combo>> GetAllAsync()
        {
            return await _context.Combos
                .Include(c => c.ComboDetails)
                    .ThenInclude(cd => cd.Fnb)
                .ToListAsync();
        }

        public async Task<List<Combo>> SearchListAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return await _context.Combos
                    .Include(c => c.ComboDetails)
                        .ThenInclude(cd => cd.Fnb)
                    .ToListAsync();
            }
            
            var normalizedSearchTerm = TextHelper.ToSearchFriendlyText(name);
            
            return await _context.Combos
                .Include(c => c.ComboDetails)
                    .ThenInclude(cd => cd.Fnb)
                .Where(c => c.ComboSearchName.Contains(normalizedSearchTerm))
                .ToListAsync();
        }

        public async Task<bool> IsComboNameExistsAsync(string comboName, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(comboName))
                return false;

            var normalizedName = TextHelper.ToSearchFriendlyText(comboName);
            
            var query = _context.Combos.AsQueryable();
            
            if (excludeId.HasValue)
            {
                // Nếu là cập nhật, loại trừ combo hiện tại
                query = query.Where(c => c.ComboId != excludeId.Value);
            }
            
            return await query.AnyAsync(c => c.ComboSearchName == normalizedName);
        }
    }
}
