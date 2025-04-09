import axios from 'axios';

// Create a unified API client with common configuration
const apiClient = axios.create({
  // baseURL: 'https://localhost:7212/api',
  baseURL: 'https://cinemamanagement.azurewebsites.net/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - adds auth token and logs requests
apiClient.interceptors.request.use( 
  config => {
    // Sửa key lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles auth errors and logs responses
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Sửa key xóa token
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullName');
      localStorage.removeItem('expirationTime');
      localStorage.removeItem('isStaff');
      localStorage.removeItem('role');
      
      // Optional: redirect to login page
      // window.location.href = '/login';
    }
    
    console.error(`[API ERROR] ${error.message}`, error.response?.data);
    return Promise.reject(error);
  }
);

// For backwards compatibility with any import of the old API file
export const api = apiClient;
export default apiClient;