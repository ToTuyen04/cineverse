using AutoMapper;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaManagement.API.Service
{
    public class GenresService : IGenresService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<GenresService> _logger;
        public GenresService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<GenresService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<GenresResponseDTO> AddAsync(GenresRequestDTO request)
        {
            var entity = _mapper.Map<Genre>(request);
            await _unitOfWork.GenresRepo.AddAsync(entity);
            return _mapper.Map<GenresResponseDTO>(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.GenresRepo.GetByIdAsync(id);
            if (entity != null)
            {
                await _unitOfWork.GenresRepo.DeleteAsync(id);
            }
        }

        public async Task<IEnumerable<GenresResponseDTO>> GetAllAsync()
        {
            var entities = await _unitOfWork.GenresRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<GenresResponseDTO>>(entities);
        }

        public async Task<GenresResponseDTO> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.GenresRepo.GetByIdAsync(id);
            return _mapper.Map<GenresResponseDTO>(entity);
        }

        public async Task<List<GenresResponseDTO>> SearchListAsync(string name)
        {
            var genres = await _unitOfWork.GenresRepo.SearchListAsync(name);
            return _mapper.Map<List<GenresResponseDTO>>(genres);
        }

        public async Task<GenresResponseDTO> UpdateAsync(int id, GenresRequestDTO request)
        {
            var entity = await _unitOfWork.GenresRepo.GetByIdAsync(id);
            if (entity != null)
            {
                entity = _mapper.Map<Genre>(request);
                await _unitOfWork.GenresRepo.UpdateAsync(entity);
            }
            return _mapper.Map<GenresResponseDTO>(entity);
        }
    }
}
