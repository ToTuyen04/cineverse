//// filepath: d:\.NetLab\FE\src\services\movieService.js
/**
 * Service để xử lý các gọi API liên quan đến phim
 * Sau này có thể tích hợp SignalR tại đây
 */

import apiClient from './apiClient';

/**
 * Lấy danh sách tất cả phim từ API
 * @param {boolean} includeUnavailable - Có bao gồm phim không khả dụng hay không (mặc định là false)
 * @returns {Promise} Promise trả về danh sách tất cả phim khả dụng
 */
export const getAllMovies = async (includeUnavailable = false) => {
  try {
    const response = await apiClient.get('/Movies');
    
    // Xác định mảng phim từ response
    let moviesArray = [];
    
    if (Array.isArray(response.data)) {
      moviesArray = response.data;
    } else if (response.data && Array.isArray(response.data.result)) {
      moviesArray = response.data.result;
    } else if (response.data && Array.isArray(response.data.data)) {
      moviesArray = response.data.data;
    } else if (response.data && Array.isArray(response.data.movies)) {
      moviesArray = response.data.movies;
    } else {
      console.error('Unexpected API response structure:', response.data);
      return [];
    }
    
    // Lọc ra phim khả dụng nếu cần
    if (!includeUnavailable) {
      moviesArray = moviesArray.filter(movie => movie.movieAvailable === true);
    }
    
    // Format dữ liệu phim
    return moviesArray.map(movie => formatMovieData(movie));
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

/**
 * Lấy danh sách phim với phân trang
 * @param {number} pageIndex - Số trang hiện tại
 * @param {number} pageSize - Số phim mỗi trang
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @param {Array} genreIds - Danh sách ID thể loại phim cần lọc
 * @param {string} movieSortBy - Sắp xếp theo (CreatedAt=0, StartAt=1, EndAt=2)
 * @param {string} sortOrder - Thứ tự sắp xếp (Ascending=0, Descending=1)
 * @returns {Promise} Promise trả về danh sách phim phân trang
 */
export const getMoviesPaginated = async (
  pageIndex = 1, 
  pageSize = 5, 
  searchTerm = null,
  genreIds = null,
  movieSortBy = null,
  sortOrder = null
) => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    // Add searchTerm if provided
    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }
    
    // Add genreIds if provided (as multiple parameters)
    if (genreIds && genreIds.length > 0) {
      genreIds.forEach(id => {
        params.append('genreIds', id);
      });
    }
    
    // Add sorting parameters if provided
    if (movieSortBy !== null && movieSortBy !== undefined) {
      params.append('movieSortBy', movieSortBy);
    }
    
    if (sortOrder !== null && sortOrder !== undefined) {
      params.append('sortOrder', sortOrder);
    }
    
    // Use apiClient directly with URL path and query string
    const queryString = params.toString();
    const url = `/Movies/${pageIndex}/${pageSize}${queryString ? `?${queryString}` : ''}`;
    
    console.log("API Call URL:", url); // For debugging
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated movies:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một phim theo ID
 * @param {number|string} id - ID của phim cần lấy thông tin
 * @param {boolean} checkAvailability - Kiểm tra phim có khả dụng không (mặc định là true)
 * @returns {Promise} Promise trả về thông tin chi tiết phim
 */
export const getMovieById = async (id, checkAvailability = true) => {
  try {
    const response = await apiClient.get(`/Movies/${id}`);
    
    // Kiểm tra phim có khả dụng không - chỉ áp dụng khi checkAvailability = true
    // Đối với admin, nên truyền checkAvailability = false để xem được phim không khả dụng
    if (checkAvailability && response.data && response.data.movieAvailable === false) {
      throw new Error('Phim này hiện không khả dụng');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách phim đang chiếu
 * @returns {Promise} Promise trả về danh sách phim đang chiếu
 */
export const getNowShowingMovies = async () => {
  try {
   const allMovies = await getAllMovies();
   const currentDate = new Date();
   return allMovies.filter(movie => {
    const startDate = new Date(movie.startDate);
    const endDate = new Date(movie.endDate);
    return currentDate >= startDate && currentDate <= endDate;
  });
  } catch (error) {
    console.error('Error fetching now showing movies:', error);
    throw error;
  }
};

/**
 * Lấy danh sách phim sắp chiếu
 * @returns {Promise} Promise trả về danh sách phim sắp chiếu
 */
export const getComingSoonMovies = async () => {
  try {
    const allMovies = await getAllMovies();
    const currentDate = new Date();
    return allMovies.filter(movie => {
      const startDate = new Date(movie.startDate);
      return startDate > currentDate;
    });
    } catch (error) {
    console.error('Error fetching coming soon movies:', error);
    throw error;
  }
};

/**
 * Lấy danh sách phim theo rạp chiếu
 * @param {string|number} theaterId - ID của rạp chiếu
 * @returns {Promise} - Promise trả về danh sách phim theo rạp
 */
export const getMoviesByTheater = async (theaterId) => {
  try {
    const response = await apiClient.get(`/Movies/bookingQuick/theaters/${theaterId}/getMovies`);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching movies for theater ${theaterId}:`, error);
    throw error;
  }
};

/**
 * Lấy thông tin banner phim chính
 * @returns {Promise} Promise trả về thông tin banner
 */
export const getBannerMovie = async () => {
  try {
    // Lấy phim đang chiếu đầu tiên làm banner
    const nowShowingMovies = await getNowShowingMovies();
    return nowShowingMovies.length > 0 ? nowShowingMovies[0] : null;
  } catch (error) {
    console.error('Error fetching banner movie:', error);
    throw error;
  }
};

/**
 * Tìm kiếm phim theo từ khóa
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Promise} Promise trả về danh sách phim phù hợp với từ khóa
 */
export const searchMoviesInFe = async (query) => {
  try {
    // Trong môi trường thực tế, thay thế bằng API call:
    // const response = await apiClient.get(`/Movies/search?query=${encodeURIComponent(query)}`);
    // return formatMovieData(response.data);

    // Giả lập API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Giả lập tìm kiếm từ getAllMovies
    const allMovies = await getAllMovies();
    
    // Lọc phim phù hợp với từ khóa
    const filteredMovies = allMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      (movie.description && movie.description.toLowerCase().includes(query.toLowerCase())) ||
      (movie.genres && movie.genres.some(genre => 
        genre.genresName.toLowerCase().includes(query.toLowerCase())
      ))
    );
    
    // Giới hạn kết quả để hiển thị
    return filteredMovies.slice(0, 5);
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}
 /* @param {number} pageIndex - Số trang hiện tại
 * @param {number} pageSize - Số phim mỗi trang
 * @param {string} additionalParams - Tham số bổ sung (genreIds, status, etc.)
 * @returns {Promise} Promise trả về danh sách phim phù hợp với từ khóa
 */
export const searchMovies = async (query, pageIndex = 1, pageSize = 10, additionalParams = '') => {
  try {
    const url = `/Movies/${pageIndex}/${pageSize}?searchTerm=${encodeURIComponent(query)}${additionalParams ? `&${additionalParams}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error searching movies with query "${query}":`, error);
    throw error;
  }
};

/**
 * Tạo phim mới
 * @param {Object} movieData - Dữ liệu phim cần tạo
 * @returns {Promise} Promise trả về thông tin phim đã tạo
 */
export const createMovie = async (movieData) => {
  try {
    // When using FormData with POST requests, need the same handling as PUT requests
    const response = await apiClient.post('/Movies', movieData, {
      // Make sure we don't set Content-Type as the browser will set it
      // automatically with the correct boundary for multipart/form-data
      headers: {
        'Content-Type': undefined
      }
    });
    
    // Debug the response
    console.log('Create movie response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating movie:', error);
    
    // Better error debugging
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    throw error;
  }
};

/**
 * Cập nhật thông tin phim
 * @param {number|string} id - ID của phim cần cập nhật
 * @param {Object} movieData - Dữ liệu phim cần cập nhật
 * @returns {Promise} Promise trả về thông tin phim đã cập nhật
 */
export const updateMovie = async (id, movieData) => {
  try {
    // When using FormData with PUT requests, some API clients
    // or servers might not process it correctly
    const response = await apiClient.put(`/Movies/${id}`, movieData, {
      // Make sure we don't set Content-Type as the browser will set it
      // automatically with the correct boundary for multipart/form-data
      headers: {
        // Remove any default Content-Type header that might be automatically set
        'Content-Type': undefined
      }
    });
    
    // Debug the response
    console.log('Update movie response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating movie with ID ${id}:`, error);
    
    // Better error debugging
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    throw error;
  }
};

/**
 * Xóa phim
 * @param {number|string} id - ID của phim cần xóa
 * @returns {Promise} Promise trả về kết quả xóa
 */
export const deleteMovie = async (id) => {
  try {
    const response = await apiClient.delete(`/Movies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting movie with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả thể loại phim
 * @returns {Promise<Array>} Promise trả về danh sách thể loại
 */
export const getAllGenres = async () => {
  try {
    const response = await apiClient.get('/Genres');
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

/**
 * Lấy thông tin thể loại phim theo ID
 * @param {number|string} id - ID của thể loại phim
 * @returns {Promise} Promise trả về thông tin thể loại phim
 */
export const getGenreById = async (id) => {
  try {
    const response = await apiClient.get(`/Genres/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching genre with ID ${id}:`, error);
    throw error;
  }
};

const formatMovieData = (movie) => {
  if (!movie) return null;
  
  // Nhóm các thể loại phim thành một chuỗi
  let genreNames = movie.genres && movie.genres.length > 0 
    ? movie.genres.map(g => g.genresName).join(', ') 
    : '';
  
  // Xử lý poster nếu là null
  const posterUrl = movie.moviePoster 
    ? movie.moviePoster 
    : `https://via.placeholder.com/500x750?text=No+Image`;
  
  // Tạo trailer URL cho iframe nếu cần
  let trailerUrl = movie.movieTrailer;
  
  // Kiểm tra nếu trailer là ID YouTube
  if (trailerUrl && !trailerUrl.includes('://')) {
    trailerUrl = `https://www.youtube.com/embed/${trailerUrl}`;
  }

 
  // Tạo backdrop từ poster nếu không có
  const backdropUrl = movie.movieBackdrop || posterUrl;

  return {
    id: movie.movieId,
    title: movie.movieName,
    poster: posterUrl,
    backdrop: backdropUrl,
    trailer: trailerUrl,
    createdAt: movie.movieCreatAt,
    startDate: movie.movieStartAt,
    endDate: movie.movieEndAt,
    actors: movie.movieActor,
    director: movie.movieDirector,
    studio: movie.movieBrand,
    duration: movie.movieDuration,
    version: movie.movieVersion,
    description: movie.movieContent,
    genres: movie.genres,
    genreNames: genreNames,
    originalData: movie // Giữ lại dữ liệu gốc nếu cần
  };
};

// Export các hàm API khác
export default {
  getAllMovies,
  getMoviesPaginated,
  getMovieById,
  getNowShowingMovies,
  getComingSoonMovies,
  getBannerMovie,
  searchMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllGenres,
  getGenreById,
  getMoviesByTheater
};

