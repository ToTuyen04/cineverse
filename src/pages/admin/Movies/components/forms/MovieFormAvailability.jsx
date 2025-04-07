import React from 'react';
import { 
  Grid, 
  Typography, 
  FormControlLabel, 
  Switch,
} from '@mui/material';
import { readOnlyStyles } from '../../utils/movieFormHelpers';

/**
 * Component for toggling movie availability status
 */
const MovieFormAvailability = ({ 
  formData, 
  handleAvailabilityChange, 
  errors,
  disabled
}) => {
  return (
    <>
      <Grid item xs={12} mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Khả dụng
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.movieAvailable}
              onChange={disabled ? undefined : handleAvailabilityChange}
              name="movieAvailable"
              color="primary"
              disabled={disabled}
              sx={{
                '& .Mui-disabled': {
                  opacity: 1,
                  '& .MuiSwitch-thumb': {
                    backgroundColor: formData.movieAvailable ? '#90caf9' : undefined,
                  },
                  '& .MuiSwitch-track': {
                    opacity: formData.movieAvailable ? 0.5 : 0.3,
                    backgroundColor: formData.movieAvailable ? '#90caf9 !important' : undefined,
                  },
                },
              }}
            />
          }
          label={
            <Typography 
              variant="body1" 
              sx={disabled ? { color: 'text.primary', opacity: 1 } : {}}
            >
              {formData.movieAvailable ? 'Khách hàng có thể xem và theo dõi' : 'Khách hàng không thể xem và theo dõi'}
            </Typography>
          }
        />
      </Grid>
    </>
  );
};

export default MovieFormAvailability;
