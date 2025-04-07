using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IFnbRepository : IGenericRepository<Fnb>, ISearchRepository<Fnb>
    {
        // Kiểm tra tên FnB đã tồn tại hay chưa
        Task<bool> IsFnbNameExistsAsync(string fnbName, int? excludeId = null);
    }
}
