/**
 * Service để xử lý các gọi API liên quan đến dashboard 
 */

import apiClient from './apiClient';

/**
 * Lấy dữ liệu dashboard cơ bản từ API
 * @returns {Promise} Promise trả về dữ liệu dashboard cơ bản
 */
export const getBasicDashboardData = async () => {
  try {
    // Basic endpoint without parameters
    const response = await apiClient.get(`/dashboard/order-dashboard`);
    return response.data;
  } catch (error) {
    console.error('Error fetching basic dashboard data:', error);
    
    // Log chi tiết hơn nếu có response error
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    throw error;
  }
};

/**
 * Lấy dữ liệu dashboard chi tiết từ API
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise} Promise trả về dữ liệu dashboard
 */
export const getDashboardData = async (theater = 'All', time = 'All') => {
  try {
    // Validate time format to ensure it matches expected patterns
    if (time && time !== 'All') {
      // Check if it's a valid month format: MM_YYYY
      const monthPattern = /^(0[1-9]|1[0-2])_\d{4}$/;
      // Check if it's a valid quarter format: Q1_YYYY to Q4_YYYY
      const quarterPattern = /^Q[1-4]_\d{4}$/;
      // Check if it's a valid year format: YYYY
      const yearPattern = /^\d{4}$/;
      
      if (!monthPattern.test(time) && !quarterPattern.test(time) && !yearPattern.test(time) && time !== 'All') {
        console.warn('Invalid time format:', time);
        // Default to 'All' if format doesn't match expected patterns
        time = 'All';
      }
    }
    
    // Detailed endpoint with parameters - ensure 'All' is capitalized
    const response = await apiClient.get(`/dashboard/order-dashboard/${theater}/${time}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Log chi tiết hơn nếu có response error
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    
    throw error;
  }
};

/**
 * Lấy tổng số phim
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<number>} Promise trả về tổng số phim
 */
export const getTotalMovies = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.totalMoive;
};

/**
 * Lấy tổng số rạp
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<number>} Promise trả về tổng số rạp
 */
export const getTotalTheaters = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.totalTheater;
};

/**
 * Lấy danh sách tên rạp
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<Array>} Promise trả về danh sách tên rạp
 */
export const getTheaterNames = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.theaterNames;
};

/**
 * Lấy số vé bán được trong ngày hôm nay
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<number>} Promise trả về số vé bán được trong ngày
 */
export const getTicketsSoldToday = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.ticketToday;
};

/**
 * Lấy tổng số vé đã bán
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<number>} Promise trả về tổng số vé đã bán
 */
export const getTotalTickets = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.totalTicket;
};

/**
 * Lấy tổng số combo đã bán
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<number>} Promise trả về tổng số combo đã bán
 */
export const getTotalCombos = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.totalCombo;
};

/**
 * Lấy dữ liệu đơn hàng cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu đơn hàng
 */
export const getOrderDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.orderDashboards;
};

/**
 * Lấy dữ liệu thể loại phim cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu thể loại phim
 */
export const getGenreDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.genresDashboards;
};

/**
 * Lấy dữ liệu phim cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu phim
 */
export const getMovieDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.movieDashboards;
};

/**
 * Lấy dữ liệu combo cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'all')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu combo
 */
export const getComboDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDashboardData(theater, time);
  return data.comboDashboards;
};

/**
 * Format lỗi từ API để hiển thị 
 * @param {Object} error - Đối tượng lỗi từ axios
 * @returns {string} Thông báo lỗi đã định dạng
 */
export const formatDashboardError = (error) => {
  if (error.response) {
    return `Lỗi ${error.response.status}: ${error.response.data.message || 'Đã xảy ra lỗi'}`;
  } else if (error.request) {
    return 'Máy chủ không phản hồi. Vui lòng kiểm tra kết nối.';
  } else {
    return `Lỗi yêu cầu: ${error.message}`;
  }
};

// Export các hàm API
export default {
  getDashboardData,
  getTotalMovies,
  getTotalTheaters,
  getTheaterNames,
  getTicketsSoldToday,
  getTotalTickets,
  getTotalCombos,
  getOrderDashboardData,
  getGenreDashboardData,
  getMovieDashboardData,
  getComboDashboardData,
  formatDashboardError
};