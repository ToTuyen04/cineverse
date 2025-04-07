import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Button, 
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  EventSeat as SeatIcon
} from '@mui/icons-material';
import { getAllRooms } from '../../../api/services/roomService'; // Bạn cần tạo service này

const SeatManagement = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRooms();
      
      if (response.success) {
        setRooms(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách phòng');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Đã xảy ra lỗi khi tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    fetchRooms();
  };

  const handleManageSeats = (roomId) => {
    navigate(`/admin/rooms/${roomId}/seats`);
  };

  // Lọc danh sách phòng theo từ khóa tìm kiếm
  const filteredRooms = rooms.filter(room => {
    const searchLower = searchTerm.toLowerCase();
    return (
      room.roomName?.toLowerCase().includes(searchLower) ||
      room.roomType?.toLowerCase().includes(searchLower) ||
      room.theaterName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box>
      <Card elevation={2}>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1" sx={{ 
              fontWeight: 600, 
              color: '#F9376E',
              display: 'flex',
              alignItems: 'center'
            }}>
              <SeatIcon sx={{ mr: 1 }} />
              Quản lý ghế theo phòng
            </Typography>
            
            <IconButton 
              onClick={handleRefresh} 
              color="primary"
              sx={{ 
                bgcolor: 'rgba(249, 55, 110, 0.1)', 
                '&:hover': { bgcolor: 'rgba(249, 55, 110, 0.2)' } 
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Search bar */}
          <Box mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm theo tên phòng, loại phòng, tên rạp..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Box>

          {/* Error and Loading states */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress color="primary" />
            </Box>
          ) : filteredRooms.length === 0 ? (
            <Alert severity="info">
              Không tìm thấy phòng nào phù hợp với tìm kiếm
            </Alert>
          ) : (
            /* Room Table */
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table sx={{ minWidth: 650 }} size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên phòng</TableCell>
                    <TableCell>Loại phòng</TableCell>
                    <TableCell>Sức chứa</TableCell>
                    <TableCell>Rạp</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.roomId} hover>
                      <TableCell>{room.roomId}</TableCell>
                      <TableCell>{room.roomName}</TableCell>
                      <TableCell>{room.roomScreenTypeName}</TableCell>
                      <TableCell>{room.roomChairAmount || 'N/A'}</TableCell>
                      <TableCell>{room.roomTheaterName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={room.status ? "Hoạt động" : "Ngừng hoạt động"} 
                          color={room.status ? "success" : "error"} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<SeatIcon />}
                          onClick={() => handleManageSeats(room.roomId)}
                          size="small"
                          sx={{
                            bgcolor: '#F9376E',
                            '&:hover': { bgcolor: '#d91b50' }
                          }}
                        >
                          Quản lý ghế
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty Room State */}
          {!loading && !error && rooms.length === 0 && (
            <Box textAlign="center" py={5}>
              <SeatIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Chưa có phòng nào trong hệ thống
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Vui lòng thêm phòng chiếu trước khi quản lý ghế
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/admin/theaters')}
              >
                Quản lý phòng chiếu
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Thêm một section giới thiệu về quản lý ghế */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Quản lý ghế là gì?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý ghế giúp bạn thiết lập và quản lý sơ đồ ghế ngồi cho từng phòng chiếu.
                Bạn có thể tạo, chỉnh sửa, xóa và phân loại ghế (thường, VIP, đôi) một cách dễ dàng.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Cách sử dụng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Tìm phòng chiếu trong danh sách<br />
                2. Nhấp vào nút "Quản lý ghế"<br />
                3. Thêm, sửa hoặc xóa ghế theo nhu cầu<br />
                4. Phân loại ghế thành ghế thường, VIP hoặc ghế đôi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Tại sao cần quản lý ghế?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mỗi phòng chiếu có sơ đồ ghế khác nhau. Việc quản lý ghế chính xác giúp:
                <br />• Hiển thị chính xác cho khách hàng khi đặt vé
                <br />• Tối ưu hóa doanh thu với các loại ghế khác nhau
                <br />• Thống kê đúng số lượng ghế và sức chứa của rạp
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SeatManagement;