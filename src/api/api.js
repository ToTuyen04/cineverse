import axios from 'axios';

// Tạo một instance của axios với cấu hình cơ bản
const api = axios.create({
  baseURL: 'https://localhost:7212', // Thay đổi URL API thật tại đây
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Thêm interceptor cho các yêu cầu
api.interceptors.request.use(
  config => {
    // Lấy token từ localStorage nếu có
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Thêm interceptor cho các phản hồi
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Xử lý lỗi phản hồi
    if (error.response && error.response.status === 401) {
      // Xử lý lỗi xác thực (ví dụ: đăng xuất người dùng, chuyển hướng đến trang đăng nhập)
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;