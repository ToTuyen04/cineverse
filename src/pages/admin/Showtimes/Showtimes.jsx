import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  useTheme, alpha, CircularProgress, Alert, Pagination, PaginationItem,
  Select, MenuItem, FormControl, Snackbar, FormControlLabel, Switch, Tabs, Tab,
  TableSortLabel // Add this import
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ViewIcon from '@mui/icons-material/Visibility';
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
      label={isAvailable ? "Khả dụng" : "Không khả dụng"} 
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
  
  // State for client-side filtering - set 'client' as default search mode
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState('client'); // Changed default to 'client'
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [currentTab, setCurrentTab] = useState(0); // 0: All, 1: Movie, 2: Room, 3: Theater
  
  // State for showtime form
  const [openShowtimeForm, setOpenShowtimeForm] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  
  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // or 'error'
  });
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'showtimeStartAt',
    direction: 'desc'  // Changed from 'showtimeId'/'asc' to 'showtimeStartAt'/'desc'
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

  // Set up search debounce for server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchMode === 'server') {
        setSearchDebounce(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, searchMode]);
  
  // Initial data fetch - include a larger pageSize to get more data for client filtering
  useEffect(() => {
    if (searchMode === 'server') {
      refreshShowtimes(page, rowsPerPage, searchDebounce);
    } else {
      // For client-side search, fetch a larger dataset initially
      refreshShowtimes(1, 50, ''); // Get 50 records for client-side filtering
    }
  }, [refreshShowtimes, page, rowsPerPage, searchDebounce, searchMode]);
  
  // Handle client-side filtering
  useEffect(() => {
    if (searchMode === 'client' && showtimes.length > 0) {
      const term = localSearchTerm.toLowerCase().trim();
      if (!term) {
        setFilteredShowtimes(showtimes);
        return;
      }
      
      let filtered;
      
      // Filter based on selected tab
      switch(currentTab) {
        case 1: // Movie tab
          filtered = showtimes.filter(showtime => 
            showtime.movieName && showtime.movieName.toLowerCase().includes(term)
          );
          break;
          
        case 2: // Room tab
          filtered = showtimes.filter(showtime => 
            showtime.roomName && showtime.roomName.toLowerCase().includes(term)
          );
          break;
          
        case 3: // Theater tab
          filtered = showtimes.filter(showtime => 
            showtime.roomTheaterName && showtime.roomTheaterName.toLowerCase().includes(term)
          );
          break;
          
        default: // All tab (0) or any other value
          filtered = showtimes.filter(showtime => 
            (showtime.movieName && showtime.movieName.toLowerCase().includes(term)) ||
            (showtime.roomName && showtime.roomName.toLowerCase().includes(term)) ||
            (showtime.roomTheaterName && showtime.roomTheaterName.toLowerCase().includes(term))
          );
      }
      
      setFilteredShowtimes(filtered);
    } else {
      setFilteredShowtimes(showtimes);
    }
  }, [localSearchTerm, showtimes, searchMode, currentTab]);
  
  // Initialize filtered showtimes when showtimes change
  useEffect(() => {
    setFilteredShowtimes(showtimes);
  }, [showtimes]);
  
  // Handle search mode toggle
  const handleSearchModeChange = (event) => {
    setSearchMode(event.target.checked ? 'client' : 'server');
    // Reset search terms when switching modes
    if (!event.target.checked) {
      setLocalSearchTerm('');
    } else {
      setSearchTerm('');
      setSearchDebounce('');
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Handle local search input change
  const handleLocalSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
  };
  
  // Handle server search input change
  const handleServerSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
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
    // Make sure to completely reset everything before opening form
    setSelectedShowtime(null);
    setTimeout(() => {
      setIsEditMode(false);
      setViewMode(false);
      setOpenShowtimeForm(true);
    }, 0);
  };
  
  // Handle row click to view showtime details
  const handleRowClick = async (showtimeId) => {
    try {
      console.log(`Viewing showtime details for ID: ${showtimeId}`);
      const showtimeData = await getShowtime(showtimeId);
      
      if (showtimeData) {
        setSelectedShowtime(showtimeData);
        setIsEditMode(false);
        setViewMode(true);
        setOpenShowtimeForm(true);
      } else {
        showSnackbar('Failed to load showtime details: No data returned', 'error');
      }
    } catch (err) {
      console.error('Error getting showtime details:', err);
      showSnackbar(`Failed to load showtime details: ${err.message || 'Unknown error'}`, 'error');
    }
  };
  
  // Handle edit showtime button click
  const handleEditClick = async (e, showtimeId) => {
    // Stop event propagation to prevent row click handler from firing
    e.stopPropagation();
    
    try {
      console.log(`Fetching showtime details for ID: ${showtimeId}`);
      const showtimeData = await getShowtime(showtimeId);
      
      if (showtimeData) {
        setSelectedShowtime(showtimeData);
        setIsEditMode(true);
        setViewMode(false);
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
  const handleDeleteShowtime = async (e, id) => {
    // Stop event propagation to prevent row click handler from firing
    e.stopPropagation();
    
    if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này không?')) {
      const result = await removeShowtime(id);
      if (result.success) {
        showSnackbar('Xóa suất chiếu thành công', 'success');
      } else {
        showSnackbar(`Xóa suất chiếu thất bại: ${result.error}`, 'error');
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

  // Sort function for table data
  const sortData = (data, config) => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      // Handle different data types
      switch (config.key) {
        case 'showtimeId':
          return config.direction === 'asc' 
            ? a.showtimeId - b.showtimeId 
            : b.showtimeId - a.showtimeId;
            
        case 'movieName':
          if (!a.movieName) return config.direction === 'asc' ? 1 : -1;
          if (!b.movieName) return config.direction === 'asc' ? -1 : 1;
          return config.direction === 'asc' 
            ? a.movieName.localeCompare(b.movieName) 
            : b.movieName.localeCompare(a.movieName);
            
        case 'showtimeStartAt':
          if (!a.showtimeStartAt) return config.direction === 'asc' ? 1 : -1;
          if (!b.showtimeStartAt) return config.direction === 'asc' ? -1 : 1;
          return config.direction === 'asc' 
            ? new Date(a.showtimeStartAt) - new Date(b.showtimeStartAt)
            : new Date(b.showtimeStartAt) - new Date(a.showtimeStartAt);
            
        case 'roomName':
          if (!a.roomName) return config.direction === 'asc' ? 1 : -1;
          if (!b.roomName) return config.direction === 'asc' ? -1 : 1;
          return config.direction === 'asc' 
            ? a.roomName.localeCompare(b.roomName) 
            : b.roomName.localeCompare(a.roomName);
            
        case 'roomScreenTypeName':
          if (!a.roomScreenTypeName) return config.direction === 'asc' ? 1 : -1;
          if (!b.roomScreenTypeName) return config.direction === 'asc' ? -1 : 1;
          return config.direction === 'asc' 
            ? a.roomScreenTypeName.localeCompare(b.roomScreenTypeName) 
            : b.roomScreenTypeName.localeCompare(a.roomScreenTypeName);
            
        case 'roomTheaterName':
          if (!a.roomTheaterName) return config.direction === 'asc' ? 1 : -1;
          if (!b.roomTheaterName) return config.direction === 'asc' ? -1 : 1;
          return config.direction === 'asc' 
            ? a.roomTheaterName.localeCompare(b.roomTheaterName) 
            : b.roomTheaterName.localeCompare(a.roomTheaterName);
            
        case 'showtimeAvailable':
          // Convert to boolean and then compare
          const aAvailable = Boolean(a.showtimeAvailable);
          const bAvailable = Boolean(b.showtimeAvailable);
          if (aAvailable === bAvailable) return 0;
          
          // For availability, true (available) should come first in ascending order
          if (config.direction === 'asc') {
            return aAvailable ? -1 : 1;
          } else {
            return aAvailable ? 1 : -1;
          }
          
        default:
          return 0;
      }
    });
  };
  
  // Handle column header click for sorting
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Apply sorting to the filtered showtimes
  const sortedShowtimes = React.useMemo(() => {
    // Make sure to always sort by date as default when no other sort is specified
    const config = sortConfig.key ? sortConfig : { key: 'showtimeStartAt', direction: 'desc' };
    return sortData(searchMode === 'client' ? filteredShowtimes : showtimes, config);
  }, [filteredShowtimes, showtimes, sortConfig, searchMode]);

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
          Thêm suất chiếu mới
        </Button>
      </Box>
      
      {/* Enhanced search box - hide the toggle switch since default is client */}
      <Box sx={{ mb: 3 }}>
        <Paper
          sx={{ 
            p: 2, 
            borderRadius: 1,
            backgroundColor: theme.palette.mode === 'light' 
              ? alpha(theme.palette.common.white, 0.9)
              : alpha(theme.palette.background.paper, 0.6),
          }}
        >
          {/* Search info text */}
          {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Đang lọc {filteredShowtimes.length} trong số {showtimes.length} suất chiếu
            </Typography>
          </Box> */}
          
          {/* Client-side search with tabs - shown by default */}
          <Box sx={{ width: '100%', mb: 1 }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minWidth: 100,
                  fontWeight: 500
                }
              }}
            >
              <Tab label="Tất cả" icon={<FilterAltIcon fontSize="small" />} iconPosition="start" />
              <Tab label="Phim" />
              <Tab label="Phòng" />
              <Tab label="Rạp" />
            </Tabs>
          </Box>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder={`Tìm kiếm ${currentTab === 0 ? 'tất cả các trường' : currentTab === 1 ? 'theo tên phim' : currentTab === 2 ? 'theo tên phòng' : 'theo tên rạp'}...`}
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: localSearchTerm && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => setLocalSearchTerm('')}
                    edge="end"
                  >
                    x
                  </IconButton>
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 1,
                backgroundColor: theme.palette.background.paper,
              }
            }}
          />
        </Paper>
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
      {(!loading || searchMode === 'client') && !error && (
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
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'showtimeId'}
                      direction={sortConfig.key === 'showtimeId' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('showtimeId')}
                    >
                      ID
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'movieName'}
                      direction={sortConfig.key === 'movieName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('movieName')}
                    >
                      Phim
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'showtimeStartAt'}
                      direction={sortConfig.key === 'showtimeStartAt' ? sortConfig.direction : 'desc'}
                      onClick={() => handleSort('showtimeStartAt')}
                    >
                      Khung giờ chiếu phim
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'roomName'}
                      direction={sortConfig.key === 'roomName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('roomName')}
                    >
                      Phòng
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'roomScreenTypeName'}
                      direction={sortConfig.key === 'roomScreenTypeName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('roomScreenTypeName')}
                    >
                      Loại màn hình
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'roomTheaterName'}
                      direction={sortConfig.key === 'roomTheaterName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('roomTheaterName')}
                    >
                      Rạp phim
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'showtimeAvailable'}
                      direction={sortConfig.key === 'showtimeAvailable' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('showtimeAvailable')}
                    >
                      Khả dụng
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell align="center">Chức năng</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Use sorted showtimes instead of filtered or regular showtimes */}
                {sortedShowtimes.map((showtime) => (
                  <StyledTableRow 
                    key={showtime.showtimeId} 
                    onClick={() => handleRowClick(showtime.showtimeId)}
                  >
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
                        color="info"
                        onClick={(e) => handleRowClick(showtime.showtimeId)}
                        sx={{ 
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          marginRight: 1,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.2),
                          }
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => handleEditClick(e, showtime.showtimeId)}
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
                        onClick={(e) => handleDeleteShowtime(e, showtime.showtimeId)}
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
                {sortedShowtimes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">
                        Không tìm thấy suất chiếu nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination - show client-side pagination */}
          {!loading && !error && (
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
                {`Hiển thị ${filteredShowtimes.length} trong số ${showtimes.length} suất chiếu`}
              </Typography>
              
              {/* Client-side pagination for filtered results */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Only show pagination when there are multiple pages */}
                {Math.ceil(filteredShowtimes.length / rowsPerPage) > 1 && (
                  <Pagination
                    count={Math.ceil(filteredShowtimes.length / rowsPerPage)}
                    page={page}
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
                    Số hàng mỗi trang:
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
          )}
        </>
      )}
      
      {/* Showtime Form Dialog */}
      <ShowtimeForm
        open={openShowtimeForm}
        handleClose={handleCloseForm}
        showtime={selectedShowtime}
        onSubmit={handleSubmitShowtime}
        isEdit={isEditMode}
        viewOnly={viewMode}
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
