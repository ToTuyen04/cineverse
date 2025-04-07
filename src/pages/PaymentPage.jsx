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
  const [voucherSuccess, setVoucherSuccess] = useState(''); // Thêm state này
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('creditCard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Quản lý bước hiện tại
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
        setCurrentStep(2); // Skip bước 1 nếu đã đăng nhập
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }
    setPaymentData(location.state);
  }, [location, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserInfo({
        orderName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        orderEmail: user.email || '',
        orderPhoneNumber: user.phoneNumber || ''
      });
      setCurrentStep(2); // Skip bước 1 nếu đã đăng nhập
    }
  }, [isAuthenticated, user]);


  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    const userFullName = localStorage.getItem('userFullName');
    const userEmail = localStorage.getItem('userEmail');

    if (token && userFullName && userEmail) {
      // Lấy thông tin từ localStorage
      return {
        fullName: userFullName,
        email: userEmail,
        phoneNumber: localStorage.getItem('userPhoneNumber') || '033333333'
      };
    } else if (token) {
      // Nếu không có trong localStorage, gọi API getUserProfile
      try {
        const userProfile = await getUserProfile();
        return {
          fullName: userProfile.fullName,
          email: userProfile.email,
          phoneNumber: userProfile.phoneNumber || ''
        };
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
      }
    }

    return null; // Không có token hoặc thông tin người dùng
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleNextStep = () => {
    if (currentStep === 1 && !validateUserInfo()) {
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

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
        selectedCombos: combo.map(item => ({
          comboId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      // Gọi API tạo đơn hàng
      const orderResponse = await createOrder(orderPayload);
      console.log('Order response:', orderResponse);
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
      console.log('Payment URL:', paymentResponse.paymentUrl);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoucherCodeChange = (e) => {
    setVoucherCode(e.target.value);
    setVoucherError('');
  };

  // Hàm áp dụng voucher
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }
  
    setIsCheckingVoucher(true);
    setVoucherError('');
  
    try {
      const totalAmount = calculateSubtotal(); // Tính tổng tiền ban đầu
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
        setVoucherSuccess(response.message);
        setVoucherError('');
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
    
    // Đảm bảo không giảm vượt quá tổng tiền
    return Math.max(subtotal - discountAmount, 0);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  if (!paymentData) {
    return <div>Loading...</div>;
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
                  style={{ opacity: 0.5, pointerEvents: 'none' }} // Vô hiệu hóa
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
                  style={{ opacity: 0.5, pointerEvents: 'none' }} // Vô hiệu hóa
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
            <div className="movie-title">{paymentData.movie.title}</div>
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
                <span>Tổng tiền :</span>
                <span>{formatCurrency(paymentData.totalPrice)}</span>
              </div>

              {appliedVoucher && (
                <div className="price-row discount">
                  <span>Giảm giá {appliedVoucher.name}:</span>
                  <span>- {formatCurrency(calculateDiscountAmount())}</span>
                </div>
              )}

              <div className="price-row total">
                <span>Số tiền cần thanh toán :</span>
                <span>{formatCurrency(calculateFinalAmount())}</span>
              </div>
            </div>
          </OrderSummary>
        </RightColumn>
      </PaymentLayout>
    </PageContainer>
  );
}

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #f3f4f6;
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: ${(props) => (props.$active ? '#e71a0f' : '#9ca3af')};
  border-bottom: ${(props) => (props.$active ? '2px solid #e71a0f' : '2px solid transparent')};
  padding-bottom: 0.5rem;
`;

// Các styled components khác giữ nguyên

const PaymentMethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  }
`;

// Thêm styled component cho bố cục 2 cột
const PaymentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr; /* Hai cột bằng nhau */
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Chuyển thành 1 cột trên màn hình nhỏ */
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RightColumn = styled.div`
  background-color: #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
  color: #f3f4f6;
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

    &.total {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #374151;
      font-weight: bold;

      span:last-child {
        color: #e71a0f;
        font-size: 1.2rem;
      }
    }
  }
  
  .concessions-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Căn trái */
    margin-bottom: 1rem;
    
    .concession-item {
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      width: 100%;
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
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 1.5rem;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
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
`;

const VoucherError = styled.div`
  color: #e71a0f;
  font-size: 0.85rem;
  margin-top: 0.5rem;
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
`;

export default PaymentPage;