import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCalendarAlt, FaClock, FaPlay, FaTicketAlt, FaChevronLeft, FaTimes } from 'react-icons/fa';
import { getMovieById, getNowShowingMovies } from '../api/services/movieService';
import { BookmarkBadge } from '../components/movies/MovieCard';
import MovieCarousel from '../components/MovieCarousel';
import { getAgeRating, getBookmarkColor } from '../utils/movieUtils';

// Reuse styles from other pages and adapt them for the detail page
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 7rem 1rem 3rem;
`;

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
`;

const MovieHeader = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
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

const MovieInfo = styled.div`
  position: relative;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
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

const MovieTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const MovieOriginalTitle = styled.h2`
  font-size: 1.2rem;
  color: #b8c2cc;
  margin-bottom: 1rem;
  font-weight: normal;
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

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b8c2cc;
  
  svg {
    color: #e71a0f;
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

const GenreTag = styled.span`
  background-color: rgba(231, 26, 15, 0.1);
  color: #e71a0f;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

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
`;

const MovieContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

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
`;

const MovieSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background-color: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  
  h3 {
    color: #f3f4f6;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

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
  }
    span {
    display: flex;  
    align-items: start;
    }

`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  p {
    color: #b8c2cc;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #f3f4f6;
  margin: 3rem 0 1.5rem;
`;

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
`;

const TrailerContainer = styled.div`
  position: relative;
  width: 90%;
  max-width: 900px;
  aspect-ratio: 16/9;
`;

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
`;

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
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
    let videoId = movie.movieTrailer;

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

  return (
    <PageContainer>


      <MovieHeader>
        <BackdropContainer>
          {/* Sử dụng backdrop hoặc poster nếu không có backdrop */}
          <Backdrop style={{ backgroundImage: `url(${movie.backdrop || movie.moviePoster || 'https://via.placeholder.com/1200x400?text=No+Backdrop'})` }} />
        </BackdropContainer>
        <MovieInfo>
          <PosterContainer>
            {/* Hiển thị poster từ moviePoster */}
            <PosterImage
              src={movie.moviePoster || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={movie.title || movie.movieName}
            />
            <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
              <BookmarkBadge
                rating={getAgeRating(movie)}
                color={getBookmarkColor(getAgeRating(movie))}
              />
            </div>
          </PosterContainer>

          <MovieDetails>
            {/* Hiển thị tên phim từ movieName */}
            <MovieTitle>{movie.title || movie.movieName}</MovieTitle>

            <MovieStats>
              {/* Hiển thị ngày chiếu từ movieStartAt */}
              {(movie.startDate || movie.movieStartAt) && (
                <Stat>
                  <FaCalendarAlt />
                  <span>{formatDate(movie.startDate || movie.movieStartAt)}</span>
                </Stat>
              )}

              {/* Hiển thị thời lượng từ movieDuration */}
              {(movie.duration || movie.movieDuration) && (
                <Stat>
                  <FaClock />
                  <span>{movie.duration || movie.movieDuration} phút</span>
                </Stat>
              )}
            </MovieStats>

            {/* Hiển thị thể loại từ genres */}
            <GenreTags>
              {(() => {
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

                // Hiển thị danh sách thể loại
                return genreList.map((genre, index) => (
                  <GenreTag key={index}>{genre}</GenreTag>
                ));
              })()}
            </GenreTags>

            <ButtonGroup>
              <Button className="primary" onClick={handleBookTicket}>
                <FaTicketAlt />
                Đặt vé ngay
              </Button>

              {/* Hiển thị nút trailer nếu có movieTrailer */}
              {(movie.trailer || movie.movieTrailer) && (
                <Button className="secondary" onClick={handleOpenTrailer}>
                  <FaPlay />
                  Xem trailer
                </Button>
              )}
            </ButtonGroup>
          </MovieDetails>
        </MovieInfo>
      </MovieHeader>

      <MovieContent>
        <div>
          {/* Hiển thị nội dung phim từ movieContent */}
          {(movie.description || movie.movieContent) && (
            <MovieDescription>
              <h3>Nội dung phim</h3>
              <p>{movie.description || movie.movieContent}</p>
            </MovieDescription>
          )}
        </div>

        <MovieSidebar>
          <InfoCard>
            <h3>Thông tin chi tiết</h3>
            <InfoList>
              <InfoItem>
                <span className="label">Đạo diễn:</span>
                <span className="value">{movie.director || movie.movieDirector || 'Chưa cập nhật'}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Diễn viên:</span>
                <span className="value">{movie.actors || movie.movieActor || 'Chưa cập nhật'}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Xuất xứ:</span>
                <span className="value">{movie.country || movie.movieBrand || 'Chưa cập nhật'}</span>
              </InfoItem>
              <InfoItem>
                <span className="label">Phiên bản:</span>
                <span className="value">
                  {(() => {
                    // Xử lý hiển thị movie.movieVersion
                    if (movie.language) return movie.language;
                    if (movie.movieVersion === 1) return '2D Phụ đề Việt';
                    if (movie.movieVersion === 2) return '3D Phụ đề Việt';
                    if (movie.movieVersion === 3) return '2D Lồng tiếng Việt';
                    return 'Chưa cập nhật';
                  })()}
                </span>
              </InfoItem>
              <InfoItem>
                <span className="label" style={{marginRight: '0.5rem'}}>Nhà sản xuất:</span>
                <span className="value">{movie.producer || movie.movieBrand || 'Chưa cập nhật'}</span>
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

      {showTrailer && (movie.trailer || movie.movieTrailer) && (
        <TrailerModal onClick={() => setShowTrailer(false)}>
          <TrailerContainer onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowTrailer(false)}>
              <FaTimes />
            </CloseButton>
            <iframe
              width="100%"
              height="100%"
              src={getEmbedYoutubeUrl(movie.trailer || movie.movieTrailer)}
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