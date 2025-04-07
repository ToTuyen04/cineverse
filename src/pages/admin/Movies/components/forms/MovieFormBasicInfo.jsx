import React from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput, 
  Box, 
  Chip,
  CircularProgress
} from '@mui/material';
import { MenuProps } from '../../utils/movieFormHelpers';
import CancelIcon from '@mui/icons-material/Cancel';

// Define custom styles for view-only fields
const readOnlyStyles = {
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
};

const MovieFormBasicInfo = ({ 
  formData, 
  handleInputChange, 
  handleGenreChange, 
  handleGenreDelete,
  errors, 
  genres, 
  loading, 
  isEdit, 
  getGenreName,
  disabled
}) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {/* Basic Information */}
        </Typography>
      </Grid>
      
      {/* Movie ID field - only visible in edit mode */}
      {isEdit && (
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Movie ID"
            name="movieId"
            value={formData.movieId || ''}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
        </Grid>
      )}
      
      <Grid item xs={12} md={isEdit ? 8 : 8}>
        <TextField
          fullWidth
          label="Tiêu đề"
          name="movieName"
          value={formData.movieName}
          onChange={disabled ? undefined : handleInputChange}
          error={!!errors.movieName}
          helperText={errors.movieName}
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
          label="Thời lượng (phút)"
          name="movieDuration"
          type="number"
          value={formData.movieDuration}
          onChange={disabled ? undefined : handleInputChange}
          error={!!errors.movieDuration}
          helperText={errors.movieDuration}
          variant="outlined"
          InputProps={{ 
            inputProps: { min: 1 },
            readOnly: disabled,
          }}
          disabled={disabled}
          sx={disabled ? readOnlyStyles : {}}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl 
          fullWidth 
          error={!!errors.genreIds} 
          disabled={disabled}
          sx={disabled ? readOnlyStyles : {}}
        >
          <InputLabel id="genres-label">Thể loại</InputLabel>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Select
              labelId="genres-label"
              id="genres"
              multiple
              value={formData.genreIds}
              onChange={disabled ? undefined : handleGenreChange}
              input={<OutlinedInput label="Genres" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={getGenreName(value)}
                      deleteIcon={disabled ? undefined : <CancelIcon onMouseDown={(event) => event.stopPropagation()} />}
                      onDelete={disabled ? undefined : () => handleGenreDelete(value)}
                      sx={disabled ? { opacity: 1 } : {}}
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {genres
                .filter(genre => !formData.genreIds.includes(genre.genresId))
                .map((genre) => (
                  <MenuItem key={genre.genresId} value={genre.genresId}>
                    {genre.genresName}
                  </MenuItem>
                ))
              }
            </Select>
          )}
          {errors.genreIds && <Typography color="error" variant="caption" sx={{mt: 0.5, ml: 2}}>{errors.genreIds}</Typography>}
        </FormControl>
      </Grid>
    </>
  );
};

export default MovieFormBasicInfo;