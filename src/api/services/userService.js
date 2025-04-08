// Các dịch vụ liên quan đến thông tin người dùng


import apiClient from "./apiClient";

/**
 * Lấy thông tin người dùng
 * @returns {Promise<object>} - Thông tin người dùng
 */
export const getUserProfile = async (token) => {
  try {
    // Lấy token từ localStorage

    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    // Gọi API lấy thông tin người dùng với token trong header
    const response = await apiClient.get('/auth/logged-profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Lấy dữ liệu từ response
    // const userData = response.data;
    return response.data;

    // Map dữ liệu từ API vào định dạng cần thiết cho ứng dụng
    // return {
    //   // Thông tin cơ bản từ API
    //   email: userData.email,
    //   firstName: userData.firstName,
    //   lastName: userData.lastName,
    //   phoneNumber: userData.phoneNumber,
    //   avatar: userData.avatar,
    //   dateOfBirth: userData.dateOfBirth,
    //   gender: userData.gender,
    //   userRank: userData.userRank || 'Mầm',
    //   userPoint: userData.userPoint || 0,
    //   createdAt: userData.createdAt,

    //   // Các trường bổ sung cho tương thích với code hiện tại
    //   user_search_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
    //   user_avatar: userData.avatar,
    //   user_date_of_birth: userData.dateOfBirth || null,
    //   user_gender: mapGenderToCode(userData.gender),
    //   user_point: userData.userPoint || 0,
    //   user_status: 'active',
    //   rank_id: userData.userRank
    // };
  } catch (error) {
    console.error('Error getting user profile:', error);

    // Xử lý lỗi cụ thể
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token'); // Xóa token không hợp lệ
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    throw error;
  }
};

/**
 * Cập nhật thông tin người dùng
 * @param {object} userInfo - Thông tin người dùng cần cập nhật
 * @returns {Promise<object>} - Thông tin người dùng đã cập nhật
 */
export const updateUserProfile = async (userInfo) => {
  try {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }

    // Chuyển đổi giới tính từ chuỗi sang số
    const genderMapping = {
      'm': 1,
      'f': 2,
      'o': 3,
      'nam': 1,
      'nữ': 2,
      'nu': 2,
      'khác': 3,
      'khac': 3
    };

    // Format ngày tháng năm sinh nếu có
    let formattedDateOfBirth = null;
    if (userInfo.dateOfBirth) {
      formattedDateOfBirth = new Date(userInfo.dateOfBirth).toISOString();
    }

    // Tạo payload theo format yêu cầu của API
    const payload = {
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phoneNumber,
      dateOfBirth: formattedDateOfBirth,
      gender: typeof userInfo.gender === 'string'
        ? genderMapping[userInfo.gender.toLowerCase()] || 0
        : userInfo.gender,
      avatar: userInfo.avatar || null,
      status: 1 // Mặc định là active
    };
    // Gọi API cập nhật thông tin người dùng
    const response = await apiClient.put('/users', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Lấy dữ liệu từ response
    const updatedData = response.data;
    // Map dữ liệu từ API vào định dạng cần thiết cho ứng dụng
    return {
      // Thông tin cơ bản từ API
      email: updatedData.email,
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      phoneNumber: updatedData.phoneNumber,
      avatar: updatedData.avatar,
      dateOfBirth: updatedData.dateOfBirth,
      gender: mapGenderFromCode(updatedData.gender),
      userRank: updatedData.userRank || 'Mầm',
      userPoint: updatedData.userPoint || 0,
      status: 1,

      // Các trường bổ sung cho tương thích với code hiện tại
      user_search_name: `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim(),
      user_avatar: updatedData.avatar,
      user_date_of_birth: updatedData.dateOfBirth || null,
      user_gender: mapGenderToCode(mapGenderFromCode(updatedData.gender)),
      user_point: updatedData.userPoint || 0,
      user_status: updatedData.status ? 'active' : 'inactive',
      rank_id: mapRankToId(updatedData.userRank)
    };
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Xử lý lỗi cụ thể
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token'); // Xóa token không hợp lệ
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    // Các lỗi khác
    throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin người dùng');
  }
};

/**
 * Cập nhật ảnh đại diện
 * @param {File} avatarFile - File ảnh đại diện
 * @returns {Promise<string>} - URL ảnh đại diện mới
 */
export const updateUserAvatar = async (avatarFile) => {
  // TODO: Thay thế bằng API thật khi có
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Tạo URL cho ảnh (giả lập upload)
  const avatarUrl = URL.createObjectURL(avatarFile);

  // Cập nhật avatar trong thông tin người dùng
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const updatedUserData = { ...userData, user_avatar: avatarUrl };

  localStorage.setItem('userData', JSON.stringify(updatedUserData));
  return avatarUrl;
};

/**
 * Đổi mật khẩu người dùng
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 * @returns {Promise<boolean>} - Kết quả thay đổi mật khẩu
 */
export const changePassword = async (currentPassword, newPassword) => {
  // TODO: Thay thế bằng API thật khi có
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Giả lập kiểm tra mật khẩu hiện tại
  const mockCurrentPassword = 'Password123!';
  if (currentPassword !== mockCurrentPassword) {
    throw new Error('Mật khẩu hiện tại không đúng');
  }

  // Đổi mật khẩu thành công
  return true;
};

/**
 * Lấy danh sách tất cả người dùng
 * @returns {Promise<Array>} - Danh sách người dùng
 */
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    
    const response = await apiClient.get('/users/get-all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.isSuccessful) {
      return response.data.users;
    } else {
      throw new Error(response.data.message || 'Không thể lấy danh sách người dùng');
    }
  } catch (error) {
    console.error('Error getting all users:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    throw error;
  }
};

/**
 * Lấy lịch sử mua hàng của người dùng
 * @param {string} email - Email của người dùng
 * @returns {Promise<Array>} - Lịch sử mua hàng
 */
export const getUserPurchaseHistory = async (email) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    
    const encodedEmail = encodeURIComponent(email);
    const response = await apiClient.get(`/users/profile/purchase-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Không thể lấy lịch sử mua hàng');
    }
  } catch (error) {
    console.error('Error getting user purchase history:', error);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    throw error;
  }
};

/**
 * Cập nhật trạng thái người dùng
 * @param {object} userData - Thông tin người dùng với trạng thái mới
 * @returns {Promise<object>} - Thông tin người dùng đã cập nhật
 */
export const updateUserStatus = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    
    const payload = {
      email: userData.userEmail,
      firstName: userData.userFirstName,
      lastName: userData.userLastName,
      phoneNumber: userData.userPhoneNumber,
      dateOfBirth: userData.userDateOfBirth,
      gender: userData.userGender,
      avatar: userData.userAvatar || "",
      status: userData.userStatus === 1 ? 0 : 1 // Toggle status
    };
    
    const response = await apiClient.put('/users/status', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.isSuccessful) {
      return response.data.user;
    } else {
      throw new Error(response.data.message || 'Không thể cập nhật trạng thái người dùng');
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    
    if (error.response && error.response.status === 400) {
      const validationErrors = error.response.data.errors;
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        throw new Error(errorMessages);
      }
    }
    
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    
    throw error;
  }
};

/**
 * Hàm lấy tên cấp bậc dựa trên rankId
 * @param {number} rankId - ID cấp bậc
 * @returns {string} - Tên cấp bậc
 */
export const getRankName = (rankId) => {
  switch (rankId) {
    case 1: return 'Thành viên mới';
    case 2: return 'Thành viên Bạc';
    case 3: return 'Thành viên Vàng';
    case 4: return 'VIP';
    default: return 'Thành viên mới';
  }
};

/**
 * Tính phần trăm để lên cấp tiếp theo
 * @param {number} rankId - ID cấp bậc
 * @param {number} points - Điểm hiện tại
 * @returns {number} - Phần trăm hoàn thành
 */
export const getNextRankProgress = (rankId, points) => {
  switch (rankId) {
    case 1: return Math.min(points / 1000 * 100, 100);
    case 2: return Math.min((points - 1000) / 1000 * 100, 100);
    case 3: return Math.min((points - 2000) / 3000 * 100, 100);
    case 4: return 100;
    default: return 0;
  }
};

/**
 * Xác định điểm cần thêm để lên cấp tiếp theo
 * @param {number} rankId - ID cấp bậc
 * @param {number} points - Điểm hiện tại
 * @returns {number} - Số điểm cần thêm
 */
export const getPointsToNextRank = (rankId, points) => {
  switch (rankId) {
    case 1: return 1000 - points;
    case 2: return 2000 - points;
    case 3: return 5000 - points;
    case 4: return 0;
    default: return 1000;
  }
};

/**
 * Map giới tính từ chuỗi thành mã
 * @param {string} gender - Giới tính (Nam, Nữ, Khác)
 * @returns {string} - Mã giới tính (M, F, O)
 */
const mapGenderToCode = (gender) => {
  if (!gender) return null;

  if (typeof gender === 'number') {
    // Nếu đã là số, giữ nguyên
    return gender >= 1 && gender <= 3 ? gender : null;
  }

  switch (gender.toLowerCase()) {
    case 'nam':
      return 'M';
    case 'nữ':
    case 'nu':
      return 'F';
    case 'khác':
    case 'khac':
      return 'O';
    default:
      return null;
  }
};

/**
 * Map mã giới tính thành chuỗi
 * @param {number} genderCode - Mã giới tính (0, 1, 2)
 * @returns {string} - Giới tính dạng chuỗi (Nam, Nữ, Khác)
 */
const mapGenderFromCode = (genderCode) => {
  switch (genderCode) {
    case 1:
      return 'Nam';
    case 2:
      return 'Nữ';
    case 3:
      return 'Khác';
    default:
      return 'Khác';
  }
};

/**
 * Map cấp bậc thành ID
 * @param {string} rank - Tên cấp bậc
 * @returns {number} - ID cấp bậc
 */
const mapRankToId = (rank) => {
  if (!rank) return 1;

  switch (rank.toLowerCase()) {
    case 'mầm':
    case 'mam':
      return 1;
    case 'bạc':
    case 'bac':
      return 2;
    case 'vàng':
    case 'vang':
      return 3;
    case 'kim cương':
    case 'kim cuong':
      return 4;
    default:
      return 1;
  }
};