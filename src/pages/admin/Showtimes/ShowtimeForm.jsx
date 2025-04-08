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
  return d.toLocaleString('vi-VN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
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

const ShowtimeForm = ({ open, handleClose, showtime, onSubmit, isEdit = false, viewOnly = false }) => {
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
      console.log("Dialog opened, isEdit:", isEdit, "viewOnly:", viewOnly);
      
      if ((isEdit || viewOnly) && showtime) {
        console.log("Initializing form with showtime data:", showtime);
        
        setFormData({
          showtimeMovieId: Number(showtime.movieId) || 0,
          showtimeStartAt: showtime.showtimeStartAt ? new Date(showtime.showtimeStartAt) : new Date(),
          showtimeCreatedBy: showtime.showtimeCreatedBy || 1,
          showtimeRoomId: Number(showtime.roomId) || 0,
          showtimeAvailable: showtime.showtimeAvailable !== undefined ? showtime.showtimeAvailable : true
        });
        
      } else {
        // Make sure to completely reset EVERYTHING when adding a new showtime
        console.log("Opening form in ADD mode - resetting all form data");
        setFormData({
          showtimeMovieId: 0,
          showtimeStartAt: new Date(),
          showtimeCreatedBy: 1,
          showtimeRoomId: 0,
          showtimeAvailable: true
        });
        setErrors({});
        setSelectedMovieDetails(null);
        setSelectedRoomDetails(null);
      }
    }
  }, [isEdit, viewOnly, showtime, open]);
  
  // Fetch specific movie and room details when selected or when editing/viewing
  useEffect(() => {
    const fetchSelectedDetails = async () => {
      // Skip fetching details if we're in add mode and no IDs are selected yet
      if (!isEdit && !viewOnly && 
          (!formData.showtimeMovieId || formData.showtimeMovieId === 0) && 
          (!formData.showtimeRoomId || formData.showtimeRoomId === 0)) {
        // Clear selected details when in add mode with no selections
        setSelectedMovieDetails(null);
        setSelectedRoomDetails(null);
        return;
      }
      
      // When in view mode, always fetch movie details from the showtime
      if (viewOnly && showtime && showtime.movieId) {
        try {
          const movieDetails = await fetchMovieById(showtime.movieId);
          if (movieDetails) {
            console.log("Fetched movie details for view:", movieDetails);
            setSelectedMovieDetails(movieDetails);
          }
        } catch (error) {
          console.error("Error fetching movie details for view:", error);
        }
      }
      // When in view mode, always fetch room details from the showtime
      if (viewOnly && showtime && showtime.roomId) {
        try {
          const roomDetails = await fetchRoomById(showtime.roomId);
          if (roomDetails) {
            console.log("Fetched room details for view:", roomDetails);
            setSelectedRoomDetails(roomDetails);
          }
        } catch (error) {
          console.error("Error fetching room details for view:", error);
        }
      }
      
      // Existing code for edit mode fetching
      if (!viewOnly) {
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
      }
    };
    
    fetchSelectedDetails();
  }, [formData.showtimeMovieId, formData.showtimeRoomId, viewOnly, showtime, isEdit]);
  
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
      newErrors.showtimeMovieId = 'Vui lòng chọn phim';
    }
    if (!formData.showtimeRoomId || formData.showtimeRoomId <= 0) {
      newErrors.showtimeRoomId = 'Vui lòng chọn phòng chiếu';
    }
    if (!formData.showtimeStartAt) {
      newErrors.showtimeStartAt = 'Thời gian bắt đầu là bắt buộc';
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
  // Make sure we don't show any selected movie or room when in add mode with no selections
  const selectedMovie = (!isEdit && !viewOnly && formData.showtimeMovieId === 0) ? null :
    selectedMovieDetails || 
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
  
  const selectedRoom = (!isEdit && !viewOnly && formData.showtimeRoomId === 0) ? null :
    selectedRoomDetails || 
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
          {viewOnly ? 'Xem Chi Tiết Suất Chiếu' : isEdit ? 'Chỉnh Sửa Suất Chiếu' : 'Thêm Suất Chiếu Mới'}
        </Typography>
        {(isEdit || viewOnly) && showtime && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            Mã suất chiếu: {showtime.showtimeId}
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
            {/* Current Selection Info - Show in view/edit mode */}
            {(isEdit || viewOnly) && showtime && (
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
                    {viewOnly ? 'Đang xem:' : 'Đang chỉnh sửa:'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                        Phim:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {showtime.movieName || "Chưa xác định"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                        Phòng:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {showtime.roomName || "Chưa xác định"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                        Rạp:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {showtime.roomTheaterName || "Chưa xác định"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            )}
            
            {/* Movie Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Thông Tin Phim
              </Typography>
            </Grid>
            
            {/* Movie Selection - Show select in edit mode, show info in view mode */}
            <Grid item xs={12}>
              {viewOnly ? (
                <Paper sx={{ p: 2, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      src={(selectedMovie && selectedMovie.moviePoster) || showtime?.moviePoster} 
                      variant="rounded"
                      sx={{ 
                        width: 70, 
                        height: 100,
                        mr: 2,
                        boxShadow: 2
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {(selectedMovie && selectedMovie.movieName) || showtime?.movieName || 'Phim không xác định'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Thời lượng: {(selectedMovie && selectedMovie.movieDuration) || showtime?.movieDuration || '—'} phút
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Đạo diễn: {(selectedMovie && selectedMovie.movieDirector) || showtime?.movieDirector || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Diễn viên: {(selectedMovie && selectedMovie.movieActor) || showtime?.movieActor || '—'}
                      </Typography>
                      {selectedMovie && selectedMovie.genres && selectedMovie.genres.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {selectedMovie.genres.map(genre => (
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
                      )}
                      {selectedMovie && selectedMovie.movieBrand && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Hãng phim: {selectedMovie.movieBrand}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <FormControl fullWidth error={!!errors.showtimeMovieId}>
                  <InputLabel id="movie-label">Phim</InputLabel>
                  <Select
                    labelId="movie-label"
                    id="showtimeMovieId"
                    name="showtimeMovieId"
                    value={formData.showtimeMovieId || 0}
                    onChange={handleInputChange}
                    label="Phim"
                    renderValue={(selected) => {
                      if (!selected || selected === 0) {
                        return <em>Chọn một phim</em>;
                      }
                      
                      // First check if we have the movie name from API response
                      if (isEdit && showtime && showtime.movieId === selected) {
                        return showtime.movieName || `Mã phim: ${selected}`;
                      }
                      
                      // Otherwise try to find it in the movies list
                      const movie = movies.find(m => m && m.movieId === Number(selected));
                      return movie ? movie.movieName : `Mã phim: ${selected}`;
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { maxHeight: 450 }
                      }
                    }}
                  >
                    <MenuItem value={0}>
                      <em>Chọn một phim</em>
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
                              {movie.movieDuration || 0} phút • ĐD: {movie.movieDirector || 'Không rõ'}
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
              )}
            </Grid>
            
            {/* Selected Movie Details - Only show in edit mode */}
            {!viewOnly && selectedMovie && (
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
                      {selectedMovie.movieDuration || '—'} phút • {selectedMovie.movieBrand || '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedMovie.movieActor || '—'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
            
            {/* Room Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Thông Tin Phòng Chiếu
              </Typography>
            </Grid>
            
            {/* Room Selection - Show select in edit mode, show info in view mode */}
            <Grid item xs={12}>
              {viewOnly ? (
                <Paper sx={{ p: 2, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {(selectedRoom && selectedRoom.roomName) || showtime?.roomName || 'Phòng không xác định'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Rạp phim: {(selectedRoom && selectedRoom.roomTheaterName) || showtime?.roomTheaterName || '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Loại màn hình: {(selectedRoom && selectedRoom.roomScreenTypeName) || showtime?.roomScreenTypeName || '—'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Số ghế: {(selectedRoom && selectedRoom.roomChairAmount) || showtime?.roomChairAmount || '—'}
                  </Typography>
                  {selectedRoom && selectedRoom.roomStatus && (
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={selectedRoom.roomStatus ? "Đang hoạt động" : "Không hoạt động"} 
                        size="small"
                        color={selectedRoom.roomStatus ? "success" : "error"}
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Paper>
              ) : (
                <FormControl fullWidth error={!!errors.showtimeRoomId}>
                  <InputLabel id="room-label">Phòng chiếu</InputLabel>
                  <Select
                    labelId="room-label"
                    id="showtimeRoomId"
                    name="showtimeRoomId"
                    value={formData.showtimeRoomId || 0}
                    onChange={handleInputChange}
                    label="Phòng chiếu"
                    renderValue={(selected) => {
                      if (!selected || selected === 0) {
                        return <em>Chọn phòng chiếu</em>;
                      }
                      
                      // First check if we have the room name from API response
                      if (isEdit && showtime && showtime.roomId === selected) {
                        return `${showtime.roomName} - ${showtime.roomTheaterName} (${showtime.roomScreenTypeName})`;
                      }
                      
                      // Otherwise try to find it in the rooms list
                      const room = rooms.find(r => r && r.roomId === Number(selected));
                      return room ? `${room.roomName} - ${room.roomTheaterName} (${room.roomScreenTypeName})` : `Mã phòng: ${selected}`;
                    }}
                  >
                    <MenuItem value={0}>
                      <em>Chọn phòng chiếu</em>
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
              )}
            </Grid>
            
            {/* Selected Room Information - Only show in edit mode */}
            {!viewOnly && selectedRoom && (
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
                    Rạp: {selectedRoom.roomTheaterName}
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
                        label={`${selectedRoom.roomChairAmount} ghế`} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
            
            {/* Showtime Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Thông Tin Suất Chiếu
              </Typography>
            </Grid>
            
            {/* Showtime Date/Time - Show picker in edit mode, show info in view mode */}
            <Grid item xs={12}>
              {viewOnly ? (
                <Paper sx={{ p: 2, borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Thời gian bắt đầu:</strong> {formatDateTimeWithTimezone(showtime?.showtimeStartAt)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Thời gian kết thúc:</strong> {formatDateTimeWithTimezone(showtime?.showtimeEndAt)}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Trạng thái:</strong> {' '}
                    <Chip 
                      label={showtime?.showtimeAvailable ? "Đang hoạt động" : "Không hoạt động"} 
                      color={showtime?.showtimeAvailable ? "success" : "error"}
                      size="small"
                    />
                  </Typography>
                </Paper>
              ) : (
                <CustomDateTimePicker
                  label="Thời gian bắt đầu"
                  name="showtimeStartAt"
                  value={formData.showtimeStartAt}
                  onChange={handleDateInputChange}
                  error={!!errors.showtimeStartAt}
                  helperText={errors.showtimeStartAt}
                  required={true}
                />
              )}
              
              {!viewOnly && errors.showtimeStartAt && (
                <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                  {errors.showtimeStartAt}
                </Typography>
              )}
            </Grid>
            
            {/* Display formatted date in edit mode */}
            {!viewOnly && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Thời gian đã chọn: {formatDateTimeWithTimezone(formData.showtimeStartAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
                    Thời gian sẽ gửi đến máy chủ: {preserveLocalTime(formData.showtimeStartAt)}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {/* Availability toggle - Only show in edit mode */}
            {!viewOnly && (
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
                      {formData.showtimeAvailable ? "Đang hoạt động" : "Không hoạt động"}
                    </Typography>
                  }
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {formData.showtimeAvailable 
                    ? "Suất chiếu này sẽ hiển thị cho người dùng và có thể đặt vé" 
                    : "Suất chiếu này sẽ ẩn đối với người dùng và không thể đặt vé"}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 1 }}
        >
          {viewOnly ? 'Đóng' : 'Hủy bỏ'}
        </Button>
        {!viewOnly && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1, px: 3 }}
            disabled={loading}
          >
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShowtimeForm;
