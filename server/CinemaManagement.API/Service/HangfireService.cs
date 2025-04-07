using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.Service
{
    public class HangfireService : IHangfireService
    {
        public string ConvertToCronDay(string day, string month)
        {
            if (day == null || month == null)
            {
                return "0 0 31 12 *";
            }

            return $"0 0 {day} {month} *";
        }
    }
}
