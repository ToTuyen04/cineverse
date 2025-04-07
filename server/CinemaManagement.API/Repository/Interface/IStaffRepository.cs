using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IStaffRepository
    {
        Task<bool> IsEmailExistAsync(string email);

        Task<Staff> GetStaffByEmailAsync(string email);

    }
}
