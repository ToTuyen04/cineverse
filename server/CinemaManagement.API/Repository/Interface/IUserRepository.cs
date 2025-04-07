using CinemaManagement.API.DTOs.AuthDTOs;
using CinemaManagement.API.Entities;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IUserRepository
    {
        Task<User> CreateUserAsync(User userInRequest);

        Task<User> FindByIdAndStatusAsync(string email, int status);

        Task<User> GetUserByEmail(string email);

        Task<bool> IsEmailExistAsync(string email);

        Task<int> ResetAllCustomerPoints();
    }
}
