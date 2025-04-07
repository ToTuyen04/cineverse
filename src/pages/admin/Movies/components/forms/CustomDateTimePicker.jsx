import React from 'react';
import { TextField, Box } from '@mui/material';
import { formatDateForInput } from '../../utils/movieFormHelpers';

const CustomDateTimePicker = ({ 
  label, 
  value, 
  onChange, 
  error, 
  helperText, 
  name,
  fullWidth = true,
  required = false
}) => {
  // Use the existing helper for formatting date as ISO string
  const formattedDate = formatDateForInput(value);
  
  const handleDateChange = (e) => {
    const dateValue = e.target.value;
    // Convert the string back to a Date object
    const dateObj = new Date(dateValue);
    
    // Call the onChange with a synthetic event that mimics the DatePicker event format
    onChange({
      target: {
        name,
        value: dateObj
      }
    });
  };
  
  return (
    <Box>
      <TextField
        fullWidth={fullWidth}
        label={label}
        type="datetime-local"
        name={name}
        value={formattedDate}
        onChange={handleDateChange}
        error={error}
        helperText={helperText}
        InputLabelProps={{ 
          shrink: true,
        }}
        required={required}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1
          }
        }}
      />
    </Box>
  );
};

export default CustomDateTimePicker;
