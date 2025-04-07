using AutoMapper;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class PaymentProfile : Profile
    {
        public PaymentProfile()
        {
            // Order -> OrderStatusResponseDTO
            CreateMap<Order, OrderStatusResponseDTO>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.OrderStatus))
                .ForMember(dest => dest.RemainingSeconds, opt => opt.MapFrom(src => 0)); 

            // PaymentResponseDTO mapping
            CreateMap<Order, PaymentUrlResponseDTO>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.PaymentUrl, opt => opt.Ignore()) 
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore())
                .ForMember(dest => dest.DiscountPrice, opt => opt.Ignore())
                .ForMember(dest => dest.PaymentPrice, opt => opt.Ignore())
                .ForMember(dest => dest.RemainingSeconds, opt => opt.Ignore()); 

            // OrderDetail -> PaymentResultResponseDTO
            CreateMap<OrderDetailResponseDTO, PaymentResultResponseDTO>()
                .ForMember(dest => dest.Success, opt => opt.Ignore())
                .ForMember(dest => dest.Message, opt => opt.Ignore())
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.TransactionNo, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetail, opt => opt.MapFrom(src => src));
        }
    }
}
