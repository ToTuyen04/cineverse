import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Button,
  InputAdornment,
  Typography,
  Divider,
  IconButton,
  Alert, // Import Alert component for message display
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Person,
  BusinessCenter,
  LocationOn,
  CalendarToday,
} from "@mui/icons-material";

const StaffForm = ({ staff, onSave, theaters, roles, apiError, apiSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: 1,
    roleId: 2, // Changed default from 1 to 2 (Staff instead of Admin)
    status: 1,
    theaterId: 1,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (staff) {
      setFormData({
        email: staff.email || "",
        password: "", // Don't set password for existing staff
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        phoneNumber: staff.phoneNumber || "",
        dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : "",
        // Ensure gender is a number - Parse to int or provide default
        gender: parseInt(staff.gender) || 1,
        roleId: staff.roleId || 2, // Changed from 1 to 2 to default to Staff if roleId is missing
        status: staff.status === undefined ? 1 : staff.status,
        theaterId: staff.theaterId || 1,
      });
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Make sure gender is properly converted to a number
    const convertedValue = name === 'gender' || name === 'status' || name === 'roleId' || name === 'theaterId' 
      ? parseInt(value) 
      : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Password validation (only required for new staff)
    if (!staff && !formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!staff && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = "Tên đệm không được để trống";
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = "Tên không được để trống";
    }

    // Phone validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Chỉ gửi password khi tạo mới nhân viên (không có staff) hoặc password đã được nhập
      const dataToSubmit = { ...formData };
      
      if (staff && !dataToSubmit.password) {
        // Nếu đang edit và không nhập password mới, xóa trường password
        delete dataToSubmit.password;
      }
      
      onSave(dataToSubmit);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {/* Display API success message if present */}
      {apiSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {apiSuccess}
        </Alert>
      )}
      
      {/* Display API error if present */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}
      
      <Typography variant="h6" gutterBottom>
        Thông tin cơ bản
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={staff !== null} // Không cho phép thay đổi email nếu là edit
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required={!staff}
            fullWidth
            name="password"
            label={
              staff ? "Mật khẩu (để trống nếu không thay đổi)" : "Mật khẩu"
            }
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Tên đệm"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Tên"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Số điện thoại"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ngày sinh"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarToday />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Thông tin công việc
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Giới tính</FormLabel>
            <RadioGroup
              row
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <FormControlLabel value={1} control={<Radio />} label="Nam" />
              <FormControlLabel value={2} control={<Radio />} label="Nữ" />
              <FormControlLabel value={0} control={<Radio />} label="Khác" />
            </RadioGroup>
          </FormControl>
        </Grid>
        {staff && (
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Trạng thái</FormLabel>
              <RadioGroup
                row
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Hoạt động"
                />
                <FormControlLabel
                  value={0}
                  control={<Radio />}
                  label="Không hoạt động"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Vai trò"
            name="roleId"
            value={formData.roleId}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessCenter />
                </InputAdornment>
              ),
            }}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {/* <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Chi nhánh"
            name="theaterId"
            value={formData.theaterId}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          >
            {theaters.map((theater) => (
              <MenuItem key={theater.id} value={theater.id}>
                {theater.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid> */}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ minWidth: 120 }}
        >
          {staff ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Box>
    </Box>
  );
};

export default StaffForm;
