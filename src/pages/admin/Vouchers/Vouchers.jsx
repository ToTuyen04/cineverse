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
import useVouchers from '../../../hooks/useVouchers';
import VoucherForm from './VoucherForm';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');
dayjs.locale('vi');

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
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

// Status chip component
const StatusChip = ({ active, endDate }) => {
  const theme = useTheme();
  const isExpired = endDate && new Date(endDate) < new Date();
  
  // If voucher is expired, use gray color for "Inactive"
  const useGrayColor = isExpired && !active;
  
  const bgcolor = active 
    ? theme.palette.mode === 'light' 
      ? alpha(theme.palette.success.main, 0.1)
      : alpha(theme.palette.success.main, 0.2)
    : useGrayColor
      ? theme.palette.mode === 'light'
        ? alpha(theme.palette.grey[500], 0.1)
        : alpha(theme.palette.grey[500], 0.2)
      : theme.palette.mode === 'light' 
        ? alpha(theme.palette.error.main, 0.1)
        : alpha(theme.palette.error.main, 0.2);
  
  const textColor = active 
    ? theme.palette.success.main
    : useGrayColor
      ? theme.palette.grey[500]
      : theme.palette.error.main;
  
  return (
    <Chip 
      label={active ? "Active" : "Inactive"} 
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

const Vouchers = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // State for voucher form
  const [openVoucherForm, setOpenVoucherForm] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Use the custom hook to fetch vouchers
  const { 
    vouchers, 
    loading, 
    error, 
    pagination,
    addVoucher, 
    editVoucher, 
    removeVoucher, 
    getVoucher, 
    refreshVouchers,
    getAllVouchers,
    searchVouchers 
  } = useVouchers();

  // Set up search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch vouchers when component mounts
  useEffect(() => {
    refreshVouchers(page, rowsPerPage);
  }, [refreshVouchers, page, rowsPerPage]);
  
  // Fetch vouchers when search changes
  useEffect(() => {
    if (searchDebounce) {
      searchVouchers(searchDebounce, page, rowsPerPage);
    } else {
      refreshVouchers(page, rowsPerPage);
    }
  }, [searchDebounce, page, rowsPerPage, searchVouchers, refreshVouchers]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (searchDebounce) {
      searchVouchers(searchDebounce, newPage, rowsPerPage);
    } else {
      refreshVouchers(newPage, rowsPerPage);
    }
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1);
    if (searchDebounce) {
      searchVouchers(searchDebounce, 1, newRowsPerPage);
    } else {
      refreshVouchers(1, newRowsPerPage);
    }
  };
  
  // Handle add voucher button click
  const handleAddVoucherClick = () => {
    setIsEditMode(false);
    setSelectedVoucher(null);
    setOpenVoucherForm(true);
  };
  
  // Handle edit voucher button click
  const handleEditClick = async (voucherId) => {
    try {
      console.log(`Fetching voucher details for ID: ${voucherId}`);
      const voucherData = await getVoucher(voucherId);
      
      console.log('Received voucher data:', voucherData);
      
      if (voucherData) {
        setSelectedVoucher(voucherData);
        setIsEditMode(true);
        setOpenVoucherForm(true);
      } else {
        showSnackbar('Failed to load voucher details: No data returned', 'error');
      }
    } catch (err) {
      console.error('Error getting voucher details:', err);
      showSnackbar(`Failed to load voucher details: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenVoucherForm(false);
  };
  
  // Handle voucher form submission
  const handleSubmitVoucher = async (formData) => {
    try {
      let result;
      
      if (isEditMode) {
        result = await editVoucher(selectedVoucher.voucherId, formData);
        if (result.success) {
          showSnackbar('Cập nhật voucher thành công', 'success');
        } else {
          showSnackbar(`Cập nhật voucher thất bại: ${result.error}`, 'error');
        }
      } else {
        result = await addVoucher(formData);
        if (result.success) {
          showSnackbar('Tạo voucher mới thành công', 'success');
        } else {
          showSnackbar(`Tạo voucher mới thất bại: ${result.error}`, 'error');
        }
      }
      
      if (result.success) {
        setOpenVoucherForm(false);
        // Refresh list with current pagination
        if (searchDebounce) {
          searchVouchers(searchDebounce, page, rowsPerPage);
        } else {
          refreshVouchers(page, rowsPerPage);
        }
      }
    } catch (err) {
      console.error('Error submitting voucher:', err);
      showSnackbar('An error occurred while saving voucher', 'error');
    }
  };
  
  // Handle delete voucher
  const handleDeleteVoucher = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      const result = await removeVoucher(id);
      if (result.success) {
        showSnackbar('Voucher deleted successfully', 'success');
        // Refresh list with current pagination
        if (searchDebounce) {
          searchVouchers(searchDebounce, page, rowsPerPage);
        } else {
          refreshVouchers(page, rowsPerPage);
        }
      } else {
        showSnackbar(`Failed to delete voucher: ${result.error}`, 'error');
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
          Quản lý Voucher
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddVoucherClick}
          sx={{ 
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            color: '#fff',
            fontWeight: 500,
            px: 2,
            py: 1
          }}
        >
          Add New Voucher
        </Button>
      </Box>
      
      {/* Enhanced search box */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for vouchers..."
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
              }
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
            <Table sx={{ minWidth: 650 }} aria-label="vouchers table">
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: theme.palette.mode === 'light' 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.common.white, 0.05) 
                }}>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Tên</StyledTableCell>
                  <StyledTableCell>Mã voucher</StyledTableCell>
                  <StyledTableCell>Thời gian</StyledTableCell>
                  <StyledTableCell>Giảm giá</StyledTableCell>
                  <StyledTableCell>Trạng thái</StyledTableCell>
                  <StyledTableCell align="center">Chức năng</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vouchers.map((voucher) => (
                  <StyledTableRow key={voucher.voucherId}>
                    <StyledTableCell>{voucher.voucherId}</StyledTableCell>
                    <StyledTableCell>{voucher.voucherName}</StyledTableCell>
                    <StyledTableCell>{voucher.voucherCode}</StyledTableCell>
                    <StyledTableCell>
                      {formatDateTime(voucher.voucherStartAt)} - {formatDateTime(voucher.voucherEndAt)}
                    </StyledTableCell>
                    <StyledTableCell>
                      {voucher.voucherDiscount}% (Max: {voucher.voucherMaxValue.toLocaleString()} VND)
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip 
                        active={voucher.voucherAvailable} 
                        endDate={voucher.voucherEndAt}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditClick(voucher.voucherId)}
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
                        onClick={() => handleDeleteVoucher(voucher.voucherId)}
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
                
                {/* Show message when no vouchers are found */}
                {vouchers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1">
                        No vouchers found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Updated pagination and rows per page controls */}
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
              {`Showing ${vouchers.length} of ${pagination.totalCount || 0} vouchers`}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Always show pagination controls */}
              <Pagination
                count={pagination.totalPages || 1}
                page={page}
                onChange={handleChangePage}
                color="primary"
                size="large"
                disabled={loading}
                renderItem={(item) => (
                  <PaginationItem
                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                    {...item}
                    disabled={loading || item.disabled}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: '#fff',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      }
                    }}
                  />
                )}
              />
              
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
                  sx={{ minWidth: 80 }}
                >
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    disabled={loading}
                    sx={{
                      backgroundColor: theme.palette.background.paper
                    }}
                  >
                    {[5, 10, 25, 50].map((option) => (
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
      
      {/* Voucher Form Dialog */}
      <VoucherForm
        open={openVoucherForm}
        handleClose={handleCloseForm}
        voucher={selectedVoucher}
        onSubmit={handleSubmitVoucher}
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

export default Vouchers;
