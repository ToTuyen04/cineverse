// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   Box,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TablePagination,
//   Button,
//   Typography,
//   TextField,
//   IconButton,
//   Tooltip,
//   Chip,
//   styled,
//   useTheme,
//   alpha,
//   Snackbar,
//   Alert,
//   Stack,
//   TableSortLabel,
//   CircularProgress,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import useCombos from "../../../hooks/useCombos";
// import ComboForm from "./ComboForm";
// import { formatPrice, formatPercent } from "../../../utils/formatters";

// // Enhanced styling for table cells
// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   borderBottom: `1px solid ${
//     theme.palette.mode === "light"
//       ? "rgba(0, 0, 0, 0.15)"
//       : "rgba(255, 255, 255, 0.15)"
//   }`,
//   color: theme.palette.text.primary,
//   padding: "16px",
//   fontWeight: theme.palette.mode === "light" ? 500 : 400,
// }));

// // Enhanced table row styling
// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   "&:nth-of-type(odd)": {
//     backgroundColor:
//       theme.palette.mode === "light"
//         ? alpha(theme.palette.primary.main, 0.03)
//         : alpha(theme.palette.common.white, 0.03),
//   },
//   "& td": {
//     borderBottom: `1px solid ${
//       theme.palette.mode === "light"
//         ? "rgba(0, 0, 0, 0.15)"
//         : "rgba(255, 255, 255, 0.15)"
//     }`,
//   },
//   "&:hover": {
//     backgroundColor: alpha(theme.palette.primary.main, 0.08) + " !important",
//     cursor: "pointer",
//   },
// }));

// // Add a styled component for combo images
// const ComboImage = styled("img")({
//   width: "60px",
//   height: "60px",
//   objectFit: "cover",
//   borderRadius: 4,
//   boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// });

// // Status chip component
// const StatusChip = ({ status }) => {
//   const theme = useTheme();
//   let color = "default";
//   let bgcolor, textColor;
//   let statusText;

//   // Handle boolean comboAvailable value
//   if (typeof status === "boolean") {
//     if (status) {
//       bgcolor =
//         theme.palette.mode === "light"
//           ? alpha(theme.palette.success.main, 0.1)
//           : alpha(theme.palette.success.main, 0.2);
//       textColor = theme.palette.success.main;
//       statusText = "Available";
//     } else {
//       bgcolor =
//         theme.palette.mode === "light"
//           ? alpha(theme.palette.error.main, 0.1)
//           : alpha(theme.palette.error.main, 0.2);
//       textColor = theme.palette.error.main;
//       statusText = "Unavailable";
//     }
//   }

//   return (
//     <Chip
//       label={statusText}
//       size="small"
//       sx={{
//         bgcolor: bgcolor,
//         color: textColor,
//         fontWeight: 500,
//         border: "none",
//       }}
//     />
//   );
// };

// const Combos = () => {
//   const theme = useTheme();
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchDebounce, setSearchDebounce] = useState("");

//   // Add sorting state
//   const [sortField, setSortField] = useState("comboId");
//   const [sortDirection, setSortDirection] = useState("asc");

//   // State for combo form
//   const [openComboForm, setOpenComboForm] = useState(false);
//   const [selectedCombo, setSelectedCombo] = useState(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isViewOnly, setIsViewOnly] = useState(false);

//   // State for feedback messages
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   // Filter and sort states - replace with our new sorting state
//   const [filters, setFilters] = useState({
//     sorting: {
//       sortBy: sortField,
//       sortOrder: sortDirection,
//     },
//   });

//   // Update filters when sort parameters change
//   useEffect(() => {
//     setFilters((prev) => ({
//       ...prev,
//       sorting: {
//         sortBy: sortField,
//         sortOrder: sortDirection,
//       },
//     }));
//   }, [sortField, sortDirection]);

//   // Memoize the options for useCombos hook
//   const comboOptions = useMemo(
//     () => ({
//       page: page + 1,
//       limit: rowsPerPage,
//       search: searchDebounce,
//       sortBy: sortField,
//       sortOrder: sortDirection,
//     }),
//     [page, rowsPerPage, searchDebounce, sortField, sortDirection]
//   );

//   // Use the custom hook
//   const {
//     combos,
//     loading,
//     error,
//     pagination,
//     addCombo,
//     editCombo,
//     removeCombo,
//     getCombo,
//     refreshCombos,
//     getComboDetails,
//     getComboWithDetails,
//   } = useCombos(comboOptions);

//   // Handle search with debounce
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setSearchDebounce(searchTerm);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [searchTerm]);

//   // Handle add combo button click
//   const handleAddComboClick = () => {
//     setSelectedCombo(null);
//     setIsEditMode(false);
//     setIsViewOnly(false);
//     setOpenComboForm(true);
//   };

//   // Handle edit combo
//   const handleEditClick = async (combo) => {
//     try {
//       console.log("Edit clicked for combo ID:", combo.comboId);

//       // Lấy combo kèm chi tiết từ API
//       const fullComboData = await getComboWithDetails(combo.comboId);
//       console.log("Full combo data with details:", fullComboData);

//       setSelectedCombo(fullComboData);
//       setIsEditMode(true);
//       setIsViewOnly(false);
//       setOpenComboForm(true);
//     } catch (error) {
//       console.error("Edit combo error:", error);
//       showSnackbar("Failed to load combo information", "error");
//     }
//   };

//   // Handle view combo
//   const handleViewClick = async (combo) => {
//     try {
//       console.log("View clicked for combo ID:", combo.comboId);

//       // Lấy combo kèm chi tiết từ API
//       const fullComboData = await getComboWithDetails(combo.comboId);
//       console.log("Full combo data with details:", fullComboData);

//       setSelectedCombo(fullComboData);
//       setIsViewOnly(true);
//       setIsEditMode(false);
//       setOpenComboForm(true);
//     } catch (error) {
//       console.error("View combo error:", error);
//       showSnackbar("Failed to load combo information", "error");
//     }
//   };

//   // Handle form close
//   const handleCloseForm = () => {
//     setOpenComboForm(false);
//     setSelectedCombo(null);
//     setIsEditMode(false);
//     setIsViewOnly(false);
//   };

//   // Handle combo form submission
//   const handleSubmitCombo = async (formData) => {
//     try {
//       if (isEditMode) {
//         await editCombo(selectedCombo.comboId, formData);
//         showSnackbar("Combo updated successfully");
//       } else {
//         await addCombo(formData);
//         showSnackbar("Combo created successfully");
//       }
//       handleCloseForm();
//       refreshCombos();
//     } catch (error) {
//       showSnackbar(error.message || "Error saving combo", "error");
//     }
//   };

//   // Handle delete combo
//   const handleDeleteCombo = async (id) => {
//     try {
//       await removeCombo(id);
//       showSnackbar("Combo deleted successfully");
//       refreshCombos();
//     } catch (error) {
//       showSnackbar(error.message || "Error deleting combo", "error");
//     }
//   };

//   // Snackbar helpers
//   const showSnackbar = (message, severity = "success") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   // Pagination handlers
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Add client-side sorted data state as a fallback
//   const [sortedCombos, setSortedCombos] = useState([]);
  
//   // Add handle sort request function - enhance to sort client-side as a fallback
//   const handleRequestSort = (field) => {
//     const isAsc = sortField === field && sortDirection === "asc";
//     const newDirection = isAsc ? "desc" : "asc";

//     // Update sort parameters
//     setSortDirection(newDirection);
//     setSortField(field);
//     setPage(0); // Reset to first page when sorting changes
    
//     // Show feedback while sorting
//     showSnackbar(`Sorting all items by ${field} (${newDirection})...`, "info");
    
//     // Client-side sorting as immediate feedback
//     const sorted = [...combos].sort((a, b) => {
//       const aValue = a[field];
//       const bValue = b[field];
      
//       // If values are the same, don't change order
//       if (aValue === bValue) return 0;
      
//       // Handle special fields
//       if (field === "comboDiscount") {
//         const aNum = parseFloat(aValue) || 0;
//         const bNum = parseFloat(bValue) || 0;
//         return newDirection === "asc" ? aNum - bNum : bNum - aNum;
//       }
      
//       // For boolean values (like comboAvailable)
//       if (typeof aValue === "boolean") {
//         return newDirection === "asc" 
//           ? (aValue === bValue ? 0 : aValue ? -1 : 1)
//           : (aValue === bValue ? 0 : aValue ? 1 : -1);
//       }
      
//       // Default string comparison
//       const result = String(aValue).localeCompare(String(bValue));
//       return newDirection === "asc" ? result : -result;
//     });
    
//     setSortedCombos(sorted);
    
//     // Force refresh data with new sort parameters
//     refreshCombos().then(() => {
//       console.log("Server-side sorting complete");
//       showSnackbar(`Successfully sorted by ${field} (${newDirection})`, "success");
//     }).catch((error) => {
//       console.error("Error sorting data:", error);
//       showSnackbar(`Using client-side sorting for ${field}`, "warning");
//     });
//   };

//   // Add effect to store sorted data when combos changes
//   useEffect(() => {
//     if (combos && combos.length > 0) {
//       const sorted = [...combos].sort((a, b) => {
//         try {
//           const aValue = a[sortField];
//           const bValue = b[sortField];
          
//           // Handle different data types appropriately
//           if (typeof aValue === 'number' && typeof bValue === 'number') {
//             return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
//           }
          
//           if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
//             return sortDirection === 'asc' 
//               ? (aValue === bValue ? 0 : aValue ? -1 : 1) 
//               : (aValue === bValue ? 0 : aValue ? 1 : -1);
//           }
          
//           // Default to string comparison
//           const result = String(aValue || '').localeCompare(String(bValue || ''));
//           return sortDirection === 'asc' ? result : -result;
//         } catch (err) {
//           console.error(`Error sorting by ${sortField}:`, err);
//           return 0;
//         }
//       });
      
//       setSortedCombos(sorted);
//       console.log(`Sorted ${sorted.length} combos by ${sortField} (${sortDirection})`);
//     }
//   }, [combos, sortField, sortDirection]);

//   // Add effect to refresh data when page, rowsPerPage, or search changes
//   useEffect(() => {
//     refreshCombos().catch(error => {
//       console.error("Error refreshing data:", error);
//       showSnackbar("Failed to fetch data. Please try again.", "error");
//     });
//   }, [page, rowsPerPage, searchDebounce]);

//   return (
//     <Box sx={{ width: "100%", p: 3 }}>
//       {/* Header */}
//       <Stack
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//         spacing={2}
//         sx={{ mb: 3 }}
//       >
//         <Typography variant="h4" component="h1" fontWeight="bold">
//           Quản lý combo
//         </Typography>

//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={handleAddComboClick}
//           sx={{ borderRadius: 2 }}
//         >
//           Tạo combo mới
//         </Button>
//       </Stack>

//       {/* Search Box */}
//       <TextField
//         fullWidth
//         variant="outlined"
//         placeholder="Tìm kiểm theo tên combo..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         sx={{ mb: 3 }}
//       />

//       {/* Table */}
//       <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <StyledTableCell>
//                 <TableSortLabel
//                   active={sortField === "comboId"}
//                   direction={sortField === "comboId" ? sortDirection : "asc"}
//                   onClick={() => handleRequestSort("comboId")}
//                 >
//                   ID
//                 </TableSortLabel>
//               </StyledTableCell>
//               <StyledTableCell>Hình ảnh</StyledTableCell>
//               <StyledTableCell>
//                 <TableSortLabel
//                   active={sortField === "comboName"}
//                   direction={sortField === "comboName" ? sortDirection : "asc"}
//                   onClick={() => handleRequestSort("comboName")}
//                 >
//                   Tên
//                 </TableSortLabel>
//               </StyledTableCell>
//               <StyledTableCell>
//                 <TableSortLabel
//                   active={sortField === "comboDiscount"}
//                   direction={sortField === "comboDiscount" ? sortDirection : "asc"}
//                   onClick={() => handleRequestSort("comboDiscount")}
//                 >
//                   Giảm giá
//                 </TableSortLabel>
//               </StyledTableCell>
//               <StyledTableCell>
//                 <TableSortLabel
//                   active={sortField === "comboAvailable"}
//                   direction={sortField === "comboAvailable" ? sortDirection : "asc"}
//                   onClick={() => handleRequestSort("comboAvailable")}
//                 >
//                   Trạng thái
//                 </TableSortLabel>
//               </StyledTableCell>
//               <StyledTableCell align="right">Chức năng</StyledTableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {loading ? (
//               <TableRow>
//                 <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
//                     <CircularProgress />
//                     <Typography variant="body2" color="text.secondary">
//                       {sortField !== "comboId" ? `Sorting by ${sortField} (${sortDirection})...` : "Loading combos..."}
//                     </Typography>
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             ) : combos.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
//                   <Typography variant="body1">No combos found</Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               // Use sortedCombos when available, otherwise fallback to regular combos
//               (sortedCombos.length > 0 ? sortedCombos : combos).map((combo) => (
//                 <StyledTableRow 
//                   key={combo.comboId}
//                   onClick={() => handleViewClick(combo)}
//                   sx={{ cursor: 'pointer' }}
//                 >
//                   <StyledTableCell>{combo.comboId}</StyledTableCell>
//                   <StyledTableCell>
//                     <ComboImage src={combo.comboImage} alt={combo.comboName} />
//                   </StyledTableCell>
//                   <StyledTableCell>{combo.comboName}</StyledTableCell>
//                   <StyledTableCell>
//                     {formatPercent(combo.comboDiscount)}
//                   </StyledTableCell>
//                   <StyledTableCell>
//                     <StatusChip status={combo.comboAvailable} />
//                   </StyledTableCell>
//                   <StyledTableCell align="right" onClick={(e) => e.stopPropagation()}>
//                     <Tooltip title="View Details">
//                       <IconButton 
//                         onClick={() => handleViewClick(combo)}
//                         color="info" // Changed to info color to match Vouchers
//                         sx={{
//                           backgroundColor: alpha(theme.palette.info.main, 0.1),
//                           mr: 1,
//                           '&:hover': {
//                             backgroundColor: alpha(theme.palette.info.main, 0.2),
//                           }
//                         }}
//                       >
//                         <VisibilityIcon />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Edit">
//                       <IconButton 
//                         onClick={() => handleEditClick(combo)}
//                         color="error" // Keep edit button as red
//                         sx={{
//                           backgroundColor: alpha(theme.palette.error.main, 0.1),
//                           mr: 1,
//                           '&:hover': {
//                             backgroundColor: alpha(theme.palette.error.main, 0.2),
//                           }
//                         }}
//                       >
//                         <EditIcon />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Delete">
//                       <IconButton
//                         onClick={() => handleDeleteCombo(combo.comboId)}
//                         sx={{
//                           color: theme.palette.grey[700],
//                           backgroundColor: alpha(theme.palette.grey[500], 0.1),
//                           '&:hover': {
//                             backgroundColor: alpha(theme.palette.grey[700], 0.2),
//                           }
//                         }}
//                       >
//                         <DeleteIcon />
//                       </IconButton>
//                     </Tooltip>
//                   </StyledTableCell>
//                 </StyledTableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Add sort indicator with more useful information - enhanced with debug info */}
//       <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
//           Showing {combos.length} of {pagination.totalItems} combos, sorted by {sortField} ({sortDirection})
//           {sortedCombos.length > 0 && sortedCombos.length !== combos.length && 
//             ` | Client-side sorted: ${sortedCombos.length} items`}
//         </Typography>
        
//         {loading && (
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <CircularProgress size={16} />
//             <Typography variant="body2" color="text.secondary">
//               Refreshing...
//             </Typography>
//           </Box>
//         )}
//       </Box>

//       {/* Pagination */}
//       <TablePagination
//         component="div"
//         count={pagination.totalItems}
//         page={page}
//         onPageChange={handleChangePage}
//         rowsPerPage={rowsPerPage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//         rowsPerPageOptions={[5, 10, 25]}
//       />

//       {/* Combo Form Dialog */}
//       <ComboForm
//         open={openComboForm}
//         handleClose={handleCloseForm}
//         combo={selectedCombo}
//         onSubmit={handleSubmitCombo}
//         isEdit={isEditMode}
//         isViewOnly={isViewOnly}
//       />

//       {/* Snackbar for feedback */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           variant="filled"
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default Combos;
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
          Quản lý combo
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddComboClick}
          sx={{ borderRadius: 2 }}
        >
          Tạo combo mới
        </Button>
      </Stack>

      {/* Search Box */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Tìm kiểm theo tên combo..."
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
              <StyledTableCell>Hình ảnh</StyledTableCell>
              <StyledTableCell>Tên</StyledTableCell>
              <StyledTableCell>Giảm giá</StyledTableCell>
              <StyledTableCell>Trạng thái</StyledTableCell>
              <StyledTableCell align="right">Chức năng</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {combos.map((combo) => (
              <StyledTableRow 
                key={combo.comboId}
                onClick={() => handleViewClick(combo)}
                sx={{ cursor: 'pointer' }}
              >
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
                <StyledTableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="View Details">
                    <IconButton 
                      onClick={() => handleViewClick(combo)}
                      color="info" // Changed to info color to match Vouchers
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        mr: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.2),
                        }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => handleEditClick(combo)}
                      color="error" // Keep edit button as red
                      sx={{
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        mr: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.2),
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDeleteCombo(combo.comboId)}
                      sx={{
                        color: theme.palette.grey[700],
                        backgroundColor: alpha(theme.palette.grey[500], 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.grey[700], 0.2),
                        }
                      }}
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
