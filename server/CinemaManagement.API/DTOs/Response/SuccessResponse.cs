using System.Text.Json.Serialization;

namespace CinemaManagement.API.DTOs.Response
{
    public class SuccessResponse<T> : ApiResponse
    {
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public T Data { get; set; }

        private SuccessResponse() { }

        public static SuccessResponse<T> Create(T data, string message = null)
        {
            return new SuccessResponse<T>
            {
                Success = true,
                Message = message ?? "Thành công",
                Data = data
            };
        }
    }
}
