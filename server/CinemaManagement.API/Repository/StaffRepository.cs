using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class StaffRepository : IStaffRepository
    {
        private readonly ApplicationDbContext _context;

        public StaffRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Staff> GetStaffByEmailAsync(string email)
        {
            throw new NotImplementedException();
            //return await _context.Staff.FirstOrDefaultAsync(s => s.StaffEmail = email);
        }

        public async Task<bool> IsEmailExistAsync(string email)
        {
            return await _context.Staff.AnyAsync(u => u.StaffEmail == email);
        }
    }
}
