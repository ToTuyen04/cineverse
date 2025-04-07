import apiClient from './apiClient';
import promotionsData from '../mock/promotions.json';

const useMockData = true; // Toggle between mock and real API

export const getPromotions = async () => {
  if (useMockData) {
    return Promise.resolve(promotionsData);
  }
  return apiClient.get('/promotions');
};