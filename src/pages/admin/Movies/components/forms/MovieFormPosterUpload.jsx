import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { VisuallyHiddenInput, ImagePreviewBox, ImageControls } from '../../utils/movieFormHelpers';

const MovieFormPosterUpload = ({
  posterPreview,
  handleFileChange,
  handleRemoveImage,
  errors,
  disabled
}) => {
  return (
    <>
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Ảnh phim
        </Typography>
        <ImagePreviewBox>
          {posterPreview ? (
            <>
              <Box
                component="img"
                src={posterPreview}
                alt="Poster Preview"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {/* Hide controls when in view-only mode */}
              {!disabled && (
                <ImageControls className="image-controls">
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{ mr: 1 }}
                  >
                    Remove
                  </Button>
                  <Button
                    component="label"
                    variant="contained"
                    size="small"
                  >
                    Change
                    <VisuallyHiddenInput type="file" onChange={(e) => handleFileChange(e.target.files[0])} />
                  </Button>
                </ImageControls>
              )}
            </>
          ) : (
            <>
              {!disabled ? (
                <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                  Upload Poster
                  <VisuallyHiddenInput type="file" onChange={(e) => handleFileChange(e.target.files[0])} />
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No poster available
                </Typography>
              )}
            </>
          )}
        </ImagePreviewBox>
        {errors.moviePoster && (
          <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
            {errors.moviePoster}
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default MovieFormPosterUpload;
