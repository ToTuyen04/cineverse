import apiClient from './apiClient';

// Gọi API tạo đơn hàng
export const createOrder = async (orderPayload) => {
  const response = await apiClient.post('/orders', orderPayload);
  return response.data;
};

// Gọi API tạo link thanh toán VNPay
export const createPaymentUrl = async (orderId) => {
  const response = await apiClient.post('/Payment/create-payment-url', { orderId });
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
    const response = await apiClient.get('/Payment/process-payment-callback', { params });
    return response.data;
  } catch (error) {
    console.error('Error processing VNPay callback:', error);
    throw error;
  }
};