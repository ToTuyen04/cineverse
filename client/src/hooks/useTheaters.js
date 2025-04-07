import { useState, useEffect, useCallback } from 'react';
import { getTheatersPaginated, searchTheaters, createTheater, updateTheater, deleteTheater, getTheaterById, getAllAreas } from '../api/services/theaterService';

const useTheaters = (options = {}) => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  const {
    page = 1,
    limit = 10,
    search = ''
  } = options;
  
  const fetchTheaters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      // If search term is provided, use search endpoint
      if (search && search.trim() !== '') {
        data = await searchTheaters(search);
      } else {
        // Otherwise use paginated endpoint
        data = await getTheatersPaginated(page, limit);
      }
      
      // Set theaters from the response
      setTheaters(data.items || data);
      
      // Update pagination info
      setPagination({
        currentPage: data.pageIndex || page,
        totalPages: data.totalPages || Math.ceil((data.totalCount || 0) / limit),
        totalItems: data.totalCount || data.totalItems || data.length || 0
      });
      
    } catch (err) {
      setError(err.message || 'Failed to fetch theaters');
      console.error('Error fetching theaters:', err);
      setTheaters([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);
  
  // Add a theater
  const addTheater = async (theaterData) => {
    try {
      await createTheater(theaterData);
      // Refresh the list after adding
      fetchTheaters();
      return { success: true };
    } catch (err) {
      console.error('Error adding theater:', err);
      return { success: false, error: err.message || 'Failed to add theater' };
    }
  };
  
  // Update a theater
  const editTheater = async (id, theaterData) => {
    try {
      await updateTheater(id, theaterData);
      // Refresh the list after updating
      fetchTheaters();
      return { success: true };
    } catch (err) {
      console.error('Error updating theater:', err);
      return { success: false, error: err.message || 'Failed to update theater' };
    }
  };
  
  // Delete a theater
  const removeTheater = async (id) => {
    try {
      await deleteTheater(id);
      // Refresh the list after deleting
      fetchTheaters();
      return { success: true };
    } catch (err) {
      console.error('Error deleting theater:', err);
      return { success: false, error: err.message || 'Failed to delete theater' };
    }
  };
  
  // Get a theater by ID
  const getTheater = async (id) => {
    try {
      const theater = await getTheaterById(id);
      
      // Map field names if needed
      if (theater) {
        // Map location to address for consistency with form
        if (theater.theaterLocation && !theater.theaterAddress) {
          theater.theaterAddress = theater.theaterLocation;
        }
        
        // Map hotline to phone for consistency with form
        if (theater.theaterHotline && !theater.theaterPhone) {
          theater.theaterPhone = theater.theaterHotline;
        }
        
        // Extract area IDs if present
        if (theater && theater.areas) {
          theater.areaIds = theater.areas.map(area => area.areaId);
          theater.areasDisplay = theater.areas;
        }
      }
      
      return theater;
    } catch (err) {
      console.error('Error getting theater:', err);
      return null;
    }
  };
  
  useEffect(() => {
    fetchTheaters();
  }, [fetchTheaters]);
  
  return {
    theaters,
    loading,
    error,
    pagination,
    addTheater,
    editTheater,
    removeTheater,
    getTheater,
    refreshTheaters: fetchTheaters
  };
};

export default useTheaters;
