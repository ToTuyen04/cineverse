// Các dịch vụ liên quan đến xác thực người dùng
import apiClient from './apiClient';

/**
 * Xử lý lỗi từ API
 * @param {Error} error - Lỗi từ API
 * @returns {Error} - Lỗi đã xử lý
 */
const handleApiError = (error) => {
  if (error.response) {
    // Lỗi từ phía server với response status khác 2xx
    const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          'Đã có lỗi xảy ra khi xử lý yêu cầu';
    return new Error(errorMessage);
  } else if (error.request) {
    // Lỗi từ phía client (không nhận được response)
    return new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
  } else {
    // Lỗi khác
    return new Error('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
  }
};

/**
 * Lưu thông tin người dùng vào localStorage
 * @param {object} userData - Thông tin người dùng
 */
const saveUserData = (userData) => {
  localStorage.setItem('token', userData.token);
  localStorage.setItem('userEmail', userData.userEmail);
  localStorage.setItem('userFullName', userData.userFullName);
  
  // Đặt thời gian hết hạn phiên đăng nhập (1 ngày)
  const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
  localStorage.setItem('expirationTime', expirationTime.toString());
};

/**
 * Đăng nhập bằng email
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise<object>} - Kết quả đăng nhập
 */
export const loginWithEmail = async (email, password) => {
  try {
    const response = await apiClient.post('/Auth/login', { email, password });
    const userData = response.data;
    
    
    // Nếu đăng nhập thành công, lưu thông tin người dùng vào localStorage
    return userData;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Đăng nhập bằng số điện thoại
 * @param {string} phone - Số điện thoại
 * @param {string} password - Mật khẩu
 * @returns {Promise<object>} - Kết quả đăng nhập
 */
export const loginWithPhone = async (phone, password) => {
  try {
    const response = await apiClient.post('/Auth/login-phone', { phone, password });
    const userData = response.data;
    
    if (userData.isSuccessful) {
      // Lưu thông tin người dùng vào localStorage
      saveUserData(userData);
    }
    
    return userData;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Đăng nhập bằng Google
 * @returns {Promise<object>} - Thông tin người dùng
 */
export const loginWithGoogle = async () => {
  // TODO: Implement Google OAuth login
  await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập API call
  
  return {
    id: 'google_user_123',
    email: 'google_user@gmail.com',
    firstName: 'Google',
    lastName: 'User',
    user_avatar: 'https://example.com/avatar.jpg',
    user_status: 'active',
    user_point: 0,
    rank_id: 1,
    user_createAt: new Date().toISOString()
  };
};

/**
 * Kiểm tra người dùng đã đăng nhập chưa
 * @returns {boolean} - Trạng thái đăng nhập
 */
export const checkIsLoggedIn = () => {
  const token = localStorage.getItem('token');
  const expirationTime = localStorage.getItem('expirationTime');
  
  if (!token || !expirationTime) {
    return false;
  }
  
  // Kiểm tra xem token đã hết hạn chưa
  const now = new Date().getTime();
  if (now > parseInt(expirationTime)) {
    logout(); // Đăng xuất nếu token đã hết hạn
    return false;
  }
  
  return true;
};

/**
 * Đăng xuất người dùng
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userFullName');
  localStorage.removeItem('isStaff');
  localStorage.removeItem('role');
  localStorage.removeItem('expirationTime');
};

/**
 * Đăng ký tài khoản mới
 * @param {object} userData - Thông tin đăng ký người dùng
 * @returns {Promise<object>} - Thông tin người dùng đã đăng ký
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/Auth/register', {
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Xác thực email người dùng
 * @param {string} token - Token xác thực email
 * @returns {Promise<object>} - Kết quả xác thực
 */
export const confirmEmail = async (token) => {
  try {
    // Đã đổi từ method GET sang POST theo yêu cầu
    const response = await apiClient.post(`/Auth/confirm-email?token=${token}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Yêu cầu gửi lại email xác thực
 * @param {string} email - Email người dùng
 * @returns {Promise<object>} - Kết quả yêu cầu
 */
export const resendConfirmationEmail = async (email) => {
  try {
    const response = await apiClient.post('/Auth/resend-confirmation-email', { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 * @returns {object|null} - Thông tin người dùng hoặc null nếu chưa đăng nhập
 */
export const getCurrentUser = () => {
  if (!checkIsLoggedIn()) {
    return null;
  }
  
  return {
    email: localStorage.getItem('userEmail'),
    fullName: localStorage.getItem('userFullName'),
    isStaff: localStorage.getItem('isStaff') === 'true',
    role: localStorage.getItem('role')
  };
};

/**
 * Lấy token hiện tại
 * @returns {string|null} - Token hoặc null nếu chưa đăng nhập
 */
export const getToken = () => {
  if (!checkIsLoggedIn()) {
    return null;
  }
  
  return localStorage.getItem('token');
};

/**
 * Cập nhật thông tin người dùng
 * @param {object} userData - Thông tin người dùng cần cập nhật
 * @returns {Promise<object>} - Thông tin người dùng đã cập nhật
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.put('/Auth/update-profile', userData);
    
    // Cập nhật thông tin người dùng trong localStorage
    const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    localStorage.setItem('userData', JSON.stringify({ ...currentUser, ...response.data }));
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Yêu cầu đặt lại mật khẩu
 * @param {string} email - Email người dùng
 * @returns {Promise<object>} - Kết quả yêu cầu
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/Auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Đặt lại mật khẩu
 * @param {Object} resetData - Dữ liệu đặt lại mật khẩu
 * @returns {Promise<object>} - Kết quả đặt lại mật khẩu
 */
export const resetPassword = async (resetData) => {
  try {
    const response = await apiClient.post('/Auth/reset-password', resetData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Thay đổi mật khẩu
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 * @param {string} confirmPassword - Xác nhận mật khẩu mới
 * @returns {Promise<object>} - Kết quả thay đổi mật khẩu
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await apiClient.post('/Auth/reset-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Thêm hàm xác thực tài khoản
 * @param {string} token - Mã xác thực tài khoản
 * @returns {Promise<object>} - Kết quả xác thực
 */
export const verifyAccount = async (token) => {
  try {
    const response = await apiClient.post('/auth/verify-account', { token });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};