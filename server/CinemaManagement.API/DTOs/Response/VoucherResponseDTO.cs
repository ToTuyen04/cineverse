namespace CinemaManagement.API.DTOs.Response
{
    public class VoucherResponseDTO
    {
        public int VoucherId { get; set; }
        
        public string? VoucherName { get; set; }
        
        public string? VoucherCode { get; set; }
        
        public string? VoucherDescription { get; set; }
        
        public DateTime? VoucherCreateAt { get; set; }
        
        public DateTime? VoucherStartAt { get; set; }
        
        public DateTime? VoucherEndAt { get; set; }
        
        public double? VoucherDiscount { get; set; }
        
        public decimal? VoucherMaxValue { get; set; }
        
        public bool? VoucherAvailable { get; set; }
    }

    public class VoucherSimplifiedResponseDTO
    {
        public int VoucherId { get; set; }
        
        public string? VoucherName { get; set; }
        
        public string? VoucherCode { get; set; }
        
        public string? VoucherDescription { get; set; }

        public DateTime? VoucherStartAt { get; set; }

        public DateTime? VoucherEndAt { get; set; }

        public double? VoucherDiscount { get; set; }

        public decimal? VoucherMaxValue { get; set; }
    }
}
