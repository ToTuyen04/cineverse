using System;
using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class ChairShowtimeRepository : GenericRepository<ChairShowtime>, IChairShowtimeRepository
    {
        public ChairShowtimeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<List<ChairShowtime>> GetAllChairShowtimeAsync()
        {
            return await _context.ChairShowtimes.Include(c => c.Chair).ThenInclude(c => c.ChairType).ToListAsync();
        }
        public async Task<List<ChairShowtime>> GetChairsByShowtimesAsync(int showtimeId)
        {
            return await _context.ChairShowtimes
                .Where(c => c.ShowtimeId == showtimeId)
                .Include(c => c.Chair)
                .ThenInclude(c => c!.ChairType)
                .OrderBy(c => c.Chair!.ChairPosition)
                .ToListAsync();
        }

        public async Task<ChairShowtime> GetChairShowtimeAsync(int showtimeId, int chairId)
        {
            var query = _context.ChairShowtimes
                .Where(c => c.ShowtimeId == showtimeId && c.ChairId == chairId);

            return await query.FirstOrDefaultAsync();
        }


        public async Task<bool> BookingChairAsync(int showtimeId, int chairId, byte[] version)
        {
            try
            {
                var chair = await GetChairShowtimeAsync(showtimeId, chairId);
                if (chair == null || !chair.Available)
                    return false;

                chair.Available = false;
                _context.Entry(chair).Property(c => c.Version).OriginalValue = version;


                return true;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return false;
            }
        }


        public async Task<bool> ReleaseChairAsync(int showtimeId, int chairId)
        {

            var chair = await GetChairShowtimeAsync(showtimeId, chairId);


            if (chair == null)
                return false;

            chair.Available = true;
            return true;
        }


        public async Task<bool> UpdateChairsAvailabilityAsync(int showtimeId, List<int> chairIds)
        {
            var chairsToUpdate = await _context.ChairShowtimes
                .Where(cs => cs.ShowtimeId == showtimeId && chairIds.Contains(cs.ChairId ?? 0))
                .ToListAsync();

            foreach (var chair in chairsToUpdate)
            {
                chair.Available = false;
            }

            return true;
        }

        public async Task<decimal> GetPriceByChairAndShowtimeAsync(int chairId, int showtimeId)
        {
            var ChairShowtime = await _context.ChairShowtimes
                .Include(cs => cs.Chair)
                .ThenInclude(c => c.ChairType)
                .FirstOrDefaultAsync(cs => cs.ShowtimeId == showtimeId && cs.ChairId == chairId);

            if (ChairShowtime == null)
                throw new NotFoundException($"Không tìm thấy thông tin ghế {chairId} trong suất chiếu {showtimeId}");

            return ChairShowtime.Chair.ChairType.ChairPrice ?? 0;
        }


    }
}
