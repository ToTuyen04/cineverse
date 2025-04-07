using CinemaManagement.API.Configuration;
using CinemaManagement.API.DTOs;
using CinemaManagement.API.DTOs.AuthDTOs;
using CinemaManagement.API.Service.Interface;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CinemaManagement.API.Service
{
    public class JwtService : IJwtService
    {
        private readonly JwtConfig _jwtConfig;
        private readonly ILogger<JwtService> _logger;

        public JwtService(IOptions<JwtConfig> jwtConfig, ILogger<JwtService> logger)
        {
            _jwtConfig = jwtConfig.Value;
            _logger = logger;
        }

        /// <summary>
        /// Tạo token JWT với danh sách claims và thời hạn tùy chỉnh
        /// </summary>
        public string GenerateToken(List<Claim> claims, DateTime expires)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtConfig.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = expires,
                    Issuer = _jwtConfig.Issuer,
                    Audience = _jwtConfig.Audience,
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo token: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Tạo token xác thực cho người dùng đăng nhập
        /// </summary>
        public string GenerateAuthToken(string email, bool isStaff, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role),
                new Claim("IsStaff", isStaff.ToString()),
                new Claim("TokenType", "Authentication")
            };

            return GenerateToken(claims, DateTime.UtcNow.AddMinutes(_jwtConfig.ExpiryMinutes));
        }

        /// <summary>
        /// Tạo token xác nhận email
        /// </summary>
        public string GenerateEmailConfirmationToken(RegisterRequestDto registerDto)
        {
            var password = HashPassword(registerDto.Password);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, registerDto.Email),
                new Claim("FirstName", registerDto.FirstName),
                new Claim("LastName", registerDto.LastName),
                new Claim("Password", password),
                new Claim("PhoneNumber", registerDto.PhoneNumber ?? ""),
                new Claim("Gender", registerDto.Gender.ToString()),
                new Claim("DateOfBirth", registerDto.DateOfBirth.ToString()),
                //new Claim("IsStaff", registerDto.IsStaff.Value),
                new Claim("TokenType", "EmailConfirmation")
            };

            return GenerateToken(claims, DateTime.UtcNow.AddHours(24)); // 24 giờ
        }

        /// <summary>
        /// Tạo token đặt lại mật khẩu
        /// </summary>
        public string GeneratePasswordResetToken(string email, bool isStaff)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email),
                new Claim("IsStaff", isStaff.ToString()),
                new Claim("TokenType", "PasswordReset")
            };

            return GenerateToken(claims, DateTime.UtcNow.AddHours(1)); // 1 giờ
        }

        /// <summary>
        /// Giải mã và xác thực token JWT
        /// </summary>
        public ClaimsPrincipal ValidateToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_jwtConfig.Secret);

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtConfig.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtConfig.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero // Không cho phép token hết hạn có thêm thời gian
                };

                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"JWT token không hợp lệ: {ex.Message}");
                return null; // Token không hợp lệ
            }
        }

        /// <summary>
        /// Giải mã token thành dictionary (không xác thực)
        /// </summary>
        public Dictionary<string, string> DecodeToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

                if (jsonToken == null)
                    return null;

                var result = new Dictionary<string, string>();
                foreach (var claim in jsonToken.Claims)
                {
                    // Tránh trùng key trong dictionary
                    if (!result.ContainsKey(claim.Type))
                    {
                        result.Add(claim.Type, claim.Value);
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Không thể giải mã JWT token: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Tạo token chứa toàn bộ thông tin đăng ký (khi không lưu vào DB ngay)
        /// </summary>
        public string GeneraRegistrationToken(RegisterRequestDto registerDto)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, registerDto.Email),
                new Claim("Password", HashPassword(registerDto.Password)), // Lưu password đã hash
                new Claim("FirstName", registerDto.FirstName),
                new Claim("LastName", registerDto.LastName),
                new Claim("PhoneNumber", registerDto.PhoneNumber ?? ""),
                new Claim("TokenType", "Registration")
            };

            // Thêm thông tin ngày sinh nếu có
            if (registerDto.DateOfBirth.HasValue)
            {
                claims.Add(new Claim("DateOfBirth", registerDto.DateOfBirth.Value.ToString("yyyy-MM-dd")));
            }

            // Thêm thông tin giới tính nếu có
            if (registerDto.Gender.HasValue)
            {
                claims.Add(new Claim("Gender", registerDto.Gender.Value.ToString()));
            }

            return GenerateToken(claims, DateTime.UtcNow.AddHours(24)); // 24 giờ
        }

        /// <summary>
        /// Hash mật khẩu sử dụng SHA256
        /// </summary>
        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create(); // được giải phóng ngay sau khi sử dụng
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}

