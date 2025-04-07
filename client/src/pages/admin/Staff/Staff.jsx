import React, { useState } from "react";
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

// Fake data based on the provided SQL results
const fakeStaffs = [
  {
    staffId: 1,
    staffEmail: "admin1@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Nguyễn",
    staffLastName: "Văn A",
    staffSearchName: "nguyen van a admin1 0901234561",
    staffPhoneNumber: "0901234561",
    staffDateOfBirth: "1990-01-01",
    staffCreateAt: "2023-01-15 09:30:00.000",
    staffGender: 1,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 1,
  },
  {
    staffId: 2,
    staffEmail: "admin2@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Trần",
    staffLastName: "Thị B",
    staffSearchName: "tran thi b admin2 0901234562",
    staffPhoneNumber: "0901234562",
    staffDateOfBirth: "1991-02-02",
    staffCreateAt: "2023-03-22 14:15:00.000",
    staffGender: 2,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 1,
  },
  {
    staffId: 3,
    staffEmail: "admin3@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Lê",
    staffLastName: "Văn C",
    staffSearchName: "le van c admin3 0901234563",
    staffPhoneNumber: "0901234563",
    staffDateOfBirth: "1992-03-03",
    staffCreateAt: "2023-05-10 11:45:00.000",
    staffGender: 1,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 3,
  },
  {
    staffId: 4,
    staffEmail: "admin4@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Phạm",
    staffLastName: "Thị D",
    staffPhoneNumber: "0901234564",
    staffDateOfBirth: "1993-04-04",
    staffCreateAt: "2023-07-18 16:20:00.000",
    staffGender: 2,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 4,
  },
  {
    staffId: 5,
    staffEmail: "admin5@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Hoàng",
    staffLastName: "Văn E",
    staffPhoneNumber: "0901234565",
    staffDateOfBirth: "1994-05-05",
    staffCreateAt: "2023-09-05 10:10:00.000",
    staffGender: 1,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 1,
  },
  {
    staffId: 6,
    staffEmail: "admin6@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Đỗ",
    staffLastName: "Thị F",
    staffPhoneNumber: "0901234566",
    staffDateOfBirth: "1995-06-06",
    staffCreateAt: "2023-11-12 13:40:00.000",
    staffGender: 2,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 1,
  },
  {
    staffId: 7,
    staffEmail: "admin7@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Vũ",
    staffLastName: "Văn G",
    staffPhoneNumber: "0901234567",
    staffDateOfBirth: "1996-07-07",
    staffCreateAt: "2024-01-08 15:25:00.000",
    staffGender: 1,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 2,
  },
  {
    staffId: 8,
    staffEmail: "admin8@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Ngô",
    staffLastName: "Thị H",
    staffPhoneNumber: "0901234568",
    staffDateOfBirth: "1997-08-08",
    staffCreateAt: "2024-02-14 09:50:00.000",
    staffGender: 2,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 3,
  },
  {
    staffId: 9,
    staffEmail: "admin9@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Bùi",
    staffLastName: "Văn I",
    staffPhoneNumber: "0901234569",
    staffDateOfBirth: "1998-09-09",
    staffCreateAt: "2024-03-01 11:30:00.000",
    staffGender: 1,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 4,
  },
  {
    staffId: 10,
    staffEmail: "admin10@cinema.com",
    staffPassword: "123456",
    staffAvatar: null,
    staffFirstName: "Mai",
    staffLastName: "Thị K",
    staffPhoneNumber: "0901234570",
    staffDateOfBirth: "1999-10-10",
    staffCreateAt: "2024-03-20 14:45:00.000",
    staffGender: 2,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 5,
  },
];

// Fake theaters data
const theaters = [
  { id: 1, name: "Cinema Đà Nẵng" },
  { id: 2, name: "Cinema Hà Nội" },
  { id: 3, name: "Cinema TP. Hồ Chí Minh" },
  { id: 4, name: "Cinema Huế" },
  { id: 5, name: "Cinema Nha Trang" },
];

// Fake roles data
const roles = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Manager" },
  { id: 3, name: "Staff" },
];

export default function Staff() {
  const [staffs, setStaffs] = useState(fakeStaffs);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

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

  // Filter staffs based on search term
  const filteredStaffs = staffs.filter((staff) => {
    const searchValue = searchTerm.toLowerCase();
    return (
      (staff.staffFirstName &&
        staff.staffFirstName.toLowerCase().includes(searchValue)) ||
      (staff.staffLastName &&
        staff.staffLastName.toLowerCase().includes(searchValue)) ||
      (staff.staffEmail &&
        staff.staffEmail.toLowerCase().includes(searchValue)) ||
      (staff.staffPhoneNumber && staff.staffPhoneNumber.includes(searchValue))
    );
  });

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

  // Get role name
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : "Không xác định";
  };

  // Get theater name
  const getTheaterName = (theaterId) => {
    const theater = theaters.find((t) => t.id === theaterId);
    return theater ? theater.name : "Không xác định";
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

  // Handle form close
  const handleFormClose = () => {
    setOpenForm(false);
    setCurrentStaff(null);
  };

  // Handle save staff
  const handleSaveStaff = (staffData) => {
    if (currentStaff) {
      // Update existing staff
      setStaffs((prevStaffs) =>
        prevStaffs.map((staff) =>
          staff.staffId === currentStaff.staffId
            ? { ...staff, ...staffData }
            : staff
        )
      );
    } else {
      // Add new staff
      const newStaff = {
        staffId: Math.max(...staffs.map((s) => s.staffId)) + 1,
        staffCreateAt: new Date().toISOString(),
        staffStatus: 1,
        ...staffData,
      };
      setStaffs((prevStaffs) => [...prevStaffs, newStaff]);
    }
    setOpenForm(false);
  };

  // Handle delete staff
  const handleDeleteClick = (staff) => {
    setStaffToDelete(staff);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (staffToDelete) {
      setStaffs((prevStaffs) =>
        prevStaffs.filter((staff) => staff.staffId !== staffToDelete.staffId)
      );
      setOpenDeleteDialog(false);
      setStaffToDelete(null);
    }
  };

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
              placeholder="Tìm kiếm nhân viên..."
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
              <IconButton onClick={() => setSearchTerm("")} color="primary">
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
                      {staffs.filter((staff) => staff.staffStatus === 1).length}
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
                      {staffs.filter((staff) => staff.staffStatus === 0).length}
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
                      {staffs.filter((staff) => staff.staffGender === 1).length}
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
                      {staffs.filter((staff) => staff.staffGender === 2).length}
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
                            staff.staffGender !== 1 &&
                            staff.staffGender !== 2 &&
                            staff.staffGender !== null
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
                  Phân bố theo chi nhánh
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {theaters.map((theater) => (
                    <Box
                      key={theater.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: theater.id !== theaters.length ? 2 : 0,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <TheaterComedy color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">{theater.name}:</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {
                          staffs.filter(
                            (staff) => staff.staffTheaterId === theater.id
                          ).length
                        }
                      </Typography>
                    </Box>
                  ))}
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
                bgcolor: "primary.main", // Changed from primary.light for better contrast in dark mode
                borderRadius: "4px 4px 0 0",
              }}
            >
              <Typography variant="h6" color="white">
                Danh sách nhân viên ({filteredStaffs.length})
              </Typography>
            </Box>

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
                    <TableCell align="center" width={50}>
                      ID
                    </TableCell>
                    <TableCell>Nhân viên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell align="center">Vai trò</TableCell>
                    <TableCell align="center">Chi nhánh</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaffs.length > 0 ? (
                    filteredStaffs.map((staff) => (
                      <TableRow key={staff.staffId} hover>
                        <TableCell align="center">{staff.staffId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={staff.staffAvatar}
                              alt={`${staff.staffFirstName} ${staff.staffLastName}`}
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                bgcolor: "primary.main",
                              }}
                            >
                              {staff.staffFirstName?.charAt(0) ||
                                staff.staffLastName?.charAt(0) || (
                                  <PersonOutline />
                                )}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {`${staff.staffFirstName || ""} ${
                                  staff.staffLastName || ""
                                }`}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {staff.staffGender === 1 ? (
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
                                ) : staff.staffGender === 2 ? (
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
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Email
                              fontSize="small"
                              color="action"
                              sx={{ mr: 1 }}
                            />
                            {staff.staffEmail || "N/A"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Phone
                              fontSize="small"
                              color="action"
                              sx={{ mr: 1 }}
                            />
                            {staff.staffPhoneNumber || "N/A"}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Cake
                              fontSize="small"
                              color="action"
                              sx={{ mr: 1 }}
                            />
                            {formatDate(staff.staffDateOfBirth)}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<WorkOutline fontSize="small" />}
                            label={getRoleName(staff.staffRoleId)}
                            variant="outlined"
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<TheaterComedy fontSize="small" />}
                            label={getTheaterName(staff.staffTheaterId)}
                            variant="outlined"
                            color="info"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(staff.staffStatus)}
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <Tooltip title="Xem chi tiết">
                              <IconButton size="small" color="info">
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
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose} color="inherit">
            Hủy
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
            Bạn có chắc chắn muốn xóa nhân viên "{staffToDelete?.staffFirstName}{" "}
            {staffToDelete?.staffLastName}" không?
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
