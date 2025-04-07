import apiClient from './apiClient';

// Function to export revenue for all theaters
export const exportRevenueAllTheaters = async (reportPeriod, startDate, endDate) => {
  try {
    const response = await apiClient.post(
      '/export-excel-file/revenue/all-theaters',
      {
        reportPeriod,
        startDate,
        endDate,
      },
      {
        responseType: 'blob', // Important for file downloads
      }
    );
    return response;
  } catch (error) {
    console.error('Error exporting revenue for all theaters:', error);
    throw error;
  }
};

// Function to export revenue for a specific theater
export const exportRevenueByTheater = async (reportPeriod, startDate, endDate, theaterId) => {
  try {
    const response = await apiClient.post(
      '/export-excel-file/revenue/theater',
      {
        reportPeriod,
        startDate,
        endDate,
        theaterId,
      },
      {
        responseType: 'blob', // Important for file downloads
      }
    );
    return response;
  } catch (error) {
    console.error('Error exporting revenue for specific theater:', error);
    throw error;
  }
};

// Function to get all theaters
export const getAllTheaters = async () => {
  try {
    const response = await apiClient.get('/Theater');
    return response.data;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    throw error;
  }
};
