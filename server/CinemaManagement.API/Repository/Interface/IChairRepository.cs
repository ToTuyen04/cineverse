using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;

namespace CinemaManagement.API.Repository.Interface
{
    public interface IChairRepository : IGenericRepository<Chair>
    {

        Task<decimal> GetPriceByChairId(int chairId);

        Task<List<ChairType>> GetAllChairType();
    }
}
