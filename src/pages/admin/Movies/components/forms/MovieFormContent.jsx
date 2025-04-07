import React from 'react';
import { Grid, TextField, Typography, Box, Paper } from '@mui/material';
import { readOnlyStyles } from '../../utils/movieFormHelpers';

const MovieFormContent = ({ formData, handleInputChange, errors, disabled }) => {
  return (
    <>
      <Grid item xs={12} mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Mô tả nội dung phim
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {disabled && formData.movieContent ? (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Movie Description
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: 'background.default',
                minHeight: '100px',
                whiteSpace: 'pre-wrap',
                overflowY: 'auto',
                maxHeight: '300px'
              }}
            >
              <Typography variant="body1">
                {formData.movieContent}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mô tả..."
            name="movieContent"
            value={formData.movieContent}
            onChange={disabled ? undefined : handleInputChange}
            error={!!errors.movieContent}
            helperText={errors.movieContent}
            variant="outlined"
            disabled={disabled}
            sx={disabled ? readOnlyStyles : {}}
            InputProps={{
              readOnly: disabled,
            }}
          />
        )}
      </Grid>
    </>
  );
};

export default MovieFormContent;
