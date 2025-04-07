import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  InputAdornment,
  Typography,
  Box,
  useTheme,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const VoucherForm = ({ open, handleClose, voucher, onSubmit, isEdit }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    voucherName: '',
    voucherCode: '',
    voucherDescription: '',
    voucherStartAt: dayjs(),
    voucherEndAt: dayjs().add(7, 'day'),
    voucherDiscount: 0,
    voucherMaxValue: 0,
    voucherAvailable: true
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (open && voucher) {
      setFormData({
        voucherName: voucher.voucherName || '',
        voucherCode: voucher.voucherCode || '',
        voucherDescription: voucher.voucherDescription || '',
        voucherStartAt: voucher.voucherStartAt ? dayjs(voucher.voucherStartAt) : dayjs(),
        voucherEndAt: voucher.voucherEndAt ? dayjs(voucher.voucherEndAt) : dayjs().add(7, 'day'),
        voucherDiscount: voucher.voucherDiscount || 0,
        voucherMaxValue: voucher.voucherMaxValue || 0,
        voucherAvailable: voucher.voucherAvailable !== undefined ? voucher.voucherAvailable : true
      });
      setFormErrors({});
    } else if (open) {
      // Reset form for new voucher
      setFormData({
        voucherName: '',
        voucherCode: '',
        voucherDescription: '',
        voucherStartAt: dayjs(),
        voucherEndAt: dayjs().add(7, 'day'),
        voucherDiscount: 0,
        voucherMaxValue: 0,
        voucherAvailable: true
      });
      setFormErrors({});
    }
  }, [open, voucher]);

  const validateForm = () => {
    const errors = {};
    if (!formData.voucherName) errors.voucherName = 'Voucher name is required';
    if (!formData.voucherCode) errors.voucherCode = 'Voucher code is required';
    if (formData.voucherDiscount < 0 || formData.voucherDiscount > 100) 
      errors.voucherDiscount = 'Discount must be between 0 and 100';
    if (formData.voucherMaxValue < 0) 
      errors.voucherMaxValue = 'Max value cannot be negative';
    
    // Check if end date is after start date using dayjs comparison
    if (formData.voucherEndAt.isBefore(formData.voucherStartAt)) 
      errors.voucherEndAt = 'End date must be after start date';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Convert dayjs objects to ISO strings for API submission
      const submissionData = {
        ...formData,
        voucherStartAt: formData.voucherStartAt.toISOString(),
        voucherEndAt: formData.voucherEndAt.toISOString()
      };
      
      await onSubmit(submissionData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[5],
          borderRadius: 1
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`, 
        px: 3, 
        py: 2,
        fontWeight: 600
      }}>
        {isEdit ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              name="voucherName"
              label="Tên voucher"
              fullWidth
              variant="outlined"
              value={formData.voucherName}
              onChange={handleChange}
              error={!!formErrors.voucherName}
              helperText={formErrors.voucherName}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              name="voucherCode"
              label="Mã voucher"
              fullWidth
              variant="outlined"
              value={formData.voucherCode}
              onChange={handleChange}
              error={!!formErrors.voucherCode}
              helperText={formErrors.voucherCode}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              margin="normal"
              name="voucherDescription"
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.voucherDescription}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Ngày bắt đầu"
                value={formData.voucherStartAt}
                onChange={(date) => handleDateChange('voucherStartAt', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    margin: 'normal',
                    error: !!formErrors.voucherStartAt,
                    helperText: formErrors.voucherStartAt
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Ngày kết thúc"
                value={formData.voucherEndAt}
                onChange={(date) => handleDateChange('voucherEndAt', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    margin: 'normal',
                    error: !!formErrors.voucherEndAt,
                    helperText: formErrors.voucherEndAt
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              name="voucherDiscount"
              label="Phần trăm giảm giá"
              type="number"
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              value={formData.voucherDiscount}
              onChange={handleChange}
              error={!!formErrors.voucherDiscount}
              helperText={formErrors.voucherDiscount}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              name="voucherMaxValue"
              label="Giá trị giảm tối đa"
              type="number"
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="end">VND</InputAdornment>,
              }}
              value={formData.voucherMaxValue}
              onChange={handleChange}
              error={!!formErrors.voucherMaxValue}
              helperText={formErrors.voucherMaxValue}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              pt: 2, 
              borderTop: `1px solid ${theme.palette.divider}`
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.voucherAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, voucherAvailable: e.target.checked }))}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1">
                    Trạng thái: <strong>{formData.voucherAvailable ? 'Có hiệu lực' : 'Không hiệu lực'}</strong>
                  </Typography>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={handleClose} 
          color="inherit" 
          variant="outlined"
          disabled={loading}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VoucherForm;