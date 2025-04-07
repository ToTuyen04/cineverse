import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt, FaStar } from 'react-icons/fa';

const Card = styled.div`
  background-color: #2A2D3E;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    
    // Ẩn bookmark khi hover
    .bookmark-badge {
      opacity: 0;
    }
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-3px); // Giảm hiệu ứng trên màn hình nhỏ
    }
  }
`;

const Poster = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
`;

const CardBody = styled.div`
  padding: 1.25rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem;
  }
`;

const Title = styled.h5`
  color: #f3f4f6;
  margin-bottom: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
  }
`;

const ReleaseDate = styled.small`
  color: #9ca3af;
  display: block;
  margin-bottom: 0.75rem;
  
  svg {
    color: #F9376E;
    margin-right: 0.25rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    margin-top: 0.75rem;
    gap: 0.3rem;
  }
`;

const Button = styled.button`
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(to right, #FF4D4D, #F9376E);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  &.outline {
    background: transparent;
    color: #f3f4f6;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
`;

const MoviePoster = styled.div`
  position: relative;
  width: 100%;
  padding-top: 150%; 
  overflow: hidden;
`;

const PosterImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// Cập nhật BookmarkBadge cho responsive
const BookmarkBadge = ({ rating, color }) => {
  // Chọn icon phù hợp với phân loại
  const getIcon = (rating) => {
    switch(rating) {
      case 'P': return 'P'; 
      case 'C13': return '13+';
      case 'C16': return '16+';
      case 'C18': return '18+';
      default: return rating;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      zIndex: 20,
      filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.4))',
      transition: 'opacity 0.3s ease',
    }}>
      <svg width="50" height="70" viewBox="0 0 50 70" className="bookmark-svg">
        <defs>
          <linearGradient id={`badge-gradient-${rating}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: color, stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: shadeColor(color, -20), stopOpacity: 1}} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path 
          d="M0,0 H50 V50 C50,50 40,50 25,70 C25,70 10,50 0,50 Z" 
          fill={`url(#badge-gradient-${rating})`}
          filter="url(#glow)"
          stroke={shadeColor(color, -30)}
          strokeWidth="0.5"
        />
        <text 
          x="25" 
          y={rating.length > 2 ? "30" : "35"}
          textAnchor="middle" 
          fill="white" 
          fontWeight="bold"
          fontSize={rating.length > 2 ? "16" : "20"}
          filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
        >
          {getIcon(rating)}
        </text>
      </svg>
    </div>
  );
};

// Hàm giúp làm tối/sáng màu
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3), 16);
  let G = parseInt(color.substring(3,5), 16);
  let B = parseInt(color.substring(5,7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;  
  G = (G < 255) ? G : 255;  
  B = (B < 255) ? B : 255;  

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#"+RR+GG+BB;
}

// Thêm responsive cho MovieReleaseStatus
const MovieReleaseStatus = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  background: ${props => props.$status === 'nowShowing' ? 'rgba(39, 174, 96, 0.9)' : 'rgba(52, 152, 219, 0.9)'};
  color: white;
  z-index: 5;
  
  @media (max-width: 576px) {
    padding: 4px 6px;
    font-size: 0.65rem;
    top: 8px;
    left: 8px;
  }
`;

// Thêm responsive cho MovieOverlay
const MovieOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 25;
  
  ${Card}:hover & {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    padding: 8px;
  }
  
  @media (max-width: 576px) {
    padding: 6px;
  }
`;

const MovieInfoDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  
  span {
    margin: 2px 0;
    font-size: 0.85rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 8px;
    
    span {
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 6px;
    
    span {
      font-size: 0.75rem;
      margin: 1px 0;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 576px) {
    gap: 6px;
  }
`;

const DetailButton = styled.button`
  background-color: #f3f4f6;
  color: #2A2D3E;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
`;

const BookingButton = styled.button`
  background-color: #F9376E;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  
  @media (max-width: 576px) {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
`;

// Hàm helper để xác định rating
const getAgeRating = (movie) => {
  if (!movie) return 'P';
  
  if (movie.ageRating) return movie.ageRating;
  
  if (movie.genres) {
    if (movie.genres.includes('Kinh dị') || movie.genres.includes('Bạo lực')) {
      return 'C16';
    }
    if (movie.genres.includes('Hành động')) {
      return 'C13';
    }
    if (movie.genres.includes('Hoạt hình') || movie.genres.includes('Gia đình')) {
      return 'P';
    }
  }
  
  return 'P';
};

const getBookmarkColor = (ageRating) => {
  switch(ageRating) {
    case 'P': return '#27ae60';
    case 'K': return '#27ae60';
    case 'C13': return '#f39c12';
    case 'C16': return '#e67e22';
    case 'C18': return '#e74c3c';
    default: return '#2980b9';
  }
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const MovieCard = ({ movie, showBookButton = false, showReleaseDate = false, activeTab }) => {
  if (!movie) {
    console.error("Missing movie data in MovieCard");
    return null;
  }

  return (
    <Card>
      <MoviePoster>
        <PosterImage 
          src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={movie.title || 'Movie poster'} 
        />
        
        {/* BookmarkBadge */}
        <div 
          className="bookmark-badge"
          style={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 20,
            filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.4))',
            transition: 'opacity 0.3s ease',
            opacity: 1,
            transform: 'scale(0.9)',
            '@media (max-width: 576px)': {
              transform: 'scale(0.8)'
            }
          }}
        >
          <BookmarkBadge 
            rating={getAgeRating(movie)} 
            color={getBookmarkColor(getAgeRating(movie))} 
          />
        </div>
        
        {/* MovieReleaseStatus */}
        {activeTab && (
          <MovieReleaseStatus $status={activeTab}>
            {activeTab === 'nowShowing' ? 'Đang chiếu' : 'Sắp chiếu'}
          </MovieReleaseStatus>
        )}
        
        {/* Overlay */}
        <MovieOverlay className="movie-info-overlay">
          <MovieInfoDetails className="movie-info-details">
            {movie.duration && <span>{movie.duration} phút</span>}
            {movie.genres && <span>{movie.genres.join(', ')}</span>}
            {movie.releaseDate && <span>{formatDate(movie.releaseDate)}</span>}
          </MovieInfoDetails>
          
          <ButtonGroup className="button-group">
            <DetailButton className="detail-btn">Chi tiết</DetailButton>
            <BookingButton className="booking-btn">Đặt vé</BookingButton>
          </ButtonGroup>
        </MovieOverlay>
      </MoviePoster>
      
      <CardBody>
        <Title>{movie.title}</Title>
        
        {showReleaseDate && (
          <ReleaseDate>
            <FaCalendarAlt /> Coming {formatDate(movie.releaseDate)}
          </ReleaseDate>
        )}
        
        <ButtonContainer>
          {showBookButton && (
            <Button className="primary">Book Now</Button>
          )}
          <Button className="outline">Details</Button>
        </ButtonContainer>
      </CardBody>
    </Card>
  );
};

export { BookmarkBadge };
export default MovieCard;
