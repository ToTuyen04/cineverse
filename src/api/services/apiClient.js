import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://cinemamanagement.azurewebsites.net/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm token vào header của mỗi request
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Xử lý lỗi token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      // Có thể thêm chuyển hướng về trang login nếu cần
    }
    return Promise.reject(error);
  }
);

export default apiClient;