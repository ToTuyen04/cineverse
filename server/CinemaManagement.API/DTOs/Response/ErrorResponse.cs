using System.Text.Json.Serialization;

namespace CinemaManagement.API.DTOs.Response
{
    public class ErrorResponse : ApiResponse
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string ErrorCode { get; set; }

        private ErrorResponse() { } // Private constructor

        public static ErrorResponse Create(string message, string errorCode)
        {
            return new ErrorResponse
            {
                Success = false,
                Message = message,
                ErrorCode = errorCode
            };
        }
    }
}
