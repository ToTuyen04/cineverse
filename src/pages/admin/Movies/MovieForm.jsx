import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
  Grid,
  Box,
  TextField,
  CircularProgress
} from '@mui/material';
import { getAllGenres } from '../../../api/services/movieService';
import MovieFormBasicInfo from './components/forms/MovieFormBasicInfo';
import MovieFormPosterUpload from './components/forms/MovieFormPosterUpload';
import MovieFormProductionDetails from './components/forms/MovieFormProductionDetails';
import MovieFormReleaseSchedule from './components/forms/MovieFormReleaseSchedule';
import MovieFormContent from './components/forms/MovieFormContent';
import MovieFormAvailability from './components/forms/MovieFormAvailability';
import { parseInputDate, formatDateForInput, formatDateForDisplay } from './utils/movieFormHelpers';

const MovieForm = ({ open, handleClose, movie, onSubmit, isEdit = false, isViewOnly = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    movieId: '',
    movieName: '',
    moviePoster: '',
    movieCreatAt: new Date(),
    movieStartAt: new Date(),
    movieEndAt: new Date(),
    movieActor: '',
    movieDirector: '',
    movieBrand: '',
    movieDuration: 0,
    movieVersion: 1,
    movieContent: '',
    movieCreatedBy: 1,
    movieUpdateBy: 1,
    movieTrailer: '',
    genreIds: [],
    movieAvailable: true // Default to available
  });
  
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch all genres when component mounts
  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      try {
        const genresData = await getAllGenres();
        setGenres(genresData);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Reset form function to clear all data
  const resetForm = () => {
    setFormData({
      movieId: '',
      movieName: '',
      moviePoster: '',
      movieCreatAt: '',
      movieStartAt: '',
      movieEndAt: '',
      movieActor: '',
      movieDirector: '',
      movieBrand: '',
      movieDuration: '',
      movieVersion: 1,
      movieContent: '',
      movieCreatedBy: 1,
      movieUpdateBy: 1,
      movieTrailer: '',
      genreIds: [],
      movieAvailable: true // Default to available
    });
    
    setPosterPreview('');
    setPosterFile(null);
    setErrors({});
  };
  
  // Initialize form with movie data or reset for new movie
  useEffect(() => {
    if (isEdit && movie) {
      setFormData({
        movieId: movie.movieId,
        movieName: movie.movieName || '',
        moviePoster: movie.moviePoster || '',
        movieCreatAt: movie.movieCreatAt ? new Date(movie.movieCreatAt) : new Date(),
        movieStartAt: movie.movieStartAt ? new Date(movie.movieStartAt) : new Date(),
        movieEndAt: movie.movieEndAt ? new Date(movie.movieEndAt) : new Date(),
        movieActor: movie.movieActor || '',
        movieDirector: movie.movieDirector || '',
        movieBrand: movie.movieBrand || '',
        movieDuration: movie.movieDuration || 0,
        movieVersion: movie.movieVersion || 1,
        movieContent: movie.movieContent || '',
        movieCreatedBy: movie.movieCreatedBy || 1,
        movieUpdateBy: movie.movieUpdateBy || 1,
        movieTrailer: movie.movieTrailer || '',
        genreIds: movie.genreIds || [],
        movieAvailable: movie.movieAvailable !== undefined ? movie.movieAvailable : true
      });
      
      if (movie.moviePoster) {
        setPosterPreview(movie.moviePoster);
      } else {
        setPosterPreview('');
      }
      
      setPosterFile(null);
    } else {
      // For new movie, completely reset the form
      resetForm();
    }
  }, [isEdit, movie, open]);
  
  // Handle dialog close with form reset
  const handleDialogClose = () => {
    if (!isSubmitting) {
      resetForm();
      handleClose();
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleDateInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInputDate(value)
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleGenreChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      genreIds: value
    });
    if (errors.genreIds) {
      setErrors({
        ...errors,
        genreIds: null
      });
    }
  };
  
  const handleGenreDelete = (genreIdToDelete) => {
    const updatedGenreIds = formData.genreIds.filter(
      (genreId) => genreId !== genreIdToDelete
    );
    
    setFormData({
      ...formData,
      genreIds: updatedGenreIds
    });
    
    if (errors.genreIds && updatedGenreIds.length > 0) {
      setErrors({
        ...errors,
        genreIds: null
      });
    }
  };
  
  const handleFileChange = (file) => {
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setErrors({
        ...errors,
        moviePoster: 'Please select an image file'
      });
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        moviePoster: 'Image size should be less than 5MB'
      });
      return;
    }
    
    setPosterFile(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    if (errors.moviePoster) {
      setErrors({
        ...errors,
        moviePoster: null
      });
    }
  };
  
  const handleRemoveImage = () => {
    setPosterFile(null);
    setPosterPreview('');
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.movieName) newErrors.movieName = 'Tiêu đề phim không được để trống!';
    if (formData.movieDuration <= 0) newErrors.movieDuration = 'Thời lượng phim phải lớn hơn 0!';
    if (!formData.movieContent) newErrors.movieContent = 'Nội dung phim không được để trống!';
    if (formData.genreIds.length === 0) newErrors.genreIds = 'Vui lòng chọn ít nhất 1 thể loại phim';
    
    if (formData.movieStartAt > formData.movieEndAt) {
      newErrors.movieEndAt = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    if (formData.movieTrailer && !formData.movieTrailer.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
      newErrors.movieTrailer = 'Vui lòng nhập YouTube URL hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAvailabilityChange = (e) => {
    const { checked } = e.target;
    setFormData({
      ...formData,
      movieAvailable: checked
    });
    
    if (errors.movieAvailable) {
      setErrors({
        ...errors,
        movieAvailable: null
      });
    }
  };
  
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const movieFormData = new FormData();
        
        const propertyMapping = {
          movieName: 'MovieName',
          moviePoster: 'MoviePoster',
          movieCreatAt: 'MovieCreatAt',
          movieStartAt: 'MovieStartAt',
          movieEndAt: 'MovieEndAt',
          movieActor: 'MovieActor',
          movieDirector: 'MovieDirector',
          movieBrand: 'MovieBrand',
          movieDuration: 'MovieDuration',
          movieVersion: 'MovieVersion',
          movieContent: 'MovieContent',
          movieCreatedBy: 'MovieCreatedBy', 
          movieUpdateBy: 'MovieUpdateBy',
          movieTrailer: 'MovieTrailer',
          movieAvailable: 'MovieAvailable' // Add mapping for movieAvailable
        };
        
        Object.keys(formData).forEach(key => {
          if (key === 'genreIds') {
            // Handle separately
          } else if (key !== 'moviePoster') {
            const propertyName = propertyMapping[key] || key;
            
            if (formData[key] instanceof Date) {
              movieFormData.append(propertyName, formData[key].toISOString());
            } else if (key === 'movieAvailable') {
              // Add null check for boolean values
              movieFormData.append(propertyName, formData[key] !== null ? formData[key].toString() : 'false');
            } else {
              // Add proper null/undefined check before calling toString()
              const value = formData[key] !== null && formData[key] !== undefined ? formData[key].toString() : '';
              movieFormData.append(propertyName, value);
            }
          }
        });

        if (formData.genreIds && formData.genreIds.length > 0) {
          formData.genreIds.forEach((genreId, index) => {
            movieFormData.append(`GenreIds[${index}]`, parseInt(genreId, 10));
          });
        }
        
        if (posterFile) {
          movieFormData.append('MoviePoster', posterFile);
        } else if (posterPreview && isEdit) {
          movieFormData.append('MoviePoster', formData.moviePoster);
        } else {
          movieFormData.append('MoviePoster', '');
        }
        
        await onSubmit(movieFormData);
        
        // Reset form after submission if creating a new movie
        if (!isEdit) {
          resetForm();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Display selected genre names in the chips
  const getGenreName = (id) => {
    const genre = genres.find(g => g.genresId === id);
    return genre ? genre.genresName : `Unknown (${id})`;
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        pt: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h5" fontWeight={600} component="div">
          {isViewOnly 
            ? "Movie Details" 
            : isEdit 
              ? "Edit Movie" 
              : "Add New Movie"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <MovieFormBasicInfo
                formData={formData}
                handleInputChange={handleInputChange}
                handleGenreChange={handleGenreChange}
                handleGenreDelete={handleGenreDelete}
                errors={errors}
                genres={genres}
                loading={loading}
                isEdit={isEdit}
                getGenreName={getGenreName}
                disabled={isViewOnly || isSubmitting}
              />
                
              <MovieFormPosterUpload
                posterPreview={posterPreview}
                handleFileChange={handleFileChange}
                handleRemoveImage={handleRemoveImage}
                errors={errors}
                disabled={isViewOnly || isSubmitting}
              />
                
              <MovieFormProductionDetails
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                disabled={isViewOnly || isSubmitting}
              />
                
              <MovieFormReleaseSchedule
                formData={formData}
                handleDateInputChange={handleDateInputChange}
                errors={errors}
                formatDateForInput={formatDateForInput}
                formatDateForDisplay={formatDateForDisplay}
                isEdit={isEdit}
                disabled={isViewOnly || isSubmitting}
              />
              
              <MovieFormAvailability
                formData={formData}
                handleAvailabilityChange={handleAvailabilityChange}
                errors={errors}
                disabled={isViewOnly || isSubmitting}
              />
                
              <MovieFormContent
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                disabled={isViewOnly || isSubmitting}
              />
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          onClick={handleDialogClose}
          variant={isViewOnly ? "contained" : "outlined"}
          color={isViewOnly ? "primary" : "inherit"}
          sx={{ borderRadius: 1 }}
          disabled={isSubmitting}
        >
          {isViewOnly ? "Đóng" : "Hủy"}
        </Button>
        
        {!isViewOnly && (
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 1, px: 3, minWidth: 100 }}
            disabled={isSubmitting}
            startIcon={isSubmitting && (
              <CircularProgress size={20} color="inherit" />
            )}
          >
            {isSubmitting 
              ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo mới...') 
              : (isEdit ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MovieForm;
