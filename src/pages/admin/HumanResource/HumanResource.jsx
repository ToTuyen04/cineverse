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
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
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
  Star,
  Info,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { getAllUsers } from "../../../api/services/userService";
import HumanResourceForm from "./HumanResourceForm";

export default function HumanResource() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openUserDetail, setOpenUserDetail] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Add pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Không thể lấy danh sách người dùng");
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.message || "Không thể lấy danh sách người dùng"}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // For ISO date format
      if (dateString.includes("T") || dateString.includes("Z")) {
        return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi });
      }
      // For other date formats
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return "Invalid date";
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (user.userFirstName &&
        user.userFirstName.toLowerCase().includes(searchValue)) ||
      (user.userLastName &&
        user.userLastName.toLowerCase().includes(searchValue)) ||
      (user.userEmail && user.userEmail.toLowerCase().includes(searchValue)) ||
      (user.userPhoneNumber &&
        user.userPhoneNumber.toLowerCase().includes(searchValue))
    );
  });

  // Get paginated data
  const paginatedUsers = filteredUsers.slice(
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

  // Reset pagination when search term changes
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  // Get status chip
  const getUserStatusChip = (status) => {
    switch (status) {
      case 1:
        return <Chip label="Hoạt động" color="success" size="small" />;
      case 0:
        return <Chip label="Không hoạt động" color="error" size="small" />;
      default:
        return <Chip label="Không xác định" color="default" size="small" />;
    }
  };

  // Handle opening user detail dialog
  const handleOpenUserDetail = (user) => {
    setSelectedUser(user);
    setOpenUserDetail(true);
  };

  // Handle closing user detail dialog
  const handleCloseUserDetail = () => {
    setOpenUserDetail(false);
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3 }}>
        {/* Header section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Quản lý nhân sự
          </Typography>
          <Box>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mr: 1, width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Làm mới dữ liệu">
              <IconButton 
                onClick={() => {
                  setSearchTerm("");
                  fetchUsers();
                }} 
                color="primary"
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Statistics cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Thống kê người dùng
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Tổng số người dùng:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {users.length}
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
                      {users.filter((user) => user.userStatus === 1).length}
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
                      {users.filter((user) => user.userStatus === 0).length}
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
                      {users.filter((user) => user.userGender === 1).length}
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
                      {users.filter((user) => user.userGender === 2).length}
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
                        users.filter(
                          (user) =>
                            user.userGender !== 1 &&
                            user.userGender !== 2 &&
                            user.userGender !== null
                        ).length
                      }
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Info color="disabled" sx={{ mr: 1 }} />
                      <Typography variant="body2">Không xác định:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {
                        users.filter((user) => user.userGender === null)
                          .length
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
                  Thống kê điểm thưởng
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Tổng điểm:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {users.reduce(
                        (total, user) => total + (user.userPoint || 0),
                        0
                      )}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2">Điểm trung bình:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {users.length > 0
                        ? Math.round(
                            users.reduce(
                              (total, user) => total + (user.userPoint || 0),
                              0
                            ) / users.length
                          )
                        : 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">Điểm cao nhất:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {users.length > 0
                        ? Math.max(
                            ...users.map((user) => user.userPoint || 0)
                          )
                        : 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User list table card */}
        <Card elevation={3} sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main", // Changed from primary.light for better contrast in dark mode
                borderRadius: "4px 4px 0 0",
              }}
            >
              <Typography variant="h6" color="white">
                Danh sách người dùng ({filteredUsers.length})
              </Typography>
            </Box>
            <Divider />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} 
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
                        <TableCell align="center" width={70}>
                          #
                        </TableCell>
                        <TableCell>Người dùng</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                        <TableCell>Ngày sinh</TableCell>
                        <TableCell align="center">Giới tính</TableCell>
                        <TableCell align="center">Điểm</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="center">Ngày tạo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user, index) => (
                          <TableRow 
                            key={user.userId || index} 
                            hover 
                            onClick={() => handleOpenUserDetail(user)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                            {/* ...existing user row cells... */}
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar
                                  src={user.userAvatar}
                                  alt={`${user.userFirstName} ${user.userLastName}`}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    bgcolor: "primary.main",
                                  }}
                                >
                                  {user.userFirstName?.charAt(0) ||
                                    user.userLastName?.charAt(0) || (
                                      <PersonOutline />
                                    )}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {`${user.userFirstName || ""} ${
                                      user.userLastName || ""
                                    }`}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    ID: {user.userId}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Email
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {user.userEmail || "N/A"}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Phone
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {user.userPhoneNumber || "N/A"}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Cake
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {formatDate(user.userDateOfBirth)}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {user.userGender === 1 ? (
                                <Tooltip title="Nam">
                                  <Male color="primary" />
                                </Tooltip>
                              ) : user.userGender === 2 ? (
                                <Tooltip title="Nữ">
                                  <Female color="secondary" />
                                </Tooltip>
                              ) : (
                                <Tooltip title="Khác">
                                  <Wc color="action" />
                                </Tooltip>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={<Star fontSize="small" />}
                                label={user.userPoint || 0}
                                variant="outlined"
                                color="primary"
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              {getUserStatusChip(user.userStatus)}
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <AccessTime
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                {formatDate(user.userCreateAt)}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Info
                                fontSize="large"
                                color="disabled"
                                sx={{ mb: 1 }}
                              />
                              <Typography variant="body1" color="textSecondary">
                                {searchTerm
                                  ? "Không tìm thấy kết quả nào."
                                  : "Chưa có dữ liệu người dùng."}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Add TablePagination component */}
                {filteredUsers.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số hàng trên trang:"
                    labelDisplayedRows={({ from, to, count }) => 
                      `${from}-${to} của ${count}`}
                    sx={{
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* User Detail Dialog */}
      <HumanResourceForm
        open={openUserDetail}
        handleClose={handleCloseUserDetail}
        user={selectedUser}
        refreshUsers={fetchUsers}
      />

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
