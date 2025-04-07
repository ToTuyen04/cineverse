using System;
using System.Collections.Generic;
using CinemaManagement.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace CinemaManagement.API.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AggregatedCounter> AggregatedCounters { get; set; }

    public virtual DbSet<Chair> Chairs { get; set; }

    public virtual DbSet<ChairShowtime> ChairShowtimes { get; set; }

    public virtual DbSet<ChairType> ChairTypes { get; set; }

    public virtual DbSet<Combo> Combos { get; set; }

    public virtual DbSet<ComboDetail> ComboDetails { get; set; }

    public virtual DbSet<Entities.Configuration> Configurations { get; set; }

    public virtual DbSet<Counter> Counters { get; set; }

    public virtual DbSet<Fnb> Fnbs { get; set; }

    public virtual DbSet<Genre> Genres { get; set; }

    public virtual DbSet<Hash> Hashes { get; set; }

    public virtual DbSet<Job> Jobs { get; set; }

    public virtual DbSet<JobParameter> JobParameters { get; set; }

    public virtual DbSet<JobQueue> JobQueues { get; set; }

    public virtual DbSet<List> Lists { get; set; }

    public virtual DbSet<Movie> Movies { get; set; }

    public virtual DbSet<MovieGenre> MovieGenres { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetailCombo> OrderDetailCombos { get; set; }

    public virtual DbSet<OrderDetailTicket> OrderDetailTickets { get; set; }

    public virtual DbSet<Rank> Ranks { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Room> Rooms { get; set; }

    public virtual DbSet<Schema> Schemas { get; set; }

    public virtual DbSet<ScreenType> ScreenTypes { get; set; }

    public virtual DbSet<Server> Servers { get; set; }

    public virtual DbSet<Set> Sets { get; set; }

    public virtual DbSet<Showtime> Showtimes { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<State> States { get; set; }

    public virtual DbSet<Theater> Theaters { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    private string GetConnectionString()
    {
        IConfiguration config = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", true, true)
                    .Build();
        var strConn = config["ConnectionStrings:DefaultConnectionStringDB"];
        return strConn!;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(GetConnectionString());

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AggregatedCounter>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("PK_HangFire_CounterAggregated");

            entity.ToTable("AggregatedCounter", "HangFire");

            entity.HasIndex(e => e.ExpireAt, "IX_HangFire_AggregatedCounter_ExpireAt").HasFilter("([ExpireAt] IS NOT NULL)");

            entity.Property(e => e.Key).HasMaxLength(100);
            entity.Property(e => e.ExpireAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Chair>(entity =>
        {
            entity.HasKey(e => e.ChairId).HasName("PK__chair__2792CB8BAE8372D4");

            entity.ToTable("chair");

            entity.Property(e => e.ChairId).HasColumnName("chair_id");
            entity.Property(e => e.ChairName)
                .HasMaxLength(255)
                .HasColumnName("chair_name");
            entity.Property(e => e.ChairPosition)
                .HasMaxLength(255)
                .HasColumnName("chair_position");
            entity.Property(e => e.ChairRoomId).HasColumnName("chair_room_id");
            entity.Property(e => e.ChairStatus).HasColumnName("chair_status");
            entity.Property(e => e.ChairTypeId).HasColumnName("chair_type_id");

            entity.HasOne(d => d.ChairRoom).WithMany(p => p.Chairs)
                .HasForeignKey(d => d.ChairRoomId)
                .HasConstraintName("FK__chair__chair_roo__0F624AF8");

            entity.HasOne(d => d.ChairType).WithMany(p => p.Chairs)
                .HasForeignKey(d => d.ChairTypeId)
                .HasConstraintName("FK__chair__chair_typ__123EB7A3");
        });

        modelBuilder.Entity<ChairShowtime>(entity =>
        {
            entity.HasKey(e => e.ChairShowtimeId).HasName("PK__chair_sh__A0E01410011552E6");

            entity.ToTable("chair_showtime");

            entity.HasIndex(e => new { e.ChairId, e.ShowtimeId }, "UQ_chair_showtime").IsUnique();

            entity.Property(e => e.ChairShowtimeId).HasColumnName("chair_showtime_id");
            entity.Property(e => e.Available).HasColumnName("available");
            entity.Property(e => e.ChairId)
                .IsRequired()
                .HasColumnName("chair_id");
            entity.Property(e => e.ShowtimeId)
                .IsRequired()
                .HasColumnName("showtime_id");
            entity.Property(e => e.Version)
                .IsRowVersion()
                .IsConcurrencyToken()
                .HasColumnName("version");

            entity.HasOne(d => d.Chair).WithMany(p => p.ChairShowtimes)
                .HasForeignKey(d => d.ChairId)
                .HasConstraintName("FK__chair_sho__chair__1DB06A4F");

            entity.HasOne(d => d.Showtime).WithMany(p => p.ChairShowtimes)
                .HasForeignKey(d => d.ShowtimeId)
                .HasConstraintName("FK__chair_sho__showt__1EA48E88");
        });

        modelBuilder.Entity<ChairType>(entity =>
        {
            entity.HasKey(e => e.ChairTypeId).HasName("PK__chair_ty__5BCABA8A9459541C");

            entity.ToTable("chair_type");

            entity.Property(e => e.ChairTypeId).HasColumnName("chair_type_id");
            entity.Property(e => e.ChairPrice)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("chair_price");
            entity.Property(e => e.ChairTypeName)
                .HasMaxLength(255)
                .HasColumnName("chair_type_name");
        });

        modelBuilder.Entity<Combo>(entity =>
        {
            entity.HasKey(e => e.ComboId).HasName("PK__combo__18F74AA30035372E");

            entity.ToTable("combo");

            entity.Property(e => e.ComboId).HasColumnName("combo_id");
            entity.Property(e => e.ComboAvailable).HasColumnName("combo_available");
            entity.Property(e => e.ComboCreateAt)
                .HasColumnType("datetime")
                .HasColumnName("combo_createAt");
            entity.Property(e => e.ComboCreateBy).HasColumnName("combo_createBy");
            entity.Property(e => e.ComboDescription)
                .HasMaxLength(500)
                .HasColumnName("combo_description");
            entity.Property(e => e.ComboDiscount).HasColumnName("combo_discount");
            entity.Property(e => e.ComboImage)
                .HasMaxLength(255)
                .HasColumnName("combo_image");
            entity.Property(e => e.ComboName)
                .HasMaxLength(255)
                .HasColumnName("combo_name");
            entity.Property(e => e.ComboSearchName)
                .HasMaxLength(255)
                .HasColumnName("combo_search_name");
            entity.Property(e => e.ComboType)
                .HasMaxLength(255)
                .HasColumnName("combo_type");

            entity.HasOne(d => d.ComboCreateByNavigation).WithMany(p => p.Combos)
                .HasForeignKey(d => d.ComboCreateBy)
                .HasConstraintName("FK__combo__combo_cre__1332DBDC");
        });

        modelBuilder.Entity<ComboDetail>(entity =>
        {
            entity.HasKey(e => e.ComboDetailId).HasName("PK__combo_de__5F32E6E2B5FBAFAA");

            entity.ToTable("combo_detail");

            entity.Property(e => e.ComboDetailId).HasColumnName("combo_detail_id");
            entity.Property(e => e.ComboId).HasColumnName("combo_id");
            entity.Property(e => e.FnbId).HasColumnName("fnb_id");
            entity.Property(e => e.Quantity).HasColumnName("quantity");

            entity.HasOne(d => d.Combo).WithMany(p => p.ComboDetails)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__combo_det__combo__14270015");

            entity.HasOne(d => d.Fnb).WithMany(p => p.ComboDetails)
                .HasForeignKey(d => d.FnbId)
                .HasConstraintName("FK__combo_det__fnb_i__151B244E");
        });

        modelBuilder.Entity<Entities.Configuration>(entity =>
        {
            entity.HasKey(e => e.ConfigurationId).HasName("PK__configur__BC79D0A2BAF1DAB0");

            entity.ToTable("configuration");

            entity.Property(e => e.ConfigurationId).HasColumnName("configuration_id");
            entity.Property(e => e.ConfigurationContent)
                .HasMaxLength(255)
                .HasColumnName("configuration_content");
            entity.Property(e => e.ConfigurationDefaultContent)
                .HasMaxLength(255)
                .HasColumnName("configuration_default_content");
            entity.Property(e => e.ConfigurationDescription)
                .HasMaxLength(255)
                .HasColumnName("configuration_description");
            entity.Property(e => e.ConfigurationName)
                .HasMaxLength(255)
                .HasColumnName("configuration_name");
            entity.Property(e => e.ConfigurationUnit)
                .HasMaxLength(20)
                .HasColumnName("configuration_unit");
        });

        modelBuilder.Entity<Counter>(entity =>
        {
            entity.HasKey(e => new { e.Key, e.Id }).HasName("PK_HangFire_Counter");

            entity.ToTable("Counter", "HangFire");

            entity.Property(e => e.Key).HasMaxLength(100);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.ExpireAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Fnb>(entity =>
        {
            entity.HasKey(e => e.FnbId).HasName("PK__fnb__5A2BF5CED13B3119");

            entity.ToTable("fnb");

            entity.Property(e => e.FnbId).HasColumnName("fnb_id");
            entity.Property(e => e.FnbAvailable).HasColumnName("fnb_available");
            entity.Property(e => e.FnbListPrice)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("fnb_list_price");
            entity.Property(e => e.FnbName)
                .HasMaxLength(255)
                .HasColumnName("fnb_name");
            entity.Property(e => e.FnbSearchName)
                .HasMaxLength(255)
                .HasColumnName("fnb_search_name");
            entity.Property(e => e.FnbType)
                .HasMaxLength(255)
                .HasColumnName("fnb_type");
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.GenresId).HasName("PK__genres__610240AC7AE51443");

            entity.ToTable("genres");

            entity.Property(e => e.GenresId).HasColumnName("genres_id");
            entity.Property(e => e.GenresContent)
                .HasMaxLength(500)
                .HasColumnName("genres_content");
            entity.Property(e => e.GenresName)
                .HasMaxLength(255)
                .HasColumnName("genres_name");
        });

        modelBuilder.Entity<Hash>(entity =>
        {
            entity.HasKey(e => new { e.Key, e.Field }).HasName("PK_HangFire_Hash");

            entity.ToTable("Hash", "HangFire");

            entity.HasIndex(e => e.ExpireAt, "IX_HangFire_Hash_ExpireAt").HasFilter("([ExpireAt] IS NOT NULL)");

            entity.Property(e => e.Key).HasMaxLength(100);
            entity.Property(e => e.Field).HasMaxLength(100);
        });

        modelBuilder.Entity<Job>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_HangFire_Job");

            entity.ToTable("Job", "HangFire");

            entity.HasIndex(e => e.ExpireAt, "IX_HangFire_Job_ExpireAt").HasFilter("([ExpireAt] IS NOT NULL)");

            entity.HasIndex(e => e.StateName, "IX_HangFire_Job_StateName").HasFilter("([StateName] IS NOT NULL)");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.ExpireAt).HasColumnType("datetime");
            entity.Property(e => e.StateName).HasMaxLength(20);
        });

        modelBuilder.Entity<JobParameter>(entity =>
        {
            entity.HasKey(e => new { e.JobId, e.Name }).HasName("PK_HangFire_JobParameter");

            entity.ToTable("JobParameter", "HangFire");

            entity.Property(e => e.Name).HasMaxLength(40);

            entity.HasOne(d => d.Job).WithMany(p => p.JobParameters)
                .HasForeignKey(d => d.JobId)
                .HasConstraintName("FK_HangFire_JobParameter_Job");
        });

        modelBuilder.Entity<JobQueue>(entity =>
        {
            entity.HasKey(e => new { e.Queue, e.Id }).HasName("PK_HangFire_JobQueue");

            entity.ToTable("JobQueue", "HangFire");

            entity.Property(e => e.Queue).HasMaxLength(50);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.FetchedAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<List>(entity =>
        {
            entity.HasKey(e => new { e.Key, e.Id }).HasName("PK_HangFire_List");

            entity.ToTable("List", "HangFire");

            entity.HasIndex(e => e.ExpireAt, "IX_HangFire_List_ExpireAt").HasFilter("([ExpireAt] IS NOT NULL)");

            entity.Property(e => e.Key).HasMaxLength(100);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.ExpireAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Movie>(entity =>
        {
            entity.HasKey(e => e.MovieId).HasName("PK__movie__83CDF7495635156A");

            entity.ToTable("movie");

            entity.Property(e => e.MovieId).HasColumnName("movie_id");
            entity.Property(e => e.MovieActor)
                .HasMaxLength(500)
                .HasColumnName("movie_actor");
            entity.Property(e => e.MovieAvailable).HasColumnName("movie_available");
            entity.Property(e => e.MovieBrand)
                .HasMaxLength(255)
                .HasColumnName("movie_brand");
            entity.Property(e => e.MovieContent)
                .HasMaxLength(1000)
                .HasColumnName("movie_content");
            entity.Property(e => e.MovieCreatAt)
                .HasColumnType("datetime")
                .HasColumnName("movie_creatAt");
            entity.Property(e => e.MovieCreatedBy).HasColumnName("movie_createdBy");
            entity.Property(e => e.MovieDirector)
                .HasMaxLength(255)
                .HasColumnName("movie_director");
            entity.Property(e => e.MovieDuration).HasColumnName("movie_duration");
            entity.Property(e => e.MovieEndAt)
                .HasColumnType("datetime")
                .HasColumnName("movie_endAt");
            entity.Property(e => e.MovieName)
                .HasMaxLength(255)
                .HasColumnName("movie_name");
            entity.Property(e => e.MoviePoster)
                .HasMaxLength(255)
                .HasColumnName("movie_poster");
            entity.Property(e => e.MovieSearchName)
                .HasMaxLength(255)
                .HasColumnName("movie_search_name");
            entity.Property(e => e.MovieStartAt)
                .HasColumnType("datetime")
                .HasColumnName("movie_startAt");
            entity.Property(e => e.MovieTrailer)
                .HasMaxLength(255)
                .HasColumnName("movie_trailer");
            entity.Property(e => e.MovieUpdateBy).HasColumnName("movie_updateBy");
            entity.Property(e => e.MovieVersion).HasColumnName("movie_version");

            entity.HasOne(d => d.MovieCreatedByNavigation).WithMany(p => p.MovieMovieCreatedByNavigations)
                .HasForeignKey(d => d.MovieCreatedBy)
                .HasConstraintName("FK__movie__movie_cre__08B54D69");

            entity.HasOne(d => d.MovieUpdateByNavigation).WithMany(p => p.MovieMovieUpdateByNavigations)
                .HasForeignKey(d => d.MovieUpdateBy)
                .HasConstraintName("FK__movie__movie_upd__09A971A2");
        });

        modelBuilder.Entity<MovieGenre>(entity =>
        {
            entity.HasKey(e => e.MovieGenresId).HasName("PK__movie_ge__3A7407F1F2D90D38");

            entity.ToTable("movie_genres");

            entity.Property(e => e.MovieGenresId).HasColumnName("movie_genres_id");
            entity.Property(e => e.GenresId).HasColumnName("genres_id");
            entity.Property(e => e.MovieId).HasColumnName("movie_id");

            entity.HasOne(d => d.Genres).WithMany(p => p.MovieGenres)
                .HasForeignKey(d => d.GenresId)
                .HasConstraintName("FK__movie_gen__genre__0B91BA14");

            entity.HasOne(d => d.Movie).WithMany(p => p.MovieGenres)
                .HasForeignKey(d => d.MovieId)
                .HasConstraintName("FK__movie_gen__movie__0A9D95DB");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__order__46596229CDA20046");

            entity.ToTable("order");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.OrderCreateAt)
                .HasColumnType("datetime")
                .HasColumnName("order_createAt");
            entity.Property(e => e.OrderEmail)
                .HasMaxLength(255)
                .HasColumnName("order_email");
            entity.Property(e => e.OrderName)
                .HasMaxLength(255)
                .HasColumnName("order_name");
            entity.Property(e => e.OrderPhone)
                .HasMaxLength(255)
                .HasColumnName("order_phone");
            entity.Property(e => e.OrderStatus)
                .HasMaxLength(255)
                .HasColumnName("order_status");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__order__user_id__17F790F9");

            entity.HasOne(d => d.Voucher).WithMany(p => p.Orders)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__order__voucher_i__18EBB532");
        });

        modelBuilder.Entity<OrderDetailCombo>(entity =>
        {
            entity.HasKey(e => e.OrderDetailComboId).HasName("PK__order_de__D35E97F8D90EE80E");

            entity.ToTable("order_detail_combo");

            entity.Property(e => e.OrderDetailComboId).HasColumnName("order_detail_combo_id");
            entity.Property(e => e.ComboId).HasColumnName("combo_id");
            entity.Property(e => e.OrderDetailComboPrice)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("order_detail_combo_price");
            entity.Property(e => e.OrderDetailComboQuantity).HasColumnName("order_detail_combo_quantity");
            entity.Property(e => e.OrderId).HasColumnName("order_id");

            entity.HasOne(d => d.Combo).WithMany(p => p.OrderDetailCombos)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__order_det__combo__1CBC4616");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetailCombos)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__order_det__order__1BC821DD");
        });

        modelBuilder.Entity<OrderDetailTicket>(entity =>
        {
            entity.HasKey(e => e.OrderDetailTicketId).HasName("PK__order_de__B13DE74D11BFCCDA");

            entity.ToTable("order_detail_ticket");

            entity.Property(e => e.OrderDetailTicketId).HasColumnName("order_detail_ticket_id");
            entity.Property(e => e.OrderDetailTicketPrice)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("order_detail_ticket_price");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.TicketId).HasColumnName("ticket_id");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetailTickets)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__order_det__order__19DFD96B");

            entity.HasOne(d => d.Ticket).WithMany(p => p.OrderDetailTickets)
                .HasForeignKey(d => d.TicketId)
                .HasConstraintName("FK__order_det__ticke__1AD3FDA4");
        });

        modelBuilder.Entity<Rank>(entity =>
        {
            entity.HasKey(e => e.RankId).HasName("PK__rank__14ADF0B21116DAB1");

            entity.ToTable("rank");

            entity.Property(e => e.RankId).HasColumnName("rank_id");
            entity.Property(e => e.RankDiscount).HasColumnName("rank_discount");
            entity.Property(e => e.RankMilestone).HasColumnName("rank_milestone");
            entity.Property(e => e.RankName)
                .HasMaxLength(255)
                .HasColumnName("rank_name");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__role__760965CCB062F4C2");

            entity.ToTable("role");

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.RoleName)
                .HasMaxLength(255)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<Room>(entity =>
        {
            entity.HasKey(e => e.RoomId).HasName("PK__room__19675A8AD37B17CC");

            entity.ToTable("room");

            entity.Property(e => e.RoomId).HasColumnName("room_id");
            entity.Property(e => e.RoomChairAmount).HasColumnName("room_chair_amount");
            entity.Property(e => e.RoomName)
                .HasMaxLength(255)
                .HasColumnName("room_name");
            entity.Property(e => e.RoomScreenTypeId).HasColumnName("room_screen_type_id");
            entity.Property(e => e.RoomTheaterId).HasColumnName("room_theater_id");

            entity.HasOne(d => d.RoomScreenType).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.RoomScreenTypeId)
                .HasConstraintName("FK__room__room_scree__0D7A0286");

            entity.HasOne(d => d.RoomTheater).WithMany(p => p.Rooms)
                .HasForeignKey(d => d.RoomTheaterId)
                .HasConstraintName("FK__room__room_theat__0E6E26BF");
        });

        modelBuilder.Entity<Schema>(entity =>
        {
            entity.HasKey(e => e.Version).HasName("PK_HangFire_Schema");

            entity.ToTable("Schema", "HangFire");

            entity.Property(e => e.Version).ValueGeneratedNever();
        });

        modelBuilder.Entity<ScreenType>(entity =>
        {
            entity.HasKey(e => e.ScreenTypeId).HasName("PK__screen_t__66979345F768CEB2");

            entity.ToTable("screen_type");

            entity.Property(e => e.ScreenTypeId).HasColumnName("screen_type_id");
            entity.Property(e => e.ScreenPrice)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("screen_price");
            entity.Property(e => e.ScreenTypeName)
                .HasMaxLength(255)
                .HasColumnName("screen_type_name");
        });

        modelBuilder.Entity<Server>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_HangFire_Server");

            entity.ToTable("Server", "HangFire");

            entity.HasIndex(e => e.LastHeartbeat, "IX_HangFire_Server_LastHeartbeat");

            entity.Property(e => e.Id).HasMaxLength(200);
            entity.Property(e => e.LastHeartbeat).HasColumnType("datetime");
        });

        modelBuilder.Entity<Set>(entity =>
        {
            entity.HasKey(e => new { e.Key, e.Value }).HasName("PK_HangFire_Set");

            entity.ToTable("Set", "HangFire");

            entity.HasIndex(e => e.ExpireAt, "IX_HangFire_Set_ExpireAt").HasFilter("([ExpireAt] IS NOT NULL)");

            entity.HasIndex(e => new { e.Key, e.Score }, "IX_HangFire_Set_Score");

            entity.Property(e => e.Key).HasMaxLength(100);
            entity.Property(e => e.Value).HasMaxLength(256);
            entity.Property(e => e.ExpireAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<Showtime>(entity =>
        {
            entity.HasKey(e => e.ShowtimeId).HasName("PK__showtime__A406B5185375A7E7");

            entity.ToTable("showtime");

            entity.Property(e => e.ShowtimeId).HasColumnName("showtime_id");
            entity.Property(e => e.ShowtimeAvailable).HasColumnName("showtime_available");
            entity.Property(e => e.ShowtimeCreatedBy).HasColumnName("showtime_createdBy");
            entity.Property(e => e.ShowtimeMovieId).HasColumnName("showtime_movie_id");
            entity.Property(e => e.ShowtimeRoomId).HasColumnName("showtime_room_id");
            entity.Property(e => e.ShowtimeStartAt)
                .HasColumnType("datetime")
                .HasColumnName("showtime_startAt");

            entity.HasOne(d => d.ShowtimeMovie).WithMany(p => p.Showtimes)
                .HasForeignKey(d => d.ShowtimeMovieId)
                .HasConstraintName("FK__showtime__showti__10566F31");

            entity.HasOne(d => d.ShowtimeRoom).WithMany(p => p.Showtimes)
                .HasForeignKey(d => d.ShowtimeRoomId)
                .HasConstraintName("FK__showtime__showti__114A936A");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.StaffId).HasName("PK__staff__1963DD9C82623206");

            entity.ToTable("staff");

            entity.Property(e => e.StaffId).HasColumnName("staff_id");
            entity.Property(e => e.StaffAvatar)
                .HasMaxLength(255)
                .HasColumnName("staff_avatar");
            entity.Property(e => e.StaffCreateAt)
                .HasColumnType("datetime")
                .HasColumnName("staff_createAt");
            entity.Property(e => e.StaffDateOfBirth).HasColumnName("staff_date_of_birth");
            entity.Property(e => e.StaffEmail)
                .HasMaxLength(255)
                .HasColumnName("staff_email");
            entity.Property(e => e.StaffFirstName)
                .HasMaxLength(50)
                .HasColumnName("staff_first_name");
            entity.Property(e => e.StaffGender).HasColumnName("staff_gender");
            entity.Property(e => e.StaffLastName)
                .HasMaxLength(50)
                .HasColumnName("staff_last_name");
            entity.Property(e => e.StaffPassword)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("staff_password");
            entity.Property(e => e.StaffPhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("staff_phone_number");
            entity.Property(e => e.StaffRoleId).HasColumnName("staff_role_id");
            entity.Property(e => e.StaffSearchName)
                .HasMaxLength(255)
                .HasColumnName("staff_search_name");
            entity.Property(e => e.StaffStatus).HasColumnName("staff_status");
            entity.Property(e => e.StaffTheaterId).HasColumnName("staff_theater_id");

            entity.HasOne(d => d.StaffRole).WithMany(p => p.Staff)
                .HasForeignKey(d => d.StaffRoleId)
                .HasConstraintName("FK__staff__staff_rol__07C12930");

            entity.HasOne(d => d.StaffTheater).WithMany(p => p.Staff)
                .HasForeignKey(d => d.StaffTheaterId)
                .HasConstraintName("FK__staff__staff_the__0C85DE4D");
        });

        modelBuilder.Entity<State>(entity =>
        {
            entity.HasKey(e => new { e.JobId, e.Id }).HasName("PK_HangFire_State");

            entity.ToTable("State", "HangFire");

            entity.HasIndex(e => e.CreatedAt, "IX_HangFire_State_CreatedAt");

            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Name).HasMaxLength(20);
            entity.Property(e => e.Reason).HasMaxLength(100);

            entity.HasOne(d => d.Job).WithMany(p => p.States)
                .HasForeignKey(d => d.JobId)
                .HasConstraintName("FK_HangFire_State_Job");
        });

        modelBuilder.Entity<Theater>(entity =>
        {
            entity.HasKey(e => e.TheaterId).HasName("PK__theater__B53C958F43C9504A");

            entity.ToTable("theater");

            entity.Property(e => e.TheaterId).HasColumnName("theater_id");
            entity.Property(e => e.TheaterHotline)
                .HasMaxLength(255)
                .HasColumnName("theater_hotline");
            entity.Property(e => e.TheaterLocation)
                .HasMaxLength(500)
                .HasColumnName("theater_location");
            entity.Property(e => e.TheaterName)
                .HasMaxLength(255)
                .HasColumnName("theater_name");
            entity.Property(e => e.TheaterSearchName)
                .HasMaxLength(255)
                .HasColumnName("theater_search_name");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.TicketId).HasName("PK__ticket__D596F96BC4E84E93");

            entity.ToTable("ticket");

            entity.Property(e => e.TicketId).HasColumnName("ticket_id");
            entity.Property(e => e.ChairId).HasColumnName("chair_id");
            entity.Property(e => e.ShowtimeId).HasColumnName("showtime_id");
            entity.Property(e => e.TicketCode)
                .HasMaxLength(255)
                .HasColumnName("ticket_code");

            entity.HasOne(d => d.Showtime).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.ShowtimeId)
                .HasConstraintName("FK__ticket__showtime__17036CC0");

            entity.HasOne(d => d.ChairShowtime).WithMany(p => p.Tickets)
                .HasPrincipalKey(p => new { p.ChairId, p.ShowtimeId })
                .HasForeignKey(d => new { d.ChairId, d.ShowtimeId })
                .HasConstraintName("FK_ticket_chair_showtime");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__user__B9BE370F3884A42A");

            entity.ToTable("user");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.RankId).HasColumnName("rank_id");
            entity.Property(e => e.UserAvatar)
                .HasMaxLength(255)
                .HasColumnName("user_avatar");
            entity.Property(e => e.UserCreateAt)
                .HasColumnType("datetime")
                .HasColumnName("user_createAt");
            entity.Property(e => e.UserDateOfBirth).HasColumnName("user_date_of_birth");
            entity.Property(e => e.UserEmail)
                .HasMaxLength(255)
                .HasColumnName("user_email");
            entity.Property(e => e.UserFirstName)
                .HasMaxLength(50)
                .HasColumnName("user_first_name");
            entity.Property(e => e.UserGender).HasColumnName("user_gender");
            entity.Property(e => e.UserLastName)
                .HasMaxLength(50)
                .HasColumnName("user_last_name");
            entity.Property(e => e.UserPassword)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("user_password");
            entity.Property(e => e.UserPhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("user_phone_number");
            entity.Property(e => e.UserPoint).HasColumnName("user_point");
            entity.Property(e => e.UserSearchName)
                .HasMaxLength(255)
                .HasColumnName("user_search_name");
            entity.Property(e => e.UserStatus).HasColumnName("user_status");

            entity.HasOne(d => d.Rank).WithMany(p => p.Users)
                .HasForeignKey(d => d.RankId)
                .HasConstraintName("FK__user__rank_id__160F4887");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.VoucherId).HasName("PK__voucher__80B6FFA89B176655");

            entity.ToTable("voucher");

            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");
            entity.Property(e => e.VoucherAvailable).HasColumnName("voucher_available");
            entity.Property(e => e.VoucherCode)
                .HasMaxLength(255)
                .HasColumnName("voucher_code");
            entity.Property(e => e.VoucherCreateAt)
                .HasColumnType("datetime")
                .HasColumnName("voucher_createAt");
            entity.Property(e => e.VoucherDescription)
                .HasMaxLength(500)
                .HasColumnName("voucher_description");
            entity.Property(e => e.VoucherDiscount).HasColumnName("voucher_discount");
            entity.Property(e => e.VoucherEndAt)
                .HasColumnType("datetime")
                .HasColumnName("voucher_endAt");
            entity.Property(e => e.VoucherMaxValue)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("voucher_maxValue");
            entity.Property(e => e.VoucherName)
                .HasMaxLength(255)
                .HasColumnName("voucher_name");
            entity.Property(e => e.VoucherSearchName)
                .HasMaxLength(255)
                .HasColumnName("voucher_search_name");
            entity.Property(e => e.VoucherStartAt)
                .HasColumnType("datetime")
                .HasColumnName("voucher_startAt");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
