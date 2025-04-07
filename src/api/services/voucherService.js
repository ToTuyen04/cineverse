import apiClient from './apiClient';
import mockVouchersData from '../mock/vouchers.json';

/**
 * Hàm kiểm tra voucher có hợp lệ không
 * @param {string} voucherCode Mã voucher cần kiểm tra
 * @param {number} totalAmount Tổng tiền hóa đơn
 * @returns {Promise} Kết quả kiểm tra voucher
 */
export const checkVoucher = async (voucherCode, totalAmount) => {
  try {
    if (!voucherCode || voucherCode.trim() === '') {
      return {
        valid: false,
        message: 'Vui lòng nhập mã giảm giá'
      };
    }

    const response = await apiClient.get(`/Voucher/code/${voucherCode}`);
    console.log('Voucher check response:', response.data);
    
    // Nếu không có dữ liệu hoặc API trả về lỗi
    if (!response.data || response.data.error) {
      return {
        valid: false,
        message: response.data?.message || 'Mã giảm giá không tồn tại'
      };
    }

    const voucher = response.data;
    
    // Kiểm tra thời hạn voucher
    const currentDate = new Date();
    const startDate = new Date(voucher.voucherStartAt);
    const endDate = new Date(voucher.voucherEndAt);

    if (currentDate < startDate) {
      return {
        valid: false,
        message: `Mã giảm giá chỉ có hiệu lực từ ${startDate.toLocaleDateString('vi-VN')}`
      };
    }

    if (currentDate > endDate) {
      return {
        valid: false,
        message: 'Mã giảm giá đã hết hạn'
      };
    }

    // Tính số tiền giảm giá
    let discountAmount = Math.floor(totalAmount * voucher.voucherDiscount);

    // Kiểm tra giới hạn giảm giá
    if (discountAmount > voucher.voucherMaxValue) {
      discountAmount = voucher.voucherMaxValue;
    }

    // Đảm bảo không giảm nhiều hơn tổng tiền
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    // Trả về thông tin voucher hợp lệ
    return {
      valid: true,
      message: `Áp dụng ${voucher.voucherName} thành công!`,
      voucherId: voucher.voucherId,
      name: voucher.voucherName,
      description: voucher.voucherDescription,
      code: voucher.voucherCode,
      discount: voucher.voucherDiscount * 100, // Chuyển thành phần trăm
      discountType: 'PERCENT',
      maxValue: voucher.voucherMaxValue,
      actualDiscount: discountAmount,
      startAt: voucher.voucherStartAt,
      endAt: voucher.voucherEndAt
    };
  } catch (error) {
    console.error('Error checking voucher:', error);
    
    // Xử lý lỗi API
    if (error.response) {
      // Nếu API trả về lỗi 404, voucher không tồn tại
      if (error.response.status === 404) {
        return {
          valid: false,
          message: 'Mã giảm giá không tồn tại'
        };
      }
      
      // Nếu API trả về lỗi 400, voucher không hợp lệ
      if (error.response.status === 400) {
        return {
          valid: false,
          message: error.response.data?.message || 'Mã giảm giá không hợp lệ'
        };
      }
    }
    
    // Lỗi khác
    return {
      valid: false,
      message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
    };
  }
};
/**
 * Service để xử lý các gọi API liên quan đến voucher
 */

/**
 * Lấy danh sách tất cả voucher từ API
 * @returns {Promise} Promise trả về danh sách tất cả voucher
 */
export const getAllVouchers = async () => {
  try {
    const response = await apiClient.get('/Vouchers');
    return response.data;
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    throw error;
  }
};

/**
 * Hàm để lấy danh sách voucher (cho tính năng tương lai)
 * @returns {Promise} Danh sách voucher khả dụng
 */
export const getAvailableVouchers = async () => {
  try {
    // Để chuyển sang API thật, chỉ cần uncomment dòng dưới
    // const response = await apiClient.get('/vouchers/available');
    // return response.data;

    // Giả lập API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Lọc voucher còn khả dụng
    const currentDate = new Date();
    return mockVouchersData.filter(voucher => {
      const startDate = new Date(voucher.voucher_startAt);
      const endDate = new Date(voucher.voucher_endAt);
      return voucher.voucher_available === 1 &&
        currentDate >= startDate &&
        currentDate <= endDate;
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
}

/* Lấy danh sách voucher với phân trang
* @param {number} pageIndex - Số trang hiện tại
* @param {number} pageSize - Số voucher mỗi trang
* @param {string} searchTerm - Từ khóa tìm kiếm
* @param {string} sortBy - Sắp xếp theo (CreateAt=0, StartAt=1, EndAt=2)
* @param {string} sortOrder - Thứ tự sắp xếp (Ascending=0, Descending=1)
* @returns {Promise} Promise trả về danh sách voucher phân trang
*/
export const getVouchersPaginated = async (
  pageIndex = 1,
  pageSize = 10,
  searchTerm = null,
  sortBy = null,
  sortOrder = null
) => {
  try {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.append('searchTerm', searchTerm);
    }

    // Xử lý sắp xếp nếu có
    if (sortBy !== null && sortBy !== undefined) {
      params.append('sortBy', sortBy);
    }

    if (sortOrder !== null && sortOrder !== undefined) {
      params.append('sortOrder', sortOrder);
    }

    const queryString = params.toString();
    const url = `/Vouchers/${pageIndex}/${pageSize}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching paginated vouchers:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một voucher theo ID
 * @param {number|string} id - ID của voucher cần lấy thông tin
 * @returns {Promise} Promise trả về thông tin chi tiết voucher
 */
export const getVoucherById = async (id) => {
  try {
    const response = await apiClient.get(`/Voucher/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching voucher with ID ${id}:`, error);
    throw error;
  }
};



/**
 * Tạo voucher mới
 * @param {Object} voucherData - Dữ liệu voucher cần tạo
 * @returns {Promise} Promise trả về thông tin voucher đã tạo
 */
export const createVoucher = async (voucherData) => {
  try {
    const response = await apiClient.post('/Vouchers', voucherData);
    return response.data;
  } catch (error) {
    console.error("Error creating voucher:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin voucher
 * @param {number|string} id - ID của voucher cần cập nhật
 * @param {Object} voucherData - Dữ liệu voucher cần cập nhật
 * @returns {Promise} Promise trả về thông tin voucher đã cập nhật
 */
export const updateVoucher = async (id, voucherData) => {
  try {
    const response = await apiClient.put(`/Voucher/${id}`, voucherData);
    return response.data;
  } catch (error) {
    console.error(`Error updating voucher with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa voucher
 * @param {number|string} id - ID của voucher cần xóa
 * @returns {Promise} Promise trả về kết quả xóa
 */
export const deleteVoucher = async (id) => {
  try {
    const response = await apiClient.delete(`/Voucher/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting voucher with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Kiểm tra tính hợp lệ của mã voucher
 * @param {string} code - Mã voucher cần kiểm tra
 * @returns {Promise} Promise trả về thông tin về tính hợp lệ của voucher
 */
export const validateVoucherCode = async (code) => {
  try {
    const response = await apiClient.get(`/Voucher/validate/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Error validating voucher code ${code}:`, error);
    throw error;
  }
};

/**
 * Tìm kiếm voucher theo tên
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @returns {Promise} Promise trả về danh sách voucher phù hợp với từ khóa
 */
export const searchVouchers = async (searchTerm) => {
  try {
    const response = await apiClient.get(`/Voucher/search?name=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching vouchers:', error);
    throw error;
  }
};

// Export các hàm API
export default {
  getAllVouchers,
  getVouchersPaginated,
  getVoucherById,
  getAvailableVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucherCode,
  searchVouchers // Add the new search function to exports
};
