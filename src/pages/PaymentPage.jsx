import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronLeft, FaTicketAlt, FaCreditCard, FaMoneyBill, FaMobileAlt, FaCheck } from 'react-icons/fa';
import { formatCurrency, formatShowDate } from '../utils/formatters';
import { bookTickets } from '../api/services/bookingService';
import { checkVoucher } from '../api/services/voucherService';
import { createOrder, createPaymentUrl } from '../api/services/orderService';
import { getUserProfile } from '../api/services/userService';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({
    orderName: '',
    orderEmail: '',
    orderPhoneNumber: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Kiểm tra đăng nhập khi component mount
  useEffect(() => {
    const loadUserData = async () => {
      const userProfile = await fetchUserProfile();
      if (userProfile) {
        setIsAuthenticated(true);
        setUser(userProfile);
        setUserInfo({
          orderName: userProfile.fullName,
          orderEmail: userProfile.email,
          orderPhoneNumber: userProfile.phoneNumber
        });
        console.log('User profile:', userProfile);
        console.log('User info:', userInfo);
        setCurrentStep(2); // Skip bước 1 nếu đã đăng nhập
      }
    };

    loadUserData();
  }, []);

  // Kiểm tra dữ liệu từ location
  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }
    setPaymentData(location.state);
  }, [location, navigate]);

  // Lấy thông tin người dùng
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    const userProfile = JSON.parse(localStorage.getItem('userProfile')); // Parse JSON từ localStorage
  
    if (token && userProfile) {
      return {
        fullName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
        email: userProfile.email,
        phoneNumber: userProfile.phoneNumber || '' // Lấy phoneNumber từ userProfile
      };
    } else if (token) {
      try {
        const userProfile = await getUserProfile();
        return {
          fullName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
          email: userProfile.email,
          phoneNumber: userProfile.phoneNumber || '' // Lấy phoneNumber từ API nếu không có trong localStorage
        };
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
      }
    }
  
    return null;
  };

  // Xử lý thay đổi thông tin người dùng
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi người dùng chỉnh sửa trường
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate thông tin người dùng
  const validateUserInfo = () => {
    const errors = {};
    if (!userInfo.orderName.trim()) errors.orderName = 'Vui lòng nhập tên';
    if (!userInfo.orderEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.orderEmail))
      errors.orderEmail = 'Vui lòng nhập email hợp lệ';
    if (!userInfo.orderPhoneNumber.trim() || !/^[0-9]{10,11}$/.test(userInfo.orderPhoneNumber))
      errors.orderPhoneNumber = 'Vui lòng nhập số điện thoại hợp lệ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Chuyển bước tiếp theo
  const handleNextStep = () => {
    if (currentStep === 1 && !validateUserInfo()) {
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Xử lý thanh toán
  const handlePayment = async () => {
    const { showtime, seats, combo } = location.state || {};

    if (!seats || seats.length === 0) {
      alert('Vui lòng chọn ghế trước khi thanh toán.');
      return;
    }

    setIsProcessing(true);
    try {
      const orderPayload = {
        showtimeId: showtime.id,
        selectedChairs: seats.map(seat => ({
          chairId: seat.chairId,
          version: seat.version
        })),
        userId: isAuthenticated ? user.id : null,
        guestCheckOutRequest: !isAuthenticated
          ? {
              guestName: userInfo.orderName,
              guestEmail: userInfo.orderEmail,
              guestPhoneNumber: userInfo.orderPhoneNumber
            }
          : {
            guestName: `${user.fullName}`.trim(),
            guestEmail: user.email || '',
            guestPhoneNumber: user.phoneNumber || ''
          },
        voucherId: appliedVoucher ? appliedVoucher.id : null,
        selectedCombos: (combo || []).map(item => ({
          comboId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Gọi API tạo đơn hàng
      const orderResponse = await createOrder(orderPayload);
      console.log('Order payload:', orderPayload);
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Tạo đơn hàng thất bại.');
      }

      const orderId = orderResponse.data.orderId;

      // Gọi API tạo link thanh toán VNPay
      const paymentResponse = await createPaymentUrl(orderId);
      if (!paymentResponse.paymentUrl) {
        throw new Error('Không thể tạo link thanh toán VNPay.');
      }

      // Điều hướng đến link thanh toán VNPay
      window.location.href = paymentResponse.paymentUrl;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.';

      // Hiển thị alert với message từ API
      alert(errorMessage);
      navigate(`/movie/${location.state.movie.movieId}/booking`, {
        state: {
          preselected: true,
          theaterId: location.state.theater.theaterId,
          theaterObject: location.state.theater,
          dateObject: {
            value: location.state.showDate.date
          },
          showtimeObject: {
            showtimeId: location.state.showtime.id,
            value: location.state.showtime.id.toString()
          },
          error: errorMessage,
          scrollToSeats: true
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý thay đổi mã giảm giá
  const handleVoucherCodeChange = (e) => {
    setVoucherCode(e.target.value);
    setVoucherError('');
    setVoucherSuccess('');
  };

  // Hàm áp dụng voucher
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }
  
    setIsCheckingVoucher(true);
    setVoucherError('');
    setVoucherSuccess('');
  
    try {
      const totalAmount = calculateSubtotal();
      const response = await checkVoucher(voucherCode, totalAmount);
  
      if (response.valid) {
        setAppliedVoucher({
          id: response.voucherId,
          code: response.code,
          name: response.name,
          description: response.description,
          discount: response.discount,
          discountType: response.discountType,
          maxValue: response.maxValue,
          actualDiscount: response.actualDiscount
        });
        setVoucherSuccess(response.message || 'Áp dụng mã giảm giá thành công');
      } else {
        setVoucherError(response.message || 'Mã giảm giá không hợp lệ');
        setAppliedVoucher(null);
      }
    } catch (error) {
      console.error('Error checking voucher:', error);
      setVoucherError('Có lỗi xảy ra khi kiểm tra mã giảm giá');
      setAppliedVoucher(null);
    } finally {
      setIsCheckingVoucher(false);
    }
  };
  
  // Hàm tính tổng tiền ban đầu
  const calculateSubtotal = () => {
    const { totalPrice = 0 } = paymentData || {};
    return totalPrice;
  };
  
  // Hàm tính số tiền giảm giá
  const calculateDiscountAmount = () => {
    if (!appliedVoucher) return 0;
    return appliedVoucher.actualDiscount || 0;
  };
  
  // Hàm tính tổng tiền cuối cùng
  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    return Math.max(subtotal - discountAmount, 0);
  };

  // Hủy voucher đã áp dụng
  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
    setVoucherSuccess('');
  };

  if (!paymentData) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Đang tải thông tin thanh toán...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1>Trang Thanh Toán</h1>
      <StepsContainer>
        <Step $active={currentStep === 1}>1. Thông tin khách hàng</Step>
        <Step $active={currentStep === 2}>2. Thanh toán</Step>
        <Step $active={currentStep === 3}>3. Thông tin vé phim</Step>
      </StepsContainer>

      <PaymentLayout>
        {/* Cột bên trái: Thông tin khách hàng */}
        <LeftColumn>
          {currentStep === 1 && (
            <UserInfoSection>
              <h2>Thông tin khách hàng</h2>
              <UserInfoForm>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="orderName"
                    value={userInfo.orderName}
                    onChange={handleUserInfoChange}
                    className={formErrors.orderName ? 'error' : ''}
                  />
                  {formErrors.orderName && <div className="error-text">{formErrors.orderName}</div>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="orderEmail"
                    value={userInfo.orderEmail}
                    onChange={handleUserInfoChange}
                    className={formErrors.orderEmail ? 'error' : ''}
                  />
                  {formErrors.orderEmail && <div className="error-text">{formErrors.orderEmail}</div>}
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="orderPhoneNumber"
                    value={userInfo.orderPhoneNumber}
                    onChange={handleUserInfoChange}
                    className={formErrors.orderPhoneNumber ? 'error' : ''}
                  />
                  {formErrors.orderPhoneNumber && <div className="error-text">{formErrors.orderPhoneNumber}</div>}
                </div>
              </UserInfoForm>
              <ButtonContainer>
                <Button className="next" onClick={handleNextStep}>
                  Tiếp tục
                </Button>
              </ButtonContainer>
            </UserInfoSection>
          )}

          {currentStep === 2 && (
            <PaymentMethods>
              <h2>Phương thức thanh toán</h2>

              {/* Phần nhập mã giảm giá */}
              <VoucherSection>
                <h3>Mã giảm giá</h3>
                <VoucherInput>
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={handleVoucherCodeChange}
                    disabled={appliedVoucher !== null}
                  />
                  {!appliedVoucher ? (
                    <button
                      onClick={applyVoucher}
                      disabled={isCheckingVoucher || !voucherCode.trim()}
                    >
                      {isCheckingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  ) : (
                    <button
                      onClick={removeVoucher}
                      className="remove"
                    >
                      Hủy
                    </button>
                  )}
                </VoucherInput>

                {voucherError && <VoucherError>{voucherError}</VoucherError>}
                {voucherSuccess && <AppliedVoucher><FaCheck /> {voucherSuccess}</AppliedVoucher>}

                {appliedVoucher && (
                  <AppliedVoucher>
                    <FaCheck /> Đã áp dụng: {appliedVoucher.name} ({appliedVoucher.discount}%, tối đa {formatCurrency(appliedVoucher.maxValue)})
                  </AppliedVoucher>
                )}
              </VoucherSection>

              <PaymentMethodsList>
                <PaymentMethodCard
                  $selected={selectedPaymentMethod === 'vnpay'}
                  onClick={() => setSelectedPaymentMethod('vnpay')}
                >
                  <div className="icon">
                    <FaMobileAlt />
                  </div>
                  <div className="info">
                    <h3>VNPay</h3>
                    <p>Thanh toán qua VNPay</p>
                  </div>
                </PaymentMethodCard>
                <PaymentMethodCard
                  $selected={selectedPaymentMethod === 'creditCard'}
                  style={{ opacity: 0.5, pointerEvents: 'none' }}
                >
                  <div className="icon">
                    <FaCreditCard />
                  </div>
                  <div className="info">
                    <h3>Thẻ tín dụng / Ghi nợ</h3>
                    <p>Không khả dụng</p>
                  </div>
                </PaymentMethodCard>
                <PaymentMethodCard
                  $selected={selectedPaymentMethod === 'bankTransfer'}
                  style={{ opacity: 0.5, pointerEvents: 'none' }}
                >
                  <div className="icon">
                    <FaMoneyBill />
                  </div>
                  <div className="info">
                    <h3>Chuyển khoản ngân hàng</h3>
                    <p>Không khả dụng</p>
                  </div>
                </PaymentMethodCard>
              </PaymentMethodsList>
              <ButtonContainer>
                <Button className="next" onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </Button>
              </ButtonContainer>
            </PaymentMethods>
          )}
        </LeftColumn>

        {/* Cột bên phải: Thông tin vé */}
        <RightColumn>
          <OrderSummary>
            <h2>Thông tin vé</h2>
            <div className="movie-title">{paymentData.movie.movieName}</div>
            <div className="theater">
              <div className="name">{paymentData.theater.name}</div>
              <div className="address">{paymentData.theater.address}</div>
            </div>
            <div className="summary-item">
              <span>Thời gian:</span>
              <span>{paymentData.showtime.time} - {formatShowDate(paymentData.showDate.date)}</span>
            </div>
            <div className="summary-item">
              <span>Phòng chiếu:</span>
              <span>{paymentData.showtime.room}</span>
            </div>
            <div className="summary-item">
              <span>Số vé:</span>
              <span>{paymentData.seats.length}</span>
            </div>
            <div className="summary-item">
              <span>Ghế:</span>
              <span>{paymentData?.seats?.map(seat => seat.name).join(', ')}</span>
            </div>
            {paymentData?.combo?.length > 0 && (
              <div className="summary-item">
                <span>Combo:</span>
                <span>
                  {paymentData.combo.map(item => `${item.name} x${item.quantity}`).join(', ')}
                </span>
              </div>
            )}
            <div className="price-detail">
              <div className="price-row">
                <span>Tổng tiền:</span>
                <span>{formatCurrency(paymentData.totalPrice)}</span>
              </div>

              {appliedVoucher && (
                <div className="price-row discount">
                  <span>Giảm giá {appliedVoucher.name}:</span>
                  <span>- {formatCurrency(calculateDiscountAmount())}</span>
                </div>
              )}

              <div className="price-row total">
                <span>Số tiền cần thanh toán:</span>
                <span>{formatCurrency(calculateFinalAmount())}</span>
              </div>
            </div>
          </OrderSummary>
        </RightColumn>
      </PaymentLayout>
    </PageContainer>
  );
}

// Thêm component loading
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #e71a0f;
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  p {
    color: #b8c2cc;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    min-height: 250px;
    
    .spinner {
      width: 35px;
      height: 35px;
      margin-bottom: 0.8rem;
    }
    
    p {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    min-height: 200px;
    
    .spinner {
      width: 30px;
      height: 30px;
      margin-bottom: 0.6rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #f3f4f6;
  
  h1 {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    color: #f3f4f6;
  }
  
  @media (max-width: 992px) {
    padding: 1.75rem 1rem;
    
    h1 {
      font-size: 2rem;
      margin-bottom: 1.25rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 0.75rem;
    
    h1 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 1.25rem 0.5rem;
    
    h1 {
      font-size: 1.6rem;
      margin-bottom: 0.75rem;
    }
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: ${(props) => (props.$active ? '#e71a0f' : '#9ca3af')};
  border-bottom: ${(props) => (props.$active ? '2px solid #e71a0f' : '2px solid transparent')};
  padding-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding-bottom: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
    padding: 0.5rem 0;
    border-bottom: none;
    border-left: ${(props) => (props.$active ? '4px solid #e71a0f' : '4px solid transparent')};
    padding-left: 0.5rem;
    text-align: left;
    background-color: ${(props) => (props.$active ? 'rgba(231, 26, 15, 0.1)' : 'transparent')};
    border-radius: 4px;
  }
`;

// Các styled components khác giữ nguyên

const PaymentMethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
  
  @media (max-width: 576px) {
    gap: 0.6rem;
  }
`;

const PaymentMethods = styled.div`
  background-color: #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
  
  h2 {
    color: #f3f4f6;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    border-bottom: 1px solid #374151;
    padding-bottom: 0.5rem;
  }
  
  @media (max-width: 992px) {
    padding: 1.25rem;
    
    h2 {
      font-size: 1.3rem;
      margin-bottom: 1.25rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    
    h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.9rem;
    border-radius: 6px;
    
    h2 {
      font-size: 1.1rem;
      margin-bottom: 0.9rem;
    }
  }
`;
const PaymentMethodCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: ${props => props.$selected ? '#374151' : '#1f2937'};
  border: 2px solid ${props => props.$selected ? '#e71a0f' : 'transparent'};
  border-radius: 8px;
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #374151;
  }
  
  .icon {
    font-size: 1.8rem;
    color: ${props => props.$selected ? '#e71a0f' : '#b8c2cc'};
  }
  
  .info {
    h3 {
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    
    p {
      color: #b8c2cc;
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 992px) {
    padding: 1rem;
    
    .icon {
      font-size: 1.6rem;
    }
    
    .info {
      h3 {
        margin-bottom: 0.4rem;
        font-size: 1rem;
      }
      
      p {
        font-size: 0.85rem;
      }
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.9rem;
    
    .icon {
      font-size: 1.5rem;
    }
    
    .info {
      h3 {
        margin-bottom: 0.3rem;
        font-size: 0.95rem;
      }
      
      p {
        font-size: 0.8rem;
      }
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.8rem;
    gap: 0.75rem;
    
    .icon {
      font-size: 1.4rem;
    }
    
    .info {
      h3 {
        margin-bottom: 0.2rem;
        font-size: 0.9rem;
      }
      
      p {
        font-size: 0.75rem;
      }
    }
  }
`;

const ResultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1f2937;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  
  svg {
    color: ${props => props.$success ? '#10B981' : '#e71a0f'};
    margin-bottom: 1.5rem;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: ${props => props.$success ? '#10B981' : '#e71a0f'};
  }
  
  p {
    margin-bottom: 0.5rem;
  }
  
  button {
    margin-top: 2rem;
  }
`;

const UserInfoSection = styled.div`
  background-color: #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
  
  h2 {
    color: #f3f4f6;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    border-bottom: 1px solid #374151;
    padding-bottom: 0.5rem;
  }
  
  @media (max-width: 992px) {
    padding: 1.25rem;
    
    h2 {
      font-size: 1.3rem;
      margin-bottom: 1.25rem;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    
    h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.9rem;
    border-radius: 6px;
    
    h2 {
      font-size: 1.1rem;
      margin-bottom: 0.9rem;
    }
  }
`;

const UserInfoForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem; /* Khoảng cách giữa các trường */

  .form-group {
    display: flex;
    flex-direction: column; /* Căn trái */
    align-items: flex-start; /* Đảm bảo label và input căn trái */
    width: 100%;

    label {
      margin-bottom: 0.5rem;
      color: #b8c2cc;
      font-size: 0.95rem;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      background-color: #374151;
      border: 1px solid #4b5563;
      border-radius: 5px;
      color: #f3f4f6;
      font-size: 0.95rem;

      &:focus {
        outline: none;
        border-color: #e71a0f;
      }

      &.error {
        border-color: #e71a0f;
      }
    }

    .error-text {
      color: #e71a0f;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
    
    .form-group {
      label {
        margin-bottom: 0.4rem;
        font-size: 0.9rem;
      }
      
      input {
        padding: 0.7rem;
        font-size: 0.9rem;
      }
      
      .error-text {
        font-size: 0.8rem;
        margin-top: 0.4rem;
      }
    }
  }
  
  @media (max-width: 576px) {
    gap: 0.9rem;
    
    .form-group {
      label {
        margin-bottom: 0.3rem;
        font-size: 0.85rem;
      }
      
      input {
        padding: 0.65rem;
        font-size: 0.85rem;
      }
      
      .error-text {
        font-size: 0.75rem;
        margin-top: 0.3rem;
      }
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &.back {
    background-color: #374151;
    color: #f3f4f6;
    
    &:hover {
      background-color: #4b5563;
    }
  }
  
  &.next {
    background-color: #e71a0f;
    color: #fff;
    
    &:hover {
      background-color: #c81a0f;
    }
    
    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
    gap: 0.4rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
    gap: 0.3rem;
  }
`;

// Thêm styled component cho bố cục 2 cột
const PaymentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Hai cột bằng nhau */
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 992px) {
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Chuyển thành 1 cột trên màn hình nhỏ */
    gap: 1.25rem;
    margin-top: 1.5rem;
  }
  
  @media (max-width: 576px) {
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1.25rem;
  }
  
  @media (max-width: 576px) {
    gap: 1rem;
  }
`;

const RightColumn = styled.div`
  background-color: #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
  color: #f3f4f6;
  height: fit-content;
  position: sticky;
  top: 20px;
  
  @media (max-width: 992px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 768px) {
    position: relative;
    top: 0;
    order: -1; /* Di chuyển lên trên trong chế độ mobile */
    padding: 1rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.9rem;
    border-radius: 6px;
  }
`;

const OrderSummary = styled.div`
  h2 {
    color: #f3f4f6;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
    border-bottom: 1px solid #374151;
    padding-bottom: 0.5rem;
  }

  .movie-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #e71a0f;
    margin-bottom: 1rem;
  }

  .theater {
    margin-bottom: 1.2rem;

    .name {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .address {
      font-size: 0.85rem;
      color: #9ca3af;
      margin-top: 0.2rem;
    }
  }

  .summary-item {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;

    &.section-title {
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
      text-transform: uppercase;
      color: #e71a0f;
      font-size: 1rem;
      display: block;
    }
  }
  
  .price-detail {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #374151;
    
    .price-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.7rem;
      
      &.discount {
        color: #10B981;
      }
      
      &.total {
        margin-top: 1rem;
        padding-top: 0.7rem;
        border-top: 1px dashed #374151;
        font-weight: bold;
        font-size: 1.1rem;
        
        span:last-child {
          color: #e71a0f;
          font-size: 1.2rem;
        }
      }
    }
  }
  
  @media (max-width: 992px) {
    h2 {
      font-size: 1.3rem;
      margin-bottom: 1.25rem;
    }
    
    .movie-title {
      font-size: 1.2rem;
      margin-bottom: 0.9rem;
    }
    
    .theater {
      margin-bottom: 1rem;
      
      .name {
        font-size: 1rem;
      }
      
      .address {
        font-size: 0.8rem;
      }
    }
    
    .summary-item {
      margin-bottom: 0.8rem;
      font-size: 0.95rem;
      
      &.section-title {
        margin-top: 1.25rem;
        margin-bottom: 0.4rem;
        font-size: 0.95rem;
      }
    }
    
    .price-detail {
      margin-top: 1.25rem;
      padding-top: 0.9rem;
      
      .price-row {
        margin-bottom: 0.6rem;
        
        &.total {
          margin-top: 0.9rem;
          padding-top: 0.6rem;
          font-size: 1.05rem;
          
          span:last-child {
            font-size: 1.15rem;
          }
        }
      }
    }
  }
  
  @media (max-width: 768px) {
    h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    
    .movie-title {
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
    }
    
    .theater {
      margin-bottom: 0.9rem;
      
      .name {
        font-size: 0.95rem;
      }
      
      .address {
        font-size: 0.75rem;
      }
    }
    
    .summary-item {
      margin-bottom: 0.7rem;
      font-size: 0.9rem;
      
      &.section-title {
        margin-top: 1rem;
        margin-bottom: 0.3rem;
        font-size: 0.9rem;
      }
    }
    
    .price-detail {
      margin-top: 1rem;
      padding-top: 0.8rem;
      
      .price-row {
        margin-bottom: 0.5rem;
        
        &.total {
          margin-top: 0.8rem;
          padding-top: 0.5rem;
          font-size: 1rem;
          
          span:last-child {
            font-size: 1.1rem;
          }
        }
      }
    }
  }
  
  @media (max-width: 576px) {
    h2 {
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
    }
    
    .movie-title {
      font-size: 1rem;
      margin-bottom: 0.7rem;
    }
    
    .theater {
      margin-bottom: 0.8rem;
      
      .name {
        font-size: 0.9rem;
      }
      
      .address {
        font-size: 0.7rem;
      }
    }
    
    .summary-item {
      margin-bottom: 0.6rem;
      font-size: 0.85rem;
      
      &.section-title {
        margin-top: 0.9rem;
        margin-bottom: 0.25rem;
        font-size: 0.85rem;
      }
    }
    
    .price-detail {
      margin-top: 0.9rem;
      padding-top: 0.7rem;
      
      .price-row {
        margin-bottom: 0.45rem;
        
        &.total {
          margin-top: 0.7rem;
          padding-top: 0.45rem;
          font-size: 0.95rem;
          
          span:last-child {
            font-size: 1.05rem;
          }
        }
      }
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 1.5rem;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    margin-top: 1.25rem;
    gap: 0.75rem;
  }
  
  @media (max-width: 576px) {
    margin-top: 1rem;
    gap: 0.5rem;
  }
`;

const VoucherSection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #374151;
  
  h3 {
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
    color: #f3f4f6;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    padding-bottom: 1.25rem;
    
    h3 {
      margin-bottom: 0.7rem;
      font-size: 1rem;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    
    h3 {
      margin-bottom: 0.6rem;
      font-size: 0.95rem;
    }
  }
`;

const VoucherInput = styled.div`
  display: flex;
  gap: 0.5rem;
  
  input {
    flex: 1;
    padding: 0.75rem;
    background-color: #374151;
    border: 1px solid #4b5563;
    border-radius: 5px;
    color: #f3f4f6;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: #e71a0f;
    }
    
    &:disabled {
      background-color: #2d3748;
      color: #9ca3af;
    }
  }
  
  button {
    padding: 0.75rem 1rem;
    background-color: #e71a0f;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.2s;
    min-width: 90px;
    text-align: center;
    
    &:hover {
      background-color: #c81a0f;
    }
    
    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    
    &.remove {
      background-color: #374151;
      border: 1px solid #e71a0f;
      color: #e71a0f;
      
      &:hover {
        background-color: rgba(231, 26, 15, 0.1);
      }
    }
  }
  
  @media (max-width: 768px) {
    input {
      padding: 0.7rem;
      font-size: 0.9rem;
    }
    
    button {
      padding: 0.7rem 0.9rem;
      font-size: 0.9rem;
      min-width: 80px;
    }
  }
  
  @media (max-width: 576px) {
    input {
      padding: 0.65rem;
      font-size: 0.85rem;
    }
    
    button {
      padding: 0.65rem 0.8rem;
      font-size: 0.85rem;
      min-width: 70px;
    }
  }
`;

const VoucherError = styled.div`
  color: #e71a0f;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-top: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    margin-top: 0.3rem;
  }
`;

const AppliedVoucher = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10B981;
  margin-top: 0.5rem;
  font-size: 0.95rem;
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    gap: 0.4rem;
    
    svg {
      font-size: 0.95rem;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.85rem;
    gap: 0.3rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
`;

export default PaymentPage;