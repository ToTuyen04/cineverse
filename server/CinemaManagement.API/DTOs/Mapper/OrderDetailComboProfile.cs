using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class OrderDetailComboProfile : Profile
    {
        public OrderDetailComboProfile()
        {
            CreateMap<ComboDetailRequestDto, OrderDetailCombo>()
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => src.ComboId))
                .ForMember(dest => dest.OrderDetailComboQuantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.OrderDetailComboPrice, opt => opt.MapFrom(src => src.Price));

            CreateMap<OrderDetailCombo, ComboDetailResponseDto>()
                .ForMember(dest => dest.OrderDetailComboId, opt => opt.MapFrom(src => src.OrderDetailComboId))
                .ForMember(dest => dest.ComboId, opt => opt.MapFrom(src => src.ComboId))
                .ForMember(dest => dest.ComboName, opt => opt.MapFrom(src => src.Combo.ComboName))
                .ForMember(dest => dest.ComboDescription, opt => opt.MapFrom(src => src.Combo.ComboDescription))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.OrderDetailComboQuantity))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.OrderDetailComboPrice));
        }

    }
}
