import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Grid, 
  CircularProgress,
  Card,
  Chip,
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getStaffByEmail, updateStaffProfile } from '../../../api/services/staffService';
import { useAuth } from '../../../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import EditIcon from '@mui/icons-material/Edit';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  margin: '0 auto',
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3]
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  overflow: 'visible',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main
  }
}));

const StyledChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 1 ? theme.palette.success.light : theme.palette.error.light,
  color: status === 1 ? theme.palette.success.contrastText : theme.palette.error.contrastText,
  fontWeight: 'bold'
}));

const EditButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
}));

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Format date cho input type="date" (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getGenderString = (gender) => {
  switch (gender) {
    case 0:
      return 'Không xác định';
    case 1:
      return 'Nam';
    case 2:
      return 'Nữ';
    default:
      return 'Không xác định';
  }
};

const getStatusLabel = (status) => {
  return status === 1 ? 'Hoạt động' : 'Không hoạt động';
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getStaffByEmail(user.email);
        console.log("Thông tin profile nhận được:", response);
        
        // Check if response has data - API returns the staff object directly now
        if (response) {
          setProfile(response);
          
          // Khởi tạo dữ liệu cho form chỉnh sửa
          setEditedProfile({
            email: response.email,
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            phoneNumber: response.phoneNumber || '',
            avatar: response.avatar || '',
            dateOfBirth: response.dateOfBirth || null,
            gender: response.gender || 0,
            status: response.status || 1
          });
        } else {
          setError('Không thể lấy thông tin nhân viên');
        }
      } catch (err) {
        setError(err.message || 'Đã xảy ra lỗi khi lấy dữ liệu');
        console.error('Lỗi khi lấy thông tin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.email) {
      fetchProfile();
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset lại dữ liệu form từ dữ liệu profile hiện tại
    const nameParts = profile.fullName.split(' ');
    const lastName = nameParts.pop() || '';
    const firstName = nameParts.join(' ') || '';
    
    setEditedProfile({
      email: profile.email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: profile.phoneNumber || '',
      avatar: profile.avatar || '',
      dateOfBirth: profile.dateOfBirth || null,
      gender: profile.gender || 0,
      status: profile.status || 1
    });
    
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true);
      
      // Không cần staffId vì API chỉ cần email và thông tin cập nhật
      const profileData = {
        email: editedProfile.email,
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        phoneNumber: editedProfile.phoneNumber,
        avatar: editedProfile.avatar || "",
        dateOfBirth: editedProfile.dateOfBirth,
        gender: parseInt(editedProfile.gender),
        status: profile.status // Giữ nguyên status hiện tại
      };
      
      console.log("Dữ liệu trước khi gửi đi:", profileData);
      
      // Gọi API để cập nhật thông tin
      const response = await updateStaffProfile(profileData);
      
      if (response.isSuccessful) {
        // Cập nhật state profile với dữ liệu mới
        setProfile(response.staff);
        setIsEditing(false);
        
        // Hiển thị thông báo thành công
        setSnackbarMessage('Cập nhật thông tin thành công!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      } else {
        // Hiển thị thông báo lỗi
        setSnackbarMessage(response.message || 'Không thể cập nhật thông tin');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err);
      setSnackbarMessage(err.message || 'Đã xảy ra lỗi khi cập nhật');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Chuyển đổi giá trị thành số nguyên cho trường gender
    if (name === 'gender') {
      setEditedProfile(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      dateOfBirth: value || null
    }));
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" align="center">
          Không có thông tin nhân viên.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Thông tin cá nhân
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ProfileCard>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <ProfileAvatar 
                src={profile.avatar} 
                alt={profile.fullName}
              >
                {!profile.avatar && profile.fullName?.charAt(0)}
              </ProfileAvatar>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                {profile.fullName}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {profile.email}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <StyledChip 
                  label={getStatusLabel(profile.status)} 
                  status={profile.status}
                />
              </Box>
            </Box>
          </ProfileCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <ProfileCard>
            {!isEditing ? (
              <EditButton 
                startIcon={<EditIcon />}
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleEditClick}
              >
                Chỉnh sửa
              </EditButton>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleCancelEdit}
                  sx={{ mr: 1 }}
                >
                  Hủy
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            )}

            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Thông tin cá nhân
            </Typography>
            
            {isEditing ? (
              // Form chỉnh sửa thông tin
              <Box component="form" noValidate>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ"
                      name="firstName"
                      value={editedProfile.firstName}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tên"
                      name="lastName"
                      value={editedProfile.lastName}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={editedProfile.email}
                      disabled
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phoneNumber"
                      value={editedProfile.phoneNumber}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="URL Ảnh đại diện"
                      name="avatar"
                      value={editedProfile.avatar}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ngày sinh"
                      name="dateOfBirth"
                      type="date"
                      value={formatDateForInput(editedProfile.dateOfBirth)}
                      onChange={handleDateChange}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Giới tính"
                      name="gender"
                      value={editedProfile.gender}
                      onChange={handleInputChange}
                      margin="normal"
                    >
                      <MenuItem value={0}>Không xác định</MenuItem>
                      <MenuItem value={1}>Nam</MenuItem>
                      <MenuItem value={2}>Nữ</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              // Hiển thị thông tin
              <>
                <InfoRow>
                  <PersonIcon />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Họ và tên</Typography>
                    <Typography variant="body1">{profile.fullName}</Typography>
                  </Box>
                </InfoRow>

                <InfoRow>
                  <EmailIcon />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{profile.email}</Typography>
                  </Box>
                </InfoRow>

                <InfoRow>
                  <PhoneIcon />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Số điện thoại</Typography>
                    <Typography variant="body1">{profile.phoneNumber || 'Chưa cập nhật'}</Typography>
                  </Box>
                </InfoRow>

                <InfoRow>
                  <CakeIcon />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Ngày sinh</Typography>
                    <Typography variant="body1">{formatDate(profile.dateOfBirth)}</Typography>
                  </Box>
                </InfoRow>

                <InfoRow>
                  <WcIcon />
                  <Box>
                    <Typography variant="body2" color="textSecondary">Giới tính</Typography>
                    <Typography variant="body1">{getGenderString(profile.gender)}</Typography>
                  </Box>
                </InfoRow>
              </>
            )}
          </ProfileCard>
        </Grid>
      </Grid>

      {/* Snackbar thông báo */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
