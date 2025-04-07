import { useState, useEffect, useCallback } from 'react';
import { 
  getAllShowtimes, 
  getShowtimeById, 
  createShowtime, 
  updateShowtime, 
  deleteShowtime,
  getPaginatedShowtimes
} from '../api/services/showtimeService';

const useShowtimes = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  const fetchShowtimes = useCallback(async (pageIndex = 1, pageSize = 10, searchTerm = '') => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the paginated API instead of getAllShowtimes
      const paginatedData = await getPaginatedShowtimes(pageIndex, pageSize, searchTerm);
      setShowtimes(paginatedData.items || []);
      
      // Update pagination information
      setPagination({
        pageIndex: paginatedData.pageIndex,
        pageSize: paginatedData.pageSize,
        totalCount: paginatedData.totalCount,
        totalPages: paginatedData.totalPages,
        totalItems: paginatedData.totalCount,
        hasNextPage: paginatedData.hasNextPage,
        hasPreviousPage: paginatedData.hasPreviousPage
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch showtimes');
      console.error('Error fetching showtimes:', err);
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Add a showtime
  const addShowtime = async (showtimeData) => {
    try {
      await createShowtime(showtimeData);
      fetchShowtimes(pagination.pageIndex, pagination.pageSize); // Refresh with current pagination
      return { success: true };
    } catch (err) {
      console.error('Error adding showtime:', err);
      return { success: false, error: err.response.data.message || 'Failed to add showtime' };
    }
  };
  
  // Update a showtime
  const editShowtime = async (id, showtimeData) => {
    try {
      await updateShowtime(id, showtimeData);
      fetchShowtimes(pagination.pageIndex, pagination.pageSize); // Refresh with current pagination
      return { success: true };
    } catch (err) {
      console.error('Error updating showtime:', err);
      return { success: false, error: err.response.data.message || 'Failed to update showtime' };
    }
  };
  
  // Delete a showtime
  const removeShowtime = async (id) => {
    try {
      await deleteShowtime(id);
      fetchShowtimes(pagination.pageIndex, pagination.pageSize); // Refresh with current pagination
      return { success: true };
    } catch (err) {
      console.error('Error deleting showtime:', err);
      return { success: false, error: err.response.data.message || 'Failed to delete showtime' };
    }
  };
  
  // Get a showtime by ID
  const getShowtime = async (id) => {
    try {
      const showtime = await getShowtimeById(id);
      return showtime;
    } catch (err) {
      console.error('Error getting showtime:', err);
      return null;
    }
  };
  
  useEffect(() => {
    fetchShowtimes(1, 10); // Initial fetch with default pagination
  }, [fetchShowtimes]);
  
  return {
    showtimes,
    loading,
    error,
    pagination, // Expose pagination info
    addShowtime,
    editShowtime,
    removeShowtime,
    getShowtime,
    refreshShowtimes: fetchShowtimes // The refreshShowtimes function now accepts pagination params
  };
};

export default useShowtimes;
