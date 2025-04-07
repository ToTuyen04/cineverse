using AutoMapper;
using CinemaManagement.API.Configuration;
using CinemaManagement.API.DTOs.Request;
using CinemaManagement.API.DTOs.Response;
using CinemaManagement.API.Entities;
using CinemaManagement.API.ExceptionHandler;
using CinemaManagement.API.Repository;
using CinemaManagement.API.Repository.Interface;
using CinemaManagement.API.Service.Interface;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CinemaManagement.API.Service
{
    public partial class MovieService : IMovieService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<MovieService> _logger;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ConfigurationHolder _configurationHolder;

        public MovieService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<MovieService> logger, ICloudinaryService cloudinaryService, ConfigurationHolder configurationHolder)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _cloudinaryService = cloudinaryService;
            _configurationHolder = configurationHolder;
        }

        public async Task<List<MovieResponseDTO>> SearchListAsync(string name)
        {
            var movies = await _unitOfWork.MovieRepo.SearchListAsync(name);
            return _mapper.Map<List<MovieResponseDTO>>(movies);
        }

    }
}
