import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Close,
  Email,
  Phone,
  Cake,
  AccessTime,
  Person,
  Male,
  Female,
  Wc,
  Star,
  ShoppingBag,
  LocalMovies,
  EventSeat,
  Fastfood,
  MonetizationOn,
  BlockOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { getUserPurchaseHistory, updateUserStatus } from "../../../api/services/userService";

// Function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    if (dateString.includes("T") || dateString.includes("Z")) {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi });
    }
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: vi });
  } catch {
    return "Invalid date";
  }
};

// Function to format datetime
const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    if (dateString.includes("T") || dateString.includes("Z")) {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    }
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
  } catch {
    return "Invalid date";
  }
};

// Function to get rank name
const getRankName = (rankId) => {
  switch (rankId) {
    case 1:
      return "Thành viên Mới";
    case 2:
      return "Thành viên Bạc";
    case 3:
      return "Thành viên Vàng";
    case 4:
      return "Thành viên Kim Cương";
    default:
      return "Chưa xác định";
  }
};

const HumanResourceForm = ({ open, handleClose, user, refreshUsers }) => {
  const [tabValue, setTabValue] = useState(0);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open && user && tabValue === 1) {
      fetchOrderHistory();
    }
  }, [open, user, tabValue]);

  const fetchOrderHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const history = await getUserPurchaseHistory(user.userEmail);
      setOrderHistory(history);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      setSnackbar({
        open: true,
        message: `Không thể lấy lịch sử đơn hàng: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateStatus = async () => {
    if (!user) return;
    
    setStatusLoading(true);
    try {
      await updateUserStatus(user);
      setSnackbar({
        open: true,
        message: `Đã ${user.userStatus === 1 ? "khóa" : "mở khóa"} tài khoản thành công`,
        severity: "success",
      });
      if (refreshUsers) {
        refreshUsers();
      }
      handleClose();
    } catch (error) {
      console.error("Failed to update user status:", error);
      setSnackbar({
        open: true,
        message: `Không thể cập nhật trạng thái: ${error.message}`,
        severity: "error",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 10,
            bgcolor: 'background.paper',
            color: 'text.primary'
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.5,
          }}
        >
          <Typography variant="h6">Thông tin người dùng</Typography>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2, position: "relative" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              mb: 3, 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              }
            }}
          >
            <Tab
              icon={<Person />}
              iconPosition="start"
              label="Thông tin cá nhân"
            />
            <Tab
              icon={<ShoppingBag />}
              iconPosition="start"
              label="Lịch sử đặt vé"
            />
          </Tabs>

          {/* Personal Information Tab */}
          {tabValue === 0 && (
            <Box>
              <Grid container spacing={3}>
                {/* Avatar and basic info section */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      pb: 2,
                    }}
                  >
                    <Avatar
                      src={user.userAvatar}
                      alt={`${user.userFirstName} ${user.userLastName}`}
                      sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        bgcolor: "primary.main",
                        fontSize: "3rem",
                      }}
                    >
                      {(user.userFirstName?.charAt(0) || "") +
                        (user.userLastName?.charAt(0) || "")}
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      {`${user.userFirstName || ""} ${user.userLastName || ""}`}
                    </Typography>
                    <Chip
                      icon={<Star />}
                      label={getRankName(user.rankId)}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                    <Chip
                      icon={user.userStatus === 1 ? <CheckCircleOutline /> : <BlockOutlined />}
                      label={user.userStatus === 1 ? "Đang hoạt động" : "Đã khóa"}
                      color={user.userStatus === 1 ? "success" : "error"}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      color={user.userStatus === 1 ? "error" : "success"}
                      onClick={handleUpdateStatus}
                      startIcon={user.userStatus === 1 ? <BlockOutlined /> : <CheckCircleOutline />}
                      disabled={statusLoading}
                      sx={{ width: "100%" }}
                    >
                      {statusLoading ? (
                        <CircularProgress size={24} />
                      ) : user.userStatus === 1 ? (
                        "Khóa tài khoản"
                      ) : (
                        "Mở khóa tài khoản"
                      )}
                    </Button>
                  </Box>
                </Grid>

                {/* Detailed user information */}
                <Grid item xs={12} md={8}>
                  <List>
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="text.primary">ID người dùng</Typography>
                        }
                        secondary={
                          <Typography variant="body2" fontWeight="bold" color="text.secondary">
                            {user.userId || "N/A"}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      <Email color="action" sx={{ mr: 2 }} />
                      <ListItemText
                        primary={
                          <Typography color="text.primary">Email</Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {user.userEmail || "N/A"}
                          </Typography>
                        }
                      />
                    </ListItem>
                    
                    {/* Continue the pattern for other list items */}
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      <Phone color="action" sx={{ mr: 2 }} />
                      <ListItemText
                        primary="Số điện thoại"
                        secondary={<Typography variant="body2">{user.userPhoneNumber || "N/A"}</Typography>}
                      />
                    </ListItem>
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      <Cake color="action" sx={{ mr: 2 }} />
                      <ListItemText
                        primary="Ngày sinh"
                        secondary={<Typography variant="body2">{formatDate(user.userDateOfBirth)}</Typography>}
                      />
                    </ListItem>
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      {user.userGender === 1 ? (
                        <Male color="primary" sx={{ mr: 2 }} />
                      ) : user.userGender === 2 ? (
                        <Female color="secondary" sx={{ mr: 2 }} />
                      ) : (
                        <Wc color="action" sx={{ mr: 2 }} />
                      )}
                      <ListItemText
                        primary="Giới tính"
                        secondary={
                          <Typography variant="body2">
                            {user.userGender === 1
                              ? "Nam"
                              : user.userGender === 2
                              ? "Nữ"
                              : "Khác"}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      <Star color="action" sx={{ mr: 2 }} />
                      <ListItemText
                        primary="Điểm thưởng"
                        secondary={
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {user.userPoint || 0} điểm
                          </Typography>
                        }
                      />
                    </ListItem>
                    <ListItem
                      sx={{ 
                        py: 2, 
                        borderBottom: (theme) => 
                          `1px solid ${theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(0, 0, 0, 0.12)'}` 
                      }}
                    >
                      <AccessTime color="action" sx={{ mr: 2 }} />
                      <ListItemText
                        primary="Ngày tạo tài khoản"
                        secondary={<Typography variant="body2">{formatDateTime(user.userCreateAt)}</Typography>}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Order History Tab */}
          {tabValue === 1 && (
            <Box>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : orderHistory.length > 0 ? (
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
                  <Table>
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: (theme) => 
                          theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : '#f5f5f5'
                      }}>
                        <TableCell>Mã đơn hàng</TableCell>
                        <TableCell>Phim</TableCell>
                        <TableCell>Rạp chiếu</TableCell>
                        <TableCell>Suất chiếu</TableCell>
                        <TableCell>Ghế</TableCell>
                        <TableCell align="right">Tổng tiền</TableCell>
                        <TableCell>Ngày đặt</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orderHistory.map((order) => (
                        <TableRow key={order.orderId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              #{order.orderId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <LocalMovies
                                fontSize="small"
                                color="primary"
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="body2">
                                {order.movieName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {order.theaterName}
                              <Typography variant="caption" display="block" color="textSecondary">
                                {order.roomName}
                              </Typography>
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(order.showtimeStartAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <EventSeat
                                fontSize="small"
                                color="action"
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="body2">
                                {order.bookedChairs?.map(chair => chair.chairName).join(', ') || 'N/A'}
                              </Typography>
                            </Box>
                            {order.bookedCombos && order.bookedCombos.length > 0 && (
                              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <Fastfood
                                  fontSize="small"
                                  color="action"
                                  sx={{ mr: 1 }}
                                />
                                <Typography variant="body2" color="textSecondary">
                                  {order.bookedCombos.map(combo => 
                                    `${combo.comboName} x${combo.quantity}`
                                  ).join(', ')}
                                </Typography>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              color="primary"
                            >
                              {formatCurrency(order.totalPrice)}
                            </Typography>
                            {order.voucherName && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="success.main"
                              >
                                Giảm: {order.voucherDiscount}%
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDateTime(order.orderCreateAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <ShoppingBag sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có lịch sử đặt vé
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Người dùng này chưa thực hiện giao dịch nào
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HumanResourceForm;
