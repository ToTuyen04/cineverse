namespace CinemaManagement.API.Repository.Interface
{
    //interface chung cho search
    public interface ISearchRepository<T> where T : class
    {
        Task<List<T>> SearchListAsync(string name);
    }
}
