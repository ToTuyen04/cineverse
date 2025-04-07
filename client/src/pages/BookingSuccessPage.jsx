import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, FaFilm, FaHome } from 'react-icons/fa';

// Styled components
const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 7rem 1rem 3rem;
`;

const SuccessCard = styled.div`
  background-color: #1a1a2e;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const SuccessHeader = styled.div`
  background-color: #e71a0f;
  color: white;
  padding: 2rem;
  text-align: center;
  
  .icon {
    background-color: white;
    color: #e71a0f;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    opacity: 0.9;
  }
`;

const SuccessContent = styled.div`
  padding: 2rem;
`;

const BookingId = styled.div`
  background-color: #2c2c44;
  padding: 1rem;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 2rem;
  
  p {
    color: #b8c2cc;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .id {
    color: #f3f4f6;
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
  }
`;

const TicketDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  margin-bottom: 1rem;
  
  .label {
    color: #b8c2cc;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .value {
    color: #f3f4f6;
    font-weight: bold;
  }
`;

const SeatsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  
  span {
    background-color: #2c2c44;
    padding: 0.3rem 0.6rem;
    border-radius: 3px;
    font-size: 0.9rem;
    color: #f3f4f6;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #3f3f5a;
  margin: 2rem 0;
`;

const InfoBox = styled.div`
  background-color: rgba(231, 26, 15, 0.1);
  border-left: 3px solid #e71a0f;
  padding: 1rem;
  margin-bottom: 2rem;
  
  p {
    color: #f3f4f6;
    line-height: 1.5;
    
    strong {
      color: #e71a0f;
    }
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &.primary {
    background-color: #e71a0f;
    color: white;
    border: none;
    
    &:hover {
      background-color: #ff3e33;
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

// Helper function
const formatShowDate = (dateString) => {
  const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', options).format(date);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin đặt vé từ state của location
  const bookingInfo = location.state;
  
  if (!bookingInfo || !bookingInfo.movie) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#b8c2cc' }}>
          Không tìm thấy thông tin đặt vé. Vui lòng quay lại trang đặt vé.
        </div>
        <div style={{ textAlign: 'center' }}>
          <Button as="a" href="/" className="secondary" style={{ display: 'inline-flex' }}>
            <FaHome />
            Quay lại trang chủ
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  const { movie, theater, showtime, showDate, seats, totalPrice, bookingId } = bookingInfo;
  
  return (
    <PageContainer>
      <SuccessCard>
        <SuccessHeader>
          <div className="icon">
            <FaCheck />
          </div>
          <h1>Đặt vé thành công!</h1>
          <p>Cảm ơn bạn đã đặt vé xem phim tại {theater.name}</p>
        </SuccessHeader>
        
        <SuccessContent>
          <BookingId>
            <p>Mã đặt vé của bạn</p>
            <div className="id">{bookingId}</div>
          </BookingId>
          
          <InfoBox>
            <p>Vui lòng đến rạp <strong>sớm ít nhất 15 phút</strong> trước giờ chiếu để nhận vé. Trình mã đặt vé tại quầy vé để được phục vụ nhanh chóng.</p>
          </InfoBox>
          
          <TicketDetails>
            <DetailItem>
              <div className="label">
                <FaFilm />
                Phim
              </div>
              <div className="value">{movie.title}</div>
            </DetailItem>
            
            <DetailItem>
              <div className="label">
                <FaMapMarkerAlt />
                Rạp
              </div>
              <div className="value">{theater.name}</div>
            </DetailItem>
            
            <DetailItem>
              <div className="label">
                <FaCalendarAlt />
                Ngày chiếu
              </div>
              <div className="value">{formatShowDate(showDate.date)}</div>
            </DetailItem>
            
            <DetailItem>
              <div className="label">
                <FaClock />
                Suất chiếu
              </div>
              <div className="value">{showtime.time} ({showtime.room})</div>
            </DetailItem>
            
            <DetailItem>
              <div className="label">
                <FaTicketAlt />
                Ghế
              </div>
              <SeatsList>
                {seats.sort().map(seat => (
                  <span key={seat}>{seat}</span>
                ))}
              </SeatsList>
            </DetailItem>
            
            <DetailItem>
              <div className="label">Tổng thanh toán</div>
              <div className="value" style={{ color: '#e71a0f' }}>
                {formatCurrency(totalPrice)}
              </div>
            </DetailItem>
          </TicketDetails>
          
          <Divider />
          
          <div style={{ textAlign: 'center', color: '#b8c2cc' }}>
            <p>Thông tin chi tiết đã được gửi đến email của bạn</p>
            <p style={{ marginTop: '0.5rem' }}>Chúc bạn có trải nghiệm xem phim tuyệt vời!</p>
          </div>
          
          <ButtonsContainer>
            <Button className="secondary" onClick={() => navigate('/')}>
              <FaHome />
              Về trang chủ
            </Button>
            
            <Button className="primary" onClick={() => navigate('/movies')}>
              <FaFilm />
              Khám phá thêm phim
            </Button>
          </ButtonsContainer>
        </SuccessContent>
      </SuccessCard>
    </PageContainer>
  );
}

export default BookingSuccessPage;