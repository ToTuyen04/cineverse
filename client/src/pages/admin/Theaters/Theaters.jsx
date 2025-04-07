import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
  useTheme, alpha, CircularProgress, Alert, Pagination, PaginationItem,
  Select, MenuItem, FormControl, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiEditIcon from '@mui/icons-material/Edit';
import MuiDeleteIcon from '@mui/icons-material/Delete';
import MuiAddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import useTheaters from '../../../hooks/useTheaters';
import TheaterForm from './TheaterForm';

// Enhanced styling for table cells with better light/dark mode support
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

// Enhanced status chip with better light/dark mode handling
const StatusChip = ({ status }) => {
  const theme = useTheme();
  let color = 'default';
  let bgcolor, textColor;
  
  if (status === 'Active') {
    color = 'success';
    bgcolor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.success.main, 0.1)
      : alpha(theme.palette.success.main, 0.2);
    textColor = theme.palette.success.main;
  } else if (status === 'Under Maintenance') {
    color = 'warning';
    bgcolor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.warning.main, 0.1)
      : alpha(theme.palette.warning.main, 0.2);
    textColor = theme.palette.warning.main;
  } else if (status === 'Closed') {
    color = 'error';
    bgcolor = theme.palette.mode === 'light' 
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.error.main, 0.2);
    textColor = theme.palette.error.main;
  }
  
  return (
    <Chip 
      label={status} 
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

const Theaters = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0); // MUI uses 0-based pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // State for theater form
  const [openTheaterForm, setOpenTheaterForm] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // or 'error'
  });
  
  // Use the custom hook to fetch theaters with pagination and search
  const { 
    theaters, 
    loading, 
    error, 
    pagination, 
    addTheater, 
    editTheater, 
    removeTheater, 
    getTheater, 
    refreshTheaters 
  } = useTheaters({
    page: page + 1, // This converts MUI's 0-based page to API's 1-based page
    limit: rowsPerPage,
    search: searchDebounce
  });

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounce(searchTerm);
      setPage(0); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  // Handle add theater button click
  const handleAddTheaterClick = () => {
    setIsEditMode(false);
    setSelectedTheater(null);
    setOpenTheaterForm(true);
  };
  
  // Handle edit theater button click
  const handleEditClick = async (theaterId) => {
    try {
      const theaterData = await getTheater(theaterId);
      if (theaterData) {
        setSelectedTheater(theaterData);
        setIsEditMode(true);
        setOpenTheaterForm(true);
      }
    } catch (err) {
      console.error('Error getting theater details:', err);
      showSnackbar('Failed to load theater details', 'error');
    }
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenTheaterForm(false);
  };
  
  // Handle theater form submission
  const handleSubmitTheater = async (formData) => {
    try {
      let result;
      if (isEditMode) {
        result = await editTheater(selectedTheater.theaterId, formData);
        if (result.success) {
          showSnackbar('Theater updated successfully', 'success');
        } else {
          showSnackbar(`Failed to update theater: ${result.error}`, 'error');
        }
      } else {
        result = await addTheater(formData);
        if (result.success) {
          showSnackbar('Theater added successfully', 'success');
        } else {
          showSnackbar(`Failed to add theater: ${result.error}`, 'error');
        }
      }
      
      if (result.success) {
        setOpenTheaterForm(false);
        refreshTheaters();
      }
    } catch (err) {
      console.error('Error submitting theater:', err);
      showSnackbar('An error occurred while saving theater', 'error');
    }
  };
  
  // Handle delete theater
  const handleDeleteTheater = async (id) => {
    if (window.confirm('Are you sure you want to delete this theater?')) {
      const result = await removeTheater(id);
      if (result.success) {
        showSnackbar('Theater deleted successfully', 'success');
      } else {
        showSnackbar(`Failed to delete theater: ${result.error}`, 'error');
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

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1); // Convert 1-based to 0-based
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing page size
  };

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
          Theaters Management
        </Typography>
        {/* <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddTheaterClick}
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            color: '#fff',
            fontWeight: 500,
            px: 2,
            py: 1
          }}
        >
          Add New Theater
        </Button> */}
      </Box>
      
      {/* Enhanced search box */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for theaters..."
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
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'light' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.common.white, 0.05) 
                }}>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Theater Name</StyledTableCell>
                  <StyledTableCell>Address</StyledTableCell>
                  <StyledTableCell>Hotline</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {theaters && theaters.map((theater) => (
                  <StyledTableRow key={theater.theaterId}>
                    <StyledTableCell>
                      {theater.theaterId}
                    </StyledTableCell>
                    <StyledTableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {theater.theaterName || theater.theatreName}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">{theater.theaterLocation || theater.theaterAddress || theater.theatreAddress}</Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      {theater.theaterHotline || theater.theaterPhone || '—'}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(theater.theaterId)}
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
                        onClick={() => handleDeleteTheater(theater.theaterId)}
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
                
                {/* Show message when no theaters are found */}
                {(!theaters || theaters.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">
                        No theaters found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination and rows per page control */}
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
              {`Showing ${theaters?.length || 0} of ${pagination.totalItems} theaters`}
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
      
      {/* Theater Form Dialog */}
      <TheaterForm
        open={openTheaterForm}
        handleClose={handleCloseForm}
        theater={selectedTheater}
        onSubmit={handleSubmitTheater}
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

const EditIcon = MuiEditIcon;
const DeleteIcon = MuiDeleteIcon;
const AddIcon = MuiAddIcon;

export default Theaters;
