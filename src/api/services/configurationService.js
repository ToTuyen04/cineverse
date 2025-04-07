/**
 * Service để xử lý các gọi API liên quan đến cấu hình hệ thống
 */

import apiClient from './apiClient';

/**
 * Lấy danh sách tất cả cấu hình từ API
 * @returns {Promise} Promise trả về danh sách tất cả cấu hình
 */
export const getConfigs = async () => {
  try {
    console.log('Gọi API: GET /configurations');
    const response = await apiClient.get('/configurations');
    console.log('Phản hồi từ API:', response);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tải cấu hình:', error);
    if (error.response) {
      console.error('Chi tiết lỗi:', error.response.data);
      console.error('Mã lỗi:', error.response.status);
    } else if (error.request) {
      console.error('Không nhận được phản hồi từ server');
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    throw error;
  }
};

/**
 * Cập nhật tất cả cấu hình
 * @param {Array} configData - Danh sách các cấu hình cần cập nhật
 * @returns {Promise} Promise trả về danh sách cấu hình đã cập nhật
 */
export const updateConfigs = async (configData) => {
  try {
    console.log('Gọi API: PUT /configurations với dữ liệu:', configData);
    const response = await apiClient.put('/configurations', configData);
    console.log('Phản hồi từ API:', response);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật cấu hình:', error);
    if (error.response) {
      console.error('Chi tiết lỗi:', error.response.data);
      console.error('Mã lỗi:', error.response.status);
    } else if (error.request) {
      console.error('Không nhận được phản hồi từ server');
    } else {
      console.error('Lỗi cấu hình request:', error.message);
    }
    throw error;
  }
};

// Export các hàm API
export default {
  getConfigs,
  updateConfigs
};
