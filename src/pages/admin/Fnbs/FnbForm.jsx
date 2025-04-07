import React, { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import { fileToBase64 } from "../../../utils/fileUtils";
import { FNB_TYPES, FNB_TYPE_OPTIONS } from "../../../utils/constants";

const FnbForm = ({
  open,
  handleClose,
  fnb,
  onSubmit,
  isEdit = false,
  isViewOnly = false,
}) => {
  const theme = useTheme();

  // Form state
  const [formData, setFormData] = useState({
    fnbId: "",
    fnbName: "",
    fnbPoster: "",
    fnbType: FNB_TYPES.FOOD,
    fnbListPrice: 0,
    fnbAvailable: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form function
  const resetForm = () => {
    setFormData({
      fnbId: "",
      fnbName: "",
      fnbPoster: "",
      fnbType: FNB_TYPES.FOOD,
      fnbListPrice: 0,
      fnbAvailable: true,
    });
    setImageFile(null);
    setImagePreview("");
    setErrors({});
  };

  // Initialize form with fnb data or reset for new fnb
  useEffect(() => {
    if ((isEdit || isViewOnly) && fnb) {
      setFormData({
        fnbId: fnb.fnbId || "",
        fnbName: fnb.fnbName || "",
        fnbPoster: fnb.fnbPoster || "",
        fnbType: fnb.fnbType || FNB_TYPES.FOOD,
        fnbListPrice:
          typeof fnb.fnbListPrice === "number" ? fnb.fnbListPrice : 0,
        fnbAvailable: Boolean(fnb.fnbAvailable),
      });

      if (fnb.fnbPoster) {
        setImagePreview(fnb.fnbPoster);
      }
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d*$/.test(value) && parseInt(value) >= 0)) {
      const numericValue = value === "" ? 0 : parseInt(value);
      setFormData((prev) => ({
        ...prev,
        fnbListPrice: numericValue,
      }));
      if (errors.fnbListPrice) {
        setErrors((prev) => ({ ...prev, fnbListPrice: null }));
      }
    }
  };

  const handleAvailabilityChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      fnbAvailable: e.target.checked,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setErrors((prev) => ({
        ...prev,
        fnbPoster: "Please select an image file",
      }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        fnbPoster: "Image size should be less than 5MB",
      }));
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear error if exists
    if (errors.fnbPoster) {
      setErrors((prev) => ({
        ...prev,
        fnbPoster: null,
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.fnbName.trim()) {
      newErrors.fnbName = "Tên không được để trống";
    } else if (formData.fnbName.trim().length < 2) {
      newErrors.fnbName = "Tên phải có ít nhất 2 ký tự";
    } else if (formData.fnbName.length > 100) {
      newErrors.fnbName = "Tên không được vượt quá 100 ký tự";
    }

    // Type validation
    if (!formData.fnbType) {
      newErrors.fnbType = "Vui lòng chọn loại";
    } else if (
      ![FNB_TYPES.FOOD, FNB_TYPES.BEVERAGE].includes(formData.fnbType)
    ) {
      newErrors.fnbType = "Loại không hợp lệ";
    }

    // Price validation
    const price = Number(formData.fnbListPrice);
    if (!price) {
      newErrors.fnbListPrice = "Giá không được để trống";
    } else if (price <= 0) {
      newErrors.fnbListPrice = "Giá phải lớn hơn 0";
    } else if (price > 10000000) {
      newErrors.fnbListPrice = "Giá không được vượt quá 10,000,000 VND";
    } else if (!Number.isInteger(price)) {
      newErrors.fnbListPrice = "Giá phải là số nguyên";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const fnbFormData = new FormData();

        // Append basic fields from formData state
        fnbFormData.append("FnbName", formData.fnbName);
        fnbFormData.append("FnbType", formData.fnbType);
        fnbFormData.append("FnbListPrice", formData.fnbListPrice.toString());
        fnbFormData.append("FnbAvailable", formData.fnbAvailable.toString());

        // Handle image - only append if there's a new image
        if (imageFile) {
          fnbFormData.append("FnbPoster", imageFile);
        }

        // Submit form based on mode
        if (isEdit) {
          await onSubmit(formData.fnbId, fnbFormData);
        } else {
          await onSubmit(fnbFormData);
        }

        if (!isEdit) {
          resetForm();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors((prev) => ({
          ...prev,
          submit: error.response?.data?.message || "Failed to submit form",
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
          boxShadow: theme.shadows[10],
        },
      }}
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
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
            {/* Image Upload */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="fnb-poster"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={isViewOnly || isSubmitting}
                />
                <label htmlFor="fnb-poster">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={isViewOnly || isSubmitting}
                  >
                    Upload Poster
                  </Button>
                </label>
                {errors.fnbPoster && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.fnbPoster}
                  </Typography>
                )}
              </Box>
              {imagePreview && (
                <Box sx={{ mt: 2, position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="F&B preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      objectFit: "contain",
                    }}
                  />
                  {!isViewOnly && (
                    <Button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setFormData((prev) => ({
                          ...prev,
                          fnbPoster: "",
                        }));
                      }}
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ position: "absolute", top: 8, right: 8 }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              )}
            </Grid>

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
                  <FormControl fullWidth error={!!errors.fnbType}>
                    <InputLabel>Loại</InputLabel>
                    <Select
                      name="fnbType"
                      value={formData.fnbType}
                      onChange={handleInputChange}
                      label="Loại"
                      disabled={isSubmitting}
                      inputProps={{
                        readOnly: isViewOnly,
                      }}
                    >
                      {FNB_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
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
              <Typography variant="h6" sx={{ mb: 2 }}>
                Price
              </Typography>
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
                  startAdornment: (
                    <InputAdornment position="start">VND</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Availability
              </Typography>
              {isViewOnly ? (
                <Typography sx={{ ml: 1, color: "text.primary" }}>
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
                <Alert severity="error">{errors.submit}</Alert>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}
      >
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
            startIcon={
              isSubmitting && <CircularProgress size={20} color="inherit" />
            }
          >
            {isSubmitting
              ? isEdit
                ? "Đang cập nhật..."
                : "Đang tạo mới..."
              : isEdit
              ? "Cập nhật"
              : "Tạo mới"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FnbForm;
