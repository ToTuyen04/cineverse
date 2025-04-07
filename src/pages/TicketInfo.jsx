import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaTicketAlt, FaHome, FaDownload } from 'react-icons/fa';
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
          
          console.log('Processing VNPay callback with params:', params);
          
          // Gọi API xử lý callback VNPay
          const response = await processVnPayCallback(params);
          console.log('VNPay callback response:', response);
          
          if (response.success) {
            // API xử lý thành công, hiển thị thông tin thanh toán
            setTicketInfo(response);
          } else {
            throw new Error(response.message || 'Thanh toán không thành công');
          }
        } else {
          // Nếu không phải callback từ VNPay, kiểm tra xem có orderId không
          const orderId = searchParams.get('orderId');
          
          if (!orderId) {
            throw new Error('Không tìm thấy thông tin vé');
          }
          
          // Gọi API lấy thông tin đơn hàng từ orderId
          const response = await getOrderById(orderId);
          console.log('Order details response:', response);
          
          if (response.success) {
            setTicketInfo(response);
          } else {
            throw new Error(response.message || 'Không thể lấy thông tin vé');
          }
        }
      } catch (error) {
        console.error('Error processing payment result:', error);
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
          <h2>{ticketInfo.message}</h2>
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

  return (
    <PageContainer>
      <h1>Thông tin vé của bạn</h1>
      
      <SuccessMessage>
        <div className="icon-container">
          <FaTicketAlt className="success-icon" />
        </div>
        <h2>{ticketInfo.message || 'Thanh toán thành công'}</h2>
      </SuccessMessage>
      
      <TicketInfoContainer>
        <TicketHeader>
          <FaTicketAlt />
          <h2>Thông tin vé</h2>
          <p>Cảm ơn bạn đã đặt vé tại CineVerse!</p>
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
                  <span>{orderData.showtimeInfos[0].movieName}</span>
                </div>
                
                <div className="info-row">
                  <span>Rạp:</span>
                  <span>{orderData.showtimeInfos[0].theaterName}</span>
                </div>
                
                <div className="info-row">
                  <span>Phòng chiếu:</span>
                  <span>{orderData.showtimeInfos[0].roomName}</span>
                </div>
                
                <div className="info-row">
                  <span>Suất chiếu:</span>
                  <span>{formatShowDate(new Date(orderData.showtimeInfos[0].startTime))}</span>
                </div>
              </>
            )}
            
            {orderData.orderDetails && orderData.orderDetails.length > 0 && (
              <div className="info-row">
                <span>Ghế:</span>
                <span>{orderData.orderDetails.map(seat => seat.chairName).join(', ')}</span>
              </div>
            )}
            
            {orderData.orderComboItems && orderData.orderComboItems.length > 0 && (
              <div className="info-row">
                <span>Combo:</span>
                <span>
                  {orderData.orderComboItems.map(combo => 
                    `${combo.comboName} x${combo.comboQuantity}`
                  ).join(', ')}
                </span>
              </div>
            )}
            
            <div className="info-row">
              <span>Họ tên:</span>
              <span>{orderData.orderName}</span>
            </div>
            
            <div className="info-row">
              <span>Email:</span>
              <span>{orderData.orderEmail}</span>
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
            <Button className="download">
              <FaDownload /> Tải vé
            </Button>
          </ButtonGroup>
        </TicketDetails>
      </TicketInfoContainer>
    </PageContainer>
  );
}

// Styled components
const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #f3f4f6;
  
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
`;

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
    background-color: rgba(16, 185, 129, 0.1);
    border-radius: 50%;
    margin-bottom: 1rem;
  }
  
  .success-icon {
    font-size: 2.5rem;
    color: #10B981;
  }
  
  h2 {
    color: #10B981;
    font-size: 1.5rem;
    text-align: center;
  }
`;

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
`;

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
`;

const TicketInfoContainer = styled.div`
  background-color: #1f2937;
  border-radius: 8px;
  padding: 2rem;
`;

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
  }
`;

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
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #e71a0f;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #c81a0f;
  }
  
  &.download {
    background-color: #3B82F6;
    
    &:hover {
      background-color: #2563EB;
    }
  }
`;

export default TicketInfo;