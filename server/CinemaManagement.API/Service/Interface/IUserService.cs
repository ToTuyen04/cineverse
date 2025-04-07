namespace CinemaManagement.API.Service.Interface
{
    public interface IUserService
    {

        Task<int> ResetAllCustomerPoints();

        Task AddUserPointsAsync(string? userEmail, decimal paymentPrice);
    }
}
