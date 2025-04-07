import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaTicketAlt, FaHome, FaDownload, FaExclamationCircle } from 'react-icons/fa';
import { formatCurrency, formatShowDate } from '../utils/formatters';
import { getOrderById, processVnPayCallback } from '../api/services/orderService';

function TicketInfo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentResult = async () => {
      try {
        setIsLoading(true);

        // Kiểm tra xem có phải là callback từ VNPay không
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        const vnpTxnRef = searchParams.get('vnp_TxnRef');

        if (vnpResponseCode && vnpTxnRef) {
          // Đây là callback từ VNPay, tạo object params để gửi đến API
          const params = {};
          for (const [key, value] of searchParams.entries()) {
            params[key] = value;
          }

          try {
            // Gọi API xử lý callback VNPay
            const response = await processVnPayCallback(params);
            setTicketInfo(response);
          } catch (apiError) {
            // Xử lý tất cả lỗi API (status khác 200) và hiển thị message từ response
            if (apiError.response) {
              // Có response từ server
              const errorData = apiError.response.data;
              const errorMessage = errorData.message || 'Thanh toán không thành công';

              // Hiển thị lỗi trong ErrorContainer thay vì SuccessMessage
              setError(errorMessage);
            } else {
              // Lỗi không có response từ API (network error, timeout)
              setError(apiError.message || 'Có lỗi xảy ra khi xử lý thông tin thanh toán');
            }
          }
        } else {
          // Nếu không phải callback từ VNPay, kiểm tra xem có orderId không
          const orderId = searchParams.get('orderId');

          if (!orderId) {
            throw new Error('Không tìm thấy thông tin vé');
          }

          try {
            // Gọi API lấy thông tin đơn hàng từ orderId
            const response = await getOrderById(orderId);
            setTicketInfo(response);
          } catch (apiError) {
            // Xử lý tất cả lỗi API (status khác 200) và hiển thị message từ response
            if (apiError.response) {
              // Có response từ server
              const errorData = apiError.response.data;
              const errorMessage = errorData.message || 'Không tìm thấy thông tin đơn hàng';

              // Hiển thị lỗi trong ErrorContainer
              setError(errorMessage);
            } else {
              // Lỗi không có response từ API
              setError(apiError.message || 'Có lỗi xảy ra khi xử lý thông tin đơn hàng');
            }
          }
        }
      } catch (error) {
        console.error('Error processing payment result:', error);
        // Lỗi không liên quan đến API response
        setError(error.message || 'Có lỗi xảy ra khi xử lý thông tin thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    handlePaymentResult();
  }, [searchParams]);

  const handleGoHome = () => {
    navigate('/');
  };

  // Thêm hàm kiểm tra chiều rộng
  const isMobile = window.innerWidth <= 576;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Đang tải thông tin vé...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h2>{error}</h2>
          <Button onClick={handleGoHome}>Về trang chủ</Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  if (!ticketInfo) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h2>Không tìm thấy thông tin vé</h2>
          <p>Vui lòng kiểm tra lại mã đơn hàng của bạn</p>
          <Button onClick={handleGoHome}>Về trang chủ</Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Dữ liệu chi tiết đơn hàng có thể nằm trong orderDetail
  const orderData = ticketInfo.orderDetail || {};

  // Chuyển đổi ghế thành mảng ngắn hơn cho màn hình nhỏ
  const formatSeatList = (seats) => {
    if (!seats || seats.length === 0) return 'None';
    if (isMobile && seats.length > 3) {
      return `${seats.slice(0, 3).join(', ')} +${seats.length - 3}`;
    }
    return seats.join(', ');
  };

  // Chuyển đổi combo thành mảng ngắn hơn cho màn hình nhỏ
  const formatComboList = (combos) => {
    if (!combos || combos.length === 0) return 'None';
    if (isMobile && combos.length > 2) {
      return `${combos.slice(0, 2).join(', ')} +${combos.length - 2}`;
    }
    return combos.join(', ');
  };

  return (
    <PageContainer>
      <h1>Thông tin vé của bạn</h1>

      <SuccessMessage success={ticketInfo.success}>
        <div className="icon-container">
          {ticketInfo.success !== false ? (
            <FaTicketAlt className="success-icon" />
          ) : (
            <FaExclamationCircle className="error-icon" />
          )}
        </div>
        <h2>{ticketInfo.message || (ticketInfo.success !== false ? 'Thanh toán thành công' : 'Thanh toán không thành công')}</h2>
      </SuccessMessage>

      <TicketInfoContainer>
        <TicketHeader>
          <FaTicketAlt />
          <h2>Thông tin vé</h2>
          <p>Cảm ơn bạn đã đặt vé tại <span style={{ color: 'linear-gradient(to right, #FF4D4D, #F9376E)' }}>CineVerse!</span></p>
        </TicketHeader>

        <TicketDetails>
          <div className="ticket-info">
            <div className="info-row">
              <span>Mã đơn hàng:</span>
              <span>#{ticketInfo.orderId}</span>
            </div>

            <div className="info-row">
              <span>Mã giao dịch:</span>
              <span>{ticketInfo.transactionNo}</span>
            </div>

            {orderData.showtimeInfos && orderData.showtimeInfos.length > 0 && (
              <>
                <div className="info-row">
                  <span>Phim:</span>
                  <span style={{ 
                    maxWidth: isMobile ? '100%' : '60%', 
                    textAlign: isMobile ? 'left' : 'right', 
                    wordBreak: 'break-word'
                  }}>
                    {orderData.showtimeInfos[0].movieName}
                  </span>
                </div>

                <div className="info-row">
                  <span>Rạp:</span>
                  <span>{orderData.showtimeInfos[0].theaterName}</span>
                </div>

                <div className="info-row">
                  <span>Phòng chiếu:</span>
                  <span>{orderData.showtimeInfos[0].roomName}</span>
                </div>

                <div className={`info-row ${isMobile ? 'wrap-content' : ''}`}>
                  <span>Suất chiếu:</span>
                  <span>
                    {new Date(orderData.showtimeInfos[0].startTime).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </>
            )}

            {orderData.orderDetails && orderData.orderDetails.length > 0 && (
              <div className={`info-row ${isMobile ? 'wrap-content' : ''}`}>
                <span>Ghế:</span>
                <span>{
                  formatSeatList(orderData.orderDetails.map(seat => seat.chairName))
                }</span>
              </div>
            )}

            {orderData.orderComboItems && orderData.orderComboItems.length > 0 && (
              <div className={`info-row ${isMobile ? 'wrap-content' : ''}`}>
                <span>Combo:</span>
                <span>
                  {formatComboList(orderData.orderComboItems.map(combo =>
                    `${combo.comboName} x${combo.comboQuantity}`
                  ))}
                </span>
              </div>
            )}

            <div className="info-row">
              <span>Họ tên:</span>
              <span>{orderData.orderName}</span>
            </div>

            <div className="info-row">
              <span>Email:</span>
              <span style={{
                maxWidth: isMobile ? '100%' : '60%',
                textAlign: isMobile ? 'left' : 'right',
                wordBreak: 'break-word'
              }}>
                {orderData.orderEmail}
              </span>
            </div>

            <div className="info-row">
              <span>Số điện thoại:</span>
              <span>{orderData.orderPhone}</span>
            </div>

            <div className="info-row">
              <span>Trạng thái đơn hàng:</span>
              <span className="status completed">{orderData.orderStatus}</span>
            </div>
          </div>

          <div className="price-summary">
            {orderData.orderDetails && orderData.orderDetails.length > 0 && (
              <div className="price-row">
                <span>Tổng tiền vé:</span>
                <span>{formatCurrency(orderData.orderDetails.reduce((sum, item) => sum + item.price, 0))}</span>
              </div>
            )}

            {orderData.orderComboItems && orderData.orderComboItems.length > 0 && (
              <div className="price-row">
                <span>Tổng tiền combo:</span>
                <span>{formatCurrency(orderData.orderComboItems.reduce((sum, combo) => sum + (combo.comboPrice * combo.comboQuantity), 0))}</span>
              </div>
            )}

            {orderData.discountPrice > 0 && (
              <div className="price-row discount">
                <span>Giảm giá:</span>
                <span>- {formatCurrency(orderData.discountPrice)}</span>
              </div>
            )}

            <div className="price-row total">
              <span>Tổng thanh toán:</span>
              <span>{formatCurrency(orderData.totalPrice || orderData.paymentPrice)}</span>
            </div>
          </div>

          <div className="ticket-note">
            <p>
              <strong>Lưu ý:</strong> Vui lòng đến rạp trước giờ chiếu 15-30 phút và mang theo mã QR
              hoặc mã đơn hàng #{ticketInfo.orderId} để đổi vé tại quầy.
            </p>
          </div>

          <ButtonGroup>
            <Button onClick={handleGoHome}>
              <FaHome /> Về trang chủ
            </Button>
          </ButtonGroup>
        </TicketDetails>
      </TicketInfoContainer>
    </PageContainer>
  );
}

// Styled components
// Cập nhật PageContainer để responsive hơn
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #f3f4f6;
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
  }
  
  @media (max-width: 992px) {
    padding: 1.75rem 0.75rem;
    
    h1 {
      font-size: 1.8rem;
      margin-bottom: 1.75rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    
    h1 {
      font-size: 1.6rem;
      margin-bottom: 1.5rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 1.25rem 0.5rem;
    
    h1 {
      font-size: 1.4rem;
      margin-bottom: 1.25rem;
    }
  }
`;

// Cập nhật SuccessMessage để responsive hơn
const SuccessMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  
  .icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background-color: ${props => props.success !== false
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(231, 26, 15, 0.1)'};
    border-radius: 50%;
    margin-bottom: 1rem;
  }
  
  .success-icon {
    font-size: 2.5rem;
    color: #10B981;
  }
  
  .error-icon {
    font-size: 2.5rem;
    color: #e71a0f;
  }
  
  h2 {
    color: ${props => props.success !== false ? '#10B981' : '#e71a0f'};
    font-size: 1.5rem;
    text-align: center;
  }
  
  @media (max-width: 992px) {
    margin-bottom: 1.75rem;
    
    .icon-container {
      width: 75px;
      height: 75px;
    }
    
    .success-icon, .error-icon {
      font-size: 2.3rem;
    }
    
    h2 {
      font-size: 1.4rem;
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    
    .icon-container {
      width: 70px;
      height: 70px;
    }
    
    .success-icon, .error-icon {
      font-size: 2.1rem;
    }
    
    h2 {
      font-size: 1.3rem;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
    
    .icon-container {
      width: 60px;
      height: 60px;
      margin-bottom: 0.75rem;
    }
    
    .success-icon, .error-icon {
      font-size: 1.8rem;
    }
    
    h2 {
      font-size: 1.2rem;
    }
  }
`;

// Cập nhật LoadingContainer để responsive hơn
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #e71a0f;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem;
    
    .spinner {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }
    
    p {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 2rem;
    
    .spinner {
      width: 28px;
      height: 28px;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

// Cập nhật ErrorContainer để responsive hơn
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
  background-color: #1f2937;
  border-radius: 8px;
  
  h2 {
    color: #e71a0f;
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
  }
  
  @media (max-width: 992px) {
    padding: 2.5rem;
    
    h2 {
      font-size: 1.4rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    
    h2 {
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 1.5rem;
    
    h2 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      margin-bottom: 1.25rem;
      font-size: 0.9rem;
    }
  }
`;

// Cập nhật TicketInfoContainer để responsive hơn
const TicketInfoContainer = styled.div`
  background-color: #1f2937;
  border-radius: 8px;
  padding: 2rem;
  
  @media (max-width: 992px) {
    padding: 1.75rem;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 6px;
  }
  
  @media (max-width: 576px) {
    padding: 1.25rem;
    border-radius: 5px;
  }
`;

// Cập nhật TicketHeader để responsive hơn
const TicketHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #374151;
  
  svg {
    font-size: 3rem;
    color: #e71a0f;
    margin-bottom: 1rem;
  }
  
  h2 {
    color: #f3f4f6;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #9ca3af;
    text-align: center;
  }
  
  @media (max-width: 992px) {
    margin-bottom: 1.75rem;
    padding-bottom: 1.25rem;
    
    svg {
      font-size: 2.8rem;
      margin-bottom: 0.85rem;
    }
    
    h2 {
      font-size: 1.4rem;
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
    padding-bottom: 1.1rem;
    
    svg {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }
    
    h2 {
      font-size: 1.3rem;
      margin-bottom: 0.4rem;
    }
    
    p {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    
    svg {
      font-size: 2.2rem;
      margin-bottom: 0.65rem;
    }
    
    h2 {
      font-size: 1.2rem;
      margin-bottom: 0.3rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

// Cập nhật TicketDetails để responsive hơn
const TicketDetails = styled.div`
  .ticket-info {
    margin-bottom: 2rem;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem 0;
    border-bottom: 1px dashed #374151;
    
    &:last-child {
      border-bottom: none;
    }
    
    span:first-child {
      color: #9ca3af;
    }
    
    .status {
      &.completed {
        color: #10B981;
        font-weight: bold;
      }
    }
  }
  
  .price-summary {
    background-color: #111827;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .price-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.8rem;
    
    &.discount {
      color: #10B981;
    }
    
    &.total {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #374151;
      font-weight: bold;
      font-size: 1.1rem;
      
      span:last-child {
        color: #e71a0f;
      }
    }
  }
  
  .ticket-note {
    background-color: rgba(231, 26, 15, 0.1);
    border-left: 3px solid #e71a0f;
    padding: 1rem;
    margin-bottom: 2rem;
    border-radius: 0 4px 4px 0;
    
    p {
      color: #f3f4f6;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
  
  @media (max-width: 992px) {
    .ticket-info {
      margin-bottom: 1.75rem;
    }
    
    .info-row {
      padding: 0.75rem 0;
      font-size: 0.95rem;
    }
    
    .price-summary {
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      border-radius: 6px;
    }
    
    .price-row {
      margin-bottom: 0.7rem;
      font-size: 0.95rem;
      
      &.total {
        margin-top: 0.9rem;
        padding-top: 0.9rem;
        font-size: 1.05rem;
      }
    }
    
    .ticket-note {
      padding: 0.9rem;
      margin-bottom: 1.75rem;
      
      p {
        font-size: 0.85rem;
      }
    }
  }
  
  @media (max-width: 768px) {
    .ticket-info {
      margin-bottom: 1.5rem;
    }
    
    .info-row {
      padding: 0.7rem 0;
      font-size: 0.9rem;
    }
    
    .price-summary {
      padding: 1.1rem;
      margin-bottom: 1.1rem;
      border-radius: 5px;
    }
    
    .price-row {
      margin-bottom: 0.6rem;
      font-size: 0.9rem;
      
      &.total {
        margin-top: 0.8rem;
        padding-top: 0.8rem;
        font-size: 1rem;
      }
    }
    
    .ticket-note {
      padding: 0.8rem;
      margin-bottom: 1.5rem;
      
      p {
        font-size: 0.8rem;
        line-height: 1.4;
      }
    }
  }
  
  @media (max-width: 576px) {
    .ticket-info {
      margin-bottom: 1.25rem;
    }
    
    .info-row {
      padding: 0.65rem 0;
      font-size: 0.85rem;
      flex-wrap: wrap;
      
      span:first-child {
        margin-bottom: 0.25rem;
      }
      
      &.wrap-content {
        flex-direction: column;
        
        span:last-child {
          margin-top: 0.25rem;
        }
      }
    }
    
    .price-summary {
      padding: 1rem;
      margin-bottom: 1rem;
    }
    
    .price-row {
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      
      &.total {
        margin-top: 0.7rem;
        padding-top: 0.7rem;
        font-size: 0.95rem;
      }
    }
    
    .ticket-note {
      padding: 0.7rem;
      margin-bottom: 1.25rem;
      
      p {
        font-size: 0.75rem;
        line-height: 1.3;
      }
    }
  }
`;

// Cập nhật ButtonGroup để responsive hơn
const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.6rem;
  }
`;

// Cập nhật Button để responsive hơn
const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #F9376E;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgb(249, 46, 103);
  }
  
  &.download {
    background-color: #3B82F6;
    
    &:hover {
      background-color: #2563EB;
    }
  }
  
  @media (max-width: 992px) {
    padding: 0.75rem 1.4rem;
    font-size: 0.95rem;
    
    svg {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.3rem;
    font-size: 0.9rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.65rem 1.2rem;
    font-size: 0.85rem;
    width: 100%;
    
    svg {
      font-size: 0.85rem;
    }
  }
`;

export default TicketInfo;