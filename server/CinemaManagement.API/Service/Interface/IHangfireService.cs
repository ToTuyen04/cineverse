namespace CinemaManagement.API.Service.Interface
{
    public interface IHangfireService
    {
        string ConvertToCronDay(string day,string month); 
    }
}
