namespace CinemaManagement.API.Service.Interface
{
    public interface ISearchService<TResponseDTO>
        where TResponseDTO : class
    {
        Task<List<TResponseDTO>> SearchListAsync(string name);
    }
}
