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
    const response = await apiClient.get(`/DashBoard/order-dashboard`);
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
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise} Promise trả về dữ liệu dashboard chi tiết
 */
export const getDetailedDashboardData = async (theater = 'All', time = 'All') => {
  try {
    // Detailed endpoint with parameters - ensure 'All' is capitalized
    const response = await apiClient.get(`/DashBoard/order-dashboard/${theater}/${time}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed dashboard data:', error);
    
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
 * @returns {Promise<number>} Promise trả về tổng số phim
 */
export const getTotalMovies = async () => {
  const data = await getBasicDashboardData();
  return data.totalMovie || 0;
};

/**
 * Lấy tổng số rạp
 * @returns {Promise<number>} Promise trả về tổng số rạp
 */
export const getTotalTheaters = async () => {
  const data = await getBasicDashboardData();
  return data.totalTheater || 0;
};

/**
 * Lấy danh sách tên rạp
 * @returns {Promise<Array>} Promise trả về danh sách tên rạp
 */
export const getTheaterNames = async () => {
  const data = await getBasicDashboardData();
  return data.theaterNames || [];
};

/**
 * Lấy số vé bán được trong ngày hôm nay
 * @returns {Promise<number>} Promise trả về số vé bán được trong ngày
 */
export const getTicketsSoldToday = async () => {
  const data = await getBasicDashboardData();
  return data.ticketToday || 0;
};

/**
 * Lấy tổng số vé đã bán
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise<number>} Promise trả về tổng số vé đã bán
 */
export const getTotalTickets = async (theater = 'All', time = 'All') => {
  const data = await getDetailedDashboardData(theater, time);
  return data.totalTicket || 0;
};

/**
 * Lấy tổng số combo đã bán
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise<number>} Promise trả về tổng số combo đã bán
 */
export const getTotalCombos = async (theater = 'All', time = 'All') => {
  const data = await getDetailedDashboardData(theater, time);
  return data.totalCombo || 0;
};

/**
 * Lấy dữ liệu đơn hàng cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu đơn hàng
 */
export const getOrderDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDetailedDashboardData(theater, time);
  return data.orderDashboards || [];
};

/**
 * Lấy dữ liệu thể loại phim cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu thể loại phim
 */
export const getGenreDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDetailedDashboardData(theater, time);
  return data.genresDashboards || [];
};

/**
 * Lấy dữ liệu phim cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu phim
 */
export const getMovieDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDetailedDashboardData(theater, time);
  return data.movieDashboards || [];
};

/**
 * Lấy dữ liệu combo cho dashboard
 * @param {string} theater - ID của rạp hoặc 'All' cho tất cả rạp
 * @param {string} time - Thời gian (định dạng: MM_YYYY, Q1_YYYY, YYYY, hoặc 'All')
 * @returns {Promise<Array>} Promise trả về danh sách dữ liệu combo
 */
export const getComboDashboardData = async (theater = 'All', time = 'All') => {
  const data = await getDetailedDashboardData(theater, time);
  return data.comboDashboards || [];
};

// Format lỗi từ API để hiển thị 
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
  getBasicDashboardData,
  getDetailedDashboardData,
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