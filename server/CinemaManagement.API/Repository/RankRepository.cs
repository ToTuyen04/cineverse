using CinemaManagement.API.Data;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;

namespace CinemaManagement.API.Repository
{
    public class RankRepository : GenericRepository<Rank>, IRankRepository
    {
        public RankRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
