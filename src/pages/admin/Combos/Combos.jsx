import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  styled,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useCombos from "../../../hooks/useCombos";
import ComboForm from "./ComboForm";
import { formatPrice, formatPercent } from "../../../utils/formatters";

// Enhanced styling for table cells
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

// Add a styled component for combo images
const ComboImage = styled("img")({
  width: "60px",
  height: "60px",
  objectFit: "cover",
  borderRadius: 4,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
});

// Status chip component
const StatusChip = ({ status }) => {
  const theme = useTheme();
  let color = "default";
  let bgcolor, textColor;
  let statusText;

  // Handle boolean comboAvailable value
  if (typeof status === "boolean") {
    if (status) {
      bgcolor =
        theme.palette.mode === "light"
          ? alpha(theme.palette.success.main, 0.1)
          : alpha(theme.palette.success.main, 0.2);
      textColor = theme.palette.success.main;
      statusText = "Available";
    } else {
      bgcolor =
        theme.palette.mode === "light"
          ? alpha(theme.palette.error.main, 0.1)
          : alpha(theme.palette.error.main, 0.2);
      textColor = theme.palette.error.main;
      statusText = "Unavailable";
    }
  }

  return (
    <Chip
      label={statusText}
      size="small"
      sx={{
        bgcolor: bgcolor,
        color: textColor,
        fontWeight: 500,
        border: "none",
      }}
    />
  );
};

const Combos = () => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounce, setSearchDebounce] = useState("");

  // State for combo form
  const [openComboForm, setOpenComboForm] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // State for feedback messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Filter and sort states
  const [filters, setFilters] = useState({
    sorting: {
      sortBy: null,
      sortOrder: null,
    },
  });

  // Memoize the options for useCombos hook
  const comboOptions = useMemo(
    () => ({
      page: page + 1,
      limit: rowsPerPage,
      search: searchDebounce,
      sortBy: filters.sorting.sortBy,
      sortOrder: filters.sorting.sortOrder,
    }),
    [page, rowsPerPage, searchDebounce, filters.sorting]
  );

  // Use the custom hook
  const {
    combos,
    loading,
    error,
    pagination,
    addCombo,
    editCombo,
    removeCombo,
    getCombo,
    refreshCombos,
    getComboDetails,
    getComboWithDetails,
  } = useCombos(comboOptions);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle add combo button click
  const handleAddComboClick = () => {
    setSelectedCombo(null);
    setIsEditMode(false);
    setIsViewOnly(false);
    setOpenComboForm(true);
  };

  // Handle edit combo
  const handleEditClick = async (combo) => {
    try {
      console.log("Edit clicked for combo ID:", combo.comboId);

      // Lấy combo kèm chi tiết từ API
      const fullComboData = await getComboWithDetails(combo.comboId);
      console.log("Full combo data with details:", fullComboData);

      setSelectedCombo(fullComboData);
      setIsEditMode(true);
      setIsViewOnly(false);
      setOpenComboForm(true);
    } catch (error) {
      console.error("Edit combo error:", error);
      showSnackbar("Failed to load combo information", "error");
    }
  };

  // Handle view combo
  const handleViewClick = async (combo) => {
    try {
      console.log("View clicked for combo ID:", combo.comboId);

      // Lấy combo kèm chi tiết từ API
      const fullComboData = await getComboWithDetails(combo.comboId);
      console.log("Full combo data with details:", fullComboData);

      setSelectedCombo(fullComboData);
      setIsViewOnly(true);
      setIsEditMode(false);
      setOpenComboForm(true);
    } catch (error) {
      console.error("View combo error:", error);
      showSnackbar("Failed to load combo information", "error");
    }
  };

  // Handle form close
  const handleCloseForm = () => {
    setOpenComboForm(false);
    setSelectedCombo(null);
    setIsEditMode(false);
    setIsViewOnly(false);
  };

  // Handle combo form submission
  const handleSubmitCombo = async (formData) => {
    try {
      if (isEditMode) {
        await editCombo(selectedCombo.comboId, formData);
        showSnackbar("Combo updated successfully");
      } else {
        await addCombo(formData);
        showSnackbar("Combo created successfully");
      }
      handleCloseForm();
      refreshCombos();
    } catch (error) {
      showSnackbar(error.message || "Error saving combo", "error");
    }
  };

  // Handle delete combo
  const handleDeleteCombo = async (id) => {
    try {
      await removeCombo(id);
      showSnackbar("Combo deleted successfully");
      refreshCombos();
    } catch (error) {
      showSnackbar(error.message || "Error deleting combo", "error");
    }
  };

  // Snackbar helpers
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Combos Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddComboClick}
          sx={{ borderRadius: 2 }}
        >
          Add Combo
        </Button>
      </Stack>

      {/* Search Box */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search combos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>Image</StyledTableCell>
              <StyledTableCell>Name</StyledTableCell>
              <StyledTableCell>Discount</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combos.map((combo) => (
              <StyledTableRow key={combo.comboId}>
                <StyledTableCell>{combo.comboId}</StyledTableCell>
                <StyledTableCell>
                  <ComboImage src={combo.comboImage} alt={combo.comboName} />
                </StyledTableCell>
                <StyledTableCell>{combo.comboName}</StyledTableCell>
                <StyledTableCell>
                  {formatPercent(combo.comboDiscount)}
                </StyledTableCell>
                <StyledTableCell>
                  <StatusChip status={combo.comboAvailable} />
                </StyledTableCell>
                <StyledTableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton onClick={() => handleViewClick(combo)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditClick(combo)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDeleteCombo(combo.comboId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={pagination.totalItems}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Combo Form Dialog */}
      <ComboForm
        open={openComboForm}
        handleClose={handleCloseForm}
        combo={selectedCombo}
        onSubmit={handleSubmitCombo}
        isEdit={isEditMode}
        isViewOnly={isViewOnly}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Combos;
