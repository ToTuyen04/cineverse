using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Repository
{
    public class ConfigurationRepository : GenericRepository<Entities.Configuration>, IConfigurationRepository
    {
        public ConfigurationRepository(ApplicationDbContext context) : base(context)
        {

        }

        public async Task<Entities.Configuration> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(c => c.ConfigurationName.ToLower() == name.ToLower());
        }

        public async Task<IEnumerable<Entities.Configuration>> GetAllByIdsAsync(List<int> ids)
        {
            return await _dbSet.Where(c => ids.Contains(c.ConfigurationId)).ToListAsync();
        }

        public async Task<IEnumerable<Entities.Configuration>> UpdateRangeAsync(List<Entities.Configuration> configList)
        {
            _dbSet.UpdateRange(configList);

            return await Task.FromResult<IEnumerable<Entities.Configuration>>(configList);
        }

        public async Task DeleteAsync(Entities.Configuration configuration)
        {
            _dbSet.Remove(configuration);
        }
    }
}
