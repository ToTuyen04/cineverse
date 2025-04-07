import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  useTheme,
  Snackbar,
  Alert,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  RestartAlt as RestartAltIcon, // Add new icon for Default Reset button
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  updateConfigs,
  getConfigs,
} from "../../../api/services/configurationService"; // Import the updateConfigs function

// Enhanced styling for table cells
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: "16px",
  fontWeight: theme.palette.mode === "light" ? 500 : 400,
}));

// Enhanced table row styling
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor:
      theme.palette.mode === "light"
        ? alpha(theme.palette.primary.main, 0.03)
        : alpha(theme.palette.common.white, 0.03),
  },
  "& td": {
    borderBottom: `1px solid ${
      theme.palette.mode === "light"
        ? "rgba(0, 0, 0, 0.15)"
        : "rgba(255, 255, 255, 0.15)"
    }`,
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08) + " !important",
    cursor: "pointer",
  },
}));

// Di chuyển khai báo validation rules ra ngoài các hàm để trở thành biến dùng chung
// Các quy tắc validation đặc biệt dựa vào configId
const specialValidationRules = {
  1: {
    // Thời gian nghỉ giữa suất chiếu
    pattern: /^([2-9][0-9]|[1-9][0-9]{2,})$/,
    message:
      "Thời gian nghỉ phải là số nguyên và tối thiểu 20 phút. VD: 20, 30, 45",
  },
  2: {
    // Thời gian hoàn tất đặt vé
    pattern: /^(1[5-9]|[2-9][0-9]|[1-9][0-9]{2,})$/,
    message:
      "Thời gian hoàn tất đặt vé phải là số nguyên và tối thiểu 15 phút. VD: 15, 20, 30",
  },
  3: {
    // Số ngày mở bán vé trước
    pattern: /^([4-9]|[1-9][0-9]+)$/,
    message:
      "Số ngày mở bán vé trước phải là số nguyên và tối thiểu 4 ngày. VD: 4, 7, 14",
  },
  4: {
    // Tỷ lệ tích điểm
    pattern: /^0?\.[0-9]{1,3}$/,
    message:
      "Tỷ lệ tích điểm phải là số thập phân với tối đa 3 chữ số sau dấu chấm (.). Mức 0.001 nghĩa là khách hàng sẽ nhận được 0.001 điểm thưởng cho mỗi 1000 VNĐ chi tiêu.",
  },
  5: {
    // Ngày reset điểm tích lũy
    pattern: /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/,
    message:
      "Nhập theo định dạng Ngày/Tháng (DD/MM). VD: 31/12 cho ngày 31 tháng 12",
  },
};

// Validation patterns dựa vào unit
const unitValidationRules = {
  Phút: {
    pattern: /^[1-9][0-9]*$/,
    message:
      "Vui lòng nhập số nguyên dương lớn hơn 0 (không chấp nhận số 0). VD: 15, 30",
  },
  "Điểm/1000": {
    pattern: /^0?\.[0-9]{1,3}$/,
    message: "Vui lòng nhập số thập phân hợp lệ (VD: 0.001)",
  },
  Ngày: {
    pattern: /^[1-9][0-9]*$/,
    message:
      "Vui lòng nhập số nguyên dương lớn hơn 0 (không chấp nhận số 0). VD: 1, 7, 14",
  },
  "Ngày/Tháng": {
    pattern: /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])$/,
    message: "Vui lòng nhập theo định dạng DD/MM (VD: 31/12)",
  },
};

function Configuration() {
  const theme = useTheme();

  // Sample initial configuration data
  const initialConfigs = [
    {
      id: 1,
      name: "Thời gian nghỉ giữa suất chiếu",
      value: "30",
      unit: "Phút",
      description:
        "Thời gian (phút) nghỉ cần thiết giữa các suất chiếu trong cùng một phòng để dọn dẹp và chuẩn bị cho suất tiếp theo",
    },
    {
      id: 2,
      name: "Thời gian hoàn tất đặt vé",
      value: "15",
      unit: "Phút",
      description:
        "Thời gian tối đa (phút) mà hệ thống giữ ghế cho khách hàng để hoàn tất quá trình đặt vé và thanh toán.",
    },
    {
      id: 3,
      name: "Số ngày mở bán vé trước",
      value: "7",
      unit: "Ngày",
      description:
        "Số ngày trước ngày chiếu mà hệ thống sẽ mở bán vé cho suất chiếu",
    },
    {
      id: 4,
      name: "Tỷ lệ tích điểm",
      value: "0.001",
      unit: "Điểm/1000",
      description:
        "Số điểm tích lũy khách hàng nhận được cho mỗi 1000 VNĐ chi tiêu",
    },
    {
      id: 5,
      name: "Ngày reset điểm tích lũy",
      value: "31/12",
      unit: "Ngày/Tháng",
      description:
        "Thời điểm trong năm mà hệ thống sẽ tự động reset tất cả điểm tích lũy của khách hàng về 0.",
    },
  ];

  // State management
  const [configs, setConfigs] = useState(initialConfigs);
  const [originalConfigs, setOriginalConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [touchedFields, setTouchedFields] = useState({});
  const [defaultConfigs, setDefaultConfigs] = useState([]);

  // Combined validation function and patterns
  const validateInput = (value, unit, configId) => {
    // Ưu tiên validation đặc biệt theo configId
    if (specialValidationRules[configId]) {
      return specialValidationRules[configId].pattern.test(value);
    }

    // Dùng validation chung dựa vào unit nếu không có validation đặc biệt
    if (unitValidationRules[unit]) {
      return unitValidationRules[unit].pattern.test(value);
    }

    // Mặc định là hợp lệ nếu không có quy tắc
    return true;
  };

  // Hàm lấy thông báo validation
  const getValidationMessage = (configId, unit) => {
    if (specialValidationRules[configId]) {
      return specialValidationRules[configId].message;
    }

    if (unitValidationRules[unit]) {
      return unitValidationRules[unit].message;
    }

    return "Vui lòng nhập giá trị hợp lệ";
  };

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchConfigurations();
  }, []);

  // Function to fetch configurations from API
  const fetchConfigurations = async () => {
    setIsLoading(true);
    try {
      // Call the API service
      const response = await getConfigs();
      console.log("API response:", response);

      if (response && response.data) {
        // Map API response to our component format
        const configData = response.data.map((config) => ({
          id: config.configurationId,
          name: config.configurationName,
          value: config.configurationContent,
          defaultValue: config.configurationDefaultContent || "", // Lưu giá trị mặc định
          unit: config.configurationUnit,
          description: config.configurationDescription || "",
        }));

        setConfigs(configData);
        setOriginalConfigs(JSON.parse(JSON.stringify(configData)));
        setDefaultConfigs(JSON.parse(JSON.stringify(configData))); // Lưu cấu hình mặc định
        console.log("Configurations loaded successfully:", configData);
      } else {
        // Fallback to initial configs if API response is invalid
        console.warn("Invalid API response, using fallback data");
        setConfigs(initialConfigs);
        setOriginalConfigs(JSON.parse(JSON.stringify(initialConfigs)));
        setDefaultConfigs(JSON.parse(JSON.stringify(initialConfigs)));
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
      setErrorMessage("Không thể tải cấu hình. Vui lòng làm mới trang.");
      // Fallback to initial configs on error
      setConfigs(initialConfigs);
      setOriginalConfigs(JSON.parse(JSON.stringify(initialConfigs)));
      setDefaultConfigs(JSON.parse(JSON.stringify(initialConfigs)));
    } finally {
      setIsLoading(false);
    }
  };

  // Update configuration value and track touched fields
  const handleConfigChange = (id, newValue) => {
    const updatedConfigs = configs.map((config) =>
      config.id === id ? { ...config, value: newValue } : config
    );
    setConfigs(updatedConfigs);

    // Find the original value for this config (from current server state)
    const originalConfig = originalConfigs.find((config) => config.id === id);
    const originalValue = originalConfig ? originalConfig.value : "";

    // Only mark as touched if value differs from original
    if (newValue !== originalValue) {
      setTouchedFields((prev) => ({ ...prev, [id]: true }));
    } else {
      // If value is the same as original, remove from touched fields
      setTouchedFields((prev) => {
        const newTouched = { ...prev };
        delete newTouched[id];
        return newTouched;
      });
    }
  };

  // Check if all inputs are valid
  const areAllInputsValid = () => {
    return configs.every((config) =>
      validateInput(config.value, config.unit, config.id)
    );
  };

  // Save configurations
  const handleSave = async () => {
    if (!areAllInputsValid()) {
      setErrorMessage("Một số giá trị không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setIsLoading(true);
    try {
      // Map our component data format to API format
      const configsToUpdate = configs.map((config) => ({
        configurationId: config.id,
        configurationContent: config.value,
      }));

      console.log("Sending data to API:", configsToUpdate);

      // Call the API to update configurations
      const response = await updateConfigs(configsToUpdate);
      console.log("API response:", response);

      if (response && response.data) {
        // Update with the data returned from the API
        const updatedData = response.data.map((config) => ({
          id: config.configurationId,
          name: config.configurationName,
          value: config.configurationContent,
          unit: config.configurationUnit,
          description: config.configurationDescription || "",
        }));

        setConfigs(updatedData);
        setOriginalConfigs(JSON.parse(JSON.stringify(updatedData)));
        setSuccessMessage("Cấu hình đã được lưu thành công.");

        // Clear touched fields after saving successfully
        setTouchedFields({});
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error saving configurations:", error);
      setErrorMessage("Không thể lưu cấu hình. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);

      // Auto-hide success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    }
  };

  // Reset to original values and clear touched state
  const handleReset = () => {
    setConfigs(JSON.parse(JSON.stringify(originalConfigs)));
    setTouchedFields({});
    setErrorMessage("");
  };

  // Reset to default initial values and clear touched state
  const handleDefaultReset = () => {
    // Thay vì sử dụng initialConfigs, sử dụng giá trị mặc định từ API
    if (defaultConfigs && defaultConfigs.length > 0) {
      // Tạo mảng configs mới với value lấy từ defaultValue
      const resetConfigs = configs.map((config) => {
        // Tìm cấu hình tương ứng trong defaultConfigs
        const defaultConfig = defaultConfigs.find((dc) => dc.id === config.id);

        // Nếu tìm được, sử dụng defaultValue, ngược lại giữ nguyên giá trị hiện tại
        return {
          ...config,
          value: defaultConfig ? defaultConfig.defaultValue : config.value,
        };
      });

      setConfigs(resetConfigs);
      setTouchedFields({});
      setErrorMessage("");
      setSuccessMessage("Đã khôi phục về giá trị mặc định");
    } else {
      // Fallback nếu không có dữ liệu mặc định
      setConfigs(JSON.parse(JSON.stringify(initialConfigs)));
      setTouchedFields({});
      setErrorMessage("");
    }
  };

  // Handle alert close
  const handleAlertClose = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Check if there are unsaved changes compared to original values
  const hasChanges =
    JSON.stringify(configs) !== JSON.stringify(originalConfigs);

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            textAlign: "left", // Align text to the left
          }}
        >
          Cấu hình hệ thống
        </Typography>
      </Box>

      {/* Main Card */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor:
            theme.palette.mode === "light"
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.background.paper, 0.1),
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: 0 }}>
            <Table sx={{ minWidth: 650 }} aria-label="configuration table">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? alpha(theme.palette.primary.main, 0.05)
                        : alpha(theme.palette.common.white, 0.05),
                  }}
                >
                  <StyledTableCell>Tên cấu hình</StyledTableCell>
                  <StyledTableCell>Giá trị</StyledTableCell>
                  <StyledTableCell>Đơn vị</StyledTableCell>
                  <StyledTableCell>Mô tả</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configs.map((config) => (
                  <StyledTableRow key={config.id} hover>
                    <StyledTableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {config.name}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TextField
                        variant="outlined"
                        size="small"
                        value={config.value}
                        onChange={(e) =>
                          handleConfigChange(config.id, e.target.value)
                        }
                        error={
                          !validateInput(config.value, config.unit, config.id)
                        }
                        helperText={null}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip
                                title={getValidationMessage(
                                  config.id,
                                  config.unit
                                )}
                                arrow
                              >
                                <InfoIcon fontSize="small" color="action" />
                              </Tooltip>
                            </InputAdornment>
                          ),
                          sx: {
                            // Simple styling that works consistently
                            "& fieldset": {
                              borderColor: touchedFields[config.id]
                                ? validateInput(
                                    config.value,
                                    config.unit,
                                    config.id
                                  )
                                  ? "#4caf50" // Green border for valid input
                                  : "#f44336" // Red for invalid
                                : theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.38)" // White border in dark mode
                                : "rgba(0, 0, 0, 0.38)", // Dark border in light mode
                              borderWidth: "1px", // Consistent border width
                            },
                            "&:hover fieldset": {
                              borderColor: touchedFields[config.id]
                                ? validateInput(
                                    config.value,
                                    config.unit,
                                    config.id
                                  )
                                  ? "#2e7d32" // Darker green on hover
                                  : "#d32f2f" // Darker red for invalid
                                : theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.7)" // Brighter white on hover in dark mode
                                : theme.palette.primary.main,
                              borderWidth: "1px", // Use primary color on hover
                            },
                            // Removed non-working focus styles
                            "&.Mui-focused fieldset": {
                              borderWidth: "20px", // Giữ độ dày border khi focus
                            },
                          },
                        }}
                        fullWidth
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2">{config.unit}</Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          // maxWidth: { xs: 150, sm: 300 },
                          width: "100%",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {config.description}
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Action Buttons with more concise names */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 3,
          gap: 2,
        }}
      >
        {/* Reset button on the left with shorter name */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<RestartAltIcon />}
          onClick={handleDefaultReset}
          disabled={isLoading}
          sx={{
            borderRadius: 1,
            px: 3,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Mặc định
        </Button>

        {/* Other buttons on the right with shorter names */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={isLoading || !hasChanges}
            sx={{
              borderRadius: 1,
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading || !areAllInputsValid() || !hasChanges}
            sx={{
              borderRadius: 1,
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Lưu
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={handleAlertClose}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled" onClose={handleAlertClose}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Configuration;
