import apiClient from './apiClient';

// Gọi API tạo đơn hàng
export const createOrder = async (orderPayload) => {
  const response = await apiClient.post('/orders', orderPayload);
  return response.data;
};

// Gọi API tạo link thanh toán VNPay
export const createPaymentUrl = async (orderId) => {
  const response = await apiClient.post('/payment/create-payment-url', { orderId });
  return response.data;
};

// Thêm hàm này vào file orderService.js
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Thêm hàm mới để xử lý callback VNPay từ frontend
export const processVnPayCallback = async (params) => {
  try {
    const response = await apiClient.get('/payment/process-payment-callback', { params });
    return response.data;
  } catch (error) {
    console.error('Error processing VNPay callback:', error);
    throw error;
  }
};

// Lấy danh sách tất cả đơn hàng (dùng cho trang admin)
export const fetchOrders = async (filters = {}) => {
  try {
    const response = await apiClient.get('/orders', { params: filters });
    return response.data.data; // Lấy phần data từ SuccessResponse
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};


// Sử dụng mock data từ file JSON riêng biệt
export const fetchOrdersMock = async () => {
  try {
    // Import JSON file trực tiếp
    const ordersData = await import('../mock/orders.json');
    
    // Mô phỏng độ trễ của mạng
    return new Promise((resolve) => {
      setTimeout(() => {
        // ordersData.default vì import JSON trả về { default: [...data] }
        resolve(ordersData.default);
      }, 800);
    });
  } catch (error) {
    console.error('Error fetching mock orders:', error);
    throw error;
  }
};