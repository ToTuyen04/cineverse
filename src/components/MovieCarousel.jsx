//// filepath: d:\.NetLab\FE\src\components\MovieCarousel.jsx
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Styled arrow components
const ArrowButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px; /* Tăng kích thước nút */
  height: 50px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: rgba(231, 26, 15, 0.8);
    transform: translateY(-50%) scale(1.1);
  }
  
  &.next-arrow {
    right: -60px; /* Đặt nút ra ngoài carousel */
    
    @media (max-width: 1200px) {
      right: -30px;
    }
    
    @media (max-width: 768px) {
      right: -20px;
      width: 40px;
      height: 40px;
    }
    
    @media (max-width: 576px) {
      right: -10px;
      width: 35px;
      height: 35px;
    }
  }
  
  &.prev-arrow {
    left: -60px; /* Đặt nút ra ngoài carousel */
    
    @media (max-width: 1200px) {
      left: -30px;
    }
    
    @media (max-width: 768px) {
      left: -20px;
      width: 40px;
      height: 40px;
    }
    
    @media (max-width: 576px) {
      left: -10px;
      width: 35px;
      height: 35px;
    }
  }
  
  svg {
    @media (max-width: 768px) {
      width: 20px;
      height: 20px;
    }
    
    @media (max-width: 576px) {
      width: 18px;
      height: 18px;
    }
  }
`;

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <ArrowButton className="next-arrow" onClick={onClick}>
      <FaChevronRight size={24} color="#fff" />
    </ArrowButton>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <ArrowButton className="prev-arrow" onClick={onClick}>
      <FaChevronLeft size={24} color="#fff" />
    </ArrowButton>
  );
};

// Container to ensure proper sizing
const CarouselContainer = styled.div`
  width: 100%;
  padding: 20px 40px; /* Tăng padding để tạo không gian */
  box-sizing: border-box;
  position: relative;
  min-height: 300px; /* Đặt chiều cao tối thiểu */
  
  .slick-slide > div {
    display: flex;
    justify-content: center;
  }
  
  .slick-slider {
    padding: 0 20px;
  }
  
  @media (max-width: 768px) {
    padding: 15px 25px;
  }
  
  @media (max-width: 576px) {
    padding: 10px 15px;
    min-height: 250px;
  }
  
  .slick-dots {
    bottom: -30px;
    
    @media (max-width: 576px) {
      bottom: -25px;
    }
    
    li button:before {
      color: #f3f4f6;
      opacity: 0.5;
      
      @media (max-width: 576px) {
        font-size: 8px;
      }
    }
    
    li.slick-active button:before {
      color: #F9376E;
      opacity: 1;
    }
  }
`;

const MovieCard = styled.div`
  margin: 0 10px;
  transition: all 0.3s;
  cursor: pointer;
  height: 100%; 
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 253, 253, 0.1);
  border-radius: 8px;

  a {
    display: block;
    text-decoration: none;
    color: inherit;
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 300px; /* Đặt chiều cao cố định cho poster */
    object-fit: cover;
    border-radius: 8px;
    transition: all 0.3s;
    
    @media (max-width: 768px) {
      height: 280px;
    }
    
    @media (max-width: 576px) {
      height: 250px;
    }
  }
  
  h3 {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 10px;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    font-size: 1rem;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    
    @media (max-width: 768px) {
      font-size: 0.95rem;
      padding: 8px;
    }
    
    @media (max-width: 576px) {
      font-size: 0.85rem;
      padding: 6px;
      -webkit-line-clamp: 1;
    }
  }

  .movie-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  color: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  text-align: center;
    
    @media (max-width: 768px) {
      padding: 8px;
    }
    
    @media (max-width: 576px) {
      padding: 6px 5px;
    }
}

&:hover h3 {
opacity: 0;
}

&:hover .movie-info-overlay {
  opacity: 1;
}
  
  .movie-info-details {
    margin-bottom: 15px;
    
    span {
      display: block;
      margin: 5px 0;
      
      @media (max-width: 768px) {
        margin: 4px 0;
        font-size: 0.85rem;
      }
      
      @media (max-width: 576px) {
        margin: 3px 0;
        font-size: 0.75rem;
      }
    }
    
    @media (max-width: 768px) {
      margin-bottom: 10px;
    }
    
    @media (max-width: 576px) {
      margin-bottom: 8px;
    }
  }

  .button-group {
    display: flex;
    gap: 8px;  /* Giảm gap từ 10px xuống 8px */
    justify-content: center;
    
    @media (max-width: 576px) {
      gap: 5px;
    }
  }

  .detail-btn {
    background-color: transparent;
    color: white;
    border: 1px solid white;
    padding: 6px 12px;  /* Giảm padding từ 8px 16px xuống 6px 12px */
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;  /* Thêm font-size nhỏ hơn */
    transition: all 0.3s;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    @media (max-width: 768px) {
      padding: 5px 10px;
      font-size: 0.85rem;
    }
    
    @media (max-width: 576px) {
      padding: 4px 8px;
      font-size: 0.75rem;
    }
  }

  .booking-btn {
    background-color: #6a1b9a;
    color: white;
    border: none;
    padding: 6px 12px;  /* Giảm padding từ 8px 16px xuống 6px 12px */
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;  /* Thêm font-size nhỏ hơn */
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #8e24aa;
    }
    
    @media (max-width: 768px) {
      padding: 5px 10px;
      font-size: 0.85rem;
    }
    
    @media (max-width: 576px) {
      padding: 4px 8px;
      font-size: 0.75rem;
    }
  }
`;

// Thêm styled component cho trường hợp không có phim
const NoMoviesMessage = styled.p`
  text-align: center;
  color: #f3f4f6;
  font-size: 1.1rem;
  padding: 40px 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 30px 0;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    padding: 20px 0;
  }
`;

function MovieCarousel({ movies = [] }) {
  // Hàm để xử lý hiển thị thể loại phim
  const getGenres = (movie) => {
    if (!movie.genres) return 'Chưa cập nhật';

    // Trường hợp đã được format sẵn thành chuỗi
    if (typeof movie.genres === 'string') return movie.genres;

    // Trường hợp là mảng string
    if (Array.isArray(movie.genres) && typeof movie.genres[0] === 'string') {
      return movie.genres.join(', ');
    }

    // Trường hợp là mảng object
    if (Array.isArray(movie.genres) && movie.genres[0]?.genresName) {
      return movie.genres.map(g => g.genresName).join(', ');
    }

    // Trường hợp có genreNames đã được format
    return movie.genreNames || 'Chưa cập nhật';
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 800,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    cssEase: "cubic-bezier(0.45, 0, 0.55, 1)",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <CarouselContainer>
      {movies && movies.length > 0 ? (
        <Slider {...settings}>
          {movies.map(movie => (
            <MovieCard key={movie.id}>
              <Link to={`/movie/${movie.id}`}>
                <img
                  src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Image'}
                  alt={movie.title}
                />
                <h3>{movie.title}</h3>

                <div className="movie-info-overlay">
                  <div className="movie-info-details">
                    <span><strong>{movie.title}</strong></span>
                    {/* TODO: Đảm bảo API trả về đầy đủ thông tin genres, duration, language, releaseDate */}
                    <span>Thể loại: {getGenres(movie)}</span>
                    <span>Thời lượng: {movie.duration || 0} phút</span>
                    <span>Ngôn ngữ: {movie.language || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="button-group">
                    <button className="detail-btn" onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/movie/${movie.id}`;
                    }}>Chi tiết</button>
                    <button className="booking-btn" onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/movie/${movie.id}/booking`;
                    }}>Đặt vé ngay</button>
                  </div>
                </div>
              </Link>
            </MovieCard>
          ))}
        </Slider>
      ) : (
        <NoMoviesMessage>Không có phim nào.</NoMoviesMessage>
      )}
    </CarouselContainer>
  );
}

export default MovieCarousel;