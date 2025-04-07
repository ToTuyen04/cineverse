using CinemaManagement.API.Data;
using CinemaManagement.API.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CinemaManagement.API.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction _transaction;
        private readonly ILogger<UnitOfWork> _logger;

        public UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger)
        {
            _context = context;
            _logger = logger;
            RankRepo = new RankRepository(_context);
            UserRepo = new UserRepository(_context);
            StaffRepo = new StaffRepository(_context);
            RoomRepo = new RoomRepository(_context);
            ChairRepo = new ChairRepository(_context);
            ChairShowtimeRepo = new ChairShowtimeRepository(_context);
            FnbRepo = new FnbRepository(_context);
            GenresRepo = new GenresRepository(_context);
            MovieRepo = new MovieRepository(_context);
            MovieGenreRepo = new MovieGenreRepository(_context);
            ComboRepo = new ComboRepository(_context);
            ComboDetailRepo = new ComboDetailRepository(_context);
            OrderRepo = new OrderRepository(_context);
            OrderDetailComboRepo = new OrderDetailComboRepository(_context);
            OrderDetailTicketRepo = new OrderDetailTicketRepository(_context);
            TheaterRepo = new TheaterRepository(_context);
            ShowtimeRepo = new ShowtimeRepository(_context);
            TicketRepo = new TicketRepository(_context);
            VoucherRepo = new VoucherRepository(_context);
            ConfigurationRepo = new ConfigurationRepository(_context);
            DashboardRepo = new DashboardRepository(_context);
        }

        public IUserRepository UserRepo { get; set; }

        public IStaffRepository StaffRepo { get; set; }

        public IRoomRepository RoomRepo { get; private set; }

        public IChairRepository ChairRepo { get; private set; }

        public IChairShowtimeRepository ChairShowtimeRepo { get; private set; }

        public IFnbRepository FnbRepo { get; private set; }

        public IGenresRepository GenresRepo { get; private set; }

        public IMovieRepository MovieRepo { get; private set; }

        public IMovieGenreRepository MovieGenreRepo { get; private set; }

        public IComboRepository ComboRepo { get; private set; }

        public IOrderDetailComboRepository OrderDetailComboRepo { get; private set; }

        public IOrderDetailTicketRepository OrderDetailTicketRepo { get; private set; }

        public IShowtimeRepository ShowtimeRepo { get; private set; }

        public ITheaterRepository TheaterRepo { get; private set; }

        public ITicketRepository TicketRepo { get; private set; }

        public IVoucherRepository VoucherRepo { get; private set; }

        public IOrderRepository OrderRepo { get; private set; }

        public IComboDetailRepository ComboDetailRepo { get; private set; }

        public IConfigurationRepository ConfigurationRepo { get; private set; }

        public IRankRepository RankRepo { get; private set; }

        public IDashboardRepository DashboardRepo { get; private set; }

        public async Task BeginTransactionAsync()
        {
            if (_transaction == null)
            {
                _transaction = await _context.Database.BeginTransactionAsync();
                _logger?.LogInformation("Transaction began");
            }
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                if (_transaction != null)
                {
                    await _transaction.CommitAsync();
                    _logger?.LogInformation("Transaction committed");
                    _transaction.Dispose();
                    _transaction = null;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during transaction commit");
                throw;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                if (_transaction != null)
                {
                    await _transaction.RollbackAsync();
                    _logger?.LogInformation("Transaction rolled back");
                    _transaction.Dispose();
                    _transaction = null;
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during transaction rollback");
                throw;
            }
        }

        public async Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> GetCurrentTransactionAsync()
        {
            if (_transaction == null)
            {
                await BeginTransactionAsync();
            }
            return _transaction;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
