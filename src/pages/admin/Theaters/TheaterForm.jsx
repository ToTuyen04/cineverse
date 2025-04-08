import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  useTheme,
  Box
} from '@mui/material';

const TheaterForm = ({ open, handleClose, theater, onSubmit, isEdit = false, isView = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    theaterId: '',
    theaterName: '',
    theaterLocation: '',
    theaterHotline: '',
    theaterSearchName: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // If editing mode and theater data is provided, initialize form
  useEffect(() => {
    if ((isEdit || isView) && theater) {
      setFormData({
        theaterId: theater.theaterId || '',
        theaterName: theater.theaterName || '',
        theaterLocation: theater.theaterLocation || '',
        theaterHotline: theater.theaterHotline || '',
        theaterSearchName: theater.theaterSearchName || theater.theaterName || ''
      });
    } else {
      // Reset form for create mode
      setFormData({
        theaterId: '',
        theaterName: '',
        theaterLocation: '',
        theaterHotline: '',
        theaterSearchName: ''
      });
    }
    // Reset errors when dialog opens/closes
    setErrors({});
  }, [isEdit, isView, theater, open]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Auto-update theaterSearchName when theaterName changes
    if (name === 'theaterName') {
      setFormData(prev => ({
        ...prev,
        theaterSearchName: value
      }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.theaterName) newErrors.theaterName = 'Tên rạp là bắt buộc';
    if (!formData.theaterLocation) newErrors.theaterLocation = 'Địa điểm là bắt buộc';
    if (!formData.theaterHotline) newErrors.theaterHotline = 'Hotline là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Remove theaterId when submitting if not in edit mode
      const submitData = isEdit ? formData : {
        theaterName: formData.theaterName,
        theaterLocation: formData.theaterLocation,
        theaterHotline: formData.theaterHotline,
        theaterSearchName: formData.theaterSearchName
      };
      
      onSubmit(submitData);
    }
  };
  
  // Tạo title và nội dung cho mode xem
  let titleText = isView ? 'Chi tiết rạp' : (isEdit ? 'Chỉnh sửa rạp' : 'Thêm rạp mới');
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        pt: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" fontWeight={600}>
          {titleText}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Info Section */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Thông tin rạp
            </Typography>
          </Grid>
          
          {/* Theater ID field - only shown in edit/view mode */}
          {(isEdit || isView) && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã rạp"
                value={formData.theaterId}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
            </Grid>
          )}
          
          {/* Display fields as read-only in view mode */}
          {isView ? (
            <>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tên rạp
                  </Typography>
                  <Typography variant="body1">
                    {formData.theaterName || 'Không có dữ liệu'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Địa điểm
                  </Typography>
                  <Typography variant="body1">
                    {formData.theaterLocation || 'Không có dữ liệu'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Hotline
                  </Typography>
                  <Typography variant="body1">
                    {formData.theaterHotline || 'Không có dữ liệu'}
                  </Typography>
                </Box>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên rạp"
                  name="theaterName"
                  value={formData.theaterName}
                  onChange={handleInputChange}
                  error={!!errors.theaterName}
                  helperText={errors.theaterName}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  name="theaterLocation"
                  value={formData.theaterLocation}
                  onChange={handleInputChange}
                  error={!!errors.theaterLocation}
                  helperText={errors.theaterLocation}
                  variant="outlined"
                  placeholder="123 Đường ABC, Thành phố, Quốc gia"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hotline"
                  name="theaterHotline"
                  value={formData.theaterHotline}
                  onChange={handleInputChange}
                  error={!!errors.theaterHotline}
                  helperText={errors.theaterHotline}
                  variant="outlined"
                  placeholder="1900 6017"
                />
              </Grid>
            </>
          )}
          
          {/* Hidden field for search name */}
          <Grid item xs={12} style={{ display: 'none' }}>
            <TextField
              fullWidth
              label="Tên tìm kiếm"
              name="theaterSearchName"
              value={formData.theaterSearchName}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: 1 }}
        >
          {isView ? 'Đóng' : 'Hủy'}
        </Button>
        
        {/* Hiển thị nút submit chỉ khi không phải chế độ xem */}
        {!isView && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1, px: 3 }}
          >
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TheaterForm;
