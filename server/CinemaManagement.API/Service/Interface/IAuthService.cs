using CinemaManagement.API.DTOs;
using CinemaManagement.API.DTOs.AuthDTOs;

namespace CinemaManagement.API.Service.Interface
{
    public interface IAuthService
    {
        //Login
        Task<AuthResponseDto> LoginAsync(LoginRequestDto loginRequestDto);

        //Handle customer information
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto registerRequestDto);
        Task<AuthResponseDto> RegisterWithTokenOnlyAsync(RegisterRequestDto registerDto);

        //Confirm account
        Task<AuthResponseDto> ConfirmEmailAsync(string token);

        // Quên mật khẩu
        Task<AuthResponseDto> ForgotPasswordAsync(ResetPasswordDto resetPasswordDto);

        // Đặt lại mật khẩu
        Task<AuthResponseDto> ResetPasswordAsync(ChangePasswordDto changePasswordDto);

        // Đăng ký thông tin mới cho staff
        Task<AuthResponseDto> CreateStaffAsync(CreateStaffDto createStaffDto, int createdByAdminId);
    }
}