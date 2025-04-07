namespace CinemaManagement.API.Service.Interface
{
    public interface IGenericService<T, TRequestDTO, TResponseDTO>
        where T : class
        where TRequestDTO : class
        where TResponseDTO : class
    {
        Task<IEnumerable<TResponseDTO>> GetAllAsync();
        Task<TResponseDTO> GetByIdAsync(int id);
        //UI gửi yêu cầu cho BE -> dùng RequestDTO
        Task<TResponseDTO> AddAsync(TRequestDTO request);
        Task<TResponseDTO> UpdateAsync(int id, TRequestDTO request);
        Task DeleteAsync(int id);
    }
}
