import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Pagination,
  PaginationItem,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useFnbs from "../../../hooks/useFnbs";
import FnbForm from "./FnbForm";
import { FNB_TYPES } from "../../../utils/constants";

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${
    theme.palette.mode === "light"
      ? "rgba(0, 0, 0, 0.15)"
      : "rgba(255, 255, 255, 0.15)"
  }`,
  color: theme.palette.text.primary,
  padding: "16px",
  fontWeight: theme.palette.mode === "light" ? 500 : 400,
}));

// Add this after your existing styled components
const FnbPosterImage = styled("img")({
  width: "60px",
  height: "60px",
  objectFit: "cover",
  borderRadius: 4,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
});

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

// Status chip component
const StatusChip = ({ available }) => {
  const theme = useTheme();

  return (
    <Chip
      label={available ? "Available" : "Unavailable"}
      size="small"
      sx={{
        bgcolor: available
          ? alpha(theme.palette.success.main, 0.1)
          : alpha(theme.palette.error.main, 0.1),
        color: available
          ? theme.palette.success.main
          : theme.palette.error.main,
        fontWeight: 500,
        border: "none",
      }}
    />
  );
};

// Type chip component
const TypeChip = ({ type }) => {
  const theme = useTheme();
  const isFood = type === FNB_TYPES.FOOD;

  return (
    <Chip
      label={type}
      size="small"
      sx={{
        bgcolor: isFood
          ? alpha(theme.palette.warning.main, 0.1)
          : alpha(theme.palette.info.main, 0.1),
        color: isFood ? theme.palette.warning.main : theme.palette.info.main,
        fontWeight: 500,
        border: "none",
      }}
    />
  );
};

const Fnbs = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  // State for fnb form
  const [openFnbForm, setOpenFnbForm] = useState(false);
  const [selectedFnb, setSelectedFnb] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Use the fnbs hook
  const {
    fnbs,
    loading,
    error,
    pagination,
    addFnb,
    editFnb,
    removeFnb,
    getFnb,
    refreshFnbs,
  } = useFnbs({
    page: page + 1,
    limit: rowsPerPage,
    search: searchDebounce,
  });

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Handle add fnb button click
  const handleAddFnbClick = () => {
    setIsEditMode(false);
    setSelectedFnb(null);
    setOpenFnbForm(true);
  };

  // Handle edit fnb
  const handleEditClick = async (fnbId) => {
    try {
      setIsEditMode(true);
      setIsViewOnly(false);
      const fnbData = await getFnb(fnbId);
      setSelectedFnb(fnbData);
      setOpenFnbForm(true);
    } catch (err) {
      showSnackbar(err.message, "error");
    }
  };

  // Handle view fnb
  const handleViewClick = async (fnbId) => {
    try {
      setIsEditMode(false);
      setIsViewOnly(true);
      const fnbData = await getFnb(fnbId);
      setSelectedFnb(fnbData);
      setOpenFnbForm(true);
    } catch (err) {
      showSnackbar(err.message, "error");
    }
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenFnbForm(false);
    setIsViewOnly(false);
    refreshFnbs();
  };

  // Handle delete fnb
  const handleDeleteFnb = async (id) => {
    if (window.confirm("Are you sure you want to delete this F&B item?")) {
      try {
        const result = await removeFnb(id);
        if (result.success) {
          showSnackbar("F&B item deleted successfully");
          refreshFnbs();
        } else {
          showSnackbar(result.error, "error");
        }
      } catch (err) {
        showSnackbar(err.message, "error");
      }
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Snackbar state and handlers
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          borderBottom:
            theme.palette.mode === "light"
              ? "1px solid rgba(0,0,0,0.1)"
              : "1px solid rgba(255,255,255,0.1)",
          pb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Quản lý đồ ăn và thức uống
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFnbClick}
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
            fontWeight: 500,
          }}
        >
          Thêm đồ ăn/thức uống
        </Button>
      </Box>

      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm đồ ăn và thức uống..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Loading and error states */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* F&B Table */}
      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>ID</StyledTableCell>
                  <StyledTableCell>Ảnh</StyledTableCell> {/* Add this line */}
                  <StyledTableCell>Tên</StyledTableCell>
                  <StyledTableCell>Loại</StyledTableCell>
                  <StyledTableCell align="right">Thành tiền</StyledTableCell>
                  <StyledTableCell>Trạng thái</StyledTableCell>
                  <StyledTableCell align="center">Chức năng</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fnbs.map((fnb) => (
                  <StyledTableRow key={fnb.fnbId}>
                    <StyledTableCell>{fnb.fnbId}</StyledTableCell>
                    <StyledTableCell>
                      <FnbPosterImage
                        src={
                          fnb.fnbPoster ||
                          "https://via.placeholder.com/60x60?text=No+Image"
                        }
                        alt={`${fnb.fnbName} poster`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/60x60?text=No+Image";
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>{fnb.fnbName}</StyledTableCell>
                    <StyledTableCell>
                      <TypeChip type={fnb.fnbType} />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {formatPrice(fnb.fnbListPrice)}
                    </StyledTableCell>
                    <StyledTableCell>
                      <StatusChip available={fnb.fnbAvailable} />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewClick(fnb.fnbId)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(fnb.fnbId)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteFnb(fnb.fnbId)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              {`Hiển thị ${fnbs.length} trên ${pagination.totalItems}`}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={page + 1}
                onChange={handleChangePage}
                color="primary"
                size="large"
                renderItem={(item) => (
                  <PaginationItem
                    slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                    {...item}
                  />
                )}
              />

              <FormControl variant="outlined" size="small">
                <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                  {[5, 10, 25].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </>
      )}

      {/* F&B Form Dialog */}
      <FnbForm
        open={openFnbForm}
        handleClose={handleCloseForm}
        fnb={selectedFnb}
        onSubmit={isEditMode ? editFnb : addFnb}
        isEdit={isEditMode}
        isViewOnly={isViewOnly}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Fnbs;
