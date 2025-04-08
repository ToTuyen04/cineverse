import api from '../api';
import apiClient from './apiClient';
// import concessionsData from '../mock/concessions.json';

// Lấy danh sách đồ ăn nước uống
export const getConcessions = async () => {
  try {
    // TODO: Thay thế bằng API call thật khi có
    const response = await apiClient.get('/combos');
    return response.data.filter((item) => item.comboAvailable === true);
    // Sử dụng mock data
    // return concessionsData;
  } catch (error) {
    console.error('Error fetching concessions:', error);
    throw error;
  }
};