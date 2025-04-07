using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class ComboDetailRepository : GenericRepository<ComboDetail>, IComboDetailRepository
    {
        public ComboDetailRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<ComboDetail>> GetAllAsync()
        {
            return await _dbSet
                .Include(cd => cd.Combo)
                .Include(cd => cd.Fnb)
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<ComboDetail> GetByIdAsync(int id)
        {
            return await _dbSet
                .Include(cd => cd.Combo)
                .Include(cd => cd.Fnb)
                .FirstOrDefaultAsync(cd => cd.ComboDetailId == id);
        }

        public async Task<IEnumerable<ComboDetail>> GetByComboIdAsync(int comboId)
        {
            return await _dbSet
                .Include(cd => cd.Combo)
                .Include(cd => cd.Fnb)
                .Where(cd => cd.ComboId == comboId)
                .ToListAsync();
        }

        public async Task<ComboDetail> GetWithFnbAsync(int comboDetailId)
        {
            return await _dbSet
                .Include(cd => cd.Fnb)
                .FirstOrDefaultAsync(cd => cd.ComboDetailId == comboDetailId);
        }

        public async Task<IEnumerable<ComboDetail>> AddRangeAsync(List<ComboDetail> comboDetails)
        {
            await _dbSet.AddRangeAsync(comboDetails);
            await _context.SaveChangesAsync();
            return comboDetails;
        }

        public async Task<ComboDetail> UpdateQuantityAsync(int comboDetailId, int newQuantity)
        {
            var comboDetail = await _dbSet.FindAsync(comboDetailId);
            if (comboDetail == null)
                return null;

            // Giả định rằng ComboDetail có thuộc tính Quantity
            // comboDetail.Quantity = newQuantity;

            _context.Entry(comboDetail).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return comboDetail;
        }

        public async Task<bool> DeleteByComboIdAsync(int comboId)
        {
            var comboDetails = await _dbSet.Where(cd => cd.ComboId == comboId).ToListAsync();
            if (!comboDetails.Any())
                return false;

            _dbSet.RemoveRange(comboDetails);
            var affected = await _context.SaveChangesAsync();

            return affected > 0;
        }

        new public async Task<ComboDetail> AddAsync(ComboDetail comboDetail)
        {
            await _dbSet.AddAsync(comboDetail);
            await _context.SaveChangesAsync();

            return comboDetail;
        }

        new public async Task<bool> DeleteAsync(ComboDetail comboDetail)
        {
            _context.ComboDetails.Remove(comboDetail);
            var affected = await _context.SaveChangesAsync();

            return affected > 0;
        }

        new public async Task<ComboDetail> UpdateAsync(ComboDetail comboDetail)
        {
            _context.Entry(comboDetail).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return comboDetail;
        }

        public async Task<List<ComboDetail>> SearchListAsync(string name)
        {
            return await _dbSet
                .Include(cd => cd.Combo)
                .Include(cd => cd.Fnb)
                .Where(cd => cd.Combo.ComboName.Contains(name))
                .ToListAsync();
        }
    }
}
