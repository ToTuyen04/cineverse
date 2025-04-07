using CinemaManagement.API.Data;
using CinemaManagement.API.DTOs.Mapper;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Repository;
using CinemaManagement.API.Service.Interface;
using CinemaManagement.API.Service;
using Microsoft.EntityFrameworkCore;
using Autofac.Extensions.DependencyInjection;
using Autofac;
using CloudinaryDotNet;
using CinemaManagement.API.DependencyInjection;
using Microsoft.AspNetCore.Diagnostics;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.BackgroundServices;
using Hangfire;
using CinemaManagement.API.Controllers;
using Microsoft.AspNetCore.DataProtection;
using CinemaManagement.API.Configuration;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace CinemaManagement.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Cho phép chuyển đổi string thành enum 
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());

                    // Cấu hình tùy chọn khác nếu cần
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionStringDB"));
            });
            //builder.Services.AddCors(options =>
            //{
            //    options.AddPolicy("AllowReactApp",
            //        policy => policy.WithOrigins(
            //                "http://localhost:5173")
            //            .AllowAnyMethod()
            //            .AllowAnyHeader());
            //});

            // Cấu hình Hangfire sử dụng SQL Server
            builder.Services.AddHangfire(config =>
                config.SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
                      .UseSimpleAssemblyNameTypeSerializer()
                      .UseRecommendedSerializerSettings()
                      .UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnectionStringDB")));

            // Khởi chạy Hangfire Server
            builder.Services.AddHangfireServer();

            // Register AutoMapper
            builder.Services.AddAutoMapper(typeof(GenresProfile), typeof(MovieProfile));
            builder.Services.AddAutoMapper(typeof(ChairProfile), typeof(ShowtimeProfile));
            //builder.Services.AddHostedService<OrderExpiryService>();



            // Use Autofac as the DI container
            builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

            builder.Services.AddDataProtection()
                .SetApplicationName("CinemaManagement")
                //.SetDefaultKeyLifetime(TimeSpan.FromDays(30))
                .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "keys"))); ;

            // Register Autofac modules
            builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
            {
                containerBuilder.RegisterModule(new ServiceRegistration(builder.Configuration));
            });

            // thêm user-secrect khi chạy môi trường Development
            if (builder.Environment.IsDevelopment())
            {
                builder.Configuration.AddUserSecrets<Program>();
            }

            // Configurar JwtConfig
            builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("JwtSettings"));

            // Configurar EmailConfig
            builder.Services.Configure<EmailConfig>(builder.Configuration.GetSection("EmailSettings"));

            var jwtSettings = builder.Configuration.GetSection("JwtSettings");
            var secretKey = builder.Configuration["JwtSettings:Secret"];

            var key = Encoding.UTF8.GetBytes(secretKey!);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    //ClockSkew = TimeSpan.Zero // Không cho phép thời gian trễ
                };
            });

            // Configure CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader());
            });

            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Cinema Management API", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header, // Token được gửi qua header HTTP
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                // Configuring Swagger to use the JWT token
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            //var app = builder.Build();
            // Đọc cấu hình từ appsettings.json
            var cloudinarySettings = new CloudinarySettings();
            builder.Configuration.GetSection("CloudinarySettings").Bind(cloudinarySettings);

            var cloudinary = new Cloudinary(new Account(
                cloudinarySettings.CloudName,
                cloudinarySettings.ApiKey,
                cloudinarySettings.ApiSecret
            ));

            builder.Services.AddSingleton(cloudinary);

            // Thêm ConfigurationHolder và ConfigurationInitializerService
            //Đăng ký ConfigurationHolder như một dịch vụ singleton, đảm bảo chỉ có một instance được chia sẻ trong toàn bộ ứng dụng
            builder.Services.AddSingleton<ConfigurationHolder>();
            //Đăng ký ConfigurationInitializerService như một Hosted Service, dịch vụ này sẽ tự động chạy khi ứng dụng khởi động và tải cấu hình từ database vào memory
            builder.Services.AddHostedService<ConfigurationInitializerService>();
            builder.Services.AddHostedService<PointsResetBackgroundService>();


            var app = builder.Build();
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseGlobalExceptionHandler();
            app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

            app.UseCors("AllowAll");

            app.UseHttpsRedirection();

            // use authentication
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseHangfireDashboard();
            app.MapControllers();
            //HangfireJobConfig.RegisterRecurringJobs();
            //HangfireJobConfig.RegisterDailyJobs();
            ////HangfireJobConfig.ResetPointsJob();
            using (var scope = app.Services.CreateScope())
            {
                var serviceProvider = scope.ServiceProvider;
                HangfireJobConfig.RegisterRecurringJobs();
                HangfireJobConfig.RegisterDailyJobs();
                HangfireJobConfig.ResetPointsJob(serviceProvider);
            }

            //app.UseCors("AllowReactApp");
            app.Run();



        }
    }
}
