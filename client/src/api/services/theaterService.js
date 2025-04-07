import apiClient from './apiClient';

// Get all theaters
export const getTheaters = async () => {
  try {
    // Gọi API thực để lấy dữ liệu
    const response = await apiClient.get('/Theater');
    return response.data;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    return [];
  }
};


// Get theater by ID
export const getTheaterById = async (id) => {
  try {
    // Gọi API thực để lấy dữ liệu của một rạp cụ thể
    const response = await apiClient.get(`/Theater/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching theater with id ${id}:`, error);
    
    // Nếu API không có endpoint lấy rạp theo ID, bạn có thể thử lấy tất cả rạp rồi lọc
    try {
      const allTheaters = await getTheaters();
      const theater = allTheaters.find(theater => theater.theaterId === parseInt(id));
      return theater || null;
    } catch (fallbackError) {
      console.error('Fallback method failed:', fallbackError);
      return null;
    }
  }
};

// Map theater data to a consistent format (useful when switching between mock and real API)
export const mapTheaterData = (theater) => {
  if (!theater) return null;
  
  return {
    id: theater.theaterId,
    name: theater.theaterName,
    location: theater.theaterLocation,
    hotline: theater.theaterHotline
  };
};

// Helper function to map an array of theaters
export const mapTheatersData = (theaters) => {
  if (!theaters || !Array.isArray(theaters)) return [];
  
  return theaters.map(theater => mapTheaterData(theater));
  };


/**
 * Lấy danh sách rạp chiếu phim với phân trang
 * @param {number} pageIndex - Số trang hiện tại
 * @param {number} pageSize - Số rạp mỗi trang
 * @returns {Promise} Promise trả về danh sách rạp phân trang
 */
export const getTheatersPaginated = async (pageIndex, pageSize) => {
  try {
    const response = await apiClient.get(`/Theater/${pageIndex}/${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated theaters:', error);
    throw error;
  }
};



/**
 * Tìm kiếm rạp chiếu theo từ khóa
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Promise} Promise trả về danh sách rạp phù hợp với từ khóa
 */
export const searchTheaters = async (query) => {
  try {
    const response = await apiClient.get(`/Theater/search/${query}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching theaters with query "${query}":`, error);
    throw error;
  }
};

/**
 * Tạo rạp chiếu mới
 * @param {Object} theaterData - Dữ liệu rạp cần tạo
 * @returns {Promise} Promise trả về thông tin rạp đã tạo
 */
export const createTheater = async (theaterData) => {
  try {
    const response = await apiClient.post('/Theater', theaterData);
    return response.data;
  } catch (error) {
    console.error('Error creating theater:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin rạp chiếu
 * @param {number|string} id - ID của rạp cần cập nhật
 * @param {Object} theaterData - Dữ liệu rạp cần cập nhật
 * @returns {Promise} Promise trả về thông tin rạp đã cập nhật
 */
export const updateTheater = async (id, theaterData) => {
  try {
    const response = await apiClient.put(`/Theater/${id}`, theaterData);
    return response.data;
  } catch (error) {
    console.error(`Error updating theater with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa rạp chiếu
 * @param {number|string} id - ID của rạp cần xóa
 * @returns {Promise} Promise trả về kết quả xóa
 */
export const deleteTheater = async (id) => {
  try {
    const response = await apiClient.delete(`/Theater/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting theater with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả khu vực
 * @returns {Promise} Promise trả về danh sách tất cả khu vực
 */
export const getAllAreas = async () => {
  try {
    const response = await apiClient.get('/Areas');
    return response.data;
  } catch (error) {
    console.error('Error fetching areas:', error);
    throw error;
  }
};

// Export các hàm API
export default {
  // getAllTheaters,
  getTheatersPaginated,
  getTheaterById,
  searchTheaters,
  createTheater,
  updateTheater,
  deleteTheater,
  getAllAreas
};