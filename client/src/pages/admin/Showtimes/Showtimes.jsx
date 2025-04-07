import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  useTheme, alpha, CircularProgress, Alert, Pagination, PaginationItem,
  Select, MenuItem, FormControl, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useShowtimes from '../../../hooks/useShowtimes';
import ShowtimeForm from './ShowtimeForm';

// Enhanced styling for table cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.mode === 'light' 
    ? 'rgba(0, 0, 0, 0.15)' 
    : 'rgba(255, 255, 255, 0.15)'}`,
  color: theme.palette.text.primary,
  padding: '16px',
  fontWeight: theme.palette.mode === 'light' ? 500 : 400
}));

// Enhanced table row styling
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'light' 
      ? alpha(theme.palette.primary.main, 0.03)
      : alpha(theme.palette.common.white, 0.03)
  },
  '& td': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.15)' 
      : 'rgba(255, 255, 255, 0.15)'}`,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08) + ' !important',
    cursor: 'pointer'
  }
}));

// Format date for display
const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  });
};

// Screen type chip component
const ScreenTypeChip = ({ type }) => {
  const theme = useTheme();
  let bgcolor, textColor;
  
  if (type === '2D') {
    bgcolor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.info.main, 0.1)
      : alpha(theme.palette.info.main, 0.2);
    textColor = theme.palette.info.main;
  } else if (type === '3D') {
    bgcolor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.success.main, 0.1)
      : alpha(theme.palette.success.main, 0.2);
    textColor = theme.palette.success.main;
  } else {
    bgcolor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.text.secondary, 0.1)
      : alpha(theme.palette.text.secondary, 0.2);
    textColor = theme.palette.text.secondary;
  }
  
  return (
    <Chip 
      label={type} 
      size="small" 
      sx={{ 
        bgcolor: bgcolor,
        color: textColor,
        fontWeight: 500,
        border: 'none'
      }} 
    />
  );
};

// Component for availability status chip
const AvailabilityChip = ({ available, endDate }) => {
  const theme = useTheme();
  
  // Helper function to properly convert any value to boolean
  const parseBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    }
    if (typeof value === 'number') return value === 1;
    return Boolean(value);
  };
  
  // Convert to boolean correctly handling different value types
  const isAvailable = parseBoolean(available);
  
  // Check if showtime has ended (is in the past)
  const currentDate = new Date();
  const showtimeEndDate = new Date(endDate);
  const isExpired = showtimeEndDate < currentDate;
  
  // Determine colors based on availability and expiration status
  let bgColor, textColor;
  
  if (isAvailable) {
    // Case 1: Available - always green
    bgColor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.success.main, 0.15)
      : alpha(theme.palette.success.main, 0.25);
    textColor = theme.palette.success.main;
  } else {
    if (isExpired) {
      // Case 2: Unavailable AND expired - gray
      bgColor = theme.palette.mode === 'light'
        ? alpha(theme.palette.grey[500], 0.1)
        : alpha(theme.palette.grey[500], 0.2);
      textColor = theme.palette.grey[500];
    } else {
      // Case 3: Unavailable but NOT expired - red
      bgColor = theme.palette.mode === 'light' 
        ? alpha(theme.palette.error.main, 0.1)
        : alpha(theme.palette.error.main, 0.2);
      textColor = theme.palette.error.main;
    }
  }
  
  return (
    <Chip 
      label={isAvailable ? "Available" : "Unavailable"} 
      size="small" 
      sx={{ 
        bgcolor: bgColor,
        color: textColor,
        fontWeight: isAvailable ? 600 : 500,
        border: 'none'
      }} 
    />
  );
};

const Showtimes = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1); // Changed to 1-based pagination to match API
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // State for showtime form
  const [openShowtimeForm, setOpenShowtimeForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // or 'error'
  });
  
  // Use the custom hook to fetch showtimes
  const { 
    showtimes, 
    loading, 
    error, 
    pagination,  // Use the pagination info from the hook
    addShowtime, 
    editShowtime, 
    removeShowtime, 
    getShowtime, 
    refreshShowtimes 
  } = useShowtimes();

  // Set up search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch showtimes when pagination or search changes
  useEffect(() => {
    refreshShowtimes(page, rowsPerPage, searchDebounce);
  }, [refreshShowtimes, page, rowsPerPage, searchDebounce]);
  
  // Handle page change - now uses 1-based pagination to match the API
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing page size
  };
  
  // Handle add showtime button click
  const handleAddShowtimeClick = () => {
    setIsEditMode(false);
    setSelectedShowtime(null);
    setOpenShowtimeForm(true);
  };
  
  // Handle edit showtime button click
  const handleEditClick = async (showtimeId) => {
    try {
      console.log(`Fetching showtime details for ID: ${showtimeId}`);
      const showtimeData = await getShowtime(showtimeId);
      
      console.log('Received showtime data:', showtimeData);
      
      if (showtimeData) {
        setSelectedShowtime(showtimeData);
        setIsEditMode(true);
        setOpenShowtimeForm(true);
      } else {
        showSnackbar('Failed to load showtime details: No data returned', 'error');
      }
    } catch (err) {
      console.error('Error getting showtime details:', err);
      showSnackbar(`Failed to load showtime details: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenShowtimeForm(false);
  };
  
  // Handle showtime form submission
  const handleSubmitShowtime = async (formData) => {
    try {
      let result;
      
      if (isEditMode) {
        result = await editShowtime(selectedShowtime.showtimeId, formData);
        if (result.success) {
          showSnackbar('Cập nhật suất chiếu thành công', 'success');
        } else {
          showSnackbar(`Cập nhật suất chiếu thất bại: ${result.error}`, 'error');
        }
      } else {
        result = await addShowtime(formData);
        if (result.success) {
          showSnackbar('Tạo suất chiếu mới thành công', 'success');
        } else {
          showSnackbar(`Tạo suất chiếu mới thất bại: ${result.error}`, 'error');
        }
      }
      
      if (result.success) {
        setOpenShowtimeForm(false);
        refreshShowtimes();
      }
    } catch (err) {
      console.error('Error submitting showtime:', err);
      showSnackbar('An error occurred while saving showtime', 'error');
    }
  };
  
  // Handle delete showtime
  const handleDeleteShowtime = async (id) => {
    if (window.confirm('Are you sure you want to delete this showtime?')) {
      const result = await removeShowtime(id);
      if (result.success) {
        showSnackbar('Showtime deleted successfully', 'success');
      } else {
        showSnackbar(`Failed to delete showtime: ${result.error}`, 'error');
      }
    }
  };
  
  // Helper function to show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (showtimes.length > 0) {
      console.log('First showtime available value:', {
        value: showtimes[0].showtimeAvailable,
        type: typeof showtimes[0].showtimeAvailable,
        convertedValue: Boolean(showtimes[0].showtimeAvailable),
        // Test our new function on the first value
        parsedValue: (function(val) {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') {
            const lowerVal = val.toLowerCase();
            return lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes';
          }
          if (typeof val === 'number') return val === 1;
          return Boolean(val);
        })(showtimes[0].showtimeAvailable)
      });
    }
  }, [showtimes]);

  return (
    <Box>
      {/* Enhanced page header with better styling */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: theme.palette.mode === 'light' 
          ? '1px solid rgba(0,0,0,0.1)'
          : '1px solid rgba(255,255,255,0.1)',
        pb: 2
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          Quản lý suất chiếu
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddShowtimeClick}
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            color: '#fff',
            fontWeight: 500,
            px: 2,
            py: 1
          }}
        >
          Add New Showtime
        </Button>
      </Box>
      
      {/* Enhanced search box */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for showtimes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { 
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.15)' 
                  : 'rgba(255, 255, 255, 0.15)'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.3)' 
                  : 'rgba(255, 255, 255, 0.3)'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main
              },
              color: theme.palette.text.primary
            }
          }}
          sx={{
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary
            }
          }}
        />
      </Box>
      
      {/* Display loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Display error if any */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Enhanced table with better Paper background handling */}
      {!loading && !error && (
        <>
          <TableContainer 
            component={Paper} 
            sx={{ 
              backgroundColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.background.paper, 0.8)
                : 'transparent', 
              boxShadow: theme.palette.mode === 'light' ? 1 : 'none',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="showtimes table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'light' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.common.white, 0.05) 
                }}>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Phim</StyledTableCell>
                  <StyledTableCell>Khung giờ chiếu phim</StyledTableCell>
                  <StyledTableCell>Phòng</StyledTableCell>
                  <StyledTableCell>Loại màn hình</StyledTableCell>
                  <StyledTableCell>Rạp phim</StyledTableCell>
                  <StyledTableCell>Khả dụng</StyledTableCell>
                  <StyledTableCell align="center">Chức năng</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showtimes.map((showtime) => (
                  <StyledTableRow key={showtime.showtimeId}>
                    <StyledTableCell>{showtime.showtimeId}</StyledTableCell> 
                    <StyledTableCell>{showtime.movieName}</StyledTableCell>
                    <StyledTableCell>{formatDateTime(showtime.showtimeStartAt)} - {formatDateTime(showtime.showtimeEndAt)}</StyledTableCell>
                    <StyledTableCell>{showtime.roomName}</StyledTableCell>
                    <StyledTableCell>
                      <ScreenTypeChip type={showtime.roomScreenTypeName} />
                    </StyledTableCell>
                    <StyledTableCell>{showtime.roomTheaterName}</StyledTableCell>
                    <StyledTableCell>
                      <AvailabilityChip 
                        available={showtime.showtimeAvailable} 
                        endDate={showtime.showtimeEndAt}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(showtime.showtimeId)}
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          marginRight: 1,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDeleteShowtime(showtime.showtimeId)}
                        sx={{ 
                          color: theme.palette.mode === 'light' ? theme.palette.grey[700] : theme.palette.text.primary,
                          backgroundColor: theme.palette.mode === 'light' 
                            ? alpha(theme.palette.text.secondary, 0.05)
                            : alpha(theme.palette.common.white, 0.05),
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'light'
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.error.main, 0.2),
                            color: theme.palette.error.main
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                
                {/* Show message when no showtimes are found */}
                {showtimes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">
                        No showtimes found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Updated pagination and rows per page controls for server-side pagination */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4,
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {`Showing ${showtimes.length} of ${pagination.totalCount} showtimes`}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Only show pagination when there are multiple pages */}
              {pagination.totalPages > 1 && (
                <Pagination
                  count={pagination.totalPages}
                  page={page} // Already 1-based from our state
                  onChange={handleChangePage}
                  color="primary"
                  size="large"
                  renderItem={(item) => (
                    <PaginationItem
                      slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                      {...item}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.main,
                          color: '#fff',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          }
                        },
                        '&.MuiPaginationItem-page': {
                          borderRadius: 1,
                          mx: 0.5,
                          border: '1px solid',
                          borderColor: theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.12)'
                            : 'rgba(255, 255, 255, 0.12)',
                        },
                        '&.MuiPaginationItem-previousNext': {
                          border: '1px solid',
                          borderColor: theme.palette.mode === 'light'
                            ? 'rgba(0, 0, 0, 0.12)'
                            : 'rgba(255, 255, 255, 0.12)',
                          borderRadius: 1,
                          backgroundColor: theme.palette.mode === 'light'
                            ? alpha(theme.palette.common.white, 0.9)
                            : alpha(theme.palette.common.black, 0.2),
                        }
                      }}
                    />
                  )}
                  sx={{
                    '& .MuiPagination-ul': {
                      flexWrap: 'nowrap',
                    }
                  }}
                />
              )}
              
              {/* Rows per page selector */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Rows per page:
                </Typography>
                <FormControl 
                  variant="outlined" 
                  size="small" 
                  sx={{
                    minWidth: 80,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      borderColor: theme.palette.mode === 'light' 
                        ? 'rgba(0, 0, 0, 0.12)' 
                        : 'rgba(255, 255, 255, 0.12)',
                    }
                  }}
                >
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    sx={{
                      backgroundColor: theme.palette.mode === 'light'
                        ? alpha(theme.palette.common.white, 0.9)
                        : alpha(theme.palette.background.paper, 0.9),
                      '& .MuiSelect-select': {
                        padding: '8px 12px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: theme.palette.background.paper,
                          color: theme.palette.text.primary
                        }
                      }
                    }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </>
      )}
      
      {/* Showtime Form Dialog */}
      <ShowtimeForm
        open={openShowtimeForm}
        handleClose={handleCloseForm}
        showtime={selectedShowtime}
        onSubmit={handleSubmitShowtime}
        isEdit={isEditMode}
      />
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{
          sx: {
            backgroundColor: snackbar.severity === 'success' 
              ? theme.palette.success.main 
              : theme.palette.error.main
          }
        }}
      />
    </Box>
  );
};

export default Showtimes;
