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
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  z-index: 1;
  font-size: 0.85rem;
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
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #f3f4f6;
  margin-bottom: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #3f425a;
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
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

// Thêm container cho filter dropdown
const FilterContainer = styled.div`
  position: relative;
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
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
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
`;

const MovieTitle = styled.h3`
  color: #f3f4f6;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
`;

// Cập nhật ButtonGroup
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%; /* Chiếm toàn bộ chiều rộng */
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
  // Thêm ref cho container chính
  const pageRef = useRef(null);

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeTab, setActiveTab] = useState('nowShowing'); // Mặc định hiển thị phim đang chiếu
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  
  // Thêm state mới cho genres
  const [genreOptions, setGenreOptions] = useState(["Tất cả"]);

  const location = useLocation();

  // Thêm hàm scroll lên đầu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Hoặc dùng ref nếu muốn scroll đến vị trí cụ thể
    // if (pageRef.current) {
    //   pageRef.current.scrollIntoView({ behavior: 'smooth' });
    // }
  };

  // Tự động scroll khi component được mount
  useEffect(() => {
    scrollToTop();
  }, []);

  // Thay đổi dependency để bắt mọi thay đổi khi điều hướng
  useEffect(() => {
    // Kiểm tra xem có được chuyển hướng từ trang chủ với category không
    if (location.state?.category) {
      setActiveTab(location.state.category);
    }

    loadMovies(location.state?.category || activeTab);

    // Scroll to top khi thay đổi location
    scrollToTop();

  }, [location.key]); // Sử dụng location.key thay vì location.pathname

  // Thêm useEffect để tải danh sách thể loại khi component mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresList = await getAllGenres();
        if (genresList && Array.isArray(genresList) && genresList.length > 0) {
          // Thêm option "Tất cả" vào đầu danh sách
          setGenreOptions(["Tất cả", ...genresList.map(genre => genre.genresName)]);
        }
      } catch (error) {
        console.error('Error loading genres:', error);
      }
    };

    loadGenres();
  }, []); // Chỉ chạy một lần khi component mount

  // Xử lý filter và search
  useEffect(() => {
    if (movies.length > 0) {
      let results = [...movies]; // Thêm dòng này để khởi tạo results

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

      // Search theo tên phim
      // if (searchTerm) {
      //   results = results.filter(movie =>
      //     movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //     (movie.originalTitle && movie.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      //   );
      // }

      // setFilteredMovies(results);
    }
  }, [movies, selectedGenre, searchTerm]);

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
      setFilteredMovies(result); // Thêm dòng này để cập nhật filteredMovies khi load
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
    setSearchTerm(''); // Reset search khi chuyển tab
    setSelectedGenre('Tất cả'); // Reset filter khi chuyển tab
    loadMovies(tab);
    scrollToTop(); // Thêm scroll to top khi chuyển tab
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
        <SearchBox>
          {/* <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          /> */}
        </SearchBox>

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

                {/* Thêm AgeRating vào cạnh BookmarkBadge */}
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

                {/* <MovieReleaseStatus $status={activeTab}>
                  {activeTab === 'nowShowing' ? 'Đang chiếu' : 'Sắp chiếu'}
                </MovieReleaseStatus> */}

                {/* Phần còn lại không đổi */}
                <MovieOverlay>
                  <MovieInfoDetails>
                    <h3>{movie.title}</h3>
                    {movie.duration && <span>Thời lượng: {movie.duration} phút</span>}
                    {/* Sửa hiển thị genres */}
                    <span>Thể loại: {
                      (() => {
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
                      })()
                    }</span>

                  </MovieInfoDetails>

                 <ButtonGroup>
                    <DetailButton>Chi tiết</DetailButton>
                    <BookingButton>Đặt vé</BookingButton>
                 </ButtonGroup>
                </MovieOverlay>
              </MoviePoster>

              {/* Thông tin phim ở dưới poster */}
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
          <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn thể loại khác.</p>
        </NoResults>
      )}
    </PageContainer>
  );
}

export default MoviesPage;