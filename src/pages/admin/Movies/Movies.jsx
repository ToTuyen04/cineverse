import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  useTheme, alpha, CircularProgress, Alert, Pagination, PaginationItem,
  Select, MenuItem, FormControl, Snackbar, InputLabel, OutlinedInput, Collapse,
  Accordion, AccordionSummary, AccordionDetails, Grid, Divider, FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import useMovies from '../../../hooks/useMovies';
import MovieForm from './MovieForm';
import { getAllGenres } from '../../../api/services/movieService';

// Enhanced styling for table cells with better light/dark mode support
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.mode === 'light' 
    ? 'rgba(0, 0, 0, 0.15)' // Darker border in light mode
    : 'rgba(255, 255, 255, 0.15)'}`,
  color: theme.palette.text.primary,
  padding: '16px',
  fontWeight: theme.palette.mode === 'light' ? 500 : 400
}));

// Enhanced table row styling
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'light' 
      ? alpha(theme.palette.primary.main, 0.03) // Very subtle primary tint in light mode
      : alpha(theme.palette.common.white, 0.03)  // Subtle white tint in dark mode
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

// Add a styled component for movie posters
const MoviePosterImage = styled('img')({
  width: '60px',
  height: '90px',
  objectFit: 'cover',
  borderRadius: 4,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
});

// Mock data remains the same
const createData = (id, title, genres, duration, releaseDate, status) => {
  return { id, title, genres, duration, releaseDate, status };
};

// Enhanced status chip with better light/dark mode handling
const StatusChip = ({ status }) => {
  const theme = useTheme();
  let color = 'default';
  let bgcolor, textColor;
  let statusText;
  
  // Handle boolean movieAvailable value
  if (typeof status === 'boolean') {
    if (status === true) {
      statusText = 'Available';
      color = 'success';
      bgcolor = theme.palette.mode === 'light' 
        ? alpha(theme.palette.success.main, 0.1)
        : alpha(theme.palette.success.main, 0.2);
      textColor = theme.palette.success.main;
    } else {
      statusText = 'Unavailable';
      color = 'default';
      bgcolor = theme.palette.mode === 'light' 
        ? alpha(theme.palette.text.secondary, 0.1)
        : alpha(theme.palette.text.secondary, 0.2);
      textColor = theme.palette.text.secondary;
    }
  } else {
    // Handle string status for backward compatibility
    statusText = status;
    if (status === 'Active') {
      color = 'success';
      bgcolor = theme.palette.mode === 'light' 
        ? alpha(theme.palette.success.main, 0.1)
        : alpha(theme.palette.success.main, 0.2);
      textColor = theme.palette.success.main;
    } else if (status === 'Coming Soon') {
      color = 'primary';
      bgcolor = theme.palette.mode === 'light' 
        ? alpha(theme.palette.primary.main, 0.1)
        : alpha(theme.palette.primary.main, 0.2);
      textColor = theme.palette.primary.main;
    } else if (status === 'Archived') {
      color = 'default';
      bgcolor = theme.palette.mode === 'light' 
        ? alpha(theme.palette.text.secondary, 0.1)
        : alpha(theme.palette.text.secondary, 0.2);
      textColor = theme.palette.text.secondary;
    }
  }
  
  return (
    <Chip 
      label={statusText} 
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

const Movies = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0); // MUI uses 0-based pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [openFilters, setOpenFilters] = useState(false);
  const [genres, setGenres] = useState([]);
  
  // New filter states - UI state (what user is currently selecting)
  const [filters, setFilters] = useState({
    selectedGenres: [],
    statuses: {
      active: true,
      comingSoon: true,
      archived: true
    },
    sorting: {
      movieSortBy: null,  // CreatedAt=0, StartAt=1, EndAt=2
      sortOrder: null     // Ascending=0, Descending=1
    }
  });
  
  // New state for applied filters (what's actually used for API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    selectedGenres: [],
    statuses: {
      active: true,
      comingSoon: true,
      archived: true
    },
    sorting: {
      movieSortBy: null,
      sortOrder: null
    }
  });
  
  // State for movie form
  const [openMovieForm, setOpenMovieForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false); // New state for view only mode
  
  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // or 'error'
  });
  
  // Fetch genres for filter options
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await getAllGenres();
        setGenres(genresData);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Track if we should make an API call (only on mount and when filters are applied)
  const [shouldFetchMovies, setShouldFetchMovies] = useState(true);
  
  // Memoize the filter params with useMemo
  const filterParams = useMemo(() => {
    if (!shouldFetchMovies) return {};
    
    const params = {};
    
    // Add genre filters using applied filters
    if (appliedFilters.selectedGenres.length > 0) {
      params.genreIds = appliedFilters.selectedGenres;
    }
    
    // Add sorting parameters
    if (appliedFilters.sorting.movieSortBy !== null) {
      params.movieSortBy = appliedFilters.sorting.movieSortBy;
    }
    
    if (appliedFilters.sorting.sortOrder !== null) {
      params.sortOrder = appliedFilters.sorting.sortOrder;
    }
    
    return params;
  }, [shouldFetchMovies, appliedFilters]);
  
  // Use options object for useMovies that's memoized
  const movieOptions = useMemo(() => {
    if (!shouldFetchMovies) return {};
    
    return {
      page: page + 1, // This converts MUI's 0-based page to API's 1-based page
      limit: rowsPerPage,
      search: searchDebounce,
      ...filterParams
    };
  }, [shouldFetchMovies, page, rowsPerPage, searchDebounce, filterParams]);
  
  // Use the custom hook with memoized options
  const { 
    movies, 
    loading, 
    error, 
    pagination, 
    addMovie, 
    editMovie, 
    removeMovie, 
    getMovie, 
    refreshMovies 
  } = useMovies(shouldFetchMovies ? movieOptions : {});

  // Handle search with debounce
  useEffect(() => {
    // Removed the early return when searchTerm is empty
    const handler = setTimeout(() => {
      setSearchDebounce(searchTerm);
      setPage(0); // Reset to first page on new search
      setShouldFetchMovies(true); // Enable fetch when search changes
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // Handle filter changes - ONLY updates UI state, not applied filters
  const handleFilterChange = useCallback((type, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'genres') {
        newFilters.selectedGenres = value;
      } else if (type === 'status') {
        newFilters.statuses = { ...prev.statuses, ...value };
      } else if (type === 'sorting') {
        newFilters.sorting = { ...prev.sorting, ...value };
      }
      
      return newFilters;
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    const defaultFilters = {
      selectedGenres: [],
      statuses: {
        active: true,
        comingSoon: true,
        archived: true
      },
      sorting: {
        movieSortBy: null,
        sortOrder: null
      }
    };
    
    // Reset both UI filters and applied filters
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(0); // Reset to first page after resetting filters
    
    // Note: The state changes above will trigger useMovies to re-fetch automatically
    setShouldFetchMovies(true); // Enable fetch when filters are reset
  }, []);

  // Apply filters function
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setPage(0);
    setOpenFilters(false);
    setShouldFetchMovies(true); // Enable fetch when filters are applied
  }, [filters]);
  
  // Handle add movie button click
  const handleAddMovieClick = () => {
    setIsEditMode(false);
    setSelectedMovie(null);
    setOpenMovieForm(true);
  };
  
  // Handle edit movie button click
  const handleEditClick = async (movieId) => {
    try {
      const movieData = await getMovie(movieId);
      if (movieData) {
        setSelectedMovie(movieData);
        setIsEditMode(true);
        setIsViewOnly(false); // Not in view only mode
        setOpenMovieForm(true);
      }
    } catch (err) {
      console.error('Error getting movie details:', err);
      showSnackbar('Tải chi tiết phim thất bại', 'error');
    }
  };

  // New handler for view only button - updated to set isEditMode to true
  const handleViewClick = async (movieId) => {
    try {
      const movieData = await getMovie(movieId);
      if (movieData) {
        setSelectedMovie(movieData);
        setIsEditMode(true); // Changed from false to true to ensure form is populated with data
        setIsViewOnly(true);  // In view only mode
        setOpenMovieForm(true);
      }
    } catch (err) {
      console.error('Error getting movie details:', err);
      showSnackbar('Tải chi tiết phim thất bại', 'error');
    }
  };

  // Handle form close - updated to reset view only mode
  const handleCloseForm = () => {
    setOpenMovieForm(false);
    setIsViewOnly(false); // Reset view only mode when closing form
  };
  
  // Handle movie form submission
  const handleSubmitMovie = async (formData) => {
    try {
      let result;
      if (isEditMode) {
        result = await editMovie(selectedMovie.movieId, formData);
        if (result.success) {
          showSnackbar('Cập nhật phim thành công', 'success');
        } else {
          showSnackbar(`Cập nhật phim thất bại: ${result.error}`, 'error');
        }
      } else {
        result = await addMovie(formData);
        if (result.success) {
          showSnackbar('Tạo phim thành công', 'success');
        } else {
          showSnackbar(`Tạo phim thất bại: ${result.error}`, 'error');
        }
      }
      
      if (result.success) {
        setOpenMovieForm(false);
        refreshMovies();
      }
      return result; // Return result to let the MovieForm component know the operation completed
    } catch (err) {
      console.error('Error submitting movie:', err);
      showSnackbar('An error occurred while saving movie', 'error');
      throw err; // Re-throw so MovieForm can catch it
    }
  };
  
  // Handle delete movie - fix to use proper async/await pattern
  const handleDeleteMovie = async (id) => {
    if (window.confirm(`Bạn có chắc muốn xóa phim ${id}?`)) {
      try {
        const result = await removeMovie(id);
        if (result.success) {
          showSnackbar('Xóa phim thành công', 'success');
          // Don't set shouldFetchMovies again - just call refreshMovies once
          await refreshMovies();
        } else {
          showSnackbar(`Xóa phim thất bại: ${result.error}`, 'error');
          console.log(result);
        }
      } catch (error) {
        console.error("Error deleting movie:", error);
        showSnackbar('Có lỗi xảy ra khi xóa phim', 'error');
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

  // This function is called when user clicks on pagination controls
  const handleChangePage = (event, newPage) => {
    console.log(`Moving to page ${newPage}`); // Log for debugging
    // Pagination component is 1-based but our state is 0-based
    setPage(newPage - 1); 
    setShouldFetchMovies(true); // Enable fetch when page changes
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log(`Changing rows per page to ${newRowsPerPage}`);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing page size
    setShouldFetchMovies(true); // Enable fetch when page size changes
  };

  // Handle sorting changes
  const handleSortChange = useCallback((field, order) => {
    setSorting(prev => ({
      movieSortBy: field,
      sortOrder: order
    }));
    setPage(0);
    setShouldFetchMovies(true); // Enable fetch when sorting changes
  }, []);

  // Modify this useEffect to avoid double fetching on initial load
  useEffect(() => {
    // Initial load - rely on useMovies hook to fetch data automatically
    // No need to call refreshMovies() on mount as it causes double fetching
    
    // Just ensure shouldFetchMovies is true for initial load
    setShouldFetchMovies(true);
    
    // No need to disable fetching here
  }, []);

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
          Quản lý phim
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddMovieClick}
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            color: '#fff', // Always white text for contrast
            fontWeight: 500,
            px: 2,
            py: 1
          }}
        >
          Tạo bộ phim mới
        </Button>
      </Box>
      
      {/* Search and Filter section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            sx={{ flexGrow: 1, mr: 2 }}
            variant="outlined"
            placeholder="Tìm kiếm theo tên phim..."
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
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setOpenFilters(!openFilters)}
            sx={{
              borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)',
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderColor: theme.palette.primary.main
              }
            }}
          >
            Filters
            <Box component="span" sx={{ ml: 0.5, display: 'inline-flex', alignItems: 'center' }}>
              <ExpandMoreIcon 
                sx={{ 
                  transform: openFilters ? 'rotate(180deg)' : 'rotate(0)',
                  transition: '0.3s'
                }} 
              />
            </Box>
          </Button>
        </Box>
        
        {/* Collapsible filter section */}
        <Collapse in={openFilters}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 3, 
              backgroundColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.background.paper, 0.7)
                : alpha(theme.palette.background.paper, 0.2),
              borderRadius: 1,
              border: '1px solid',
              borderColor: theme.palette.mode === 'light' 
                ? 'rgba(0, 0, 0, 0.12)'
                : 'rgba(255, 255, 255, 0.12)'
            }}
          >
            <Grid container spacing={3}>
              {/* Combined filters section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  Lọc theo các tiêu chí
                </Typography>
                
                {/* Combined filters in single row */}
                <Grid container spacing={2} mb={2}>
                  {/* Genre filter */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id="genre-filter-label" sx={{ fontWeight: 500 }}>
                        Thể loại
                      </InputLabel>
                      <Select
                        labelId="genre-filter-label"
                        id="genre-filter"
                        multiple
                        value={filters.selectedGenres}
                        onChange={(e) => handleFilterChange('genres', e.target.value)}
                        input={<OutlinedInput label="Genres" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => {
                              const genre = genres.find(g => g.genresId === value);
                               return (
                                <Chip 
                                  key={value} 
                                  label={genre ? genre.genresName : value}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )}
                        sx={{
                          borderRadius: 1,
                          '& .MuiSelect-select': {
                            minHeight: 30
                          }
                        }}
                      >
                        {genres.map((genre) => (
                          <MenuItem key={genre.genresId} value={genre.genresId}>
                            {genre.genresName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Sort By dropdown - moved from top section */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel>Thời gian</InputLabel>
                      <Select
                        value={filters.sorting.movieSortBy !== null ? filters.sorting.movieSortBy : ''}
                        onChange={(e) => handleFilterChange('sorting', { 
                          movieSortBy: e.target.value === '' ? null : e.target.value 
                        })}
                        label="Sort by"
                      >
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="0">Ngày tạo</MenuItem>
                        <MenuItem value="1">Ngày phát hành</MenuItem>
                        <MenuItem value="2">Ngày kết thúc</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Order dropdown - moved from top section */}
                  <Grid item xs={12} md={4}>
                    <FormControl 
                      fullWidth 
                      variant="outlined" 
                      size="small" 
                      disabled={filters.sorting.movieSortBy === null}
                    >
                      <InputLabel>Thứ tự</InputLabel>
                      <Select
                        value={filters.sorting.sortOrder !== null ? filters.sorting.sortOrder : '0'}
                        onChange={(e) => handleFilterChange('sorting', { sortOrder: e.target.value })}
                        label="Order"
                      >
                        <MenuItem value="0">Cũ nhất</MenuItem>
                        <MenuItem value="1">Mới nhất</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                  
                {/* Status filter row */}
                <Grid container>
                  <Grid item xs={12}>
                    {/* <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Status
                    </Typography> */}
                    <FormGroup row>
                      {/* <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.statuses.active}
                            onChange={(e) => handleFilterChange('status', { active: e.target.checked })}
                            name="active"
                            size="small"
                            sx={{
                              color: theme.palette.success.main,
                              '&.Mui-checked': {
                                color: theme.palette.success.main,
                              },
                            }}
                          />
                        }
                        label="Active"
                        sx={{ mr: 4 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.statuses.comingSoon}
                            onChange={(e) => handleFilterChange('status', { comingSoon: e.target.checked })}
                            name="comingSoon"
                            size="small"
                            sx={{
                              color: theme.palette.primary.main,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label="Coming Soon"
                        sx={{ mr: 4 }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.statuses.archived}
                            onChange={(e) => handleFilterChange('status', { archived: e.target.checked })}
                            name="archived"
                            size="small"
                            sx={{
                              color: theme.palette.text.secondary,
                              '&.Mui-checked': {
                                color: theme.palette.text.secondary,
                              },
                            }}
                          />
                        }
                        label="Archived"
                      /> */}
                    </FormGroup>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Action buttons */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  onClick={resetFilters}
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, borderRadius: 1 }}
                >
                  Reset
                </Button>
                <Button 
                  onClick={applyFilters}
                  variant="contained"
                  size="small"
                  sx={{ borderRadius: 1 }}
                >
                  Lọc
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
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
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'light' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.common.white, 0.05) 
                }}>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Ảnh</StyledTableCell>
                  <StyledTableCell>Tiêu đề phim</StyledTableCell>
                  <StyledTableCell>Thể loại</StyledTableCell>
                  <StyledTableCell align="right">Thời lượng (phút)</StyledTableCell>
                  <StyledTableCell>Ngày công chiếu</StyledTableCell>
                  <StyledTableCell>Trạng thái</StyledTableCell>
                  <StyledTableCell align="center">Chức năng</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movies.map((movie) => (
                  <StyledTableRow 
                    key={movie.movieId}
                    onClick={() => handleViewClick(movie.movieId)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <StyledTableCell>{movie.movieId}</StyledTableCell>
                    <StyledTableCell>
                      {movie.moviePoster ? (
                        <MoviePosterImage
                          src={movie.moviePoster}
                          alt={`${movie.movieName} poster`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/60x90?text=No+Image';
                          }}
                        />
                      ) : (
                        <MoviePosterImage
                          src="https://via.placeholder.com/60x90?text=No+Image"
                          alt="No poster available"
                        />
                      )}
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {movie.movieName}
                    </StyledTableCell>
                    <StyledTableCell>
                      {movie.genres?.map((genre, index) => (
                        <Chip 
                          key={index} 
                          label={genre.genresName} 
                          size="small" 
                          sx={{ 
                            mr: 0.5, 
                            backgroundColor: theme.palette.mode === 'light'
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.2),
                            color: theme.palette.primary.main,
                            fontWeight: 500
                          }} 
                        />
                      )) || '—'}
                    </StyledTableCell>
                    <StyledTableCell align="right">{movie.movieDuration || '—'}</StyledTableCell>
                    <StyledTableCell>
                      {movie.movieStartAt 
                        ? new Date(movie.movieStartAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            timeZone: 'Asia/Ho_Chi_Minh'
                          })
                        : '—'
                      }
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip status={movie.movieAvailable} />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton 
                        size="small" 
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleViewClick(movie.movieId);
                        }}
                        sx={{ 
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          marginRight: 1,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.2),
                          }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleEditClick(movie.movieId);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleDeleteMovie(movie.movieId);
                        }}
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
                
                {/* Show message when no movies are found */}
                {movies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">
                        No movies found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Always show movie count and rows per page */}
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
              {`Hiển thị ${movies.length} trên ${pagination.totalItems} bộ phim`}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Only show pagination when there are multiple pages */}
              {pagination.totalPages > 1 && (
                <Pagination
                  count={pagination.totalPages}
                  page={page + 1} // Convert 0-based to 1-based for Pagination component
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
              
              {/* Always show rows per page selector */}
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
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                      setShouldFetchMovies(true); // Enable fetch when page size changes
                    }}
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
      
      {/* Movie Form Dialog - updated to pass isViewOnly prop */}
      <MovieForm
        open={openMovieForm}
        handleClose={handleCloseForm}
        movie={selectedMovie}
        onSubmit={handleSubmitMovie}
        isEdit={isEditMode}
        isViewOnly={isViewOnly}
      />
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}  // Changed from 6000 to 3000 milliseconds (3 seconds)
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

export default Movies;