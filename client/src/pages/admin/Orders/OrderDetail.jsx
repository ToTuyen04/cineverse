import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MovieIcon from '@mui/icons-material/Movie';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

// Hàm lấy màu trạng thái
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'warning'; // Vàng - đang chờ thanh toán
    case 'completed':
      return 'success'; // Xanh lá - đã thanh toán thành công
    case 'printed':
      return 'info';    // Xanh dương - đã in vé
    case 'canceled':
      return 'error';   // Đỏ - đã hủy
    case 'failed':
      return 'error';   // Đỏ - thanh toán thất bại
    default:
      return 'default';
  }
};

// Hàm chuyển đổi trạng thái sang text hiển thị tiếng Việt
const getStatusLabel = (status) => {
  switch (status) {
    case 'Pending':
      return 'Chờ thanh toán';
    case 'Completed':
      return 'Đã thanh toán';
    case 'Printed':
      return 'Đã in vé';
    case 'Canceled':
      return 'Đã hủy';
    case 'Failed':
      return 'Thanh toán thất bại';
    default:
      return status;
  }
};

const OrderDetail = ({ order, onClose }) => {
  const theme = useTheme();
  
  if (!order) return null;

  const hasTickets = order.orderDetails && order.orderDetails.length > 0;
  const hasCombos = order.orderComboItems && order.orderComboItems.length > 0;
  const hasShowtimeInfo = order.showtimeInfos && order.showtimeInfos.length > 0;

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1,
        borderBottom: `1px solid ${theme.palette.divider}` 
      }}>
        <Box display="flex" alignItems="center">
          <ReceiptIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h5" component="div">
            Chi tiết đơn hàng #{order.orderId}
          </Typography>
          <Chip 
            label={getStatusLabel(order.orderStatus)} 
            color={getStatusColor(order.orderStatus)}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Thông tin khách hàng */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader 
                avatar={<AccountCircleIcon color="primary" />}
                title="Thông tin khách hàng"
                sx={{ 
                  backgroundColor: theme.palette.background.default,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>ID người dùng:</strong> {order.userId || 'Khách vãng lai'}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {order.orderEmail}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Họ tên:</strong> {order.orderName}</Typography>
                    <Typography variant="body1"><strong>Số điện thoại:</strong> {order.orderPhone}</Typography>
                    
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin đơn hàng */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardHeader 
                avatar={<ReceiptIcon color="primary" />}
                title="Thông tin đơn hàng" 
                sx={{ 
                  backgroundColor: theme.palette.background.default,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1"><strong>Ngày tạo:</strong> {formatDateTime(order.orderCreateAt)}</Typography>
                    <Typography variant="body1"><strong>Trạng thái:</strong> {getStatusLabel(order.orderStatus)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.background.default, 
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`
                    }}>

                      <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <span>Tổng tiền:</span> 
                        <span>{formatCurrency(order.totalPrice)}</span>
                      </Typography>
                      
                      <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <span>Giảm giá:</span> 
                        <span>- {formatCurrency(order.discountPrice)}</span>
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Thanh toán:</span> 
                        <span>{formatCurrency(order.paymentPrice)}</span>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin suất chiếu */}
          {hasShowtimeInfo && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader 
                  avatar={<MovieIcon color="primary" />}
                  title="Thông tin suất chiếu" 
                  sx={{ 
                    backgroundColor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                          <TableCell><strong>Phim</strong></TableCell>
                          <TableCell><strong>Rạp</strong></TableCell>
                          <TableCell><strong>Phòng</strong></TableCell>
                          <TableCell><strong>Thời gian</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.showtimeInfos.map((info, index) => (
                          <TableRow key={index}>
                            <TableCell>{info.movieName}</TableCell>
                            <TableCell>{info.theaterName}</TableCell>
                            <TableCell>{info.roomName}</TableCell>
                            <TableCell>{formatDateTime(info.startTime)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Thông tin vé */}
          {hasTickets && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader 
                  avatar={<ConfirmationNumberIcon color="primary" />}
                  title="Thông tin vé" 
                  sx={{ 
                    backgroundColor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                          <TableCell><strong>Mã vé</strong></TableCell>
                          <TableCell><strong>Ghế</strong></TableCell>
                          <TableCell><strong>Loại ghế</strong></TableCell>
                          <TableCell><strong>Vị trí</strong></TableCell>
                          <TableCell align="right"><strong>Giá</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.orderDetails.map((detail) => (
                          <TableRow key={detail.orderDetailId}>
                            <TableCell>{detail.ticketCode}</TableCell>
                            <TableCell>{detail.chairName}</TableCell>
                            <TableCell>{detail.chairType}</TableCell>
                            <TableCell>{detail.chairPosition}</TableCell>
                            <TableCell align="right">{formatCurrency(detail.price)}</TableCell>
                          </TableRow>
                        ))}
                        {/* Thêm dòng tính tổng tiền vé */}
                        <TableRow>
                          <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                            Tổng tiền:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(order.orderDetails.reduce((sum, item) => sum + item.price, 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
)}

          {/* Thông tin thức ăn & combo */}
          {hasCombos && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader 
                  avatar={<FastfoodIcon color="primary" />}
                  title="Thức ăn & Combo" 
                  sx={{ 
                    backgroundColor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.background.default }}>
                          <TableCell><strong>Tên</strong></TableCell>
                          <TableCell align="center"><strong>Số lượng</strong></TableCell>
                          <TableCell align="right"><strong>Đơn giá</strong></TableCell>
                          <TableCell align="right"><strong>Thành tiền</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.orderComboItems.map((combo, index) => (
                          <TableRow key={index}>
                            <TableCell>{combo.comboName}</TableCell>
                            <TableCell align="center">{combo.comboQuantity}</TableCell>
                            <TableCell align="right">{formatCurrency(combo.comboPrice)}</TableCell>
                            <TableCell align="right">{formatCurrency(combo.comboPrice * combo.comboQuantity)}</TableCell>
                          </TableRow>
                        ))}
                        {/* Thêm dòng tính tổng tiền combo */}
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                            Tổng tiền:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(order.orderComboItems.reduce((sum, item) => sum + (item.comboPrice * item.comboQuantity), 0))}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, justifyContent: 'flex-end', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetail;