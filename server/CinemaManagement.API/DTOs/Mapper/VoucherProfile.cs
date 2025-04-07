using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class VoucherProfile : Profile
    {
        public VoucherProfile()
        {
            CreateMap<VoucherRequestDTO, Voucher>();
            
            // Map from entity to response DTO and calculate VoucherAvailable
            CreateMap<Voucher, VoucherResponseDTO>()
                .ForMember(dest => dest.VoucherAvailable, opt => opt.MapFrom(src => 
                    src.VoucherStartAt <= System.DateTime.Now && src.VoucherEndAt >= System.DateTime.Now));

            // Map from create DTO to entity and calculate VoucherAvailable
            CreateMap<VoucherRequestDTO.VoucherCreateDTO, Voucher>()
                .ForMember(dest => dest.VoucherAvailable, opt => opt.MapFrom(src => 
                    src.VoucherStartAt <= System.DateTime.Now && src.VoucherEndAt >= System.DateTime.Now));
                
            // Map from update DTO to entity and calculate VoucherAvailable
            CreateMap<VoucherRequestDTO.VoucherUpdateDTO, Voucher>()
                .ForMember(dest => dest.VoucherAvailable, opt => opt.MapFrom(src => 
                    src.VoucherStartAt <= System.DateTime.Now && src.VoucherEndAt >= System.DateTime.Now));

            CreateMap<Voucher, VoucherRequestDTO.VoucherUpdateDTO>();
            
            // Map Voucher to simplified response DTO with only essential fields
            CreateMap<Voucher, VoucherSimplifiedResponseDTO>();
        }
    }
}
