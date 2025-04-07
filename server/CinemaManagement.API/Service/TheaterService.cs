using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;

namespace CinemaManagement.API.Service
{
    public partial class TheaterService : ITheaterService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TheaterService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.TheaterRepo.GetByIdAsync(id);
            if(entity != null)
            {
                await _unitOfWork.TheaterRepo.DeleteAsync(id);
                var isDeleted = await _unitOfWork.SaveChangesAsync();
                if(isDeleted <= 0)
                {
                    throw new Exception($"Không thể xóa thể loại có ID: {id}");
                }
            }
        }

        public async Task<IEnumerable<TheaterResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.TheaterRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<TheaterResponseDTO>>(entities);
        }

        public async Task<TheaterResponseDTO> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.TheaterRepo.GetByIdAsync(id);
            return _mapper.Map<TheaterResponseDTO>(entity);
        }

        public async Task<List<TheaterResponseDTO>> SearchListAsync(string name)
        {
            var theater = await _unitOfWork.TheaterRepo.SearchListAsync(name) 
                ?? throw new NotFoundException($"Không tìm thấy rạp với tên {name}");
            return _mapper.Map<List<TheaterResponseDTO>>(theater);
        }
    }
}
