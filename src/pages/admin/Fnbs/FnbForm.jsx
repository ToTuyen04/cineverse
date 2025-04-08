import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
  Grid,
  Box,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert
} from '@mui/material';

const FnbForm = ({ open, handleClose, fnb, onSubmit, isEdit = false, isViewOnly = false }) => {
  const theme = useTheme();
  
  // Form state
  const [formData, setFormData] = useState({
    fnbId: '',
    fnbName: '',
    fnbType: 0,
    fnbListPrice: 0,
    fnbAvailable: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form function
  const resetForm = () => {
    setFormData({
      fnbId: '',
      fnbName: '',
      fnbType: 0,
      fnbListPrice: 0,
      fnbAvailable: true
    });
    setErrors({});
  };

  // Initialize form with fnb data or reset for new fnb
  useEffect(() => {
    if ((isEdit || isViewOnly) && fnb) {
      // Parse fnbType to a number regardless of whether it's a string or number
      const fnbTypeAsNumber = fnb.fnbType !== undefined ? Number(fnb.fnbType) : 0;
      
      // Better handling of availability status - convert to boolean properly
      let isAvailable = false;
      if (typeof fnb.fnbAvailable === 'boolean') {
        isAvailable = fnb.fnbAvailable;
      } else if (typeof fnb.fnbAvailable === 'string') {
        isAvailable = fnb.fnbAvailable.toLowerCase() === 'true' || fnb.fnbAvailable === '1';
      } else if (typeof fnb.fnbAvailable === 'number') {
        isAvailable = fnb.fnbAvailable === 1;
      }
      
      setFormData({
        fnbId: fnb.fnbId || '',
        fnbName: fnb.fnbName || '',
        fnbType: fnbTypeAsNumber,
        fnbListPrice: typeof fnb.fnbListPrice === 'number' ? fnb.fnbListPrice : 0,
        fnbAvailable: isAvailable
      });
      
      console.log('Setting form data:', {
        id: fnb.fnbId,
        name: fnb.fnbName,
        type: {
          original: fnb.fnbType,
          converted: fnbTypeAsNumber
        },
        availability: {
          original: fnb.fnbAvailable,
          typeOf: typeof fnb.fnbAvailable,
          converted: isAvailable
        }
      });
    } else {
      resetForm();
    }
  }, [isEdit, isViewOnly, fnb, open]);

  // Form input handlers
  const handleDialogClose = () => {
    if (!isSubmitting) {
      resetForm();
      handleClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*$/.test(value) && parseInt(value) >= 0)) {
      const numericValue = value === '' ? 0 : parseInt(value);
      setFormData(prev => ({
        ...prev,
        fnbListPrice: numericValue
      }));
      if (errors.fnbListPrice) {
        setErrors(prev => ({ ...prev, fnbListPrice: null }));
      }
    }
  };

  const handleAvailabilityChange = (e) => {
    setFormData(prev => ({
      ...prev,
      fnbAvailable: e.target.checked
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.fnbName.trim()) {
      newErrors.fnbName = 'Name is required';
    } else if (formData.fnbName.trim().length < 2) {
      newErrors.fnbName = 'Name must be at least 2 characters';
    } else if (formData.fnbName.length > 100) {
      newErrors.fnbName = 'Name cannot exceed 100 characters';
    }

    // Type validation
    if (formData.fnbType === null || formData.fnbType === undefined) {
      newErrors.fnbType = 'Type is required';
    } else if (![0, 1].includes(Number(formData.fnbType))) {
      newErrors.fnbType = 'Invalid type selected';
    }

    // Price validation
    const price = Number(formData.fnbListPrice);
    if (!price) {
      newErrors.fnbListPrice = 'Price is required';
    } else if (price <= 0) {
      newErrors.fnbListPrice = 'Price must be greater than 0';
    } else if (price > 10000000) {
      newErrors.fnbListPrice = 'Price cannot exceed 10,000,000 VND';
    } else if (!Number.isInteger(price)) {
      newErrors.fnbListPrice = 'Price must be a whole number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const submitData = {
          ...formData,
          fnbType: Number(formData.fnbType),
          fnbListPrice: Number(formData.fnbListPrice)
        };
        
        await onSubmit(submitData);
        handleClose();
        if (!isEdit) {
          resetForm();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to submit form'
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        pt: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" fontWeight={600} component="div">
          {isViewOnly 
            ? "F&B Item Details" 
            : isEdit 
              ? "Edit F&B Item" 
              : "Add New F&B Item"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" noValidate>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}></Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="fnbName"
                    value={formData.fnbName}
                    onChange={handleInputChange}
                    error={!!errors.fnbName}
                    helperText={errors.fnbName}
                    disabled={isSubmitting}
                    InputProps={{
                      readOnly: isViewOnly,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl 
                    fullWidth 
                    error={!!errors.fnbType}
                  >
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="fnbType"
                      value={formData.fnbType}
                      onChange={handleInputChange}
                      label="Type"
                      disabled={isSubmitting}
                      inputProps={{
                        readOnly: isViewOnly,
                      }}
                    >
                      <MenuItem value={0}>Thức ăn</MenuItem>
                      <MenuItem value={1}>Đồ uống</MenuItem>
                    </Select>
                    {errors.fnbType && (
                      <FormHelperText>{errors.fnbType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            {/* Price */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Price</Typography>
              <TextField
                fullWidth
                label="List Price"
                name="fnbListPrice"
                type="number"
                value={formData.fnbListPrice}
                onChange={handlePriceChange}
                error={!!errors.fnbListPrice}
                helperText={errors.fnbListPrice}
                disabled={isSubmitting}
                InputProps={{
                  readOnly: isViewOnly,
                  startAdornment: <InputAdornment position="start">VND</InputAdornment>,
                }}
              />
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Availability</Typography>
              {isViewOnly ? (
                <Typography sx={{ ml: 1, color: 'text.primary' }}>
                  {formData.fnbAvailable ? "Available" : "Unavailable"}
                </Typography>
              ) : (
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.fnbAvailable}
                      onChange={handleAvailabilityChange}
                      disabled={isSubmitting}
                    />
                  }
                  label={formData.fnbAvailable ? "Available" : "Unavailable"}
                />
              )}
            </Grid>

            {/* Error Display */}
            {errors.submit && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {errors.submit}
                </Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={handleDialogClose}
          variant={isViewOnly ? "contained" : "outlined"}
          color={isViewOnly ? "primary" : "inherit"}
          sx={{ borderRadius: 1 }}
          disabled={isSubmitting}
        >
          {isViewOnly ? "Close" : "Cancel"}
        </Button>
        
        {!isViewOnly && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1, px: 3, minWidth: 100 }}
            disabled={isSubmitting}
            startIcon={isSubmitting && (
              <CircularProgress size={20} color="inherit" />
            )}
          >
            {isSubmitting 
              ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo mới...') 
              : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FnbForm;