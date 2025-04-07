import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

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

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'canceled':
      return 'error';
    case 'processing':
      return 'info';
    default:
      return 'default';
  }
};

const OrderList = ({ orders, onSelectOrder }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  return (
    <Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã đơn</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Khách hàng</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Liên hệ</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tổng tiền</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Giảm giá</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thanh toán</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
              <TableRow key={order.orderId} hover>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>{formatDateTime(order.orderCreateAt)}</TableCell>
                <TableCell>{order.orderName}</TableCell>
                <TableCell>
                  <div>{order.orderEmail}</div>
                  <div>{order.orderPhone}</div>
                </TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>{formatCurrency(order.discountPrice)}</TableCell>
                <TableCell>{formatCurrency(order.paymentPrice)}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(order.orderStatus)} 
                    color={getStatusColor(order.orderStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Xem chi tiết">
                    <IconButton 
                      color="primary" 
                      onClick={() => onSelectOrder(order)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={9} />
              </TableRow>
            )}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
      />
    </Box>
  );
};

export default OrderList;