using AutoMapper;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.DTOs.Mapper
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            // Mapping từ Order sang OrderResponseDTO
            CreateMap<Order, OrderResponseDTO>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.OrderCreateAt, opt => opt.MapFrom(src => src.OrderCreateAt))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.VoucherId, opt => opt.MapFrom(src => src.VoucherId))
                .ForMember(dest => dest.OrderName, opt => opt.MapFrom(src => src.OrderName))
                .ForMember(dest => dest.OrderEmail, opt => opt.MapFrom(src => src.OrderEmail))
                .ForMember(dest => dest.OrderPhone, opt => opt.MapFrom(src => src.OrderPhone))
                .ForMember(dest => dest.OrderStatus, opt => opt.MapFrom(src => src.OrderStatus))
                .ForMember(dest => dest.PaymentPrice, opt => opt.Ignore())
                .ForMember(dest => dest.DiscountPrice, opt => opt.Ignore())
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore());


            // Mapping từ Order sang OrderDetailResponseDTO
            CreateMap<Order, OrderDetailResponseDTO>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.OrderId))
                .ForMember(dest => dest.OrderCreateAt, opt => opt.MapFrom(src => src.OrderCreateAt))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.OrderStatus, opt => opt.MapFrom(src => src.OrderStatus))
                .ForMember(dest => dest.OrderName, opt => opt.MapFrom(src => src.OrderName))
                .ForMember(dest => dest.OrderEmail, opt => opt.MapFrom(src => src.OrderEmail))
                .ForMember(dest => dest.OrderPhone, opt => opt.MapFrom(src => src.OrderPhone))
                .ForMember(dest => dest.PaymentPrice, opt => opt.Ignore())
                .ForMember(dest => dest.DiscountPrice, opt => opt.Ignore())
                .ForMember(dest => dest.TotalPrice, opt => opt.Ignore());

            // Map thông tin suất chiếu từ OrderDetailTickets -> Ticket -> Showtime
            CreateMap<Ticket, ShowtimeInfoDTO>()
            .ForMember(dest => dest.ShowtimeId, opt => opt.MapFrom(src =>
                src.OrderDetailTickets != null && src.OrderDetailTickets.Any() &&
                src.OrderDetailTickets.First().Ticket != null ?
                src.OrderDetailTickets.First().Ticket.Showtime.ShowtimeId : 0))
            .ForMember(dest => dest.MovieName, opt => opt.MapFrom(src =>
                src.OrderDetailTickets != null && src.OrderDetailTickets.Any() &&
                src.OrderDetailTickets.First().Ticket != null ?
                src.OrderDetailTickets.First().Ticket.Showtime.ShowtimeMovie.MovieName : null))
            .ForMember(dest => dest.TheaterName, opt => opt.MapFrom(src =>
                src.OrderDetailTickets != null && src.OrderDetailTickets.Any() &&
                src.OrderDetailTickets.First().Ticket != null ?
                src.OrderDetailTickets.First().Ticket.Showtime.ShowtimeRoom.RoomTheater.TheaterName : null))
            .ForMember(dest => dest.RoomName, opt => opt.MapFrom(src =>
                src.OrderDetailTickets != null && src.OrderDetailTickets.Any() &&
                src.OrderDetailTickets.First().Ticket != null ?
                src.OrderDetailTickets.First().Ticket.Showtime.ShowtimeRoom.RoomName : null))
            .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src =>
                src.OrderDetailTickets != null && src.OrderDetailTickets.Any() &&
                src.OrderDetailTickets.First().Ticket != null ?
                src.OrderDetailTickets.First().Ticket.Showtime.ShowtimeStartAt : null));
                
               

            // Mapping từ OrderDetailTicket sang OrderDetailItemDTO
            CreateMap<OrderDetailTicket, OrderDetailItemDTO>()
                .ForMember(dest => dest.OrderDetailId, opt => opt.MapFrom(src => src.OrderDetailTicketId))
                .ForMember(dest => dest.TicketId, opt => opt.MapFrom(src => src.TicketId))
                .ForMember(dest => dest.TicketCode, opt => opt.MapFrom(src => src.Ticket != null ? src.Ticket.TicketCode : null))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.OrderDetailTicketPrice))
                // Map thông tin ghế 
                .ForMember(dest => dest.ChairId, opt => opt.MapFrom(src =>
                    src.Ticket != null && src.Ticket.ChairShowtime != null ?
                    src.Ticket.ChairShowtime.ChairId : null))
                .ForMember(dest => dest.ChairName, opt => opt.MapFrom(src =>
                    src.Ticket != null && src.Ticket.ChairShowtime != null ? src.Ticket.ChairShowtime.Chair.ChairName : null))
                .ForMember(dest => dest.ChairType, opt => opt.MapFrom(src =>
                    src.Ticket != null && src.Ticket.ChairShowtime != null && src.Ticket.ChairShowtime.Chair.ChairType != null ?
                    src.Ticket.ChairShowtime.Chair.ChairType.ChairTypeName : null))
                .ForMember(dest => dest.ChairPosition, opt => opt.MapFrom(src =>
                    src.Ticket != null && src.Ticket.ChairShowtime != null ?
                    $"{src.Ticket.ChairShowtime.Chair.ChairPosition}" : null));

            
        }
    }
}
