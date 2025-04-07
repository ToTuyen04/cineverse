import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaSearch, FaFilter, FaSpinner, FaStar, FaCalendarAlt } from 'react-icons/fa';
import { getNowShowingMovies, getComingSoonMovies, getAllGenres } from '../api/services/movieService';
import { BookmarkBadge } from '../components/movies/MovieCard';

// Di chuyển MovieCard lên đầu phần định nghĩa các styled components
const MovieCard = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  background-color: #1a1a2e;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    
    .bookmark-badge {
      opacity: 0;
    }
  }
  
  @media (max-width: 576px) {
    border-radius: 6px;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  z-index: 1;
  font-size: 0.85rem;
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
    left: 7px;
  }
`;

// Thêm animation cho spinner
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Thêm styling cho spinner
const StyledSpinner = styled(FaSpinner)`
  animation: ${rotate} 1s linear infinite;
  font-size: 2rem;
  color: #e71a0f;
`;

// Styled components cho trang phim
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 7rem 1rem 2rem;
  min-height: 150vh;
  
  @media (max-width: 992px) {
    padding: 6rem 1rem 1.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 5rem 0.75rem 1.5rem;
  }
  
  @media (max-width: 576px) {
    padding: 4.5rem 0.5rem 1rem;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #f3f4f6;
  margin-bottom: 1rem;
  
  @media (max-width: 992px) {
    font-size: 2.2rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 0.75rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #3f425a;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    gap: 0.75rem;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
    gap: 0.5rem;
  }
`;

// Cách 2: Đổi tên prop để tránh xung đột với HTML attributes
const TabButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.$isActive ? '#e71a0f' : '#f3f4f6'};
  font-size: 1.2rem;
  font-weight: ${props => props.$isActive ? 'bold' : 'normal'};
  padding: 0.5rem 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${props => props.$isActive ? '#e71a0f' : 'transparent'};
    transition: all 0.3s;
  }
  
  &:hover {
    color: #e71a0f;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.4rem 0.75rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1rem;
    padding: 0.3rem 0.5rem;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 576px) {
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  border-radius: 50px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e71a0f;
  }
  
  @media (max-width: 768px) {
    padding: 0.65rem 1rem 0.65rem 2.3rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.6rem 0.9rem 0.6rem 2.1rem;
    font-size: 0.8rem;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  
  @media (max-width: 576px) {
    left: 0.8rem;
    font-size: 0.9rem;
  }
`;

// Thêm container cho filter dropdown
const FilterContainer = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Cập nhật GenreFilter để có padding bên trái cho icon
const GenreFilter = styled.select`
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.75rem 1rem 0.75rem 1.5rem; // Thêm padding bên trái nhiều hơn
  border-radius: 50px;
  cursor: pointer;
  min-width: 180px; // Tăng độ rộng tối thiểu
  
  option {
    background-color: #1e1e30;
  }
  
  &:focus {
    outline: none;
    border-color: #e71a0f;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.65rem 1rem 0.65rem 1.4rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.6rem 0.9rem 0.6rem 1.3rem;
    font-size: 0.85rem;
  }
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 0.75rem;
  }
  
  @media (max-width: 360px) {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  flex-direction: column;
  
  p {
    margin-top: 1rem;
    color: #b8c2cc;
  }
  
  @media (max-width: 768px) {
    min-height: 250px;
    
    p {
      margin-top: 0.75rem;
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    min-height: 200px;
    
    p {
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  
  h3 {
    margin-bottom: 1rem;
    color: #f3f4f6;
  }
  
  p {
    color: #b8c2cc;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 2rem;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      font-size: 0.9rem;
    }
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
  transition: transform 0.3s;
  
  
`;

const MovieRating = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(231, 26, 15, 0.9);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  z-index: 2;
`;

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
  z-index: 2;
`;

const MovieInfo = styled.div`
  padding: 0.75rem;
  
  @media (max-width: 768px) {
    padding: 0.65rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem;
  }
`;

const MovieTitle = styled.h3`
  color: #f3f4f6;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }
`;

const MovieGenres = styled.div`
  color: #b8c2cc;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReleaseDate = styled.div`
  color: #e71a0f;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-top: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.7rem;
    margin-top: 0.3rem;
    gap: 3px;
  }
`;

// MovieInfo overlay khi hover
const MovieOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Thay đổi từ center sang space-between */
  align-items: flex-start; /* Thay đổi từ center sang flex-start để căn trái */
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 25;
  
  ${MovieCard}:hover & {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 576px) {
    padding: 10px;
  }
  
  @media (max-width: 360px) {
    padding: 8px;
  }
`;

// Thêm styling cho movie-info-details trong overlay
const MovieInfoDetails = styled.div`
  width: 100%; /* Chiếm toàn bộ chiều rộng */
  margin-bottom: 15px;
  margin-top: 15px; 
  margin-left: 5px;
  text-align: left; /* Căn trái */
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 10px;
    color: #fff;
    font-weight: bold;
  }
  
  span {
    display: block;
    margin: 5px 0;
    font-size: 0.9rem;
    text-align: left; /* Căn trái */
  }
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
    margin-top: 12px;
    margin-left: 3px;
    
    h3 {
      font-size: 1rem;
      margin-bottom: 8px;
    }
    
    span {
      font-size: 0.85rem;
      margin: 4px 0;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 10px;
    margin-top: 10px;
    margin-left: 2px;
    
    h3 {
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    
    span {
      font-size: 0.8rem;
      margin: 3px 0;
    }
  }
  
  @media (max-width: 360px) {
    h3 {
      font-size: 0.85rem;
      margin-bottom: 5px;
    }
    
    span {
      font-size: 0.75rem;
      margin: 2px 0;
    }
  }
`;

// Cập nhật ButtonGroup
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%; /* Chiếm toàn bộ chiều rộng */
  
  @media (max-width: 768px) {
    gap: 6px;
  }
  
  @media (max-width: 576px) {
    gap: 5px;
  }
  
  @media (max-width: 360px) {
    gap: 4px;
    flex-direction: column;
  }
`;

// Cập nhật nút chi tiết
const DetailButton = styled.button`
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
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
    font-size: 0.8rem;
    border-radius: 4px;
  }
  
  @media (max-width: 360px) {
    padding: 4px 6px;
    font-size: 0.75rem;
    width: 100%;
    margin-bottom: 4px;
  }
`;

// Cập nhật nút đặt vé
const BookingButton = styled.button`
  background-color: #6a1b9a;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
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
    font-size: 0.8rem;
    border-radius: 4px;
  }
  
  @media (max-width: 360px) {
    padding: 4px 6px;
    font-size: 0.75rem;
    width: 100%;
  }
`;

// Thêm component AgeRating mới với styling tốt hơn
const AgeRating = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.75rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  /* Màu sắc dựa trên phân loại độ tuổi */
  background: ${props => {
    switch (props.$ageRating) {
      case 'P':
        return '#27ae60'; // Xanh lá - Phim dành cho mọi lứa tuổi
      case 'K':
        return '#27ae60'; // Xanh lá - Phim dành cho mọi lứa tuổi (Khuyến khích phụ huynh đi cùng)
      case 'C13':
        return '#f39c12'; // Vàng cam - Phim cấm khán giả dưới 13 tuổi
      case 'C16':
        return '#e67e22'; // Cam - Phim cấm khán giả dưới 16 tuổi
      case 'C18':
        return '#e74c3c'; // Đỏ - Phim cấm khán giả dưới 18 tuổi
      default:
        return '#2980b9'; // Xanh dương - Mặc định
    }
  }};
  color: white;
`;

// Hàm để xác định phân loại độ tuổi dựa vào dữ liệu phim
const getAgeRating = (movie) => {
  if (!movie) return 'P';

  // Nếu phim có trường ageRating, sử dụng nó
  if (movie.ageRating) return movie.ageRating;

  // Nếu không có, thử đoán từ các trường khác (thể loại, rating, v.v.)
  let genreList = [];

  // Xử lý các định dạng khác nhau của genres
  if (typeof movie.genres === 'string') {
    genreList = movie.genres.split(', ');
  } else if (Array.isArray(movie.genres)) {
    if (typeof movie.genres[0] === 'string') {
      genreList = movie.genres;
    } else if (movie.genres[0]?.genresName) {
      genreList = movie.genres.map(g => g.genresName);
    }
  } else if (movie.genreNames) {
    genreList = movie.genreNames.split(', ');
  }

  if (genreList.some(genre =>
    genre.includes('Kinh dị') ||
    genre.includes('Bạo lực'))) {
    return 'C16';
  }

  // Mặc định là P
  return 'P';
};

// Thêm hàm getBookmarkColor vào trước function MoviesPage
const getBookmarkColor = (ageRating) => {
  switch (ageRating) {
    case 'P': return '#27ae60';  // Xanh lá - Phim dành cho mọi lứa tuổi
    case 'K': return '#27ae60';  // Xanh lá - Khuyến khích phụ huynh đi cùng
    case 'C13': return '#f39c12'; // Vàng cam - Cấm dưới 13 tuổi
    case 'C16': return '#e67e22'; // Cam - Cấm dưới 16 tuổi
    case 'C18': return '#e74c3c'; // Đỏ - Cấm dưới 18 tuổi
    case 'PG-13': return '#f39c12'; // Tương tự C13
    default: return '#2980b9';   // Xanh dương - Mặc định
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Kiểm tra date có hợp lệ không
    if (isNaN(date.getTime())) {
      return 'Ngày không hợp lệ';
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Ngày không hợp lệ';
  }
};

function MoviesPage() {
  const pageRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('nowShowing');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [genreOptions, setGenreOptions] = useState(["Tất cả"]);
  const location = useLocation();

  // Scroll lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Tự động scroll khi component được mount
  useEffect(() => {
    scrollToTop();
  }, []);

  // Kiểm tra chuyển hướng từ trang chủ và load phim
  useEffect(() => {
    if (location.state?.category) {
      setActiveTab(location.state.category);
    }

    loadMovies(location.state?.category || activeTab);
    scrollToTop();
  }, [location.key]);

  // Tải danh sách thể loại khi component mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresList = await getAllGenres();
        if (genresList && Array.isArray(genresList) && genresList.length > 0) {
          setGenreOptions(["Tất cả", ...genresList.map(genre => genre.genresName)]);
        }
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };

    loadGenres();
  }, []);

  // Xử lý filter genres
  useEffect(() => {
    if (movies.length > 0) {
      let results = [...movies];

      if (selectedGenre !== 'Tất cả') {
        results = results.filter(movie => {
          // Xử lý nhiều dạng dữ liệu genres
          if (typeof movie.genres === 'string') {
            return movie.genres.includes(selectedGenre);
          } else if (Array.isArray(movie.genres)) {
            if (typeof movie.genres[0] === 'string') {
              return movie.genres.some(genre => genre.includes(selectedGenre));
            } else if (movie.genres[0]?.genresName) {
              return movie.genres.some(genre => genre.genresName.includes(selectedGenre));
            }
          } else if (movie.genreNames) {
            return movie.genreNames.includes(selectedGenre);
          }
          return false;
        });
      }

      // Loại bỏ phần tìm kiếm theo tên phim vì đã được comment out
      setFilteredMovies(results);
    }
  }, [movies, selectedGenre]);

  // Hàm tải danh sách phim theo category
  const loadMovies = async (category) => {
    try {
      setLoading(true);
      let result;

      if (category === 'comingSoon') {
        result = await getComingSoonMovies();
      } else {
        result = await getNowShowingMovies();
      }

      setMovies(result);
      setFilteredMovies(result);
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi người dùng chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setSelectedGenre('Tất cả');
    loadMovies(tab);
    scrollToTop();
  };

  // Hàm hiển thị thể loại phim
  const displayGenreList = (movie) => {
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

  return (
    <PageContainer ref={pageRef}>
      <PageHeader>
        <PageTitle>Danh sách phim</PageTitle>
      </PageHeader>

      <TabContainer>
        <TabButton
          $isActive={activeTab === 'nowShowing'}
          onClick={() => handleTabChange('nowShowing')}
        >
          Phim Đang Chiếu
        </TabButton>
        <TabButton
          $isActive={activeTab === 'comingSoon'}
          onClick={() => handleTabChange('comingSoon')}
        >
          Phim Sắp Chiếu
        </TabButton>
      </TabContainer>

      <FiltersContainer>
        {/* Loại bỏ phần SearchBox vì đã được comment out trong code gốc */}
        <FilterContainer>
          <IconWrapper>
            <FaFilter />
          </IconWrapper>
          <GenreFilter
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genreOptions.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </GenreFilter>
        </FilterContainer>
      </FiltersContainer>

      {loading ? (
        <LoadingIndicator>
          <StyledSpinner />
          <p>Đang tải danh sách phim...</p>
        </LoadingIndicator>
      ) : filteredMovies.length > 0 ? (
        <MovieGrid>
          {filteredMovies.map(movie => (
            <MovieCard key={movie.id} to={`/movie/${movie.id}`}>
              <MoviePoster>
                <PosterImage
                  src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title || 'Movie poster'}
                />

                <div className="bookmark-badge" style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  zIndex: 20,
                  transition: 'opacity 0.3s ease'
                }}>
                  <BookmarkBadge
                    rating={getAgeRating(movie)}
                    color={getBookmarkColor(getAgeRating(movie))}
                  />
                </div>

                <MovieOverlay>
                  <MovieInfoDetails>
                    <h3>{movie.title}</h3>
                    {movie.duration && <span>Thời lượng: {movie.duration} phút</span>}
                    <span>Thể loại: {displayGenreList(movie)}</span>
                  </MovieInfoDetails>

                  <ButtonGroup>
                    <DetailButton>Chi tiết</DetailButton>
                    <BookingButton>Đặt vé</BookingButton>
                  </ButtonGroup>
                </MovieOverlay>
              </MoviePoster>

              <MovieInfo>
                <MovieTitle>{movie.title}</MovieTitle>
                
                {(movie.startDate || movie.releaseDate) && (
                  <ReleaseDate>
                    <FaCalendarAlt size={12} />
                    {formatDate(movie.startDate || movie.releaseDate)}
                  </ReleaseDate>
                )}
              </MovieInfo>
            </MovieCard>
          ))}
        </MovieGrid>
      ) : (
        <NoResults>
          <h3>Không tìm thấy kết quả</h3>
          <p>Hãy thử chọn thể loại khác.</p>
        </NoResults>
      )}
    </PageContainer>
  );
}

export default MoviesPage;