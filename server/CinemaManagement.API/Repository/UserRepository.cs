using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.AuthDTOs;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;

namespace CinemaManagement.API.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _dbContext;


        public UserRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<User> CreateUserAsync(User userInRequest)
        {
            var newUser = new User
            {
                UserEmail = userInRequest.UserEmail,
                UserPassword = userInRequest.UserPassword,
                UserFirstName = userInRequest.UserFirstName,
                UserLastName = userInRequest.UserLastName,
                UserPhoneNumber = userInRequest.UserPhoneNumber,
                UserDateOfBirth = userInRequest.UserDateOfBirth,
                UserGender = userInRequest.UserGender,
                UserCreateAt = DateTime.UtcNow,
                UserStatus = 1, // 0: Chưa kích hoạt, 1: Đã kích hoạt
                UserPoint = 0,
                RankId = 1 // Rank mặc định khi đăng ký
            };

            await _dbContext.Users.AddAsync(newUser);
            return newUser;
        }

        public async Task<User?> FindByIdAndStatusAsync(string email, int status)
        {
            return await _dbContext.Users.FirstOrDefaultAsync(u => u.UserEmail == email);
        }

        public Task<User> GetUserByEmail(string email)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> IsEmailExistAsync(string email)
        {
            return await _dbContext.Users.AnyAsync(u => u.UserEmail == email);
        }

        public async Task<int> ResetAllCustomerPoints()
        {
            var query = @"UPDATE [user] SET user_point = 0
                       WHERE user_status = 1"; // Chỉ reset điểm cho tài khoản đang hoạt động
            
            return await _dbContext.Database.ExecuteSqlRawAsync(query);

        }
    }
}
