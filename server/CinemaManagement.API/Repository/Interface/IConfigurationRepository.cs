namespace CinemaManagement.API.Repository.Interface
{
    public interface IConfigurationRepository : IGenericRepository<Entities.Configuration>
    {
        Task<IEnumerable<Entities.Configuration>> UpdateRangeAsync(List<Entities.Configuration> configList);
        Task<Entities.Configuration> GetByNameAsync(string name);
        Task<IEnumerable<Entities.Configuration>> GetAllByIdsAsync(List<int> ids);
        Task DeleteAsync(Entities.Configuration configuration);
    }
}
