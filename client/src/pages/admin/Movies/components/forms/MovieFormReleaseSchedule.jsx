import React from 'react';
import { Grid, TextField, Typography, InputAdornment } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatDateForDisplay } from '../../utils/movieFormHelpers';

const MovieFormReleaseSchedule = ({ formData, handleDateInputChange, errors, formatDateForInput, isEdit }) => {
  return (
    <>
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Lịch phát hành
        </Typography>
      </Grid>
      
      {/* Only show creation date field when editing an existing movie */}
      {isEdit && (
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Ngày tạo phim"
            name="movieCreatAt"
            type="datetime-local"
            value={formatDateForInput(formData.movieCreatAt)}
            onChange={handleDateInputChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            helperText={formData.movieCreatAt ? `Shown as: ${formatDateForDisplay(formData.movieCreatAt)}` : ''}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      )}
      
      <Grid item xs={12} md={isEdit ? 4 : 6}>
        <TextField
          fullWidth
          label="Ngày công chiếu"
          name="movieStartAt"
          type="datetime-local"
          value={formatDateForInput(formData.movieStartAt)}
          onChange={handleDateInputChange}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          helperText={formData.movieStartAt ? `Selected date: ${formatDateForDisplay(formData.movieStartAt)}` : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={isEdit ? 4 : 6}>
        <TextField
          fullWidth
          label="Ngày kế thúc"
          name="movieEndAt"
          type="datetime-local"
          value={formatDateForInput(formData.movieEndAt)}
          onChange={handleDateInputChange}
          error={!!errors.movieEndAt}
          helperText={errors.movieEndAt || (formData.movieEndAt ? `Selected date: ${formatDateForDisplay(formData.movieEndAt)}` : '')}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarTodayIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </>
  );
};

export default MovieFormReleaseSchedule;
