import apiClient from './apiClient';

const useMockData = true; // Toggle between mock and real API

export const getTodayShowtimes = async () => {
  if (useMockData) {
    return Promise.resolve(showtimesData);
  }
  return apiClient.get('/showtimes/today');
};

export const getShowtimesByMovie = async (movieId) => {
  if (useMockData) {
    const filteredShowtimes = showtimesData.today.filter(
      showtime => showtime.movieId === parseInt(movieId)
    );
    return Promise.resolve({ showtimes: filteredShowtimes });
  }
  return apiClient.get(`/showtimes/movie/${movieId}`);
};

export const getShowtimesByTheater = async (theaterId) => {
  if (useMockData) {
    const filteredShowtimes = showtimesData.today.filter(
      showtime => showtime.theaterId === parseInt(theaterId)
    );
    return Promise.resolve({ showtimes: filteredShowtimes });
  }
  return apiClient.get(`/showtimes/theater/${theaterId}`);
};

// Get all showtimes
export const getShowtimes = async () => {
  try {
    // In a real app, you'd use apiClient
    // const response = await apiClient.get('/showtimes');
    // return response.data;
    
    return showtimesData;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return [];
  }
};

// Get showtimes filtered by theater and date
export const getShowtimesByTheaterAndDate = async (theaterId, date) => {
  try {
    // const response = await apiClient.get(`/showtimes?theaterId=${theaterId}&date=${date}`);
    // return response.data;
    
    return showtimesData.filter(
      showtime => 
        showtime.theaterId === Number(theaterId) && 
        showtime.date.includes(date)
    );
  } catch (error) {
    console.error('Error fetching filtered showtimes:', error);
    return [];
  }
};

// Add mock data for showtimes if you don't have it already
const mockShowtimes = {
  '1': {
    id: '1',
    movieId: '1',
    theaterId: '1',
    startTime: '2025-03-10T18:30:00',
    endTime: '2025-03-10T20:45:00',
    format: '2D',
    language: 'English',
    price: 10.00
  },
  '2': {
    id: '2',
    movieId: '2',
    theaterId: '1',
    startTime: '2025-03-10T14:00:00',
    endTime: '2025-03-10T16:15:00',
    format: '3D',
    language: 'English',
    price: 12.00
  }
  // Add more showtime data as needed
};

// Get all showtimes
export const getAllShowtimes = async () => {
  try {
    const response = await apiClient.get('/Showtime');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching all showtimes:', error);
    throw error;
  }
};


export const getShowtimesByMovieAndTheater = async (movieId, theaterId) => {
  try {
    const response = await apiClient.get(`/Showtime/${theaterId}/${movieId}`);
    return response.data;
    
    // return showtimesData.filter(
    //   showtime => 
    //     showtime.movieId === Number(movieId) && 
    //     showtime.theaterId === Number(theaterId)
    // );
  } catch (error) {
    console.error('Error fetching filtered showtimes:', error);
    return [];
  }
}
// Get showtime by ID
export const getShowtimeById = async (id) => {
  try {
    const response = await apiClient.get(`/Showtime/${id}`);
    console.log(`Showtime API response for ID ${id}:`, response.data);
    
    if (!response.data || !response.data.success) {
      console.error(`Invalid response from Showtime API for ID ${id}:`, response.data);
      return null;
    }
    
    return response.data.success ? response.data.data : null;
  } catch (error) {
    console.error(`Error fetching showtime with id ${id}:`, error);
    throw error;
  }
};

// Update showtime
export const updateShowtime = async (id, showtimeData) => {
  try {
    const response = await apiClient.put(`/Showtime/${id}`, showtimeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating showtime with id ${id}:`, error);
    throw error;
  }
};

// Delete showtime
export const deleteShowtime = async (id) => {
  try {
    const response = await apiClient.delete(`/Showtime/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting showtime with id ${id}:`, error);
    throw error;
  }
};

// Create showtime
export const createShowtime = async (showtimeData) => {
  try {
    const response = await apiClient.post('/Showtime', showtimeData);
    return response.data;
  } catch (error) {
    console.error('Error creating showtime:', error);
    throw error;
  }
};

// Get all rooms for selection in form
export const getAllRooms = async () => {
  try {
    const response = await apiClient.get('/Room');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    throw error;
  }
};

// Get all movies for selection in form
export const getActiveMovies = async () => {
  try {
    const response = await apiClient.get('/Movie/active');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching active movies:', error);
    throw error;
  }
};

// Get all movies from Movies API
export const getAllMovies = async () => {
  try {
    const response = await apiClient.get('/Movies');
    
    // Debug the response
    console.log("Movies API response:", response.data);
    
    // Add additional error handling
    if (!response.data || !response.data.success) {
      console.error("Invalid response from Movies API:", response.data);
      return [];
    }
    
    // Check if data exists and is an array
    if (!response.data.data || !Array.isArray(response.data.data)) {
      console.error("No movies data found or data is not an array:", response.data);
      return [];
    }
    
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching all movies:', error);
    return []; // Return empty array instead of throwing
  }
};

// Get paginated showtimes
export const getPaginatedShowtimes = async (pageIndex = 1, pageSize = 10, searchTerm = '') => {
  try {
    let url = `/Showtime/paginated?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    
    // Add search parameter if provided
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    
    const response = await apiClient.get(url);
    
    if (!response.data || !response.data.success) {
      console.error('Invalid response from paginated showtimes API:', response.data);
      return { 
        items: [], 
        pageIndex: 1, 
        pageSize, 
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching paginated showtimes:', error);
    throw error;
  }
};


/**
 * Lấy lịch chiếu phim theo rạp và phim
 * @param {number|string} movieId - ID của phim
 * @param {number|string} theaterId - ID của rạp
 * @returns {Promise} Promise trả về lịch chiếu phim
 */
export const getMovieScheduleByTheaterAndMovie = async (movieId, theaterId) => {
  try {
    const response = await apiClient.get(`/Movies/${movieId}/theater/${theaterId}/schedule`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching schedule for movie ${movieId} at theater ${theaterId}:`, error);
    throw error;
  }
};