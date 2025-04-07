namespace CinemaManagement.API.DTOs.Request
{
    public class VoucherRequestDTO
    {
        public class VoucherCreateDTO
        {
            public string? VoucherName { get; set; }

            public string? VoucherCode { get; set; }

            public string? VoucherDescription { get; set; }

            public DateTime? VoucherStartAt { get; set; }

            public DateTime? VoucherEndAt { get; set; }

            public double? VoucherDiscount { get; set; }

            public decimal? VoucherMaxValue { get; set; }

            public bool? VoucherAvailable { get; set; }
        }

        public class VoucherUpdateDTO
        {
            public string? VoucherName { get; set; }

            public string? VoucherCode { get; set; }

            public string? VoucherDescription { get; set; }

            public DateTime? VoucherStartAt { get; set; }

            public DateTime? VoucherEndAt { get; set; }

            public double? VoucherDiscount { get; set; }

            public decimal? VoucherMaxValue { get; set; }

            public bool? VoucherAvailable { get; set; }
        }
    }
}
