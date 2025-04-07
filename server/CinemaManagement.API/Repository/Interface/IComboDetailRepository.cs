using CinemaManagement.API.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IComboDetailRepository : IGenericRepository<ComboDetail>, ISearchRepository<ComboDetail>
    {
        // Lấy tất cả ComboDetail theo ComboId
        Task<IEnumerable<ComboDetail>> GetByComboIdAsync(int comboId);

        // Lấy ComboDetail cùng với thông tin Fnb
        Task<ComboDetail> GetWithFnbAsync(int comboDetailId);

        // Thêm nhiều ComboDetail cùng lúc
        Task<IEnumerable<ComboDetail>> AddRangeAsync(List<ComboDetail> comboDetails);

        // Cập nhật số lượng của ComboDetail
        Task<ComboDetail> UpdateQuantityAsync(int comboDetailId, int newQuantity);

        // Xóa tất cả ComboDetail theo ComboId
        Task<bool> DeleteByComboIdAsync(int comboId);




    }
}
