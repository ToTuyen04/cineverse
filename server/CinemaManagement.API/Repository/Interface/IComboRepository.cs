using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IComboRepository : IGenericRepository<Combo>, ISearchRepository<Combo>
    {
        // Kiểm tra tên combo đã tồn tại hay chưa
        Task<bool> IsComboNameExistsAsync(string comboName, int? excludeId = null);
    }
}
