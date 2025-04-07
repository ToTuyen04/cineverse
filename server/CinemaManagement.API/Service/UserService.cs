using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.EntityFrameworkCore;
﻿using AutoMapper;
using CinemaManagement.API.Configuration;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Service
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private ILogger<UserService> _logger;
        private readonly IMapper _mapper;
        private readonly ConfigurationHolder _configurationHolder;

        public UserService(IUnitOfWork unitOfWork, ILogger<UserService> logger, IMapper mapper, ConfigurationHolder configurationHolder)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
            _configurationHolder = configurationHolder;
        }

        public async Task<int> ResetAllCustomerPoints()
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                _logger.LogInformation("Bắt đầu reset điểm tích lũy cho tất cả khách hàng");

                var affectedCustomers = await _unitOfWork.UserRepo.ResetAllCustomerPoints();

                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Đã reset điểm tích lũy cho {Count} khách hàng", affectedCustomers);
                
                await _unitOfWork.CommitTransactionAsync();

                return affectedCustomers;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.LogError(ex, "Lỗi khi reset điểm tích lũy khách hàng");
                 await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
        
        public async Task AddUserPointsAsync(string userEmail, decimal paymentAmount)
        {
            try
            {
                var user = await _unitOfWork.UserRepo.GetUserByEmail(userEmail);
                if (user == null) return;

                decimal pointsAdd = paymentAmount * _configurationHolder.GetPointsPerThousand();

                decimal currentPoints = user.UserPoint ?? 0;

                decimal newPoints = currentPoints + pointsAdd;
                user.UserPoint = (int?)newPoints;

                user.RankId = await updateUserRankAsync(newPoints);

                //await _unitOfWork.UserRepo.UpdateAsync(user);
                await _unitOfWork.SaveChangesAsync();
                /*
                 get order by userId
                rạp, phim, suất chiếu, ghế, combo, vé, 
                 */
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, $"Lỗi khi cộng điểm cho user: {ex.Message}");
            }
        }

        public async Task<int> updateUserRankAsync(decimal points)
        {
            try
            {
                var ranks = await _unitOfWork.RankRepo.GetAllAsync();
                var currentRankId = ranks.LastOrDefault(r => r.RankMilestone <= points)?.RankId;

                Console.WriteLine("Current Rank Id: " + currentRankId);
                return currentRankId.Value;
            }
            catch (Exception ex)
            {
                var errorMessage = $"Lỗi khi cập nhật hạng người dùng với số điểm: {points}. Chi tiết lỗi: {ex.Message}";
                _logger.LogError(ex, errorMessage);
                throw new Exception(errorMessage, ex);
            }
        }
    }
}
