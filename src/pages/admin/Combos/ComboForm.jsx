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
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import useFnbs from "../../../hooks/useFnbs";
import { formatPrice, formatPercent } from "../../../utils/formatters";

const ComboForm = ({
  open,
  handleClose,
  combo,
  onSubmit,
  isEdit = false,
  isViewOnly = false,
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    comboId: "",
    comboName: "",
    comboImage: "",
    comboCreateAt: new Date(),
    comboCreateBy: 1,
    comboDiscount: 0,
    comboAvailable: true,
    comboDetails: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // State cho việc thêm F&B mới vào combo
  const [newDetail, setNewDetail] = useState({
    fnbId: "",
    quantity: 1,
  });
  const [detailErrors, setDetailErrors] = useState({});

  // Sử dụng hook để lấy danh sách F&B
  const { fnbs, loading: loadingFnbs } = useFnbs({
    limit: 100, // Lấy toàn bộ F&B để hiển thị
    fnbType: null, // Lấy cả thức ăn và đồ uống
  });

  // Reset form function
  const resetForm = () => {
    setFormData({
      comboName: "",
      comboDiscount: 0,
      comboAvailable: true,
      comboDetails: [],
    });
    setImagePreview("");
    setImageFile(null);
    setErrors({});
    setDetailErrors({});
    setNewDetail({ fnbId: "", quantity: 1 });
  };

  // Console log để kiểm tra dữ liệu combo
  useEffect(() => {
    if (combo) {
      console.log("ComboForm received combo data:", combo);

      // Kiểm tra chi tiết combo
      if (combo.comboDetails) {
        console.log("Combo details count:", combo.comboDetails.length);
        console.log("Combo details data:", combo.comboDetails);
      } else {
        console.log("No combo details found in the combo object");
      }

      // Hiển thị loading khi bắt đầu load dữ liệu
      setIsLoadingDetails(true);

      // Giả lập thời gian loading để hiển thị spinner
      setTimeout(() => {
        setIsLoadingDetails(false);
      }, 500);
    }
  }, [combo]);

  // Load dữ liệu combo khi edit hoặc view
  useEffect(() => {
    // First, reset the image state when the dialog opens regardless of edit mode
    if (open) {
      setImagePreview("");
      setImageFile(null);
      
      // Then if we have a combo and are in edit or view mode, load the combo data
      if (combo && (isEdit || isViewOnly)) {
        console.log("ComboForm initializing with combo:", combo);

        // Mô phỏng trạng thái loading
        setIsLoadingDetails(true);

        setTimeout(() => {
          // Đảm bảo comboDetails luôn là một mảng
          const comboDetails = combo.comboDetails || [];

          console.log("Combo details:", comboDetails);
          console.log("Detail count:", comboDetails.length);

          // Map the details to ensure consistent property names
          const mappedDetails = comboDetails.map(detail => ({
            comboDetailId: detail.comboDetailId || detail.ComboDetailId, // Use either format for ID
            fnbId: detail.fnbId || detail.FnbId, // Try both property name formats
            quantity: detail.quantity || detail.Quantity,
            fnbName: detail.fnbName || detail.FnbName || "Unknown Item",
            fnbPrice: detail.fnbPrice || detail.FnbPrice || 0,
          }));

          // Log the discount value for debugging
          console.log("Original combo discount value:", combo.comboDiscount);
          
          // Fix for discount value (backend value is already decimal 0-1)
          let discountValue = 0;
          if (combo.comboDiscount !== null && combo.comboDiscount !== undefined) {
            // Check if discount is already a percentage (e.g. 3, 10, 20...)
            if (combo.comboDiscount >= 0 && combo.comboDiscount <= 1) {
              // Convert from decimal (0.03) to percentage (3) for display
              discountValue = Math.round(combo.comboDiscount * 100);
              console.log("Converting decimal discount to percentage:", discountValue);
            } else {
              // Value is already a percentage (e.g. 3, 5, 10...)
              discountValue = combo.comboDiscount;
              console.log("Discount already appears to be a percentage:", discountValue);
            }
          }
          
          console.log("Final discount value for display:", discountValue);

          // Cập nhật form data
          setFormData({
            comboId: combo.comboId,
            comboName: combo.comboName,
            comboImage: combo.comboImage,
            comboDiscount: discountValue, // Use the corrected discount value
            comboAvailable: combo.comboAvailable,
            comboType: combo.comboType,
            comboCreateAt: combo.comboCreatedAt,
            comboDetails: mappedDetails,
          });

          // Only set the image preview if the combo has an image
          if (combo.comboImage) {
            setImagePreview(combo.comboImage);
            console.log("Set image preview to:", combo.comboImage);
          } else {
            // Explicitly clear the image preview if the combo has no image
            setImagePreview("");
            console.log("Cleared image preview because combo has no image");
          }

          setIsLoadingDetails(false);
        }, 500);
      } else if (!combo) {
        // If no combo is provided, this is a new combo, so reset the form
        resetForm();
        console.log("ComboForm reset for new combo");
      }
    }
  }, [combo, isEdit, isViewOnly, open]); // Added 'open' to the dependency array

  const handleDialogClose = () => {
    if (!isSubmitting) {
      resetForm();
      handleClose();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match("image.*")) {
      setErrors({
        ...errors,
        comboImage: "Please select an image file",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        comboImage: "Image size should be less than 5MB",
      });
      return;
    }

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    if (errors.comboImage) {
      setErrors({
        ...errors,
        comboImage: null,
      });
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleAvailabilityChange = (e) => {
    const { checked } = e.target;
    setFormData({
      ...formData,
      comboAvailable: checked,
    });
    if (errors.comboAvailable) {
      setErrors({
        ...errors,
        comboAvailable: null,
      });
    }
  };

  // Xử lý nhập liệu cho F&B mới
  const handleDetailInputChange = (e) => {
    const { name, value } = e.target;
    setNewDetail({
      ...newDetail,
      [name]: value,
    });
    if (detailErrors[name]) {
      setDetailErrors({
        ...detailErrors,
        [name]: null,
      });
    }
  };

  // Xử lý thêm F&B item vào combo
  const handleAddDetail = () => {
    // Validate
    const errors = {};
    if (!newDetail.fnbId) errors.fnbId = "Vui lòng chọn món";
    if (!newDetail.quantity || newDetail.quantity <= 0)
      errors.quantity = "Số lượng phải lớn hơn 0";

    if (Object.keys(errors).length > 0) {
      setDetailErrors(errors);
      return;
    }

    // Lấy thông tin món từ danh sách F&B
    const selectedFnb = fnbs.find((f) => f.fnbId === newDetail.fnbId);

    if (!selectedFnb) {
      setDetailErrors({ fnbId: "Không tìm thấy thông tin món" });
      return;
    }

    // Thêm món vào combo
    const newDetailItem = {
      fnbId: newDetail.fnbId,
      quantity: newDetail.quantity,
      fnbName: selectedFnb.fnbName,
      fnbPrice: selectedFnb.fnbListPrice,
    };

    setFormData({
      ...formData,
      comboDetails: [...formData.comboDetails, newDetailItem],
    });

    // Reset form
    setNewDetail({ fnbId: "", quantity: 1 });
    setDetailErrors({});
  };

  // Hàm xóa F&B khỏi combo
  const handleRemoveDetail = (index) => {
    const updatedDetails = [...formData.comboDetails];
    updatedDetails.splice(index, 1);
    setFormData({
      ...formData,
      comboDetails: updatedDetails,
    });
  };

  // Kiểm tra tính hợp lệ của form
  const validateForm = () => {
    const newErrors = {};

    // Validate các trường bắt buộc
    if (!formData.comboName || formData.comboName.trim() === '') {
      newErrors.comboName = "Tên combo không được để trống";
    }

    // Validate discount
    if (formData.comboDiscount < 0 || formData.comboDiscount > 100) {
      newErrors.comboDiscount = "Giảm giá phải từ 0% đến 100%";
    }

    // Validate image
    if (!isEdit && !isViewOnly && !imageFile && !imagePreview) {
      newErrors.comboImage = "Vui lòng tải lên hình ảnh cho combo";
    }

    // Validate chi tiết combo
    if (
      (!formData.comboDetails || formData.comboDetails.length === 0) &&
      !isViewOnly
    ) {
      newErrors.comboDetails = "Combo phải có ít nhất một món F&B";
    }

    return newErrors;
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        // Create a new FormData with consistent structure for both create and update
        const formDataToSubmit = new FormData();

        // Always include the ID for edit operations
        if (isEdit && formData.comboId) {
          formDataToSubmit.append("ComboId", formData.comboId);
          console.log("Including ComboId in form data:", formData.comboId);
        }

        // Common fields for both operations
        formDataToSubmit.append("ComboName", formData.comboName);
        
        // Convert percentage (e.g. 3%) to decimal (0.03) for API
        const discountDecimal = (formData.comboDiscount / 100).toFixed(2);
        formDataToSubmit.append("ComboDiscount", discountDecimal);
        console.log("Converting discount from percentage to decimal:", 
                   `${formData.comboDiscount}% → ${discountDecimal}`);
        
        formDataToSubmit.append("ComboType", formData.comboType || "Regular");
        
        // Fix for ComboAvailable boolean issue - convert boolean to lowercase string
        console.log("ComboAvailable value before conversion:", formData.comboAvailable);
        const availableValue = formData.comboAvailable === true ? "true" : "false";
        formDataToSubmit.append("ComboAvailable", availableValue);
        console.log("ComboAvailable value after conversion:", availableValue);
        
        // For create operations only
        if (!isEdit) {
          formDataToSubmit.append("ComboCreatedBy", "1");
        }

        // Handle image upload - CRITICAL FIX HERE
        if (imageFile) {
          // This is a new image being uploaded
          console.log("Adding new image file to FormData:", imageFile.name);
          formDataToSubmit.append("ComboImage", imageFile);
        } else if (isEdit && !imageFile && imagePreview && imagePreview.startsWith('http')) {
          // This is an update where we're keeping the existing image
          // The backend will detect no file was sent and keep the existing image
          console.log("Keeping existing image URL:", imagePreview);
          // We don't append anything - the backend handles this case by checking if ComboImage is null
        } else if (isEdit && !imageFile && !imagePreview) {
          // This is an update where we intentionally removed the image
          // But since IFormFile can't be null in FormData, we handle this on backend
          console.log("Image was removed, sending empty image signal");
          // We might need a special handling on backend for "image removed" case
        }

        // Handle F&B details with identical structure for both operations
        if (formData.comboDetails && formData.comboDetails.length > 0) {
          formData.comboDetails.forEach((detail, index) => {
            // IMPROVED FIX FOR UNDEFINED FnbId: Use the lowercase property if uppercase is not available
            // If still undefined, log a clear error and stop processing
            const fnbIdValue = detail.fnbId || detail.FnbId;
            
            if (!fnbIdValue) {
              console.error(`CRITICAL ERROR: Missing fnbId for detail at index ${index}:`, detail);
              
              // Get the existing FnbId from the original combo if this is an edit operation
              if (isEdit && detail.comboDetailId && combo && combo.comboDetails) {
                const originalDetail = combo.comboDetails.find(d => 
                  d.comboDetailId === detail.comboDetailId || d.ComboDetailId === detail.comboDetailId
                );
                
                if (originalDetail) {
                  const originalFnbId = originalDetail.fnbId || originalDetail.FnbId;
                  if (originalFnbId) {
                    console.log(`Using original FnbId=${originalFnbId} from combo details`);
                    formDataToSubmit.append(`ComboDetails[${index}].FnbId`, originalFnbId);
                  } else {
                    console.error(`Cannot find FnbId in original detail:`, originalDetail);
                    // Use a default value as last resort
                    formDataToSubmit.append(`ComboDetails[${index}].FnbId`, '1');
                    console.warn(`Using default FnbId=1 as last resort`);
                  }
                } else {
                  console.error(`Cannot find original detail with ID ${detail.comboDetailId}`);
                  // Use a default value as last resort
                  formDataToSubmit.append(`ComboDetails[${index}].FnbId`, '1');
                  console.warn(`Using default FnbId=1 as last resort`);
                }
              } else {
                // This should never happen for new details, but add a fallback
                formDataToSubmit.append(`ComboDetails[${index}].FnbId`, '1');
                console.warn(`Using default FnbId=1 as last resort`);
              }
            } else {
              console.log(`Adding detail[${index}].FnbId:`, fnbIdValue);
              formDataToSubmit.append(`ComboDetails[${index}].FnbId`, fnbIdValue);
            }
            
            formDataToSubmit.append(`ComboDetails[${index}].Quantity`, detail.quantity);
            
            // Include ComboDetailId for existing details if available
            if (detail.comboDetailId) {
              formDataToSubmit.append(`ComboDetails[${index}].ComboDetailId`, detail.comboDetailId);
            }
          });
        } else {
          formDataToSubmit.append("ComboDetails", JSON.stringify([]));
        }

        // Log the FormData content for debugging
        console.log(`Submitting FormData for ${isEdit ? "update" : "create"}:`);
        for (let [key, value] of formDataToSubmit.entries()) {
          if (key === 'ComboImage' && typeof value === 'object') {
            console.log(`${key}: File object - Name: ${value.name}, Type: ${value.type}, Size: ${value.size}`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        // DIRECT CALL FOR DEBUGGING: Test that our update function works
        if (isEdit) {
          console.log("======== DIRECTLY CALLING UPDATE API ========");
          
          // Get direct reference to the updateCombo function
          const { updateCombo } = await import('../../../api/services/comboService');
          
          if (!updateCombo) {
            console.error("Failed to import updateCombo function");
          } else {
            console.log("Successfully imported updateCombo function");
            try {
              console.log(`Directly calling updateCombo(${formData.comboId}, formData)`);
              const directResult = await updateCombo(formData.comboId, formDataToSubmit);
              console.log("Direct API call result:", directResult);
            } catch (directError) {
              console.error("Error in direct API call:", directError);
            }
          }
        }
        
        // Use the same onSubmit handler for both operations
        let result;
        if (isEdit) {
          console.log(`Calling onSubmit for update with ID=${formData.comboId}`);
          result = await onSubmit(formData.comboId, formDataToSubmit);
        } else {
          console.log("Calling onSubmit for create");
          result = await onSubmit(formDataToSubmit);
        }

        console.log(`Form submission result (${isEdit ? "update" : "create"}):`, result);
        
        if (!isEdit) {
          resetForm();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: error.response?.data?.error || "Failed to submit form" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(errors);
    }
  };

  // Chuẩn bị dữ liệu để gửi lên server
  const prepareFormData = () => {
    const formDataToSubmit = new FormData();

    // Thêm các thông tin cơ bản
    formDataToSubmit.append("comboName", formData.comboName);

    // Discount được lưu dưới dạng tỷ lệ (0-1) nên cần chia cho 100
    formDataToSubmit.append(
      "comboDiscount",
      (formData.comboDiscount / 100).toString()
    );
    formDataToSubmit.append(
      "comboAvailable",
      formData.comboAvailable.toString()
    );

    // Thêm hình ảnh nếu có
    if (imageFile) {
      formDataToSubmit.append("comboImage", imageFile);
    }

    // Thêm chi tiết F&B items
    if (formData.comboDetails && formData.comboDetails.length > 0) {
      // Tạo mảng fnbId và quantity để gửi lên server
      const fnbIds = [];
      const quantities = [];

      formData.comboDetails.forEach((detail) => {
        fnbIds.push(detail.fnbId);
        quantities.push(detail.quantity);
      });

      formDataToSubmit.append("fnbIds", JSON.stringify(fnbIds));
      formDataToSubmit.append("quantities", JSON.stringify(quantities));
    }

    return formDataToSubmit;
  };

  // Hàm hiển thị bảng F&B items
  const renderFnbItemsTable = () => {
    // Chỉ hiển thị bảng nếu có F&B items hoặc đang ở chế độ xem
    if (formData.comboDetails && formData.comboDetails.length > 0) {
      // Tính tổng số lượng món và tổng giá trị
      let totalItems = 0;
      let totalPrice = 0;

      formData.comboDetails.forEach((item) => {
        totalItems += item.quantity;
        totalPrice += item.quantity * item.fnbPrice;
      });

      return (
        <>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            F&B Items in Combo
            <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
              ({formData.comboDetails.length} items, {totalItems} món)
            </Typography>
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {!isViewOnly && <TableCell width="5%"></TableCell>}
                  <TableCell width="5%">STT</TableCell>
                  <TableCell>Tên món</TableCell>
                  <TableCell align="right">Số lượng</TableCell>
                  <TableCell align="right">Đơn giá</TableCell>
                  <TableCell align="right">Thành tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.comboDetails.map((detail, index) => (
                  <TableRow key={detail.comboDetailId || index}>
                    {!isViewOnly && (
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveDetail(index)}
                          disabled={isSubmitting}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{detail.fnbName}</TableCell>
                    <TableCell align="right">{detail.quantity}</TableCell>
                    <TableCell align="right">
                      {formatPrice(detail.fnbPrice)}
                    </TableCell>
                    <TableCell align="right">
                      {formatPrice(detail.quantity * detail.fnbPrice)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={!isViewOnly ? 5 : 4}
                    align="right"
                    sx={{ fontWeight: "bold" }}
                  >
                    Tổng giá trị:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {formatPrice(totalPrice)}
                  </TableCell>
                </TableRow>
                {formData.comboDiscount > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={!isViewOnly ? 5 : 4} align="right">
                        Giảm giá ({formatPercent(formData.comboDiscount)}
                        ):
                      </TableCell>
                      <TableCell align="right">
                        {formatPrice(
                          totalPrice * (formData.comboDiscount / 100)
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        colSpan={!isViewOnly ? 5 : 4}
                        align="right"
                        sx={{ fontWeight: "bold" }}
                      >
                        Giá sau giảm:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {formatPrice(
                          totalPrice * (1 - formData.comboDiscount / 100)
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    } else if (isLoadingDetails) {
      // Hiển thị loading spinner nếu đang tải dữ liệu
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      );
    } else if (isViewOnly || isEdit) {
      // Thông báo không có món nào trong combo nếu đang ở chế độ xem/chỉnh sửa
      return (
        <Paper sx={{ p: 3, textAlign: "center", my: 2 }}>
          <Typography color="text.secondary">
            Không có món F&B nào trong combo này.
          </Typography>
        </Paper>
      );
    }

    // Trường hợp thêm mới, không hiển thị gì nếu chưa có món nào
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
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
            ? "Combo Details"
            : isEdit
            ? "Edit Combo"
            : "Add New Combo"}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box component="form" noValidate>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Combo Name"
                name="comboName"
                value={formData.comboName || ''}
                onChange={handleInputChange}
                error={!!errors.comboName}
                helperText={errors.comboName}
                disabled={isViewOnly || isSubmitting}
              />
            </Grid>
            {/* Image Upload */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  type="file"
                  id="combo-image"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.match("image.*")) {
                      setErrors((prev) => ({
                        ...prev,
                        comboImage: "Please select an image file",
                      }));
                      return;
                    }

                    // Validate file size (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setErrors((prev) => ({
                        ...prev,
                        comboImage: "Image size should be less than 5MB",
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
                    if (errors.comboImage) {
                      setErrors((prev) => ({
                        ...prev,
                        comboImage: null,
                      }));
                    }
                  }}
                  style={{ display: "none" }}
                  disabled={isViewOnly || isSubmitting}
                />
                <label htmlFor="combo-image">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={isViewOnly || isSubmitting}
                  >
                    Upload Image
                  </Button>
                </label>
                {errors.comboImage && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.comboImage}
                  </Typography>
                )}
              </Box>
              {imagePreview && (
                <Box sx={{ mt: 2, position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="Combo preview"
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
                          comboImage: "",
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

            {/* Discount */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount (%)"
                name="comboDiscount"
                type="number"
                value={formData.comboDiscount}
                onChange={handleInputChange}
                error={!!errors.comboDiscount}
                helperText={errors.comboDiscount}
                disabled={isViewOnly || isSubmitting}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>

            {/* Availability Switch */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.comboAvailable}
                    onChange={handleAvailabilityChange}
                    disabled={isViewOnly || isSubmitting}
                  />
                }
                label="Available"
              />
            </Grid>

            {/* F&B Items Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              {errors.comboDetails && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.comboDetails}
                </Typography>
              )}

              {/* Form để thêm F&B vào combo */}
              {!isViewOnly && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!detailErrors.fnbId}>
                        <InputLabel>Select F&B Item</InputLabel>
                        <Select
                          name="fnbId"
                          value={newDetail.fnbId}
                          onChange={handleDetailInputChange}
                          disabled={isSubmitting || loadingFnbs}
                          label="Select F&B Item"
                        >
                          {fnbs.map((fnb) => (
                            <MenuItem key={fnb.fnbId} value={fnb.fnbId}>
                              {fnb.fnbName} - {formatPrice(fnb.fnbListPrice)}
                            </MenuItem>
                          ))}
                        </Select>
                        {detailErrors.fnbId && (
                          <FormHelperText>{detailErrors.fnbId}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={newDetail.quantity}
                        onChange={handleDetailInputChange}
                        disabled={isSubmitting}
                        error={!!detailErrors.quantity}
                        helperText={detailErrors.quantity}
                        InputProps={{
                          inputProps: { min: 1 },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddDetail}
                        disabled={isSubmitting || loadingFnbs}
                      >
                        Add Item
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {renderFnbItemsTable()}
            </Grid>

            {isViewOnly && (
              <>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Combo ID
                    </Typography>
                    <Typography variant="body1">{formData.comboId}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formData.comboCreateAt
                        ? new Date(formData.comboCreateAt).toLocaleString()
                        : "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                {formData.comboDescription && (
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {formData.comboDescription}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </>
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
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update"
              : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ComboForm;
