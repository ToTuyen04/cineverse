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

const StaffForm = ({ staff, onSave, theaters, roles }) => {
  const [formData, setFormData] = useState({
    staffEmail: "",
    staffPassword: "",
    staffFirstName: "",
    staffLastName: "",
    staffPhoneNumber: "",
    staffDateOfBirth: "",
    staffGender: 1,
    staffRoleId: 1,
    staffStatus: 1,
    staffTheaterId: 1,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (staff) {
      setFormData({
        staffEmail: staff.staffEmail || "",
        staffPassword: staff.staffPassword || "",
        staffFirstName: staff.staffFirstName || "",
        staffLastName: staff.staffLastName || "",
        staffPhoneNumber: staff.staffPhoneNumber || "",
        staffDateOfBirth: staff.staffDateOfBirth || "",
        staffGender: staff.staffGender || 1,
        staffRoleId: staff.staffRoleId || 1,
        staffStatus: staff.staffStatus || 1,
        staffTheaterId: staff.staffTheaterId || 1,
      });
    }
  }, [staff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    if (!formData.staffEmail) {
      newErrors.staffEmail = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.staffEmail)) {
      newErrors.staffEmail = "Email không hợp lệ";
    }

    // Password validation (only required for new staff)
    if (!staff && !formData.staffPassword) {
      newErrors.staffPassword = "Mật khẩu không được để trống";
    } else if (!staff && formData.staffPassword.length < 6) {
      newErrors.staffPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // First name validation
    if (!formData.staffFirstName) {
      newErrors.staffFirstName = "Tên đệm không được để trống";
    }

    // Last name validation
    if (!formData.staffLastName) {
      newErrors.staffLastName = "Tên không được để trống";
    }

    // Phone validation
    if (!formData.staffPhoneNumber) {
      newErrors.staffPhoneNumber = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.staffPhoneNumber)) {
      newErrors.staffPhoneNumber = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Thông tin cơ bản
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Email"
            name="staffEmail"
            value={formData.staffEmail}
            onChange={handleInputChange}
            error={!!errors.staffEmail}
            helperText={errors.staffEmail}
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
            name="staffPassword"
            label={
              staff ? "Mật khẩu (để trống nếu không thay đổi)" : "Mật khẩu"
            }
            type={showPassword ? "text" : "password"}
            value={formData.staffPassword}
            onChange={handleInputChange}
            error={!!errors.staffPassword}
            helperText={errors.staffPassword}
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
            name="staffFirstName"
            value={formData.staffFirstName}
            onChange={handleInputChange}
            error={!!errors.staffFirstName}
            helperText={errors.staffFirstName}
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
            name="staffLastName"
            value={formData.staffLastName}
            onChange={handleInputChange}
            error={!!errors.staffLastName}
            helperText={errors.staffLastName}
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
            name="staffPhoneNumber"
            value={formData.staffPhoneNumber}
            onChange={handleInputChange}
            error={!!errors.staffPhoneNumber}
            helperText={errors.staffPhoneNumber}
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
            name="staffDateOfBirth"
            type="date"
            value={formData.staffDateOfBirth}
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
              name="staffGender"
              value={formData.staffGender}
              onChange={handleInputChange}
            >
              <FormControlLabel value={1} control={<Radio />} label="Nam" />
              <FormControlLabel value={2} control={<Radio />} label="Nữ" />
              <FormControlLabel value={3} control={<Radio />} label="Khác" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Trạng thái</FormLabel>
            <RadioGroup
              row
              name="staffStatus"
              value={formData.staffStatus}
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
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Vai trò"
            name="staffRoleId"
            value={formData.staffRoleId}
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
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Chi nhánh"
            name="staffTheaterId"
            value={formData.staffTheaterId}
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
        </Grid>
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
