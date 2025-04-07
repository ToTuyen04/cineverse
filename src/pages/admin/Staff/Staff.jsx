import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  Search,
  Refresh,
  PersonOutline,
  Email,
  Phone,
  Cake,
  Male,
  Female,
  Wc,
  AccessTime,
  Add,
  Edit,
  Delete,
  Visibility,
  TheaterComedy,
  WorkOutline,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import StaffForm from "./StaffForm";
import { useStaff } from "../../../hooks/useStaff";

// Fake theaters data - to be replaced by API
const theaters = [
  { id: 1, name: "Cinema Đà Nẵng" },
  { id: 2, name: "Cinema Hà Nội" },
  { id: 3, name: "Cinema TP. Hồ Chí Minh" },
  { id: 4, name: "Cinema Huế" },
  { id: 5, name: "Cinema Nha Trang" },
];

// Fake roles data - to be replaced by API
const roles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Staff" },
];

export default function Staff() {
  const { 
    staffs, 
    loading, 
    error, 
    fetchStaffs, 
    addStaff, 
    editStaff, 
    removeStaff 
  } = useStaff();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewStaff, setViewStaff] = useState(null);
  // Add state for API messages
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Sorting states
  const [orderBy, setOrderBy] = useState('fullName');
  const [order, setOrder] = useState('asc');

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return "Invalid date";
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setSearchTerm("");
    setPage(0);
    fetchStaffs();
  };

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort function
  const getSortedData = (data, order, orderBy) => {
    return [...data].sort((a, b) => {
      // Handle special case for fullName which might be composed of firstName and lastName
      if (orderBy === 'fullName') {
        const nameA = a.fullName || `${a.firstName || ''} ${a.lastName || ''}`;
        const nameB = b.fullName || `${b.firstName || ''} ${b.lastName || ''}`;
        return order === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      
      // Handle special case for date
      if (orderBy === 'dateOfBirth') {
        const dateA = a.dateOfBirth ? new Date(a.dateOfBirth) : new Date(0);
        const dateB = b.dateOfBirth ? new Date(b.dateOfBirth) : new Date(0);
        return order === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }
      
      // For other fields
      if (a[orderBy] === undefined || a[orderBy] === null) return order === 'asc' ? -1 : 1;
      if (b[orderBy] === undefined || b[orderBy] === null) return order === 'asc' ? 1 : -1;
      
      return order === 'asc'
        ? a[orderBy].toString().localeCompare(b[orderBy].toString())
        : b[orderBy].toString().localeCompare(a[orderBy].toString());
    });
  };

  // Filter staffs based on search term - focusing on name, phone number, and email
  const filteredStaffs = staffs.filter((staff) => {
    if (!searchTerm.trim()) return true; // Return all results if search is empty
    
    const searchValue = searchTerm.toLowerCase().trim();
    const searchTerms = searchValue.split(' ').filter(term => term.length > 0); // Split search into words
    
    // If no valid search terms after splitting, return all results
    if (searchTerms.length === 0) return true;
    
    // Check if any search term is contained in name, phone number, or email fields
    return searchTerms.some(term => {
      // Check name fields
      const nameMatch = 
        (staff.firstName && staff.firstName.toLowerCase().includes(term)) ||
        (staff.lastName && staff.lastName.toLowerCase().includes(term)) ||
        (staff.fullName && staff.fullName.toLowerCase().includes(term));
      
      // Check phone number
      const phoneMatch = staff.phoneNumber && staff.phoneNumber.includes(term);
      
      // Check email
      const emailMatch = staff.email && staff.email.toLowerCase().includes(term);
      
      // Return true if name, phone, or email matches
      return nameMatch || phoneMatch || emailMatch;
    });
  });

  // Apply sorting to filtered staff data
  const sortedStaffs = getSortedData(filteredStaffs, order, orderBy);

  // Get paginated data from sorted staff
  const paginatedStaffs = sortedStaffs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status chip
  const getStatusChip = (status) => {
    switch (status) {
      case 1:
        return <Chip label="Hoạt động" color="success" size="small" />;
      case 0:
        return <Chip label="Không hoạt động" color="error" size="small" />;
      default:
        return <Chip label="Không xác định" color="default" size="small" />;
    }
  };

  // Handle form open for creating new staff
  const handleAddStaff = () => {
    setCurrentStaff(null);
    setOpenForm(true);
  };

  // Handle form open for editing staff
  const handleEditStaff = (staff) => {
    setCurrentStaff(staff);
    setOpenForm(true);
  };

  // Handle form close with reset messages
  const handleFormClose = () => {
    setOpenForm(false);
    setCurrentStaff(null);
    setApiError("");
    setApiSuccess("");
  };

  // Handle view staff details
  const handleViewStaff = (staff) => {
    setViewStaff(staff);
    setOpenViewDialog(true);
  };

  // Handle save staff with success/error handling
  const handleSaveStaff = async (staffData) => {
    try {
      setApiError("");
      setApiSuccess("");
      
      if (currentStaff) {
        // Update existing staff
        const result = await editStaff({
          email: currentStaff.email,
          ...staffData
        });
        
        if (result.success) {
          setApiSuccess(result.message);
          // Change timeout to 3 seconds
          setTimeout(() => {
            setOpenForm(false);
            setCurrentStaff(null);
          }, 3000); // Changed from 1500 to 3000 (3 seconds)
        } else {
          setApiError(result.message);
        }
      } else {
        // Add new staff
        const result = await addStaff(staffData);
        
        if (result.success) {
          setApiSuccess(result.message);
          // Change timeout to 3 seconds
          setTimeout(() => {
            setOpenForm(false);
          }, 3000); // Changed from 1500 to 3000 (3 seconds)
        } else {
          setApiError(result.message);
        }
      }
    } catch (err) {
      console.error("Error saving staff:", err);
      setApiError("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  // Handle delete staff
  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (staffToDelete) {
      try {
        await removeStaff(staffToDelete.email);
        setOpenDeleteDialog(false);
        setStaffToDelete(null);
      } catch (err) {
        console.error("Error deleting staff:", err);
        // Error is already handled by the hook
      }
    }
  };

  // Add a component for sortable column headers
  const SortableTableCell = ({ id, label, align }) => {
    return (
      <TableCell 
        align={align || 'left'}
        sortDirection={orderBy === id ? order : false}
        sx={{ cursor: 'pointer' }}
        onClick={() => handleRequestSort(id)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
          {label}
          <Box component="span" sx={{ ml: 0.5 }}>
            {orderBy === id ? (
              order === 'asc' ? '↑' : '↓'
            ) : ''}
          </Box>
        </Box>
      </TableCell>
    );
  };

  // Update the table to display roleName
  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Quản lý nhân viên
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Tìm theo tên, sđt hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Làm mới dữ liệu">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddStaff}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Thêm nhân viên
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Thống kê nhân viên
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Tổng số nhân viên:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {staffs.length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Đang hoạt động:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {staffs.filter((staff) => staff.status === 1).length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Không hoạt động:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="error.main"
                    >
                      {staffs.filter((staff) => staff.status === 0).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Phân bố giới tính
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Male color="primary" sx={{ mr: 1 }} />
                      <Typography variant="body2">Nam:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {staffs.filter((staff) => staff.gender === 1).length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Female color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="body2">Nữ:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {staffs.filter((staff) => staff.gender === 2).length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Wc color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">Khác:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {
                        staffs.filter(
                          (staff) =>
                            staff.gender !== 1 &&
                            staff.gender !== 2 &&
                            staff.gender !== null
                        ).length
                      }
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Bộ lọc và sắp xếp
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonOutline color="action" sx={{ mr: 1 }} />
                    <TextField
                      fullWidth
                      size="small"
                      label="Tên nhân viên"
                      variant="outlined"
                      placeholder="Nhập tên nhân viên..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Email color="action" sx={{ mr: 1 }} />
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      variant="outlined"
                      placeholder="Nhập email..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Phone color="action" sx={{ mr: 1 }} />
                    <TextField
                      fullWidth
                      size="small"
                      label="Số điện thoại"
                      variant="outlined"
                      placeholder="Nhập số điện thoại..."
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Nhấp vào tiêu đề cột để sắp xếp
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

        </Grid>

        <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                borderRadius: "4px 4px 0 0",
              }}
            >
              <Typography variant="h6" color="white">
                Danh sách nhân viên ({filteredStaffs.length})
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer 
                  component={Paper} 
                  elevation={0}
                  sx={{ 
                    bgcolor: 'background.paper',
                    '& .MuiTableCell-root': {
                      color: 'text.primary'
                    }
                  }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : '#f5f5f5'
                      }}>
                        <SortableTableCell id="fullName" label="Nhân viên" />
                        <SortableTableCell id="email" label="Email" />
                        <SortableTableCell id="phoneNumber" label="Số điện thoại" />
                        <SortableTableCell id="dateOfBirth" label="Ngày sinh" />
                        <SortableTableCell id="roleName" label="Vai trò" />
                        <SortableTableCell id="status" label="Trạng thái" align="center" />
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedStaffs.length > 0 ? (
                        paginatedStaffs.map((staff) => (
                          <TableRow 
                            key={staff.email} 
                            hover
                            onClick={() => handleViewStaff(staff)}
                            sx={{ cursor: 'pointer' }}
                          >
                            {/* Name cell - no changes */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar
                                  src={staff.avatar}
                                  alt={staff.fullName}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    bgcolor: "primary.main",
                                  }}
                                >
                                  {staff.firstName?.charAt(0) ||
                                    staff.lastName?.charAt(0) || (
                                      <PersonOutline />
                                    )}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {staff.fullName || `${staff.firstName || ""} ${staff.lastName || ""}`}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {staff.gender === 1 ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Male
                                          fontSize="small"
                                          color="primary"
                                          sx={{ mr: 0.5 }}
                                        />
                                        <span>Nam</span>
                                      </Box>
                                    ) : staff.gender === 2 ? (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Female
                                          fontSize="small"
                                          color="secondary"
                                          sx={{ mr: 0.5 }}
                                        />
                                        <span>Nữ</span>
                                      </Box>
                                    ) : (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Wc
                                          fontSize="small"
                                          color="action"
                                          sx={{ mr: 0.5 }}
                                        />
                                        <span>Khác</span>
                                      </Box>
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            
                            {/* Email cell - no changes */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Email
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {staff.email || "N/A"}
                              </Box>
                            </TableCell>
                            
                            {/* Phone cell - no changes */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Phone
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {staff.phoneNumber || "N/A"}
                              </Box>
                            </TableCell>
                            
                            {/* Birthday cell - no changes */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Cake
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {formatDate(staff.dateOfBirth)}
                              </Box>
                            </TableCell>
                            
                            {/* Role cell - New */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <WorkOutline
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {staff.roleName || (staff.roleId === 1 ? "Admin" : "Staff")}
                              </Box>
                            </TableCell>
                            
                            {/* Status cell - no changes */}
                            <TableCell align="center">
                              {getStatusChip(staff.status)}
                            </TableCell>
                            
                            {/* Actions cell - no changes */}
                            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                              <Box
                                sx={{ display: "flex", justifyContent: "center" }}
                              >
                                <Tooltip title="Xem chi tiết">
                                  <IconButton 
                                    size="small" 
                                    color="info"
                                    onClick={() => handleViewStaff(staff)}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Chỉnh sửa">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditStaff(staff)}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(staff)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="body1" color="text.secondary">
                                {searchTerm
                                  ? "Không tìm thấy kết quả nào."
                                  : "Chưa có dữ liệu nhân viên."}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pagination control */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredStaffs.length}
                  rowsPerPage={rowsPerPage}
                  page={filteredStaffs.length > 0 ? page : 0}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số hàng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} của ${count}`
                  }
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Staff Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={handleFormClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle>
          {currentStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        </DialogTitle>
        <DialogContent dividers>
          <StaffForm
            staff={currentStaff}
            onSave={handleSaveStaff}
            theaters={theaters}
            roles={roles}
            apiError={apiError}
            apiSuccess={apiSuccess}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose} color="inherit">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Staff Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle>Thông tin nhân viên</DialogTitle>
        <DialogContent dividers>
          {viewStaff && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={viewStaff.avatar}
                  alt={viewStaff.fullName}
                  sx={{ width: 100, height: 100, mb: 2 }}
                >
                  {viewStaff.firstName?.charAt(0) || viewStaff.lastName?.charAt(0) || <PersonOutline />}
                </Avatar>
                <Typography variant="h6">{viewStaff.fullName}</Typography>
                <Chip 
                  label={viewStaff.status === 1 ? "Hoạt động" : "Không hoạt động"} 
                  color={viewStaff.status === 1 ? "success" : "error"} 
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{viewStaff.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Số điện thoại</Typography>
                  <Typography variant="body1">{viewStaff.phoneNumber || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ngày sinh</Typography>
                  <Typography variant="body1">{formatDate(viewStaff.dateOfBirth)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Giới tính</Typography>
                  <Typography variant="body1">
                    {viewStaff.gender === 1 ? "Nam" : viewStaff.gender === 2 ? "Nữ" : "Khác"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Vai trò</Typography>
                  <Typography variant="body1">
                    {viewStaff.roleName || 
                      (viewStaff.roleId === 1 ? "Admin" : 
                      viewStaff.roleId === 2 ? "Staff" : "Không xác định")}
                  </Typography>
                </Grid>
                {/* <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Chi nhánh</Typography>
                  <Typography variant="body1">
                    {theaters.find(t => t.id === viewStaff.theaterId)?.name || "Không xác định"}
                  </Typography>
                </Grid> */}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)} color="primary">
            Đóng
          </Button>
          <Button 
            onClick={() => {
              setOpenViewDialog(false);
              handleEditStaff(viewStaff);
            }} 
            color="primary"
            startIcon={<Edit />}
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary'
          }
        }}
      >
        <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Bạn có chắc chắn muốn xóa nhân viên "{staffToDelete?.fullName || `${staffToDelete?.firstName || ""} ${staffToDelete?.lastName || ""}`}" không?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Lưu ý: Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
