using CinemaManagement.API.DTOs;
using CinemaManagement.API.DTOs.AuthDTOs;
using CinemaManagement.API.Service;
using CinemaManagement.API.Service.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.RegisterAsync(registerDto);
                if (result.IsSuccessful)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in register: {ex.Message}");
                return StatusCode(500, new AuthResponseDto 
                { 
                    IsSuccessful = false, 
                    Message = "Error in register." 
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.LoginAsync(loginDto);
                if (result.IsSuccessful)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in login: {ex.Message}");
                return StatusCode(500, new AuthResponseDto
                { 
                    IsSuccessful = false, 
                    Message = "Error in login." 
                });
            }
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "Token false"
                    });
                }

                var result = await _authService.ConfirmEmailAsync(token);
                if (result.IsSuccessful)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in confirm email: {ex.Message}");
                return StatusCode(500, new AuthResponseDto
                { 
                    IsSuccessful = false, 
                    Message = "Error in confirm email." 
                });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.ForgotPasswordAsync(resetPasswordDto);
                if (result.IsSuccessful)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in forgot password: {ex.Message}");
                return StatusCode(500, new AuthResponseDto
                { 
                    IsSuccessful = false, 
                    Message = "Error interno del servidor al procesar la solicitud de restablecimiento de contraseña." 
                });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.ResetPasswordAsync(changePasswordDto);
                if (result.IsSuccessful)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in reset password: {ex.Message}");
                return StatusCode(500, new AuthResponseDto
                { 
                    IsSuccessful = false, 
                    Message = "Error interno del servidor al restablecer la contraseña." 
                });
            }
        }

        [HttpPost("create-staff")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto createStaffDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Obtener el ID del staff que está creando el nuevo staff (administrador)
                var staffIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(staffIdClaim) || !int.TryParse(staffIdClaim, out int createdByStaffId))
                {
                    return BadRequest(new AuthResponseDto
                    {
                        IsSuccessful = false,
                        Message = "loi gi do"
                    });
                }

                var result = await _authService.CreateStaffAsync(createStaffDto, createdByStaffId);
                if (result.IsSuccessful)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in create staff: {ex.Message}");
                return StatusCode(500, new AuthResponseDto
                { 
                    IsSuccessful = false, 
                    Message = "Error in create staff." 
                });
            }
        }
    }
} 