import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  useTheme,
  CircularProgress,
  Box,
  Avatar,
  Chip,
  ListItemText,
  Paper,
  FormControlLabel,
  Switch
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import axios from 'axios'; // Added axios import for direct API calls
import CustomDateTimePicker from '../../admin/Movies/components/forms/CustomDateTimePicker';
import { formatDateForDisplay } from '../../admin/Movies/utils/movieFormHelpers';

// Helper to format dates for input fields
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
};

// Utility to preserve the exact local time when submitting dates
const preserveLocalTime = (date) => {
  if (!date) return null;

  const d = new Date(date);

  // Create an ISO string that preserves the exact time as displayed to the user
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  // Format: YYYY-MM-DDTHH:MM:SS - no timezone specifier
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Function to display the date in user's locale with timezone information
const formatDateTimeWithTimezone = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
};

// New API service functions
const fetchAllMovies = async () => {
  try {
    const response = await axios.get('https://cinemamanagement.azurewebsites.net/api/Movies');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

const fetchAllRooms = async () => {
  try {
    const response = await axios.get('https://cinemamanagement.azurewebsites.net/api/Rooms');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

const fetchMovieById = async (id) => {
  try {
    const response = await axios.get(`https://cinemamanagement.azurewebsites.net/api/Movies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie with id ${id}:`, error);
    return null;
  }
};

const fetchRoomById = async (id) => {
  try {
    const response = await axios.get(`https://cinemamanagement.azurewebsites.net/api/Rooms/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching room with id ${id}:`, error);
    return null;
  }
};

const ShowtimeForm = ({ open, handleClose, showtime, onSubmit, isEdit = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    showtimeMovieId: 0,
    showtimeStartAt: new Date(),
    showtimeCreatedBy: 1,
    showtimeRoomId: 0,
    showtimeAvailable: true // Add default value for availability
  });
  
  const [errors, setErrors] = useState({});
  const [rooms, setRooms] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  
  // Fetch rooms and movies when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsData, moviesData] = await Promise.all([
          fetchAllRooms(),
          fetchAllMovies()
        ]);
        
        console.log("Movies data received:", moviesData);
        
        setRooms(roomsData || []);
        setMovies(moviesData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [open]);
  
  // Reset form completely when opened
  const resetForm = () => {
    console.log("Resetting form data completely");
    
    // Reset form data to defaults
    setFormData({
      showtimeMovieId: 0,
      showtimeStartAt: new Date(),
      showtimeCreatedBy: 1,
      showtimeRoomId: 0,
      showtimeAvailable: true
    });
    
    // Clear errors
    setErrors({});
    
    // Clear selected details
    setSelectedMovieDetails(null);
    setSelectedRoomDetails(null);
  };
  
  // Initialize form when dialog opens/closes or edit state changes
  useEffect(() => {
    // When dialog opens
    if (open) {
      console.log("Dialog opened, isEdit:", isEdit);
      
      if (isEdit && showtime) {
        console.log("Initializing form with showtime data:", showtime);
        
        setFormData({
          showtimeMovieId: Number(showtime.movieId) || 0,
          showtimeStartAt: showtime.showtimeStartAt ? new Date(showtime.showtimeStartAt) : new Date(),
          showtimeCreatedBy: showtime.showtimeCreatedBy || 1,
          showtimeRoomId: Number(showtime.roomId) || 0,
          showtimeAvailable: showtime.showtimeAvailable !== undefined ? showtime.showtimeAvailable : true
        });
        
      } else {
        // Always reset form completely when opening in add mode
        resetForm();
      }
    }
  }, [isEdit, showtime, open]);
  
  // Fetch specific movie and room details when selected or when editing
  useEffect(() => {
    const fetchSelectedDetails = async () => {
      // When movie ID is available, fetch details regardless of edit mode
      if (formData.showtimeMovieId > 0) {
        try {
          const movieDetails = await fetchMovieById(formData.showtimeMovieId);
          if (movieDetails) {
            console.log("Fetched movie details:", movieDetails);
            setSelectedMovieDetails(movieDetails);
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
      }
      
      // When room ID is available, fetch details regardless of edit mode
      if (formData.showtimeRoomId > 0) {
        try {
          const roomDetails = await fetchRoomById(formData.showtimeRoomId);
          if (roomDetails) {
            console.log("Fetched room details:", roomDetails);
            setSelectedRoomDetails(roomDetails);
          }
        } catch (error) {
          console.error("Error fetching room details:", error);
        }
      }
    };
    
    fetchSelectedDetails();
  }, [formData.showtimeMovieId, formData.showtimeRoomId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changed ${name} to:`, value);
    
    setFormData({
      ...formData,
      [name]: name === "showtimeMovieId" || name === "showtimeRoomId" ? Number(value) : value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Add a handler for toggle/switch inputs
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    console.log(`Changed ${name} to:`, checked);
    
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleDateInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Date changed (${name}):`, value);
    
    // Store the date directly without timezone conversion
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.showtimeMovieId || formData.showtimeMovieId <= 0) {
      newErrors.showtimeMovieId = 'Please select a movie';
    }
    if (!formData.showtimeRoomId || formData.showtimeRoomId <= 0) {
      newErrors.showtimeRoomId = 'Please select a room';
    }
    if (!formData.showtimeStartAt) {
      newErrors.showtimeStartAt = 'Start time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Create a copy to avoid modifying original state
      const submissionData = {
        ...formData,
        // Use the utility to preserve the exact local time
        showtimeStartAt: preserveLocalTime(formData.showtimeStartAt)
      };

      console.log('Submitting with preserved local time:', submissionData);
      onSubmit(submissionData);
    }
  };
  
  // Update how we determine the selected movie and room
  // Use our fetched details when available, fall back to the data in movies/rooms arrays
  const selectedMovie = selectedMovieDetails || 
    (isEdit && showtime && showtime.movieId === formData.showtimeMovieId ? 
      { 
        movieId: showtime.movieId,
        movieName: showtime.movieName,
        moviePoster: showtime.moviePoster,
        movieDuration: showtime.movieDuration,
        movieBrand: showtime.movieBrand,
        movieActor: showtime.movieActor
      } : 
      movies.find(movie => movie && movie.movieId === Number(formData.showtimeMovieId)));
  
  const selectedRoom = selectedRoomDetails || 
    (isEdit && showtime && showtime.roomId === formData.showtimeRoomId ?
      {
        roomId: showtime.roomId,
        roomName: showtime.roomName,
        roomTheaterName: showtime.roomTheaterName,
        roomScreenTypeName: showtime.roomScreenTypeName,
        roomChairAmount: showtime.roomChairAmount
      } :
      rooms.find(room => room && room.roomId === Number(formData.showtimeRoomId)));
  
  console.log("Selected movie:", selectedMovie);
  console.log("Selected room:", selectedRoom);
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        pt: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" fontWeight={600}>
          {isEdit ? 'Edit Showtime' : 'Add New Showtime'}
        </Typography>
        {isEdit && showtime && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            ID: {showtime.showtimeId}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Grid container justifyContent="center" sx={{ py: 5 }}>
            <CircularProgress />
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {/* Current Selection Info - Only show when editing */}
            {isEdit && showtime && (
              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderColor: theme.palette.divider,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Currently Editing:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                        Movie:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {showtime.movieName || "Not specified"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                        Room:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {showtime.roomName || "Not specified"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                        Theater:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {showtime.roomTheaterName || "Not specified"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
            
            {/* Movie Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Movie Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.showtimeMovieId}>
                <InputLabel id="movie-label">Movie</InputLabel>
                <Select
                  labelId="movie-label"
                  id="showtimeMovieId"
                  name="showtimeMovieId"
                  value={formData.showtimeMovieId || 0}
                  onChange={handleInputChange}
                  label="Movie"
                  renderValue={(selected) => {
                    if (!selected || selected === 0) {
                      return <em>Select a movie</em>;
                    }
                    
                    // First check if we have the movie name from API response
                    if (isEdit && showtime && showtime.movieId === selected) {
                      return showtime.movieName || `Movie ID: ${selected}`;
                    }
                    
                    // Otherwise try to find it in the movies list
                    const movie = movies.find(m => m && m.movieId === Number(selected));
                    return movie ? movie.movieName : `Movie ID: ${selected}`;
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 450 }
                    }
                  }}
                >
                  <MenuItem value={0}>
                    <em>Select a movie</em>
                  </MenuItem>
                  {movies.map(movie => movie && (
                    <MenuItem key={movie.movieId} value={movie.movieId} sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar 
                          src={movie.moviePoster} 
                          variant="rounded"
                          sx={{ 
                            width: 48, 
                            height: 68,
                            mr: 2,
                            boxShadow: 1
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {movie.movieName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {movie.movieDuration || 0} mins • Dir: {movie.movieDirector || 'Unknown'}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {movie.genres && movie.genres.map(genre => (
                              <Chip 
                                key={genre.genresId} 
                                label={genre.genresName} 
                                size="small"
                                sx={{ 
                                  height: 20,
                                  fontSize: '0.7rem',
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? theme.palette.grey[800] 
                                    : theme.palette.grey[200]
                                }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.showtimeMovieId && (
                  <Typography color="error" variant="caption" sx={{mt: 0.5, ml: 2}}>
                    {errors.showtimeMovieId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            {/* Selected Movie Details */}
            {selectedMovie && (
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 1, 
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'flex'
                }}>
                  <Avatar 
                    src={selectedMovie.moviePoster} 
                    variant="rounded"
                    sx={{ 
                      width: 60, 
                      height: 90,
                      mr: 2,
                      boxShadow: 2
                    }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedMovie.movieName}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {selectedMovie.movieDuration || '—'} min • {selectedMovie.movieBrand || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedMovie.movieActor || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            
            {/* Room Selection */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Room Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.showtimeRoomId}>
                <InputLabel id="room-label">Room</InputLabel>
                <Select
                  labelId="room-label"
                  id="showtimeRoomId"
                  name="showtimeRoomId"
                  value={formData.showtimeRoomId || 0}
                  onChange={handleInputChange}
                  label="Room"
                  renderValue={(selected) => {
                    if (!selected || selected === 0) {
                      return <em>Select a room</em>;
                    }
                    
                    // First check if we have the room name from API response
                    if (isEdit && showtime && showtime.roomId === selected) {
                      return `${showtime.roomName} - ${showtime.roomTheaterName} (${showtime.roomScreenTypeName})`;
                    }
                    
                    // Otherwise try to find it in the rooms list
                    const room = rooms.find(r => r && r.roomId === Number(selected));
                    return room ? `${room.roomName} - ${room.roomTheaterName} (${room.roomScreenTypeName})` : `Room ID: ${selected}`;
                  }}
                >
                  <MenuItem value={0}>
                    <em>Select a room</em>
                  </MenuItem>
                  {rooms.map(room => room && (
                    <MenuItem key={room.roomId} value={room.roomId}>
                      {room.roomName} - {room.roomTheaterName} ({room.roomScreenTypeName})
                    </MenuItem>
                  ))}
                </Select>
                {errors.showtimeRoomId && (
                  <Typography color="error" variant="caption" sx={{mt: 0.5, ml: 2}}>
                    {errors.showtimeRoomId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            {/* Selected Room Information */}
            {selectedRoom && (
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 1, 
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedRoom.roomName}
                  </Typography>
                  <Typography variant="body2">
                    Theater: {selectedRoom.roomTheaterName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                    <Chip 
                      label={selectedRoom.roomScreenTypeName} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {selectedRoom.roomChairAmount && (
                      <Chip 
                        label={`${selectedRoom.roomChairAmount} seats`} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
            
            {/* Showtime Start */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Showtime Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <CustomDateTimePicker
                label="Start Time"
                name="showtimeStartAt"
                value={formData.showtimeStartAt}
                onChange={handleDateInputChange}
                error={!!errors.showtimeStartAt}
                helperText={errors.showtimeStartAt}
                required={true}
              />
              {errors.showtimeStartAt && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.showtimeStartAt}
                </Typography>
              )}
            </Grid>
            
            {/* Display the formatted date for verification */}
            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Selected time: {formatDateTimeWithTimezone(formData.showtimeStartAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
                  Time to be sent to server: {preserveLocalTime(formData.showtimeStartAt)}
                </Typography>
              </Box>
            </Grid>
            
            {/* Add Showtime Availability Field */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.showtimeAvailable}
                    onChange={handleSwitchChange}
                    name="showtimeAvailable"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" fontWeight={500}>
                    {formData.showtimeAvailable ? "Active" : "Inactive"} Showtime
                  </Typography>
                }
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {formData.showtimeAvailable 
                  ? "This showtime will be visible to users and available for booking" 
                  : "This showtime will be hidden from users and unavailable for booking"}
              </Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{ borderRadius: 1, px: 3 }}
          disabled={loading}
        >
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowtimeForm;
