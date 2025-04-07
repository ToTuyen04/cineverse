import apiClient from "./apiClient";

/**
 * Lấy tất cả phòng chiếu
 * @returns {Promise} Promise chứa danh sách phòng
 */
export const getAllRooms = async () => {
  try {
    const response = await apiClient.get('/rooms');
    
    // Kiểm tra nếu response có cấu trúc theo định dạng
    if (response.data && typeof response.data === 'object') {
      // Trường hợp API trả về dạng { data: [...], success: true, message: "..." }
      if ('data' in response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Trường hợp API trả về trực tiếp mảng dữ liệu
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách phòng chiếu thành công'
      };
    }
    
    throw new Error('Định dạng dữ liệu không hợp lệ');
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể tải danh sách phòng chiếu'
    };
  }
};

/**
 * Lấy thông tin phòng theo ID
 * @param {number} roomId - ID của phòng
 * @returns {Promise} Promise chứa thông tin phòng
 */
export const getRoomById = async (roomId) => {
  try {
    const response = await apiClient.get(`/api/rooms/${roomId}`);
    
    // Kiểm tra nếu response có cấu trúc theo định dạng
    if (response.data && typeof response.data === 'object') {
      // Trường hợp API trả về dạng { data: {...}, success: true, message: "..." }
      if ('data' in response.data && 'success' in response.data) {
        return response.data;
      }
      
      // Trường hợp API trả về trực tiếp object dữ liệu
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin phòng chiếu thành công'
      };
    }
    
    throw new Error('Định dạng dữ liệu không hợp lệ');
  } catch (error) {
    console.error(`Error fetching room with ID ${roomId}:`, error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Không thể tải thông tin phòng chiếu'
    };
  }
};

/**
 * Tạo phòng chiếu mới
 * @param {Object} roomData - Dữ liệu phòng cần tạo
 * @returns {Promise} Promise chứa kết quả tạo phòng
 */
export const createRoom = async (roomData) => {
  try {
    const response = await apiClient.post('/api/rooms', roomData);
    
    if (response.data && typeof response.data === 'object') {
      if ('success' in response.data) {
        return response.data;
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Tạo phòng chiếu mới thành công'
      };
    }
    
    throw new Error('Định dạng dữ liệu không hợp lệ');
  } catch (error) {
    console.error('Error creating room:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tạo phòng chiếu mới'
    };
  }
};

/**
 * Cập nhật thông tin phòng
 * @param {number} roomId - ID của phòng
 * @param {Object} roomData - Dữ liệu phòng cần cập nhật
 * @returns {Promise} Promise chứa kết quả cập nhật
 */
export const updateRoom = async (roomId, roomData) => {
  try {
    const response = await apiClient.put(`/api/rooms/${roomId}`, roomData);
    
    if (response.data && typeof response.data === 'object') {
      if ('success' in response.data) {
        return response.data;
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật phòng chiếu thành công'
      };
    }
    
    throw new Error('Định dạng dữ liệu không hợp lệ');
  } catch (error) {
    console.error(`Error updating room with ID ${roomId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể cập nhật phòng chiếu'
    };
  }
};

/**
 * Xóa phòng chiếu
 * @param {number} roomId - ID của phòng cần xóa
 * @returns {Promise} Promise chứa kết quả xóa
 */
export const deleteRoom = async (roomId) => {
  try {
    const response = await apiClient.delete(`/api/rooms/${roomId}`);
    
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data;
    }
    
    return {
      success: true,
      message: 'Xóa phòng chiếu thành công'
    };
  } catch (error) {
    console.error(`Error deleting room with ID ${roomId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa phòng chiếu'
    };
  }
};

/**
 * Lấy danh sách phòng theo rạp
 * @param {number} theaterId - ID của rạp
 * @returns {Promise} Promise chứa danh sách phòng của rạp
 */
export const getRoomsByTheater = async (theaterId) => {
  try {
    const response = await apiClient.get(`/api/theaters/${theaterId}/rooms`);
    
    if (response.data && typeof response.data === 'object') {
      if ('data' in response.data && 'success' in response.data) {
        return response.data;
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách phòng chiếu theo rạp thành công'
      };
    }
    
    throw new Error('Định dạng dữ liệu không hợp lệ');
  } catch (error) {
    console.error(`Error fetching rooms for theater ID ${theaterId}:`, error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể tải danh sách phòng chiếu theo rạp'
    };
  }
};