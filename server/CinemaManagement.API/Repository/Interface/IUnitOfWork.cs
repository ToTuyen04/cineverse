namespace CinemaManagement.API.Repository.Interface
{
    public interface IUnitOfWork
    {
        IRankRepository RankRepo { get; }
        IUserRepository UserRepo { get; }
        IStaffRepository StaffRepo { get; }
        IRoomRepository RoomRepo { get; }
        IChairRepository ChairRepo { get; }
        IChairShowtimeRepository ChairShowtimeRepo { get; }
        IFnbRepository FnbRepo { get; }
        IGenresRepository GenresRepo { get; }
        IMovieRepository MovieRepo { get; }
        IMovieGenreRepository MovieGenreRepo { get; }
        IComboRepository ComboRepo { get; }
        IComboDetailRepository ComboDetailRepo { get; }
        IOrderRepository OrderRepo { get; }
        IOrderDetailComboRepository OrderDetailComboRepo { get; }
        IOrderDetailTicketRepository OrderDetailTicketRepo { get; }
        IShowtimeRepository ShowtimeRepo { get; }
        ITheaterRepository TheaterRepo { get; }
        ITicketRepository TicketRepo { get; }
        IVoucherRepository VoucherRepo { get; }
        IConfigurationRepository ConfigurationRepo { get; }

        IDashboardRepository DashboardRepo { get; }
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
        Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> GetCurrentTransactionAsync();
    }
}
