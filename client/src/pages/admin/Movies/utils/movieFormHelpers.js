import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Format date for input fields (datetime-local) - ISO format required by HTML5
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // YYYY-MM-DDThh:mm format required by datetime-local input
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Parse date from input field value
export const parseInputDate = (dateString) => {
  if (!dateString) return new Date();
  return new Date(dateString);
};

// Format date for display with day before month (DD/MM/YYYY HH:MM)
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  // Convert to date object if it's a string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Explicitly format as DD/MM/YYYY HH:MM (day first, then month)
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Styled component for hiding file inputs visually
export const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Styled component for image preview box
export const ImagePreviewBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  border: `1px dashed ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}`,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover .image-controls': {
    opacity: 1,
  },
}));

// Styled component for image controls
export const ImageControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'flex-end',
  opacity: 0,
  transition: 'opacity 0.3s ease',
}));

// Menu props for select components
export const ITEM_HEIGHT = 48;
export const ITEM_PADDING_TOP = 8;
export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Add this to your existing helpers file
export const readOnlyStyles = {
  '.MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)', // Normal text color
    color: 'rgba(0, 0, 0, 0.87)',
  },
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.23) !important', // Normal border color
  },
  '.MuiInputLabel-root.Mui-disabled': {
    color: 'rgba(0, 0, 0, 0.6)', // Normal label color
  },
  '.MuiSelect-icon.Mui-disabled': {
    color: 'rgba(0, 0, 0, 0.54)', // Normal icon color
  },
  '.MuiChip-root': {
    opacity: 1, // Normal opacity for chips
  },
  // For dark mode compatibility
  '@media (prefers-color-scheme: dark)': {
    '.MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: 'rgba(255, 255, 255, 0.87)',
      color: 'rgba(255, 255, 255, 0.87)',
    },
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.23) !important',
    },
    '.MuiInputLabel-root.Mui-disabled': {
      color: 'rgba(255, 255, 255, 0.6)',
    },
    '.MuiSelect-icon.Mui-disabled': {
      color: 'rgba(255, 255, 255, 0.54)',
    },
  },
};