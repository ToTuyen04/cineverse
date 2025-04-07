import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaClock, FaPlay, FaTicketAlt, FaChevronLeft, FaTimes } from 'react-icons/fa';
import { getMovieById, getNowShowingMovies } from '../api/services/movieService';
import { BookmarkBadge } from '../components/movies/MovieCard';
import MovieCarousel from '../components/MovieCarousel';
import { getAgeRating, getBookmarkColor } from '../utils/movieUtils';

// Cập nhật PageContainer để responsive hơn
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 7rem 1rem 3rem;
  
  @media (max-width: 992px) {
    padding: 6rem 1rem 2.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 5rem 1rem 2rem;
  }
  
  @media (max-width: 576px) {
    padding: 4.5rem 0.75rem 1.5rem;
  }
`;

// Cập nhật BackButton để responsive hơn
const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #f3f4f6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    color: #e71a0f;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

// Cập nhật MovieHeader để responsive hơn
const MovieHeader = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    border-radius: 8px;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
  }
`;

const BackdropContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(10, 10, 25, 0.95));
  }
`;

// Cập nhật MovieInfo để responsive hơn
const MovieInfo = styled.div`
  position: relative;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  
  @media (max-width: 992px) {
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem 1rem;
    gap: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem 0.75rem;
  }
`;

const PosterContainer = styled.div`
  position: relative;
  margin-top: -100px;
  width: 220px; 
  height: 100%; 
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    margin-top: -70px;
    width: 160px;
  }
`;

const PosterImage = styled.img`
  width: 100%;
  height: 100%; 
  object-fit: cover;
  aspect-ratio: 2/3; 
`;

const MovieDetails = styled.div`
  flex: 1;
  color: #f3f4f6;
`;

// Cập nhật MovieTitle để responsive hơn
const MovieTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 992px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
  }
`;

// Cập nhật MovieOriginalTitle để responsive hơn
const MovieOriginalTitle = styled.h2`
  font-size: 1.2rem;
  color: #b8c2cc;
  margin-bottom: 1rem;
  font-weight: normal;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
`;

const MovieStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// Cập nhật Stat để responsive hơn
const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b8c2cc;
  
  svg {
    color: #e71a0f;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    gap: 0.3rem;
  }
`;

const GenreTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// Cập nhật GenreTag để responsive hơn
const GenreTag = styled.span`
  background-color: rgba(231, 26, 15, 0.1);
  color: #e71a0f;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

// Cập nhật Button để responsive hơn
const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  
  &.primary {
    background-color: #6a1b9a;
    color: white;
    border: none;
    
    &:hover {
      background-color: #8e24aa;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: #f3f4f6;
    border: 1px solid #f3f4f6;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    gap: 0.3rem;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 360px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const MovieContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// Cập nhật MovieDescription để responsive hơn
const MovieDescription = styled.div`
  background-color: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  
  h3 {
    color: #f3f4f6;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    color: #b8c2cc;
    line-height: 1.7;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    
    h3 {
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.95rem;
      line-height: 1.6;
    }
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
    margin-bottom: 1.25rem;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
`;

// Cập nhật MovieSidebar để responsive hơn
const MovieSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1.25rem;
  }
  
  @media (max-width: 576px) {
    gap: 1rem;
  }
`;

// Cập nhật InfoCard để responsive hơn
const InfoCard = styled.div`
  background-color: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  
  h3 {
    color: #f3f4f6;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 8px;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
    
    h3 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }
`;

// Cập nhật InfoList để responsive hơn
const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Cập nhật InfoItem để responsive hơn
const InfoItem = styled.li`
  margin-bottom: 1rem;
  display: flex;
  color: #ffffff;
  
  .label {
    font-weight: bold;
    min-width: 100px;
    color: #ffffff;
  }
  
  .value {
    flex: 1;
    color: #ffffff;
    display: flex;  
    align-items: start;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    
    .label {
      min-width: 90px;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 0.6rem;
    font-size: 0.9rem;
    flex-direction: column;
    
    .label {
      min-width: auto;
      margin-bottom: 0.2rem;
    }
  }
`;

// Cập nhật LoadingIndicator để responsive hơn
const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  p {
    color: #b8c2cc;
  }
  
  @media (max-width: 768px) {
    min-height: 300px;
  }
  
  @media (max-width: 576px) {
    min-height: 200px;
  }
`;

// Cập nhật SectionTitle để responsive hơn
const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #f3f4f6;
  margin: 3rem 0 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin: 2.5rem 0 1.25rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.4rem;
    margin: 2rem 0 1rem;
  }
`;

// Cập nhật TrailerModal để responsive hơn
const TrailerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0 1rem;
  
  @media (max-width: 576px) {
    padding: 0 0.5rem;
  }
`;

// Cập nhật TrailerContainer để responsive hơn
const TrailerContainer = styled.div`
  position: relative;
  width: 90%;
  max-width: 900px;
  aspect-ratio: 16/9;
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

// Cập nhật CloseButton để responsive hơn
const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1001;
  
  &:hover {
    color: #e71a0f;
  }
  
  @media (max-width: 768px) {
    top: -35px;
    font-size: 1.3rem;
  }
  
  @media (max-width: 576px) {
    top: -30px;
    font-size: 1.2rem;
  }
`;

// Cải tiến hàm formatDate với Intl.DateTimeFormat để hiển thị đúng định dạng ngày tháng Việt Nam
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  
  try {
    const date = new Date(dateString);
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(date.getTime())) return 'Chưa cập nhật';
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Chưa cập nhật';
  }
};

// Thêm hàm xử lý hiển thị thể loại phim
const displayGenres = (movie) => {
  // Mảng để chứa thể loại phim
  let genreList = [];

  // Kiểm tra dữ liệu genres
  if (movie.genres) {
    if (Array.isArray(movie.genres)) {
      // Nếu là mảng đối tượng (từ API)
      if (movie.genres[0] && typeof movie.genres[0] === 'object') {
        genreList = movie.genres.map(g => g.genresName);
      }
      // Nếu là mảng chuỗi
      else {
        genreList = movie.genres;
      }
    }
    // Nếu là chuỗi
    else if (typeof movie.genres === 'string') {
      genreList = movie.genres.split(',').map(g => g.trim());
    }
  }

  // Trả về danh sách thể loại đã xử lý
  return genreList;
};

// Thêm hàm xử lý hiển thị phiên bản phim
const displayVersion = (movie) => {
  if (movie.language) return movie.language;
  if (movie.movieVersion === 1) return '2D Phụ đề Việt';
  if (movie.movieVersion === 2) return '3D Phụ đề Việt';
  if (movie.movieVersion === 3) return '2D Lồng tiếng Việt';
  return 'Chưa cập nhật';
};

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const movieData = await getMovieById(id);
        setMovie(movieData);

        // Fetch related movies (e.g., movies from the same genres)
        const nowShowingMovies = await getNowShowingMovies();
        if (movieData && movieData.genres && nowShowingMovies.length > 0) {
          const related = nowShowingMovies
            .filter(m => m.id !== movieData.id && m.genres)
            .slice(0, 8);
          setRelatedMovies(related);
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleBookTicket = () => {
    navigate(`/movie/${id}/booking`);
  };

  const handleOpenTrailer = () => {
    setShowTrailer(true);
  };

  const getEmbedYoutubeUrl = (url) => {
    if (!url) return '';

    // Xử lý URL YouTube
    let videoId = '';

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }
    // Nếu là mã video trực tiếp
    else {
      videoId = url;
    }

    // Thêm tham số autoplay=1 để tự động phát
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingIndicator>
          <p>Đang tải thông tin phim...</p>
        </LoadingIndicator>
      </PageContainer>
    );
  }

  if (!movie) {
    return (
      <PageContainer>
        <LoadingIndicator>
          <p>Không tìm thấy thông tin phim.</p>
        </LoadingIndicator>
      </PageContainer>
    );
  }

  // Xử lý thông tin phim để hiển thị
  const movieTitle = movie.title || movie.movieName || 'Tên phim chưa cập nhật';
  const moviePoster = movie.moviePoster || movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster';
  const movieBackdrop = movie.backdrop || movie.moviePoster || 'https://via.placeholder.com/1200x400?text=No+Backdrop';
  const movieDuration = movie.duration || movie.movieDuration || 'Chưa cập nhật';
  const movieReleaseDate = movie.startDate || movie.movieStartAt || '';
  const movieDescription = movie.description || movie.movieContent || 'Nội dung phim chưa được cập nhật.';
  const movieDirector = movie.director || movie.movieDirector || 'Chưa cập nhật';
  const movieActors = movie.actors || movie.movieActor || 'Chưa cập nhật';
  const movieCountry = movie.country || movie.movieBrand || 'Chưa cập nhật';
  const movieProducer = movie.producer || movie.movieBrand || 'Chưa cập nhật';
  const movieTrailer = movie.trailer || movie.movieTrailer || '';
  const movieGenres = displayGenres(movie);
  const movieVersion = displayVersion(movie);

  return (
    <PageContainer>
      <BackButton onClick={handleGoBack}>
        <FaChevronLeft /> Quay lại
      </BackButton>

      <MovieHeader>
        <BackdropContainer>
          <Backdrop style={{ backgroundImage: `url(${movieBackdrop})` }} />
        </BackdropContainer>
        <MovieInfo>
          <PosterContainer>
            <PosterImage src={moviePoster} alt={movieTitle} />
            <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
              <BookmarkBadge
                rating={getAgeRating(movie)}
                color={getBookmarkColor(getAgeRating(movie))}
              />
            </div>
          </PosterContainer>

          <MovieDetails>
            <MovieTitle>{movieTitle}</MovieTitle>

            <MovieStats>
              {movieReleaseDate && (
                <Stat>
                  <FaCalendarAlt />
                  <span>{formatDate(movieReleaseDate)}</span>
                </Stat>
              )}

              {movieDuration && (
                <Stat>
                  <FaClock />
                  <span>{typeof movieDuration === 'number' ? `${movieDuration} phút` : movieDuration}</span>
                </Stat>
              )}
            </MovieStats>

            <GenreTags>
              {movieGenres.map((genre, index) => (
                <GenreTag key={index}>{genre}</GenreTag>
              ))}
            </GenreTags>

            <ButtonGroup>
              <Button className="primary" onClick={handleBookTicket}>
                <FaTicketAlt />
                <span className="button-text">Đặt vé ngay</span>
              </Button>

              {movieTrailer && (
                <Button className="secondary" onClick={handleOpenTrailer}>
                  <FaPlay />
                  <span className="button-text">Xem trailer</span>
                </Button>
              )}
            </ButtonGroup>
          </MovieDetails>
        </MovieInfo>
      </MovieHeader>

      <MovieContent>
        <div>
          {movieDescription && (
            <MovieDescription>
              <h3>Nội dung phim</h3>
              <p>{movieDescription}</p>
            </MovieDescription>
          )}
        </div>

        <MovieSidebar>
          <InfoCard>
            <h3>Thông tin chi tiết</h3>
            <InfoList>
              <InfoItem>
                <span className="label">Đạo diễn:</span>
                <span className="value">{movieDirector}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Diễn viên:</span>
                <span className="value">{movieActors}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Xuất xứ:</span>
                <span className="value">{movieCountry}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Phiên bản:</span>
                <span className="value">{movieVersion}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Nhà sản xuất:</span>
                <span className="value">{movieProducer}</span>
              </InfoItem>
            </InfoList>
          </InfoCard>
        </MovieSidebar>
      </MovieContent>

      {relatedMovies.length > 0 && (
        <>
          <SectionTitle>Phim tương tự</SectionTitle>
          <MovieCarousel movies={relatedMovies} />
        </>
      )}

      {showTrailer && movieTrailer && (
        <TrailerModal onClick={() => setShowTrailer(false)}>
          <TrailerContainer onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowTrailer(false)}>
              <FaTimes />
            </CloseButton>
            <iframe
              width="100%"
              height="100%"
              src={getEmbedYoutubeUrl(movieTrailer)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </TrailerContainer>
        </TrailerModal>
      )}
    </PageContainer>
  );
}

export default MovieDetailPage;