using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class ComboProfile : Profile
    {
        public ComboProfile()
        {
            // Map Combo to ComboResponseDTO including ComboDetails
            CreateMap<Combo, ComboResponseDTO>()
                .ForMember(dest => dest.ComboCreatedAt, opt => opt.MapFrom(src => src.ComboCreateAt))
                .ForMember(dest => dest.ComboCreatedBy, opt => opt.MapFrom(src => src.ComboCreateBy))
                .ForMember(dest => dest.ComboDetails, opt => opt.MapFrom(src => src.ComboDetails));

            // Map CreateComboDTO to Combo
            CreateMap<ComboRequestDTO.CreateComboDTO, Combo>()
                .ForMember(dest => dest.ComboCreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDetails, opt => opt.Ignore())
                .ForMember(dest => dest.ComboCreateByNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetailCombos, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDescription, opt => opt.Ignore())
                .ForMember(dest => dest.ComboAvailable, opt => opt.Ignore())
                .ForMember(dest => dest.ComboSearchName, opt => opt.Ignore());

            // Map UpdateComboDTO to Combo
            CreateMap<ComboRequestDTO.UpdateComboDTO, Combo>()
                .ForMember(dest => dest.ComboCreateAt, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDetails, opt => opt.Ignore())
                .ForMember(dest => dest.ComboCreateByNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.OrderDetailCombos, opt => opt.Ignore())
                .ForMember(dest => dest.ComboDescription, opt => opt.Ignore())
                .ForMember(dest => dest.ComboSearchName, opt => opt.Ignore())
                .ForMember(dest => dest.ComboCreateBy, opt => opt.Ignore());

            // ComboDetail mappings
            CreateMap<ComboDetailRequestDTO, ComboDetail>()
                .ForMember(dest => dest.ComboDetailId, opt => opt.Ignore())
                .ForMember(dest => dest.Combo, opt => opt.Ignore())
                .ForMember(dest => dest.Fnb, opt => opt.Ignore());

            CreateMap<ComboDetail, ComboDetailResponseDTO>()
                .ForMember(dest => dest.FnbName, opt => opt.MapFrom(src => src.Fnb.FnbName))
                .ForMember(dest => dest.FnbPrice, opt => opt.MapFrom(src => src.Fnb.FnbListPrice));
        }
    }
}
