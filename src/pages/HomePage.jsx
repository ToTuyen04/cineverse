import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // Thêm import này
import MovieCarousel from '../components/MovieCarousel';
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaMapMarkerAlt, FaSearch, FaCalendarAlt, FaClock } from 'react-icons/fa'; // Thêm FaArrowRight, FaMapMarkerAlt, FaSearch, FaCalendarAlt, FaClock
import { getNowShowingMovies, getComingSoonMovies, getBannerMovie, getMoviesByTheater } from '../api/services/movieService';
import { getMovieScheduleByTheaterAndMovie } from '../api/services/showtimeService';
import Button from "../components/common/Button";
import { getTheaters, mapTheatersData } from '../api/services/theaterService';

// Cập nhật PageContainer để responsive hơn
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 100px 0 100px;
  
  @media (max-width: 1200px) {
    padding: 25px 70px 0 70px;
  }
  
  @media (max-width: 992px) {
    padding: 20px 50px 0 50px;
  }
  
  @media (max-width: 768px) {
    padding: 15px 30px 0 30px;
  }
  
  @media (max-width: 576px) {
    padding: 10px 15px 0 15px;
  }
`;

// Cập nhật BannerContainer cho responsive
const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 360px;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
  margin-top: 20px;
  
  @media (max-width: 992px) {
    height: 320px;
  }
  
  @media (max-width: 768px) {
    height: 280px;
    border-radius: 6px;
  }
  
  @media (max-width: 576px) {
    height: 240px;
    margin-top: 10px;
  }
`;

// Cập nhật BannerArrow để responsive, nhỏ lại trên mobile
const BannerArrow = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(231, 26, 15, 0.8);
    transform: translateY(-50%) scale(1.1);
  }

  &.left {
    left: 20px;
  }

  &.right {
    right: 20px;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    &.left {
      left: 10px;
    }
    
    &.right {
      right: 10px;
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 576px) {
    width: 30px;
    height: 30px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

// Cập nhật BannerPoster để responsive
const BannerPoster = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 5rem;
  
  @media (max-width: 992px) {
    padding: 0 4rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 3rem;
  }
  
  @media (max-width: 576px) {
    padding: 0 2rem;
    
    h1 {
      font-size: 1.8rem !important;
      margin-bottom: 0.75rem !important;
    }
    
    p {
      font-size: 0.9rem !important;
      margin-bottom: 1.5rem !important;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  @media (max-width: 480px) {
    h1 {
      font-size: 1.5rem !important;
      margin-bottom: 0.5rem !important;
    }
    
    p {
      font-size: 0.85rem !important;
      margin-bottom: 1rem !important;
      -webkit-line-clamp: 2;
    }
  }
`;

// Cập nhật ButtonGroup cho responsive
const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 576px) {
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 200px;
  }
`;

// Cập nhật DetailButton cho responsive
const DetailButton = styled.button`
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-size: 1rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 1.25rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

// Cập nhật BookingButton cho responsive
const BookingButton = styled.button`
  background-color: #6a1b9a; /* Màu tím */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #8e24aa; /* Màu tím sáng hơn khi hover */
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 1.25rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

// Cập nhật SectionTitle cho responsive
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color:rgb(255, 255, 255); /* Màu chữ chính */
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }
`;

// Cập nhật BannerDots cho responsive
const BannerDots = styled.div`
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 10;
  
  @media (max-width: 576px) {
    bottom: 10px;
    gap: 6px;
  }
`;

// Cập nhật BannerDot cho responsive
const BannerDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#e71a0f' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#e71a0f' : 'rgba(255, 255, 255, 0.8)'};
  }
  
  @media (max-width: 576px) {
    width: 8px;
    height: 8px;
  }
`;

// Thêm styled component cho nút Xem thêm
// Cập nhật ViewMoreButton cho responsive
const ViewMoreButton = styled.button`
  background-color: transparent;
  border: 2px solid #8e24aa;
  color: #8e24aa;
  padding: 0.75rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem auto;
  gap: 10px;
  
  &:hover {
    background-color: rgba(123, 15, 231, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(148, 15, 231, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.75rem;
    font-size: 1rem;
    margin: 1.5rem auto;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
    margin: 1.25rem auto;
    gap: 8px;
  }
`;

// Thêm styled component cho container section
// Cập nhật SectionContainer cho responsive
const SectionContainer = styled.div`
  margin: 20px 0 0 0;
  padding: 20px;
  border-radius: 8px;
  min-height: 200px; 
  
  @media (max-width: 768px) {
    margin: 15px 0 0 0;
    padding: 15px;
    min-height: 180px;
  }
  
  @media (max-width: 576px) {
    margin: 10px 0 0 0;
    padding: 10px;
    min-height: 150px;
  }
`;

// Cập nhật SelectionBar cho responsive - đổi sang flex-direction column trên màn hình nhỏ
const SelectionBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  padding: 10px 20px;
  background-color: #f5f5f5; /* Màu nền sáng */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  
  @media (max-width: 992px) {
    gap: 20px;
    padding: 10px 15px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  @media (max-width: 576px) {
    gap: 12px;
    padding: 12px;
    border-radius: 6px;
  }
`;

// Cập nhật SelectWrapper cho responsive
const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
  color: #4a4a4a;
  width: 200px; /* Thêm chiều rộng cố định */
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 350px;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a1b9a; /* Màu tím cho icon */
  pointer-events: none;
`;

// Cập nhật StyledSelect cho responsive
const StyledSelect = styled.select`
  padding: 10px 20px 10px 40px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  color: #4a4a4a;
  background-color: transparent;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.3s;
  width: 200px; /* Thêm chiều rộng cố định */
  max-width: 200px; /* Thêm chiều rộng tối đa */
  text-overflow: ellipsis; /* Hiển thị dấu ... khi text quá dài */
  white-space: nowrap; /* Không xuống dòng */
  overflow: hidden; /* Ẩn phần text tràn */

  &:hover {
    border-color: #6a1b9a;
  }

  &:focus {
    outline: none;
    border-color: #6a1b9a;
    box-shadow: 0 0 5px rgba(106, 27, 154, 0.5);
  }

  &:disabled {
    color: #aaa;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    font-size: 0.95rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    padding: 8px 15px 8px 35px;
  }
`;

// Thêm LoadingOverlay component
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const LoadingContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #F9376E;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 576px) {
    width: 50px;
    height: 50px;
  }
`;

const LoadingLogo = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  background: linear-gradient(to right, #FF4D4D, #F9376E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 576px) {
    font-size: 2rem;
  }
`;

const LoadingText = styled.div`
  color: white;
  font-size: 1.2rem;
  text-align: center;
  max-width: 80%;
  margin-top: 10px;
  
  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

function HomePage() {
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [bannerMovies, setBannerMovies] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);
  const [filteredTimes, setFilteredTimes] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  // Thêm state để theo dõi tiến trình tải
  const [loadingProgress, setLoadingProgress] = useState('Đang tải dữ liệu phim...');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const navigate = useNavigate(); // Thêm hook để chuyển hướng

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setLoadingProgress('Đang tải dữ liệu phim...');
        
        // Fetch movie data
        const [nowShowing, comingSoon, banner] = await Promise.all([
          getNowShowingMovies(),
          getComingSoonMovies(),
          getBannerMovie()
        ]);

        setLoadingProgress('Đang tải dữ liệu rạp chiếu...');
        // Fetch theaters data
        const theatersData = await getTheaters();
        
        // Format theaters data
        const formattedTheaters = theatersData.map(theater => ({
          id: theater.theaterId,
          name: theater.theaterName,
          location: theater.theaterLocation,
          hotline: theater.theaterHotline
        }));

        const uniqueBannerMovies = [banner, ...nowShowing.slice(0, 4)].filter(
          (movie, index, self) => self.findIndex(m => m.id === movie.id) === index
        );

        // Update all states
        setNowShowingMovies(nowShowing);
        setComingSoonMovies(comingSoon);
        setBannerMovies(uniqueBannerMovies);
        setTheaters(formattedTheaters);
        
        // Set initial data loaded flag
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoadingProgress('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau...');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, []);

  // Chuyển banner ngay lập tức không có animation
  const handlePrevBanner = () => {
    setCurrentBannerIndex(prevIndex =>
      prevIndex === 0 ? bannerMovies.length - 1 : prevIndex - 1
    );
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex(prevIndex =>
      prevIndex === bannerMovies.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Chuyển banner theo index
  const handleDotClick = (index) => {
    setCurrentBannerIndex(index);
  };

  // Thêm hàm xử lý khi click vào nút "Xem thêm"
  const handleViewMoreNowShowing = () => {
    navigate('/movies', { state: { category: 'nowShowing' } });
  };

  const handleViewMoreComingSoon = () => {
    navigate('/movies', { state: { category: 'comingSoon' } });
  };

  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;
    setSelectedTheater(theaterId);
    if (theaterId) {
      fetchMovies(theaterId);
    } else {
      // Reset các trường khác nếu rạp được đặt về giá trị trống
      setMovies([]);
      setSelectedMovie('');
      setDates([]);
      setSelectedDate('');
      setTimes([]);
      setSelectedTime('');
    }
  };

  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    setSelectedMovie(movieId);
    if (movieId && selectedTheater) {
      fetchSchedule(movieId, selectedTheater);
    } else {
      // Reset các trường liên quan
      setDates([]);
      setSelectedDate('');
      setTimes([]);
      setSelectedTime('');
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);

    // Lọc suất chiếu theo ngày đã chọn
    if (date) {
      const filteredTimes = times.filter(time => time.date === date);
      setFilteredTimes(filteredTimes);
    } else {
      setFilteredTimes([]);
    }
    setSelectedTime('');
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleBookNow = () => {
    if (selectedTheater && selectedMovie && selectedDate && selectedTime) {
      // Tìm suất chiếu đã chọn để lấy showtimeId
      const selectedShowtime = times.find(time => time.value === selectedTime);
      
      if (selectedShowtime) {
        // Tìm đối tượng theater đầy đủ
        const theaterObject = theaters.find(t => t.id === selectedTheater);
        
        // Tìm ngày đã chọn dưới dạng đối tượng date
        const dateObject = dates.find(d => d.value === selectedDate);
        
        // Chuyển hướng đến trang booking với các thông tin đã chọn
        navigate(`/movie/${selectedMovie}/booking`, {
          state: {
            movieId: selectedMovie,
            theaterId: selectedTheater,
            theaterObject: theaterObject,  // Truyền đối tượng theater đầy đủ
            showtimeId: selectedShowtime.showtimeId,
            dateObject: dateObject,        // Truyền đối tượng date đầy đủ
            showtimeObject: selectedShowtime, // Truyền đối tượng showtime đầy đủ
            preselected: true,             // Flag để biết đây là từ Đặt Vé Nhanh
            scrollToSeats: true            // Flag để cuộn xuống phần chọn ghế
          }
        });
      }
    }
  };

  const fetchMovies = async (theaterId) => {
    try {
      setLoadingMovies(true);
      setLoadingProgress('Đang tải danh sách phim cho rạp đã chọn...');
      
      // Sử dụng API mới để lấy phim theo rạp
      const moviesData = await getMoviesByTheater(theaterId);
      
      // Format dữ liệu phim để phù hợp với dropdown
      const formattedMovies = moviesData.map(movie => ({
        id: movie.movieId,
        name: movie.movieName
      }));
      
      setMovies(formattedMovies);
    } catch (error) {
      console.error('Error fetching movies by theater:', error);
      setMovies([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  // Hàm mới để lấy lịch chiếu với cấu trúc dữ liệu API thực tế
const fetchSchedule = async (movieId, theaterId) => {
  try {
    setLoadingSchedule(true);
    setLoadingProgress('Đang tải lịch chiếu cho phim đã chọn...');
    const response = await getMovieScheduleByTheaterAndMovie(movieId, theaterId);
    
    
    // Kiểm tra cấu trúc dữ liệu từ API
    if (response.success && response.data && response.data.showtimesData && response.data.showtimesData.length > 0) {
      // Tạo mảng cho ngày và xuất chiếu
      const datesArray = [];
      const allTimes = [];
      
      // Xử lý dữ liệu lịch chiếu
      response.data.showtimesData.forEach(dateItem => {
        // Format: DD/MM/YYYY -> YYYY-MM-DD
        const [day, month, year] = dateItem.date.split('/');
        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // Xác định thứ trong tuần từ YYYY-MM-DD
        const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayOfWeek = dayNames[date.getDay()];
        const formattedLabel = `${dayOfWeek}, ${day}/${month}`;
        
        // Tạo object ngày với danh sách xuất chiếu
        const dateObject = {
          value: dateStr,
          label: formattedLabel,
          times: []
        };
        
        // Thêm các xuất chiếu của ngày này
        if (dateItem.schedule && dateItem.schedule.length > 0) {
          dateItem.schedule.forEach(schedule => {
            const timeObj = {
              value: schedule.showtime_id.toString(),
              label: schedule.time,
              date: dateStr,
              roomName: schedule.room_name || `Phòng ${schedule.room_id}`,
              showtimeId: schedule.showtime_id,
              screenType: schedule.screen_type_name,
              price: schedule.screen_type_price
            };
            
            // Thêm vào danh sách xuất chiếu của ngày
            dateObject.times.push(timeObj);
            
            // Thêm vào danh sách tất cả xuất chiếu
            allTimes.push(timeObj);
          });
          
          // Sắp xếp xuất chiếu theo thời gian
          dateObject.times.sort((a, b) => {
            const [aHours, aMinutes] = a.label.split(':').map(Number);
            const [bHours, bMinutes] = b.label.split(':').map(Number);
            
            if (aHours !== bHours) return aHours - bHours;
            return aMinutes - bMinutes;
          });
          
          // Thêm ngày vào danh sách các ngày
          datesArray.push(dateObject);
        }
      });
      
      // Sắp xếp ngày theo thứ tự tăng dần
      datesArray.sort((a, b) => new Date(a.value) - new Date(b.value));
      
      // Cập nhật state
      setDates(datesArray);
      setTimes(allTimes);
      
      // Đặt ngày đầu tiên làm mặc định nếu có
      if (datesArray.length > 0) {
        setSelectedDate(datesArray[0].value);
        setFilteredTimes(datesArray[0].times);
      }
    } else {
      setDates([]);
      setTimes([]);
      setFilteredTimes([]);
    }
  } catch (error) {
    console.error('Error fetching schedule:', error);
    setDates([]);
    setTimes([]);
    setFilteredTimes([]);
  } finally {
    setLoadingSchedule(false);
  }
};

  const currentBanner = bannerMovies[currentBannerIndex];

  // Hiển thị LoadingOverlay khi đang tải dữ liệu ban đầu
  if (!initialDataLoaded) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingLogo>CineVerse</LoadingLogo>
          <LoadingSpinner />
          <LoadingText>{loadingProgress}</LoadingText>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  return (
    <>
      {/* Hiển thị loading overlay khi fetch dữ liệu từ API */}
      {(loading || loadingMovies || loadingSchedule) && (
        <LoadingOverlay>
          <LoadingContent>
            <LoadingLogo>CineVerse</LoadingLogo>
            <LoadingSpinner />
            <LoadingText>{loadingProgress}</LoadingText>
          </LoadingContent>
        </LoadingOverlay>
      )}
      
      <PageContainer>
        {/* Banner Poster Phim với nút điều hướng */}
        <BannerContainer>
          {!loading && bannerMovies.length > 0 && (
            <>
              <BannerPoster
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), 
                                  url(${currentBanner?.backdrop || 'https://via.placeholder.com/1200x360?text=No+Banner'})`,
                }}
              >
                <div style={{ maxWidth: '500px', color: '#fff' }}>
                  <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    {currentBanner?.title || 'Tên Phim'}
                  </h1>
                  <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>
                    {currentBanner?.description || 'Mô tả phim sẽ hiển thị ở đây khi có dữ liệu.'}
                  </p>
                  <ButtonGroup>
                    <DetailButton onClick={() => navigate(`/movie/${currentBanner?.id}`)}>
                      Chi tiết
                    </DetailButton>
                    <BookingButton onClick={() => navigate(`/movie/${currentBanner?.id}/booking`)}>
                      Đặt vé ngay
                    </BookingButton>
                  </ButtonGroup>
                </div>
              </BannerPoster>

              {/* Nút điều hướng banner */}
              <BannerArrow className="left" onClick={handlePrevBanner}>
                <FaChevronLeft size={24} color="#fff" />
              </BannerArrow>
              <BannerArrow className="right" onClick={handleNextBanner}>
                <FaChevronRight size={24} color="#fff" />
              </BannerArrow>

              {/* Hiển thị dots để chọn banner */}
              <BannerDots>
                {bannerMovies.map((_, index) => (
                  <BannerDot
                    key={index}
                    active={index === currentBannerIndex}
                    onClick={() => handleDotClick(index)}
                  />
                ))}
              </BannerDots>
            </>
          )}
        </BannerContainer>

        <SectionContainer>
          <SectionTitle>Đặt Vé Nhanh</SectionTitle>
          <SelectionBar>
            <SelectWrapper>
              <IconWrapper>
                <FaMapMarkerAlt size={16} />
              </IconWrapper>
              <StyledSelect
                value={selectedTheater}
                onChange={handleTheaterChange}
              >
                <option value=""> Chọn Rạp</option>
                {theaters.map(theater => (
                  <option key={theater.id} value={theater.id}>
                    {theater.name}
                  </option>
                ))}
              </StyledSelect>
            </SelectWrapper>

            <SelectWrapper>
              <IconWrapper>
                <FaSearch size={16} />
              </IconWrapper>
              <StyledSelect
                value={selectedMovie}
                onChange={handleMovieChange}
                disabled={!selectedTheater || loadingMovies}
              >
                <option value="">
                  {loadingMovies ? 'Đang tải phim...' : ' Chọn Phim'}
                </option>
                {movies.map(movie => (
                  <option key={movie.id} value={movie.id}>
                    {movie.name}
                  </option>
                ))}
              </StyledSelect>
            </SelectWrapper>

            <SelectWrapper>
              <IconWrapper>
                <FaCalendarAlt size={16} />
              </IconWrapper>
              <StyledSelect
                value={selectedDate}
                onChange={handleDateChange}
                disabled={!selectedMovie || loadingSchedule || dates.length === 0}
              >
                {loadingSchedule ? (
                  <option value="">Đang tải lịch...</option>
                ) : dates.length === 0 ? (
                  <option value="">Không có lịch chiếu</option>
                ) : (
                  <>
                    <option value="">Chọn Ngày</option>
                    {dates.map(date => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </>
                )}
              </StyledSelect>
            </SelectWrapper>

            <SelectWrapper>
              <IconWrapper>
                <FaClock size={16} />
              </IconWrapper>
              <StyledSelect
                value={selectedTime}
                onChange={handleTimeChange}
                disabled={!selectedDate || filteredTimes.length === 0}
              >
                <option value=""> Chọn Suất</option>
                {filteredTimes.map(time => (
                  <option key={time.value} value={time.value}>
                    {time.label} - {time.roomName}
                  </option>
                ))}
              </StyledSelect>
            </SelectWrapper>

            <Button
              onClick={handleBookNow}
              disabled={!selectedTheater || !selectedMovie || !selectedDate || !selectedTime}
            >
              Đặt Ngay
            </Button>
          </SelectionBar>
        </SectionContainer>

        {/* Carousel phim đang chiếu */}
        <SectionContainer>
          <SectionTitle>Phim Đang Chiếu</SectionTitle>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <>
              <MovieCarousel movies={nowShowingMovies} />
              <ViewMoreButton onClick={handleViewMoreNowShowing}>
                Xem thêm <FaArrowRight />
              </ViewMoreButton>
            </>
          )}
        </SectionContainer>

        {/* Carousel phim sắp chiếu */}
        <SectionContainer>
          <SectionTitle>Phim Sắp Chiếu</SectionTitle>
          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <>
              <MovieCarousel movies={comingSoonMovies} />
              <ViewMoreButton onClick={handleViewMoreComingSoon}>
                Xem thêm <FaArrowRight />
              </ViewMoreButton>
            </>
          )}
        </SectionContainer>
      </PageContainer>
    </>
  );
}

export default HomePage;