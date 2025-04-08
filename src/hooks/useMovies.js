import { useState, useEffect, useCallback, useRef } from 'react';
import { getMoviesPaginated, createMovie, updateMovie, deleteMovie, getMovieById } from '../api/services/movieService';

const useMovies = (options = {}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  // Use a ref to store the previous options to compare and prevent unnecessary fetches
  const prevOptionsRef = useRef(null);
  const isInitialMount = useRef(true);
  
  // Fetch movies based on current options
  const fetchMovies = useCallback(async (forceRefresh = false) => {
    // Convert options to a string for comparison
    const optionsString = JSON.stringify(options);
    
    // Skip if options haven't changed and not forcing refresh
    if (!forceRefresh && prevOptionsRef.current === optionsString) {
      return;
    }
    
    // Update the previous options ref
    prevOptionsRef.current = optionsString;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching movies with options:", options);
      
      const data = await getMoviesPaginated(
        options.page || 1,
        options.limit || 10,
        options.search || '',
        options.genreIds || [],
        options.movieSortBy,
        options.sortOrder
      );
      
      // Set movies from the response
      setMovies(data.items || []);
      
      // Update pagination info
      setPagination({
        currentPage: options.page || 1,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || 0
      });
      
    } catch (err) {
      setError(err.message || 'Failed to fetch movies');
      console.error('Error fetching movies:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [options]);
  
  // Only fetch on mount and when options change
  useEffect(() => {
    // Skip on initial mount - we'll manually trigger the first fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchMovies(true); // Force initial fetch
      return;
    }
    
    // On subsequent renders, only fetch if options changed
    fetchMovies();
  }, [fetchMovies]);
  
  // Add a movie
  const addMovie = async (movieData) => {
    try {
      await createMovie(movieData);
      // Refresh the list after adding
      fetchMovies();
      return { success: true };
    } catch (err) {
      console.error('Error adding movie:', err);
      return { success: false, error: err.response.data.message || 'Failed to add movie' };
    }
  };
  
  // Update a movie
  const editMovie = async (id, movieData) => {
    try {
      await updateMovie(id, movieData);
      // Refresh the list after updating
      fetchMovies();
      return { success: true };
    } catch (err) {
      console.error('Error updating movie:', err);
      return { success: false, error: err.response.data.message || 'Failed to update movie' };
    }
  };
  
  // Delete a movie
  const removeMovie = async (id) => {
    try {
      await deleteMovie(id);
      // Refresh the list after deleting
      fetchMovies();
      return { success: true };
    } catch (err) {
      console.error('Error deleting movie:', err.response.data.message);
      return { success: false, error: err.response.data.message || 'Failed to delete movie' };
    }
  };
  
  // Get a movie by ID
  const getMovie = async (id) => {
    try {
      console.log(`Fetching movie with ID: ${id}`);
      const movie = await getMovieById(id);
      
      console.log('Movie data received:', movie);
      
      // Check if we received valid movie data
      if (!movie || typeof movie !== 'object') {
        console.error('Invalid movie data received:', movie);
        throw new Error('Invalid movie data received from server');
      }
      
      // Extract genre IDs directly from the API response
      if (movie && movie.genres) {
        // API already provides genresId in each genre object
        movie.genreIds = movie.genres.map(genre => genre.genresId);
        
        // Keep the original genres for display
        movie.genresDisplay = movie.genres;
      } else {
        console.warn('Movie has no genres data:', movie);
        movie.genreIds = [];
        movie.genresDisplay = [];
      }
      
      return movie;
    } catch (err) {
      console.error('Error getting movie details:', err);
      throw err; // Propagate error to be handled by the component
    }
  };
  
  return {
    movies,
    loading,
    error,
    pagination,
    addMovie,
    editMovie,
    removeMovie,
    getMovie,
    refreshMovies: () => fetchMovies(true) // Force refresh when called explicitly
  };
};

export default useMovies;