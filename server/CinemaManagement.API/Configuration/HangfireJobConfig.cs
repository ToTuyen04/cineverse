using CinemaManagement.API.BackgroundServices;
using CinemaManagement.API.Service.Interface;
using Hangfire;

namespace CinemaManagement.API.Configuration
{
    public class HangfireJobConfig
    {
        public static void RegisterRecurringJobs ()
        {
            RecurringJob.AddOrUpdate<OrderBackgroundService>(
                "check-expire-orders",
                x => x.CheckExprireOrders(),
                Cron.Minutely
                );
        }
        public static void RegisterDailyJobs()
        {
            RecurringJob.AddOrUpdate<OrderBackgroundService>(
                "remove-failed-orders",
                x => x.RemoveFailedOrders(),
                Cron.Daily
                );
            RecurringJob.AddOrUpdate<OrderBackgroundService>(
                "remove-nulll-tickets",
                x => x.RemoveTickets(),
                Cron.Daily
                );
        }
        public static void ResetPointsJob(IServiceProvider serviceProvider)
        {
            var configHolder = serviceProvider.GetRequiredService<ConfigurationHolder>();
            var hangfireService = serviceProvider.GetRequiredService<IHangfireService>();

            var (day, month) = configHolder.GetPointsResetDate();
            var cronDay = hangfireService.ConvertToCronDay(day.ToString(), month.ToString());

            RecurringJob.AddOrUpdate<PointBackgroundService>(
                "reset-points",
                x => x.CheckAndResetPoint(),
                cronDay
            );
        }


    }
}
