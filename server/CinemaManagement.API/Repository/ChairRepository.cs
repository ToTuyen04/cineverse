using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace CinemaManagement.API.Repository
{
    public class ChairRepository : GenericRepository<Chair>, IChairRepository
    {
        public ChairRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<decimal> GetPriceByChairId(int chairId)
        {
            var chairPrice = await _context.Chairs
                .Include(c => c.ChairType)
                .FirstOrDefaultAsync(c => c.ChairId == chairId);

            return chairPrice.ChairType.ChairPrice ?? 0;
        }

        public async Task<List<ChairType>> GetAllChairType()
        {
            return await _context.ChairTypes.ToListAsync();
        }

    }
}
