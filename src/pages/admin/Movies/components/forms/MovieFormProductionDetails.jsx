import React from 'react';
import { Grid, TextField, Typography, Box, Link } from '@mui/material';
import { readOnlyStyles } from '../../utils/movieFormHelpers';

const MovieFormProductionDetails = ({ formData, handleInputChange, errors, disabled }) => {
  return (
    <>
      <Grid item xs={12} mt={2}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Chi tiết phim
        </Typography>
      </Grid>

      <Grid item xs={12}>
        {disabled && formData.movieTrailer ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Trailer URL
            </Typography>
            <Link 
              href={formData.movieTrailer} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                display: 'block', 
                wordBreak: 'break-all',
                typography: 'body1',
                color: 'primary.main'
              }}
            >
              {formData.movieTrailer}
            </Link>
          </Box>
        ) : (
          <TextField
            fullWidth
            label="Trailer URL"
            name="movieTrailer"
            value={formData.movieTrailer}
            onChange={disabled ? undefined : handleInputChange}
            error={!!errors.movieTrailer}
            helperText={errors.movieTrailer || "Enter YouTube video URL"}
            variant="outlined"
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={disabled}
            sx={disabled ? readOnlyStyles : {}}
            InputProps={{
              readOnly: disabled,
            }}
          />
        )}
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Đạo diễn"
          name="movieDirector"
          value={formData.movieDirector || ''}
          onChange={disabled ? undefined : handleInputChange}
          error={!!errors.movieDirector}
          helperText={errors.movieDirector}
          variant="outlined"
          disabled={disabled}
          sx={disabled ? readOnlyStyles : {}}
          InputProps={{
            readOnly: disabled,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Diễn viên"
          name="movieActor"
          value={formData.movieActor || ''}
          onChange={disabled ? undefined : handleInputChange}
          error={!!errors.movieActor}
          helperText={errors.movieActor}
          variant="outlined"
          disabled={disabled}
          sx={disabled ? readOnlyStyles : {}}
          InputProps={{
            readOnly: disabled,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Phòng thu"
          name="movieBrand"
          value={formData.movieBrand || ''}
          onChange={disabled ? undefined : handleInputChange}
          error={!!errors.movieBrand}
          helperText={errors.movieBrand}
          variant="outlined"
          disabled={disabled}
          sx={disabled ? readOnlyStyles : {}}
          InputProps={{
            readOnly: disabled,
          }}
        />
      </Grid>
    </>
  );
};

export default MovieFormProductionDetails;
