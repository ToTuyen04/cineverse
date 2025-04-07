import React from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Paper,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

const OrderFilters = ({ filters, onFilterChange }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      dateFrom: null,
      dateTo: null,
      searchTerm: "",
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  // Hàm hỗ trợ chuyển đổi Date sang chuỗi date cho input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Tìm kiếm theo mã đơn, email hoặc SĐT"
            value={localFilters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: localFilters.searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange("searchTerm", "")}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-filter-label">Trạng thái</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Trạng thái"
              value={localFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Pending">Chờ thanh toán</MenuItem>
              <MenuItem value="Completed">Đã thanh toán</MenuItem>
              <MenuItem value="Printed">Đã in vé</MenuItem>
              <MenuItem value="Canceled">Đã hủy</MenuItem>
              <MenuItem value="Failed">Thanh toán thất bại</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid
          item
          xs={12}
          md={3}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={handleToggleExpand}
            sx={{ mr: 1 }}
          >
            {expanded ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
          >
            Lọc
          </Button>
        </Grid>

        {expanded && (
          <Grid item xs={12}>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Từ ngày"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formatDateForInput(localFilters.dateFrom)}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      handleFilterChange("dateFrom", date);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Đến ngày"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formatDateForInput(localFilters.dateTo)}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      handleFilterChange("dateTo", date);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={handleResetFilters}
                  >
                    Đặt lại
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default OrderFilters;
