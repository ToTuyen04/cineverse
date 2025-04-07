using CinemaManagement.API.DTOs.Response;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;

namespace CinemaManagement.API.ExceptionHandler
{
    public class GlobalExceptionHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger,
            IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                   ex,
                   "Lỗi không mong muốn tại {Path}. Error: {Error}",
                   context.Request.Path,
                   ex.Message
               );
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json; charset=utf-8";


            var (statusCode, response) = exception switch
            {
                ValidationException ex => (
                    StatusCodes.Status400BadRequest,
                    ErrorResponse.Create(ex.Message, "VALIDATION_ERROR")
                ),

                NotFoundException ex => (
                    StatusCodes.Status404NotFound,
                    ErrorResponse.Create(ex.Message, "NOT_FOUND")
                ),

                DbUpdateException ex => HandleDbUpdateException(ex),

                _ => (
                    StatusCodes.Status500InternalServerError,
                    CreateInternalServerError(exception)
                )
            };

            context.Response.StatusCode = statusCode;

            await context.Response.WriteAsJsonAsync(response);
        }

        private static (int StatusCode, ErrorResponse Response) HandleDbUpdateException(DbUpdateException ex)
        {
            var (message, errorCode) = ex.InnerException switch
            {
                SqlException sqlEx => sqlEx.Number switch
                {
                    547 => ("Không thể xóa dữ liệu do ràng buộc khóa ngoại", "DB_FOREIGN_KEY_ERROR"),
                    2601 or 2627 => ("Dữ liệu bị trùng lặp", "DB_DUPLICATE_ERROR"),
                    _ => ("Lỗi thao tác với cơ sở dữ liệu", "DB_ERROR")
                },
                _ => ("Lỗi thao tác với cơ sở dữ liệu", "DB_ERROR")
            };

            return (StatusCodes.Status400BadRequest, ErrorResponse.Create(message, errorCode));
        }
        private ErrorResponse CreateInternalServerError(Exception ex)
        {
            var message = _env.IsDevelopment()
                ? $"Internal Server Error: {ex.Message}"
                : "Đã xảy ra lỗi trong quá trình xử lý";

            return ErrorResponse.Create(message, "INTERNAL_ERROR");
        }

    }
}
