using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;

namespace CinemaManagement.API.DTOs.Response
{
    public class QRResponseDtos
    {
        // DTO tối ưu để lưu trong QR code (tên trường rút gọn)
        public class CompactOrderQRPayload
        {
            [JsonPropertyName("i")]
            public int OrderId { get; set; }

            [JsonPropertyName("t")]
            public string Type { get; set; } // "T" (Ticket) hoặc "F" (Full - vé + combo)

            [JsonPropertyName("e")]
            public long ExpiresAt { get; set; } // Unix timestamp

            [JsonPropertyName("n")]
            public string Nonce { get; set; } // ID duy nhất cho mỗi mã QR

            [JsonPropertyName("s")]
            public string Signature { get; set; } // Chữ ký số xác thực

        }

        // DTO gốc - để tương thích với mã hiện tại
        public class OrderQRPayload
        {
            [JsonPropertyName("id")]
            public int OrderId { get; set; }

            [JsonPropertyName("t")]
            public string Type { get; set; } // "TICKETS" hoặc "FULL" (vé + combo)

            [JsonPropertyName("e")]
            public DateTime ExpiresAt { get; set; }
        }

        public class OrderVerificationResult
        {
            public bool IsValid { get; set; }
            public bool IsUsed { get; set; }
            public string? ErrorMessage { get; set; }
            public bool IsExpired { get; set; }
            public object? OrderInfo { get; set; } // Có thể là OrderQRPayload hoặc TicketQRPayload
            public string PayloadType { get; set; } = "Unknown";
        }
    }
}
