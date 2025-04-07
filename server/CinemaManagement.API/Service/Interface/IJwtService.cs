using CinemaManagement.API.DTOs.AuthDTOs;
using System.Security.Claims;

namespace CinemaManagement.API.Service.Interface
{
    public interface IJwtService
    {
        // Generate token with claims and expiry time
        string GenerateToken(List<Claim> claims, DateTime expires);

        // Generate auth token for: user, admin, staff
        string GenerateAuthToken(string email, bool isStaff, string role);

        // Generate token for confirm member's mail
        string GenerateEmailConfirmationToken(RegisterRequestDto registerRequest);
        string GeneraRegistrationToken(RegisterRequestDto registerRequest);

        // Generate token for people who are absent-minded
        string GeneratePasswordResetToken(string email, bool isStaff);

        // Giải mã và xác thực token, trả về claims nếu hợp lệ hoặc null nếu không hợp lệ
        ClaimsPrincipal ValidateToken(string token);

        // Giải mã token thành dictionary các claim (không cần xác thực chữ ký)
        Dictionary<string, string> DecodeToken(string token);

        string HashPassword(string password);
    }
}
