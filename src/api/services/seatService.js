import apiClient from "./apiClient";

// Mock data
const mockSeats = {
  // Showtime ID 1
  '1': generateTheaterSeats('1'),
  // Add more showtimes as needed
};

// Generate theater seating
function generateTheaterSeats(showtimeId) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats = [];
  let seatId = 1;
  
  rows.forEach(row => {
    for (let i = 1; i <= seatsPerRow; i++) {
      // Make some seats unavailable randomly
      const isAvailable = Math.random() > 0.2;
      
      // Make some seats VIP
      const isVIP = (row === 'E' || row === 'F') && (i >= 4 && i <= 9);
      
      seats.push({
        id: seatId++,
        row,
        number: i,
        isAvailable,
        isVIP,
        price: isVIP ? 15.00 : 10.00,
        showtimeId
      });
    }
  });
  
  return seats;
}

// Reserve seats
export const reserveSeats = async (showtimeId, seatIds) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would send a request to the backend
  return {
    success: true,
    message: 'Seats reserved successfully',
    reservationId: 'RES-' + Math.floor(Math.random() * 1000000)
  };
};


/**
 * Lấy danh sách ghế theo phòng
 * @param {number} roomId - ID của phòng
 * @returns {Promise} - Promise chứa danh sách ghế
 */
export const getChairsByRoom = async (roomId) => {
  try {
    const response = await apiClient.get(`/Chair/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chairs by room:', error);
    throw error;
  }
};
// Get seats by showtime
export const getSeatsByShowtime = async (showtimeId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If we have mock data for this showtime, return it
  if (mockSeats[showtimeId]) {
    return mockSeats[showtimeId];
  }
  
  // Otherwise generate new seats
  const generatedSeats = generateTheaterSeats(showtimeId);
  mockSeats[showtimeId] = generatedSeats;
  return generatedSeats;
};

/**
 * Tạo mới ghế cho phòng
 * @param {number} roomId - ID của phòng
 * @param {Array} chairs - Mảng các ghế cần tạo
 * @returns {Promise} - Promise chứa kết quả tạo mới
 */
export const createChairs = async (roomId, chairs) => {
  try {
    // Format API yêu cầu:
    // [
    //   {
    //     "chairTypeId": 0,
    //     "chairName": "string",
    //     "chairPosition": "string",
    //     "chairStatus": true
    //   }
    // ]
    const response = await apiClient.post(`/Chair/room/${roomId}`, chairs);
    return response.data;
  } catch (error) {
    console.error('Error creating chairs:', error);
    throw error;
  }
};

/**
 * Cập nhật ghế cho phòng
 * @param {number} roomId - ID của phòng
 * @param {Array} chairs - Mảng các ghế cần cập nhật
 * @returns {Promise} - Promise chứa kết quả cập nhật
 */
export const updateChairs = async (roomId, chairs) => {
  try {
    // Format API yêu cầu:
    // [
    //   {
    //     "chairId": 0,
    //     "chairTypeId": 0,
    //     "chairName": "string",
    //     "chairPosition": "string",
    //     "chairStatus": true
    //   }
    // ]
    const response = await apiClient.put(`/Chair/room/${roomId}`, chairs);
    return response.data;
  } catch (error) {
    console.error('Error updating chairs:', error);
    throw error;
  }
};

/**
 * Xóa ghế theo danh sách ID
 * @param {number} roomId - ID của phòng
 * @param {Array<number>} chairIds - Mảng ID ghế cần xóa
 * @returns {Promise} - Promise chứa kết quả xóa
 */
export const deleteChairs = async (roomId, chairIds) => {
  try {
    // Format API yêu cầu:
    // [0, 1, 2] - mảng chairId
    const response = await apiClient.delete(`/Chair/room/${roomId}`, {
      data: chairIds
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting chairs:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái ghế
 * @param {number} chairId - ID của ghế
 * @param {boolean} status - Trạng thái mới của ghế
 * @returns {Promise} - Promise chứa kết quả cập nhật
 */
export const updateChairStatus = async (chairId, status) => {
  try {
    const response = await apiClient.put(`/Chair/${chairId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating chair status:', error);
    throw error;
  }
};

/**
 * Cập nhật loại ghế
 * @param {number} chairId - ID của ghế
 * @param {number} chairTypeId - ID loại ghế mới
 * @returns {Promise} - Promise chứa kết quả cập nhật
 */
export const updateChairType = async (chairId, chairTypeId) => {
  try {
    const response = await apiClient.put(`/Chair/${chairId}/type`, { chairTypeId });
    return response.data;
  } catch (error) {
    console.error('Error updating chair type:', error);
    throw error;
  }
};