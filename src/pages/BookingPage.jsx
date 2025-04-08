import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronLeft, FaClock, FaMapMarkerAlt, FaCheck, FaTicketAlt, FaMinus, FaPlus } from 'react-icons/fa';
import { getMovieById } from '../api/services/movieService';
import { getShowtimesByTheater, getSeatsByShowtime, bookTickets } from '../api/services/bookingService';
import { BookmarkBadge } from '../components/movies/MovieCard';
import { getAgeRating, getBookmarkColor, formatDate } from '../utils/movieUtils';
import { MAX_SEATS_SELECTION, SEAT_TYPES } from '../config/bookingConfig';
import { formatCurrency, formatShowDate } from '../utils/formatters';
import { getConcessions } from '../api/services/concessionsService';
import { getTheaters } from '../api/services/theaterService';
import { getShowtimesByMovieAndTheater } from '../api/services/showtimeService';

// Styled components
// Cập nhật PageContainer để hiển thị tốt hơn trên thiết bị di động
const PageContainer = styled.div`
  max-width: 80%;
  margin: 0 auto;
  padding-bottom: calc(7rem + 100px); 
  min-height: calc(100vh + 200px);
  position: relative;
  overflow-y: visible;
  box-sizing: border-box;
  
  @media (max-width: 1024px) {
    max-width: 90%;
  }
  
  @media (max-width: 768px) {
    max-width: 95%;
    padding-bottom: calc(9rem + 100px); // Tăng padding-bottom để tránh bị che bởi SummarySection
  }
`;

// Thêm background với chấm màu tím và xanh loang
const PageOverlay = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  
  &:before {
    content: '';
    position: absolute;
    top: 15%;
    left: 10%;
    width: 50vw;
    height: 50vw;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(180, 140, 230, 0.25) 0%, rgba(160, 120, 220, 0.1) 40%, transparent 80%);
    filter: blur(60px);
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 15%;
    right: 10%;
    width: 45vw;
    height: 45vw;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(240, 240, 255, 0.05) 50%, transparent 80%);
    filter: blur(50px);
  }
  
  /* Thêm chấm thứ ba */
  &::before::before {
    content: '';
    position: absolute;
    top: 40%;
    right: 25%;
    width: 35vw;
    height: 35vw;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200, 180, 255, 0.15) 0%, rgba(180, 150, 255, 0.05) 50%, transparent 80%);
    filter: blur(40px);
  }
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

const BookingHeader = styled.div`
  display: flex;
  align-items: start; 
  gap: 2rem; 
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center; 
  }
`;

const MoviePoster = styled.div`
  width: 250px; 
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 200px; /* Giảm kích thước poster trên màn hình nhỏ */
    margin-bottom: 1rem;
  }
`;

const MovieInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: start;
`;

// Cập nhật MovieTitle để tránh tràn trên màn hình nhỏ
const MovieTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color:rgb(230, 255, 6);
  margin-bottom: 1rem;
  
  @media (max-width: 1200px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    text-align: center;
  }
  
  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const MovieMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 1rem;

  span {
    color: #b8c2cc;
    font-size: 0.9rem;
    display: flex;
    align-items: start;
    gap: 0.4rem;
  }
`;

const MovieDetails = styled.div`
  color: #b8c2cc;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: start;

  p {
    margin-bottom: 0.5rem;

    strong {
      color: #f3f4f6;
    }
  }
`;

const StepContent = styled.div`
  background-color: #1a1a2e;
  padding: 1.5rem;
  border-radius: 8px;
`;

// Cập nhật TheatersList để hiển thị tốt hơn trên thiết bị di động
const TheatersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const TheaterCard = styled.div`
  background-color: ${props => props.$selected ? 'rgba(231, 26, 15, 0.1)' : '#2c2c44'};
  border: 1px solid ${props => props.$selected ? '#e71a0f' : 'transparent'};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(231, 26, 15, 0.1); /* Giống với showtime và date */
    
  }
`;

const TheaterImage = styled.div`
  height: 120px;
  background-size: cover;
  background-position: center;
`;

const TheaterInfo = styled.div`
  padding: 1rem;
`;

const TheaterName = styled.h3`
  font-size: 1.1rem;
  color: #f3f4f6;
  margin-bottom: 0.5rem;
`;

const TheaterAddress = styled.p`
  font-size: 0.9rem;
  color: #b8c2cc;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  
  svg {
    margin-top: 3px;
    min-width: 14px;
  }
`;

// Cập nhật DateSelector để hiển thị tốt hơn trên thiết bị di động
const DateSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2c2c44;
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3f3f5a;
    border-radius: 5px;
  }
  
  @media (max-width: 576px) {
    gap: 0.5rem;
  }
`;

// Cập nhật DateCard để hiển thị tốt hơn trên thiết bị di động
const DateCard = styled.div`
  min-width: 100px;
  padding: 1rem;
  background-color: ${props => props.$selected ? 'rgba(231, 26, 15, 0.1)' : '#2c2c44'};
  border: 1px solid ${props => props.$selected ? '#e71a0f' : 'transparent'};
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  
  .day {
    color: ${props => props.$selected ? '#e71a0f' : '#b8c2cc'};
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .date {
    color: #f3f4f6;
    font-weight: ${props => props.$selected ? 'bold' : 'normal'};
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: rgba(231, 26, 15, 0.1);
  }
  
  @media (max-width: 576px) {
    min-width: 80px;
    padding: 0.75rem;
    
    .date {
      font-size: 0.95rem;
    }
  }
`;

// Cập nhật ShowtimesList để hiển thị tốt hơn trên thiết bị di động
const ShowtimesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;

// Cập nhật ShowtimeCard để hiển thị tốt hơn trên thiết bị di động
const ShowtimeCard = styled.div`
  background-color: ${props => props.$selected ? 'rgba(231, 26, 15, 0.1)' : '#2c2c44'};
  border: 1px solid ${props => props.$selected ? '#e71a0f' : 'transparent'};
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(231, 26, 15, 0.1);
  }
  
  .time {
    color: ${props => props.$selected ? '#e71a0f' : '#f3f4f6'};
    font-size: 1.2rem;
    font-weight: ${props => props.$selected ? 'bold' : 'normal'};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .info {
    color: #b8c2cc;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem;
    
    .time {
      font-size: 1rem;
      gap: 0.3rem;
    }
    
    .info {
      font-size: 0.8rem;
    }
  }
`;

// Thay thế component ScreenIndicator hiện tại
// Cập nhật ScreenIndicator để hiển thị tốt hơn trên thiết bị di động
const ScreenIndicator = styled.div`
  width: 90%;
  height: 70px;
  background: linear-gradient(to right, rgba(10, 132, 255, 0.6), rgba(10, 132, 255, 0.9), rgba(10, 132, 255, 0.6));
  margin: 0 auto 7rem;
  border-radius: 100% 100% 0 0; /* Tăng độ cong lên 100% */
  position: relative;
  transform: perspective(500px) rotateX(75deg); /* Tăng góc rotateX để tạo hiệu ứng cong hơn */
  box-shadow: 0 0 40px rgba(10, 132, 255, 0.8);
  
  @media (max-width: 768px) {
    width: 95%;
    height: 60px;
    margin: 0 auto 5rem;
  }
  
  @media (max-width: 576px) {
    width: 100%;
    height: 40px;
    margin: 0 auto 3rem;
  }
  
  &:before {
    content: ""; /* Đã bỏ chữ "MÀN HÌNH" */
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  &:after {
    content: "";
    position: absolute;
    width: 140%;
    height: 60px;
    bottom: -20px;
    left: -20%;
    border-radius: 100% 100% 0 0;
    z-index: -1;
    transform: perspective(300px) rotateX(40deg);
  }
`;

const SeatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;



const SeatLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .box {
    width: 20px;
    height: 20px;
    border-radius: 3px;
    background-color: ${props => props.$color};
  }
  
  .text {
    color: #b8c2cc;
    font-size: 0.9rem;
  }
`;



// Thay thế SummarySection
// Cập nhật SummarySection để hiển thị tốt hơn trên thiết bị di động
const SummarySection = styled.div`
  max-width: 100%;
  box-sizing: border-box;
  background-color: #1a1a2e;
  color: #f3f4f6;
  padding: 1rem 2rem;
  position: sticky; 
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.3);
  border-top: 2px solid #2c2c44;
  min-height: 80px;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    min-height: 120px;
  }
  
  @media (max-width: 576px) {
    padding: 0.75rem;
    min-height: 140px;
  }
`;



const Button = styled.button`
  padding: 0.5rem 1.25rem; /* Giảm padding */
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem; /* Giảm font size */
  
  &.back {
    background-color: transparent;
    color: #f3f4f6;
    border: 1px solid #f3f4f6;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  }
  
  &.next {
    background-color: #e71a0f;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem; /* Giảm padding */
    
    &:hover {
      background-color: #ff3e33;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(231, 26, 15, 0.3);
    }
    
    &:disabled {
      background-color: #666;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
`;

// Cập nhật SeatName để hiển thị tốt hơn trên thiết bị di động
const SeatName = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: ${props => props.$selected ? '#fff' : props.$reserved ? '#666' : '#b8c2cc'};
  z-index: 2;
  pointer-events: none; /* Đảm bảo click vào SeatWrapper không bị SeatName chặn */
  text-shadow: ${props => props.$selected ? '0 0 3px rgba(0, 0, 0, 0.5)' : 'none'};
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.65rem;
  }
  
  @media (max-width: 400px) {
    font-size: 0.6rem;
  }
  
  &.booked {
  color: ${props => props.$selected ? '#fff' : '#fff'}; /* Luôn màu trắng để dễ đọc */
  z-index: 2;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8); /* Thêm đổ bóng để dễ đọc */
  user-select: none; /* Ngăn người dùng bôi đen text */
  pointer-events: none; /* Đảm bảo click events vẫn đi qua tên ghế và tác động lên ghế */
`;


const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #e71a0f;
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  display: ${props => (props.$show ? 'block' : 'none')};
`;

// Styled Components cho view sơ đồ ghế - cập nhật theo RoomSeatsManagement
const ScreenArea = styled.div`
  height: 10px;
  background: linear-gradient(to right, #6a11cb, #2575fc, #6a11cb);
  border-radius: 50%;
  margin: 0 auto 50px;
  width: 70%;
  position: relative;
  box-shadow: 0 0 20px rgba(106, 17, 203, 0.5);
  
  &:after {
    content: 'MÀN HÌNH';
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    color: #f3f4f6;
    white-space: nowrap;
  }
  
  @media (max-width: 768px) {
    width: 90%;
    margin: 0 auto 40px;
  }
  
  @media (max-width: 576px) {
    width: 95%;
    height: 8px;
    margin: 0 auto 35px;
    
    &:after {
      font-size: 0.7rem;
      top: -20px;
    }
  }
`;

const SeatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); /* Đặt số lượng cột cố định là 10 */
  gap: 10px; /* Khoảng cách giữa các ghế */
  width: 50%; /* Đảm bảo chiếm toàn bộ chiều rộng */
  justify-content: center; /* Căn giữa các ghế trong container */
  align-items: center; /* Căn giữa theo chiều dọc */

  @media (max-width: 1328px) {
  width: 60%;
  gap: 10px;
  }
  @media (max-width: 1130px) {
  width: 70%;
  gap: 10px;
  }
   @media (max-width: 910px) {
  width: 80%;
  gap: 8px;
  }
  @media (max-width: 790px) {
    width: 100%;
    gap: 8px; /* Giảm khoảng cách trên màn hình nhỏ */
  }

  @media (max-width: 576px) {
    width: 100%;
    gap: 6px; /* Giảm khoảng cách hơn nữa trên màn hình rất nhỏ */
  }
`;

const SeatRow = styled.div`
  display: flex;
  justify-content: center; /* Căn giữa hàng ghế */
  align-items: center;
  width: 100%;
  margin-bottom: 10px;

  .row-label {
    width: 30px;
    text-align: center;
    font-weight: bold;
    color: #b8c2cc;
    margin-right: 10px;
  }
`;

function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Thêm useRef để tham chiếu đến phần tử summary
  const summaryRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  // State for movie info
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // State for booking steps
  const [theatersList, setTheatersList] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [showDates, setShowDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seatsConfig, setSeatsConfig] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showDateSelection, setShowDateSelection] = useState(false);
  const [showShowtimeSelection, setShowShowtimeSelection] = useState(false);
  const [concessions, setConcessions] = useState(null);
  const [selectedConcessions, setSelectedConcessions] = useState([]);



  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch movie details
        const movieData = await getMovieById(id);
        setMovie(movieData);

        // Fetch theaters
        const theatersData = await getTheaters();
        setTheatersList(theatersData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);



  // Lấy dữ liệu đồ ăn nước uống
  useEffect(() => {
    const fetchConcessions = async () => {
      try {
        const data = await getConcessions();
        const groupedCombos = {
          combos: data.filter(item => item.comboType === "Combo"),
          popcorn: data.filter(item => item.comboType === "Thức ăn" && item.comboName.toLowerCase().includes('bắp')),
          snacks: data.filter(item => item.comboType === "Thức ăn" && !item.comboName.toLowerCase().includes('bắp')),
          drinks: data.filter(item => item.comboType === "Nước")
        };

        // Định dạng lại dữ liệu cho phù hợp với component
        const formattedData = {
          combos: groupedCombos.combos.map(formatComboItem),
          popcorn: groupedCombos.popcorn.map(formatComboItem),
          drinks: groupedCombos.drinks.map(formatComboItem),
          snacks: groupedCombos.snacks.map(formatComboItem)
        };
        setConcessions(formattedData);
      } catch (error) {
        console.error('Error fetching concessions:', error);
      }
    };

    const formatComboItem = (item) => {
      // Tính tổng giá của combo (có tính discount)
      let totalPrice = 0;
      if (item.comboDetails && item.comboDetails.length > 0) {
        totalPrice = item.comboDetails.reduce((sum, detail) => {
          return sum + (detail.fnbPrice * detail.quantity);
        }, 0);

        // Áp dụng giảm giá nếu có
        if (item.comboDiscount > 0) {
          totalPrice = totalPrice * (1 - item.comboDiscount / 100); // Chia comboDiscount cho 100
        }
      }

      // Tạo mô tả từ comboDetails
      let description = item.comboDescription;
      if (!description && item.comboDetails && item.comboDetails.length > 0) {
        description = item.comboDetails
          .map(detail => `${detail.quantity} ${detail.fnbName}`)
          .join(' + ');
      }

      return {
        id: item.comboId,
        name: item.comboName,
        description: description,
        price: totalPrice,
        image: item.comboImage || `https://via.placeholder.com/300x200?text=${encodeURIComponent(item.comboName)}`,
        type: item.comboType,
        discount: item.comboDiscount
      };
    };

    fetchConcessions();
  }, []);

  // Handle theater selection
  const handleTheaterSelect = async (theater) => {
    try {
      setSelectedTheater(theater);
      setSelectedDate(null);
      setSelectedShowtime(null);
      setSelectedSeats([]);
      setShowDateSelection(true);
      setShowShowtimeSelection(false);

      const response = await getShowtimesByMovieAndTheater(id, theater.theaterId);
      // Kiểm tra response có dữ liệu không
      if (response && response.data && response.data.length > 0) {
        const availableShowtimes = response.data.filter(showtime => showtime.showtimeAvailable === true);
        // Nhóm suất chiếu theo ngày
        const groupedShowtimes = {};

        availableShowtimes.forEach(showtime => {
          // Lấy ngày từ showtimeStartAt
          const showDate = new Date(showtime.showtimeStartAt);
          const dateKey = showDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

          // Định dạng giờ từ showtimeStartAt
          const hours = showDate.getHours().toString().padStart(2, '0');
          const minutes = showDate.getMinutes().toString().padStart(2, '0');
          const timeString = `${hours}:${minutes}`;

          // Xác định thứ trong tuần
          const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
          const dayOfWeek = days[showDate.getDay()];

          // Tạo đối tượng cấu trúc cho từng suất chiếu
          const timeObj = {
            id: showtime.showtimeId,
            time: timeString,
            room: showtime.roomName || `Phòng ${showtime.roomId}`,
            type: showtime.roomScreenTypeName || '2D',
            price: 0 // Giá sẽ được cập nhật sau khi chọn ghế
          };

          // Nhóm theo ngày
          if (!groupedShowtimes[dateKey]) {
            groupedShowtimes[dateKey] = {
              date: dateKey,
              day: dayOfWeek,
              times: [timeObj]
            };
          } else {
            // Kiểm tra nếu suất chiếu đã tồn tại (trùng id)
            const existingTime = groupedShowtimes[dateKey].times.find(
              t => t.id === timeObj.id
            );

            if (!existingTime) {
              groupedShowtimes[dateKey].times.push(timeObj);
            }
          }
        });

        // Chuyển đổi từ object sang array và sắp xếp theo ngày
        const formattedDates = Object.values(groupedShowtimes).sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );

        // Sắp xếp suất chiếu theo giờ trong mỗi ngày
        formattedDates.forEach(dateObj => {
          dateObj.times.sort((a, b) => {
            const [aHour, aMinute] = a.time.split(':').map(Number);
            const [bHour, bMinute] = b.time.split(':').map(Number);

            if (aHour !== bHour) return aHour - bHour;
            return aMinute - bMinute;
          });
        });

        setShowDates(formattedDates);

        // Chọn ngày đầu tiên theo mặc định
        if (formattedDates.length > 0) {
          setSelectedDate(formattedDates[0]);
        }
      } else {
        // Xử lý khi không có suất chiếu
        setShowDates([]);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      setShowDates([]);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setShowShowtimeSelection(true);
  };

  // Handle showtime selection
  const handleShowtimeSelect = async (showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);

    try {
      const { seats } = await getSeatsByShowtime(showtime.id);
      setSeatsConfig({
        seats,
        groupedSeats: seats.reduce((acc, seat) => {
          const row = seat.chairName.charAt(0); // Lấy ký tự đầu tiên làm hàng (A, B, C, ...)
          if (!acc[row]) {
            acc[row] = [];
          }
          acc[row].push(seat);
          return acc;
        }, {})
      });
    } catch (error) {
      console.error('Error fetching seats:', error);
      alert('Không thể tải thông tin ghế. Vui lòng thử lại sau.');
    }
  };

  // Thêm hàm kiểm tra số ghế tối đa
  const isMaxSeatsReached = () => {
    return selectedSeats.length >= MAX_SEATS_SELECTION;
  };

  // Cập nhật phương thức handleSeatSelect
  const handleSeatSelect = (seatName) => {
    const seat = Object.values(seatsConfig.groupedSeats)
      .flat()
      .find(s => s.chairName === seatName);

    if (seat) {
      if (selectedSeats.includes(seatName)) {
        setSelectedSeats(selectedSeats.filter(name => name !== seatName));
      } else if (selectedSeats.length < MAX_SEATS_SELECTION) {
        setSelectedSeats([...selectedSeats, seatName]);
      }
    }
  };

  // Get seat type for pricing
  const getSeatType = (seatId) => {
    if (!seatsConfig || !seatsConfig.seatTypes) {
      return SEAT_TYPES.STANDARD; // Giá trị mặc định nếu không có cấu hình
    }

    const row = seatId.charAt(0);

    if (seatsConfig.seatTypes.couple && seatsConfig.seatTypes.couple.includes(row)) {
      return SEAT_TYPES.COUPLE;
    } else if (seatsConfig.seatTypes.vip && seatsConfig.seatTypes.vip.includes(row)) {
      return SEAT_TYPES.VIP;
    } else {
      return SEAT_TYPES.STANDARD;
    }
  };

  // Tính tổng tiền bao gồm cả combo đồ ăn
  const calculateTotal = () => {
    let total = 0;

    // Tính tiền vé dựa theo chairPrice từ API
    if (seatsConfig && selectedSeats.length) {
      selectedSeats.forEach(seatId => {
        const seat = seatsConfig.seats.find(seat => seat.chairName === seatId);
        if (seat) {
          const price = seat.price || 0;
          total += price;
        }
      });

      // Nếu có giá suất chiếu (price thuộc selectedShowtime) cộng thêm (nếu có)
      if (selectedShowtime.price) {
        total += selectedShowtime.price * selectedSeats.length;
      }
    }

    // Cộng thêm tiền combo đồ ăn
    selectedConcessions.forEach(item => {
      total += item.price * item.quantity;
    });

    return total;
  };


  // Generate seats array for display
  const generateSeatsArray = () => {
    if (!seatsConfig) return [];

    const rows = Array.from({ length: seatsConfig.rows }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    const cols = Array.from({ length: seatsConfig.seatsPerRow }, (_, i) => i + 1);

    return { rows, cols };
  };




  // Hàm mapping loại ghế từ tên
  const getSeatTypeFromName = (chairTypeName) => {
    switch (chairTypeName) {
      case "Ghế VIP":
        return SEAT_TYPES.VIP;
      case "Ghế đôi":
        return SEAT_TYPES.COUPLE;
      case "Ghế thường":
      default:
        return SEAT_TYPES.STANDARD;
    }
  };

  // Hàm xử lý thêm/bớt combo
  const handleConcessionChange = (item, action) => {
    setSelectedConcessions(prev => {
      const existingItem = prev.find(i => i.id === item.id);

      if (action === 'add') {
        if (existingItem) {
          return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          return [...prev, { ...item, quantity: 1 }];
        }
      } else if (action === 'remove') {
        if (existingItem && existingItem.quantity > 1) {
          return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
        } else if (existingItem) {
          return prev.filter(i => i.id !== item.id);
        }
      }

      return prev;
    });
  };

  const handleProceedToPayment = () => {
    const selectedChairs = selectedSeats.map(seatName => {
      const seat = Object.values(seatsConfig.groupedSeats)
        .flat()
        .find(s => s.chairName === seatName);
      return {
        chairId: seat.chairId,
        version: seat.version,
        price: seat.price,
        type: getSeatTypeFromName(seat.chairTypeName),
        name: seat.chairName
      };
    });

    navigate('/payment', {
      state: {
        movie: movie, // Đảm bảo truyền thông tin phim
        theater: selectedTheater, // Đảm bảo truyền thông tin rạp
        showtime: selectedShowtime, // Đảm bảo truyền thông tin suất chiếu
        showDate: selectedDate, // Đảm bảo truyền thông tin ngày chiếu
        seats: selectedChairs,
        combo: selectedConcessions,
        totalPrice: calculateTotal(),
      }
    });
  };

  useEffect(() => {
    // Kiểm tra nếu cần cuộn xuống phần chọn ghế
    if (location.state?.scrollToSeats) {
      // Sử dụng setTimeout để đảm bảo component đã render xong
      const timer = setTimeout(() => {
        const seatsSection = document.getElementById('seats-section');
        if (seatsSection) {
          seatsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Theo dõi khi showDates thay đổi (sau khi chọn rạp)
  useEffect(() => {
    if (location.state?.preselected && showDates.length > 0) {
      const { dateObject } = location.state;
      if (dateObject) {
        // Tìm ngày tương ứng
        const matchedDate = showDates.find(d => d.date === dateObject.value);
        if (matchedDate) {
          handleDateSelect(matchedDate);
        }
      }
    }
  }, [showDates, location.state]);

  // Theo dõi khi selectedDate thay đổi (sau khi chọn ngày)
  useEffect(() => {
    if (location.state?.preselected && selectedDate && selectedDate.times) {
      const { showtimeObject } = location.state;
      if (showtimeObject) {
        // Tìm suất chiếu tương ứng
        const matchedShowtime = selectedDate.times.find(
          t => t.id === showtimeObject.showtimeId || t.id === parseInt(showtimeObject.value)
        );
        if (matchedShowtime) {
          handleShowtimeSelect(matchedShowtime);
        }
      }
    }
  }, [selectedDate, location.state]);

  // Trong BookingPage.jsx - Thêm useEffect để xử lý preselection
  useEffect(() => {


    // Chọn rạp
    if (location.state?.preselected && theatersList.length > 0 && !loading) {
      const theaterId = location.state.theaterId;

      // Tìm rạp trong danh sách
      const theater = theatersList.find(t =>
        t.theaterId === parseInt(theaterId) ||
        t.id === parseInt(theaterId)
      );

      if (theater) {
        handleTheaterSelect(theater);
      }
    }
  }, [location.state, theatersList, loading]); // Thêm loading là dependency quan trọng



  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#b8c2cc' }}>
          Đang tải thông tin đặt vé...
        </div>
      </PageContainer>
    );
  }

  if (!movie) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#b8c2cc' }}>
          Không tìm thấy thông tin phim.
        </div>
      </PageContainer>
    );
  }



  const renderSeatingLayout = () => {
    if (!seatsConfig || !seatsConfig.groupedSeats) {
      return <div style={{ textAlign: 'center', padding: '3rem' }}>Không có thông tin ghế.</div>;
    }

    const rows = Object.keys(seatsConfig.groupedSeats).sort(); // Sắp xếp hàng theo thứ tự A, B, C, ...

    return (
      <SeatsContainer>
        <ScreenArea />

        {rows.map(row => {
          const seats = seatsConfig.groupedSeats[row];
          return (
            <SeatRow key={row}>
              <div className="row-label">{row}</div>
              <SeatsGrid>
                {seats.map(seat => {
                  const isReserved = !seat.available;
                  const isSelected = selectedSeats.includes(seat.chairName);
                  const isDoubleSeat = seat.chairTypeName === 'Ghế đôi';

                  return (
                    <SeatWrapper
                      key={seat.chairId}
                      className={`seat-wr ${isReserved ? 'booked' : ''}`}
                      onClick={() => !isReserved && handleSeatSelect(seat.chairName)}
                    >
                      <SeatImage
                        className="seat-image"
                        $reserved={isReserved}
                        $selected={isSelected}
                        $type={seat.chairTypeName}
                        style={{
                          gridColumn: isDoubleSeat ? 'span 2' : 'span 1', // Ghế đôi chiếm 2 cột
                        }}
                      />
                      <SeatName
                        $selected={isSelected}
                        $reserved={isReserved}
                      >
                        {seat.chairName}
                      </SeatName>
                    </SeatWrapper>
                  );
                })}
              </SeatsGrid>
            </SeatRow>
          );
        })}

        <SeatLegend>
          <LegendItem $color="#2c2c44">
            <div className="box"></div>
            <div className="text">Ghế thường</div>
          </LegendItem>
          <LegendItem $color="#f39c12">
            <div className="box"></div>
            <div className="text">Ghế VIP</div>
          </LegendItem>
          <LegendItem $color="#9b59b6">
            <div className="box"></div>
            <div className="text">Ghế đôi</div>
          </LegendItem>
          <LegendItem $color="#333">
            <div className="box"></div>
            <div className="text">Đã đặt</div>
          </LegendItem>
          <LegendItem $color="#800080">
            <div className="box"></div>
            <div className="text">Đang chọn</div>
          </LegendItem>
        </SeatLegend>
      </SeatsContainer>
    );
  };

  return (
    <PageContainer>
      <PageOverlay />



      <BookingHeader>
        <MoviePoster>
          <img src={movie.moviePoster || 'https://via.placeholder.com/300x450?text=No+Poster'} alt={movie.title} />
          <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
            <BookmarkBadge
              rating={getAgeRating(movie)}
              color={getBookmarkColor(getAgeRating(movie))}
            />
          </div>
        </MoviePoster>

        <MovieInfo>
          <MovieTitle>{movie.movieName}</MovieTitle>
          <MovieMeta>
            <p>Thời lượng: {movie.movieDuration} phút</p>
            <p>Khởi chiếu: {formatDate(movie.movieCreatAt)}</p>
          </MovieMeta>

          <MovieDetails>
            <p style={{ fontSize: "20px", fontWeight: "bolder", color: "white" }}>MÔ TẢ</p>
            <p><strong>Đạo diễn:</strong> {movie.movieDirector}</p>
            <p><strong>Diễn viên:</strong> {movie.movieActor}</p>
            <p><strong>Nội dung phim:</strong> {movie.movieContent}</p>
          </MovieDetails>
        </MovieInfo>
      </BookingHeader>

      {/* Phần chọn rạp */}
      <StepContent style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#f3f4f6', marginBottom: '1.5rem' }}>Chọn rạp chiếu phim</h2>
        <TheatersList style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {theatersList.map(theater => (
            <TheaterCard
              key={theater.theaterId}
              $selected={selectedTheater && selectedTheater.theaterId === theater.theaterId}
              onClick={() => handleTheaterSelect(theater)}
            >
              <TheaterInfo>
                <TheaterName>{theater.theaterName}</TheaterName>
                <TheaterAddress>
                  <FaMapMarkerAlt />
                  <span>{theater.theaterLocation}</span>
                </TheaterAddress>
              </TheaterInfo>
            </TheaterCard>
          ))}
        </TheatersList>
      </StepContent>

      {/* Phần chọn ngày */}
      {selectedTheater && showDates.length > 0 && (
        <StepContent style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#f3f4f6', marginBottom: '1.5rem' }}>Chọn ngày</h2>
          <DateSelector>
            {showDates.map((dateItem, index) => (
              <DateCard
                key={index}
                $selected={selectedDate && selectedDate.date === dateItem.date}
                onClick={() => handleDateSelect(dateItem)}
              >
                <div className="day">{dateItem.day}</div>
                <div className="date">{new Date(dateItem.date).getDate()}/{new Date(dateItem.date).getMonth() + 1}</div>
              </DateCard>
            ))}
          </DateSelector>
        </StepContent>
      )}

      {/* Phần chọn suất chiếu */}
      {selectedDate && (
        <StepContent style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#f3f4f6', marginBottom: '1.5rem' }}>Chọn suất chiếu</h2>
          <ShowtimesList>
            {selectedDate.times.map(time => (
              <ShowtimeCard
                key={time.id}
                $selected={selectedShowtime && selectedShowtime.id === time.id}
                onClick={() => handleShowtimeSelect(time)}
              >
                <div className="time">
                  <FaClock />
                  {time.time}
                </div>
                <div className="info">
                  <span>Phòng: {time.room}</span>
                  <span>Loại: {time.type}</span>
                </div>
              </ShowtimeCard>
            ))}
          </ShowtimesList>
        </StepContent>
      )}

      {/* Kiểm tra điều kiện hiển thị ghế */}
      {selectedShowtime && seatsConfig && seatsConfig.groupedSeats ? (
        <StepContent style={{ marginBottom: '2rem' }} id="seats-section">
          <h2 style={{ color: '#f3f4f6', marginBottom: '1.5rem' }}>
            Chọn ghế <span style={{ color: '#b8c2cc', fontSize: '0.9rem' }}>
            </span>
          </h2>

          {renderSeatingLayout()}
        </StepContent>
      ) : (
        selectedShowtime && (
          <StepContent style={{ marginBottom: '2rem' }}>
            <h2 style={{ color: '#f3f4f6', marginBottom: '1.5rem' }}>Đang tải sơ đồ ghế...</h2>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #e71a0f', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            </div>
          </StepContent>
        )
      )}

      {/* Thêm section chọn đồ ăn và nước uống */}
      {/* Thêm section chọn đồ ăn và nước uống */}
      {selectedShowtime && concessions && (
        <StepContent className="concessions-section" style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#f3f4f6', marginBottom: '1.5rem' }}>Chọn Đồ ăn & nước uống</h2>

          <ConcessionsSection>
            {/* Combo */}
            {concessions.combos && concessions.combos.length > 0 && (
              <ConcessionsCategory>
                <h3>Combo</h3>
                <ConcessionsGrid>
                  {concessions.combos.map(item => (
                    <ConcessionCard key={item.id}>
                      <ConcessionImage>
                        <img src={item.image} alt={item.name} />
                        {item.discount > 0 && (
                          <DiscountBadge>-{Math.round(item.discount * 100)}%</DiscountBadge>
                        )}
                      </ConcessionImage>
                      <ConcessionInfo>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <span className="price">{formatCurrency(item.price)}</span>
                      </ConcessionInfo>
                      <ConcessionActions>
                        <button
                          className="remove"
                          onClick={() => handleConcessionChange(item, 'remove')}
                          disabled={!selectedConcessions.find(i => i.id === item.id)}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">
                          {selectedConcessions.find(i => i.id === item.id)?.quantity || 0}
                        </span>
                        <button
                          className="add"
                          onClick={() => handleConcessionChange(item, 'add')}
                        >
                          <FaPlus />
                        </button>
                      </ConcessionActions>
                    </ConcessionCard>
                  ))}
                </ConcessionsGrid>
              </ConcessionsCategory>
            )}

            {/* Bắp Rang */}
            {concessions.popcorn && concessions.popcorn.length > 0 && (
              <ConcessionsCategory>
                <h3>Bắp Rang</h3>
                <ConcessionsGrid>
                  {concessions.popcorn.map(item => (
                    <ConcessionCard key={item.id}>
                      <ConcessionImage>
                        <img src={item.image} alt={item.name} />
                      </ConcessionImage>
                      <ConcessionInfo>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <span className="price">{formatCurrency(item.price)}</span>
                      </ConcessionInfo>
                      <ConcessionActions>
                        <button
                          className="remove"
                          onClick={() => handleConcessionChange(item, 'remove')}
                          disabled={!selectedConcessions.find(i => i.id === item.id)}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">
                          {selectedConcessions.find(i => i.id === item.id)?.quantity || 0}
                        </span>
                        <button
                          className="add"
                          onClick={() => handleConcessionChange(item, 'add')}
                        >
                          <FaPlus />
                        </button>
                      </ConcessionActions>
                    </ConcessionCard>
                  ))}
                </ConcessionsGrid>
              </ConcessionsCategory>
            )}

            {/* Nước Uống */}
            {concessions.drinks && concessions.drinks.length > 0 && (
              <ConcessionsCategory>
                <h3>Nước Uống</h3>
                <ConcessionsGrid>
                  {concessions.drinks.map(item => (
                    <ConcessionCard key={item.id}>
                      <ConcessionImage>
                        <img src={item.image} alt={item.name} />
                      </ConcessionImage>
                      <ConcessionInfo>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <span className="price">{formatCurrency(item.price)}</span>
                      </ConcessionInfo>
                      <ConcessionActions>
                        <button
                          className="remove"
                          onClick={() => handleConcessionChange(item, 'remove')}
                          disabled={!selectedConcessions.find(i => i.id === item.id)}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">
                          {selectedConcessions.find(i => i.id === item.id)?.quantity || 0}
                        </span>
                        <button
                          className="add"
                          onClick={() => handleConcessionChange(item, 'add')}
                        >
                          <FaPlus />
                        </button>
                      </ConcessionActions>
                    </ConcessionCard>
                  ))}
                </ConcessionsGrid>
              </ConcessionsCategory>
            )}

            {/* Snack */}
            {concessions.snacks && concessions.snacks.length > 0 && (
              <ConcessionsCategory>
                <h3>Snack</h3>
                <ConcessionsGrid>
                  {concessions.snacks.map(item => (
                    <ConcessionCard key={item.id}>
                      <ConcessionImage>
                        <img src={item.image} alt={item.name} />
                      </ConcessionImage>
                      <ConcessionInfo>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <span className="price">{formatCurrency(item.price)}</span>
                      </ConcessionInfo>
                      <ConcessionActions>
                        <button
                          className="remove"
                          onClick={() => handleConcessionChange(item, 'remove')}
                          disabled={!selectedConcessions.find(i => i.id === item.id)}
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity">
                          {selectedConcessions.find(i => i.id === item.id)?.quantity || 0}
                        </span>
                        <button
                          className="add"
                          onClick={() => handleConcessionChange(item, 'add')}
                        >
                          <FaPlus />
                        </button>
                      </ConcessionActions>
                    </ConcessionCard>
                  ))}
                </ConcessionsGrid>
              </ConcessionsCategory>
            )}
          </ConcessionsSection>
        </StepContent>
      )}



      {/* Phần tóm tắt & nút thanh toán */}
      {selectedShowtime && <SummarySection>
        <SummaryInnerContainer>
          <SummaryInfo>
            <h3>{movie.movieName} ({selectedShowtime.type})</h3>
            <p>{selectedTheater.name}</p>
            <p>Phòng: {selectedShowtime.room} | Suất: {selectedShowtime.time}</p>
            <p>Ghế: {selectedSeats.sort().join(', ') || "Chưa chọn ghế"}</p>
            {selectedConcessions.length > 0 && <p>Combo: {selectedConcessions.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>}
          </SummaryInfo>
          <SummaryActions>
            <span className="price">{formatCurrency(calculateTotal())}</span>
            <button onClick={handleProceedToPayment} disabled={selectedSeats.length === 0}
              style={{ opacity: selectedSeats.length === 0 ? '0.5' : '1', cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer' }}>
              ĐẶT VÉ
            </button>
          </SummaryActions>
        </SummaryInnerContainer>
      </SummarySection>}


    </PageContainer>
  );
}

// Thêm styled components mới
const ConcessionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ConcessionsCategory = styled.div`
  h3 {
    color: #e0e0e0;
    margin-bottom: 1rem;
    border-bottom: 1px solid #374151;
    padding-bottom: 0.5rem;
  }
`;

// Cập nhật ConcessionsGrid để hiển thị tốt hơn trên thiết bị di động
const ConcessionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Cập nhật ConcessionCard để hiển thị tốt hơn trên thiết bị di động
const ConcessionCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #1f2937;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-3px);
    }
  }
  
  @media (max-width: 576px) {
    flex-direction: row;
    
    &:hover {
      transform: none;
    }
  }
`;

// Cập nhật ConcessionImage để hiển thị tốt hơn trên thiết bị di động
const ConcessionImage = styled.div`
  height: 150px; /* Chiều cao cố định */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: auto; /* Đảm bảo ảnh giữ nguyên tỷ lệ */
    height: 100%; /* Chiều cao ảnh vừa với container */
    object-fit: contain; /* Hiển thị đầy đủ ảnh */
    transition: transform 0.3s;
  }
  
  @media (max-width: 768px) {
    height: 130px;
  }
  
  @media (max-width: 576px) {
    width: 100px;
    height: 100px;
    min-width: 100px;
  }
`;

// Cập nhật ConcessionInfo để hiển thị tốt hơn trên thiết bị di động
const ConcessionInfo = styled.div`
  padding: 1rem;
  flex-grow: 1;
  
  h4 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #f3f4f6;
  }
  
  p {
    color: #9ca3af;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .price {
    display: block;
    color: #e71a0f;
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    
    h4 {
      font-size: 1rem;
    }
    
    p {
      font-size: 0.85rem;
    }
    
    .price {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem;
    
    h4 {
      font-size: 0.95rem;
      margin-bottom: 0.3rem;
    }
    
    p {
      font-size: 0.8rem;
      margin-bottom: 0.3rem;
    }
    
    .price {
      font-size: 0.95rem;
      margin-top: 0.3rem;
    }
  }
`;

// Cập nhật ConcessionActions để hiển thị tốt hơn trên thiết bị di động
const ConcessionActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem 1rem;
  
  button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    
    &.add {
      background-color: #e71a0f;
      color: white;
      
      &:hover {
        background-color: #c81a0f;
      }
    }
    
    &.remove {
      background-color: #374151;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: #4b5563;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  
  .quantity {
    font-size: 1.1rem;
    font-weight: bold;
    min-width: 40px;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.75rem 0.75rem;
    
    button {
      width: 32px;
      height: 32px;
    }
    
    .quantity {
      font-size: 1rem;
      min-width: 30px;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.3rem 0.5rem 0.5rem;
    
    button {
      width: 28px;
      height: 28px;
    }
    
    .quantity {
      font-size: 0.9rem;
      min-width: 25px;
    }
  }
`;

// Thêm styles mới cho bố cục ghế kiểu table
// Cập nhật SeatTable để hiển thị tốt hơn trên thiết bị di động
const SeatTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 4px 10px; /* Giảm khoảng cách giữa các ghế đơn */

  &.couple-seats {
    border-spacing: 8px 10px; /* Khoảng cách cho ghế đôi */
    width: 100%;
  }

  @media (max-width: 768px) {
    border-spacing: 3px 8px; /* Giảm khoảng cách trên màn hình nhỏ */
  }

  @media (max-width: 576px) {
    border-spacing: 2px 6px; /* Giảm khoảng cách hơn nữa trên màn hình rất nhỏ */
  }
`;

const SeatNameRow = styled.td`
  width: 30px;
  height: 35px;
  text-align: center;
  font-weight: bold;
  color: #b8c2cc;
  padding: 0;
  vertical-align: middle;
`;

// Cập nhật SeatTd để hiển thị tốt hơn trên thiết bị di động
const SeatTd = styled.td`
  padding: 0;
  width: 40px; /* Đảm bảo chiều rộng */
  height: 40px; /* Đảm bảo chiều cao bằng chiều rộng */
  position: relative;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
  }
  
  @media (max-width: 576px) {
    width: 30px;
    height: 30px;
  }
`;

const SeatWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  
  &.seat-single {
    width: 35px;
    height: 35px;
  }
  
  &.booked {
  color: ${props => props.$selected ? '#fff' : '#fff'}; /* Luôn màu trắng để dễ đọc */
  z-index: 2;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.8); /* Thêm đổ bóng để dễ đọc */
  user-select: none; /* Ngăn người dùng bôi đen text */
  pointer-events: none; /* Đảm bảo click events vẫn đi qua tên ghế và tác động lên ghế */
`;

const SeatImage = styled.div`
  width: ${props => props.$type === 'Ghế đôi' ? '80px' : '40px'}; /* Ghế đôi rộng gấp đôi */
  height: 40px; /* Chiều cao giữ nguyên */
  border-radius: 8px;
  position: relative;
  transition: all 0.2s ease;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    background-color: ${props => {
    if (props.$reserved) return '#333';
    if (props.$selected) return '#800080';
    if (props.$type === 'Ghế VIP') return '#f39c12';
    if (props.$type === 'Ghế đôi') return '#9b59b6';
    return '#2c2c44';
  }};
  }
  
  &:hover {
    box-shadow: ${props => props.$reserved ? 'none' : '0 0 15px rgba(255, 255, 255, 0.2)'};
  }
`;



// Cập nhật SummaryActions để hiển thị tốt hơn trên thiết bị di động
const SummaryActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;

  .price {
    font-size: 1.4rem;
    font-weight: bold;
    color:rgb(255, 255, 255);
  }

  button {
    background-color: #6a1b9a;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;

    &:disabled {
      background-color: #666;
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    align-items: stretch;
    width: 100%;

    .price {
      font-size: 1.3rem;
      text-align: center;
    }

    button {
      width: 100%;
      font-size: 0.95rem;
      padding: 0.7rem 1.25rem;
    }
  }
  
  @media (max-width: 576px) {
    .price {
      font-size: 1.2rem;
    }
    
    button {
      font-size: 0.9rem;
      padding: 0.6rem 1rem;
    }
  }
`;

// Cập nhật SummaryInfo để hiển thị tốt hơn trên thiết bị di động
const SummaryInfo = styled.div`
  flex: 1;
  text-align: left; /* Đảm bảo nội dung trong SummaryInfo được căn trái */
  
  h3 {
    font-size: 1.2rem;
    color: #f3f4f6;
    margin-bottom: 0.5rem;
    text-align: left;
  }
  
  p {
    color: #b8c2cc;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    text-align: left;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    
    h3 {
      font-size: 1.1rem;
    }
    
    p {
      font-size: 0.85rem;
    }
  }
  
  @media (max-width: 576px) {
    h3 {
      font-size: 1rem;
    }
    
    p {
      font-size: 0.8rem;
    }
  }
`;

const SummaryInnerContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  display: flex; 
  justify-content: space-between; /* Đảm bảo info ở trái và actions ở phải */
  align-items: center; /* Căn giữa theo chiều dọc */
  gap: 2rem;
  min-height: 80px; /* Đảm bảo chiều cao cố định */

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export default BookingPage;
