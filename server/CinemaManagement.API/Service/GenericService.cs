using AutoMapper;
using AutoMapper;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using NuGet.Protocol.Resources;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaManagement.API.Service
{
    public class GenericService<T, TRequestDTO, TResponseDTO> : IGenericService<T, TRequestDTO, TResponseDTO>
        where T : class
        where TRequestDTO : class
        where TResponseDTO : class
    {
        private readonly IGenericRepository<T> _repository;
        private readonly IMapper _mapper;

        public GenericService(IGenericRepository<T> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public virtual async Task<IEnumerable<TResponseDTO>> GetAllAsync()
        {
            var entities = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TResponseDTO>>(entities);
        }

        public async Task<TResponseDTO> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id)
                ?? throw new NotFoundException($"Không tìm thấy object với ID: {id}");

            return _mapper.Map<TResponseDTO>(entity);
        }

        public async Task<TResponseDTO> AddAsync(TRequestDTO request)
        {
            var entity = _mapper.Map<T>(request);
            await _repository.AddAsync(entity);
            return _mapper.Map<TResponseDTO>(entity);
        }

        public async Task<TResponseDTO> UpdateAsync(int id, TRequestDTO request)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity != null)
            {
                _mapper.Map(request, entity);
                await _repository.UpdateAsync(entity);
            }
            return _mapper.Map<TResponseDTO>(entity);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
