using CinemaManagement.API.Configuration;
using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs;
using CinemaManagement.API.DTOs.AuthDTOs;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CinemaManagement.API.Service
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;
        private readonly IUnitOfWork _unitOfWork;


        public AuthService(ApplicationDbContext dbContext,
                           IJwtService jwtService,
                           IEmailService emailService,
                           ILogger<AuthService> logger, IUnitOfWork unitOfWork)
        {
            _dbContext = dbContext;
            _jwtService = jwtService;
            _emailService = emailService;
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto loginRequestDto)
        {
            try
            {
                // Tìm user hoặc staff với email
                var staff = await _dbContext.Staff
                    .FirstOrDefaultAsync(s => s.StaffEmail == loginRequestDto.Email);

                var user = await _dbContext.Users
                    .FirstOrDefaultAsync(u => u.UserEmail == loginRequestDto.Email);

                // Kiểm tra xem email có tồn tại không
                if (staff == null && user == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Email hoặc mật khẩu không chính xác."
                    };
                }

                // Xác định người dùng là staff hay member
                bool isStaff = staff != null;

                // Kiểm tra mật khẩu
                var passwordFromDb = isStaff ? staff.StaffPassword : user.UserPassword;
                //if (passwordFromDb != loginRequestDto.Password)

                var passwordFromLogin = _jwtService.HashPassword(loginRequestDto.Password);
                if (passwordFromDb != passwordFromLogin)
                {
                    return new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Email hoặc mật khẩu không chính xác."
                    };
                }

                string userRole = isStaff ? (staff.StaffRoleId == 1 ? "Admin" : "Staff") : "Member";

                // Tạo token
                var token = _jwtService.GenerateAuthToken(loginRequestDto.Email, isStaff, userRole);

                // Lấy tên đầy đủ
                string fullName = isStaff
                    ? $"{staff.StaffFirstName} {staff.StaffLastName}"
                    : $"{user.UserFirstName} {user.UserLastName}";

                // Trả về response
                return new AuthResponseDto
                {
                    IsSuccessful = true,
                    Message = "Đăng nhập thành công.",
                    UserEmail = loginRequestDto.Email,
                    UserFullName = fullName,
                    IsStaff = isStaff,
                    Token = token,
                    Role = userRole
                    //Expiration ???
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi trong quá trình đăng nhập: {ex.Message}");
                return new AuthResponseDto
                {
                    IsSuccessful = false,
                    Message = "Đã xảy ra lỗi trong quá trình đăng nhập."
                };
            }
        }

        public async Task<AuthResponseDto> ConfirmEmailAsync(string token)
        {
            try
            {
                // Giải mã và xác thực token
                var principal = _jwtService.ValidateToken(token);
                if (principal == null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Link xác nhận không hợp lệ hoặc đã hết hạn."
                    };
                }

                // Kiểm tra loại token
                var tokenType = principal.FindFirst("TokenType")?.Value;
                if (string.IsNullOrEmpty(tokenType) || tokenType != "EmailConfirmation")
                {
                    return new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Token không phải là token xác nhận mail."
                    };
                }

                // Lấy dữ liệu từ token
                var email = principal.FindFirst(ClaimTypes.Email)?.Value;
                var hashedPassword = principal.FindFirst("Password")?.Value;
                var firstName = principal.FindFirst("FirstName")?.Value;
                var lastName = principal.FindFirst("LastName")?.Value;
                var phoneNumber = principal.FindFirst("PhoneNumber")?.Value;
                var isStaff = principal.FindFirst("IsStaff")?.Value;

                // Kiểm tra email đã tồn tại chưa
                var existingUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserEmail == email);
                if (existingUser != null)
                {
                    return new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Email này đã được đăng ký. Có thể bạn đã xác nhận tài khoản trước đó."
                    };
                }

                // Tạo user mới với status active (1)
                var newUser = new User
                {
                    UserEmail = email,
                    UserPassword = hashedPassword,
                    UserFirstName = firstName,
                    UserLastName = lastName,
                    UserSearchName = $"{firstName} {lastName}".ToLower(),
                    UserPhoneNumber = phoneNumber,
                    UserCreateAt = DateTime.UtcNow,
                    UserPoint = 0,
                    UserStatus = 1, // Active ngay khi tạo vì đã xác nhận email
                    RankId = 1 // Rank cơ bản
                };

                // Lấy thông tin ngày sinh nếu có
                var dateOfBirthStr = principal.FindFirst("DateOfBirth")?.Value;
                if (!string.IsNullOrEmpty(dateOfBirthStr) && DateTime.TryParse(dateOfBirthStr, out DateTime dateOfBirth))
                {
                    newUser.UserDateOfBirth = DateOnly.FromDateTime(dateOfBirth);
                }

                // Lấy thông tin giới tính nếu có
                var genderStr = principal.FindFirst("Gender")?.Value;
                if (!string.IsNullOrEmpty(genderStr) && byte.TryParse(genderStr, out byte gender))
                {
                    newUser.UserGender = gender;
                }

                //// Lưu user vào database
                //_dbContext.Users.Add(newUser);
                //await _dbContext.SaveChangesAsync();
                //if (isStaff.Equals("true"))
                await _unitOfWork.UserRepo.CreateUserAsync(newUser);
                await _unitOfWork.SaveChangesAsync();
                //else _staffRepository.CreateStaffAsync(newUser)

                return new AuthResponseDto
                {
                    IsSuccessful = true,
                    Message = "Xác nhận tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi xác nhận đăng ký: {ex.Message}");
                return new AuthResponseDto
                {
                    IsSuccessful = false,
                    Message = "Đã xảy ra lỗi khi xác nhận tài khoản."
                };
            }
        }

        public Task<AuthResponseDto> CreateStaffAsync(CreateStaffDto createStaffDto, int createdByAdminId)
        {
            throw new NotImplementedException();
        }

        public Task<AuthResponseDto> ForgotPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            throw new NotImplementedException();
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto registerRequestDto)
        {
            try
            {
                if (await _unitOfWork.UserRepo.IsEmailExistAsync(registerRequestDto.Email) || await _unitOfWork.UserRepo.IsEmailExistAsync(registerRequestDto.Email))
                {
                    return new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Email đã tồn tại trong hệ thống."
                    };
                }

                // Tạo token xác nhận
                string registrationToken = _jwtService.GenerateEmailConfirmationToken(registerRequestDto);

                await _emailService.SendAccountConfirmationEmailAsync(
                    registerRequestDto.Email,
                    registrationToken,
                    registerRequestDto.FirstName
                );

                return new AuthResponseDto
                {
                    IsSuccessful = true,
                    //Message = "Đăng ký thành công. Vui lòng trở lại trang home để đăng nhập."
                    Message = "Kiểm tra mail để xác nhận tài khoản"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi trong quá trình đăng ký: {ex.Message}");
                return new AuthResponseDto
                {
                    IsSuccessful = false,
                    Message = "Đã xảy ra lỗi trong quá trình đăng ký."
                };
            }

        }

        public Task<AuthResponseDto> RegisterWithTokenOnlyAsync(RegisterRequestDto registerDto)
        {
            throw new NotImplementedException();
        }

        public Task<AuthResponseDto> ResetPasswordAsync(ChangePasswordDto changePasswordDto)
        {
            throw new NotImplementedException();
        }
    }
}