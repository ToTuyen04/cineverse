import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { resetPassword } from '../api/services/authService';
import Button from '../components/common/Button';

// Cập nhật PageContainer để responsive hơn
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// Cập nhật ContentContainer để responsive hơn
const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 2rem;
  
  @media (max-width: 992px) {
    padding: 1rem 0.75rem 1.5rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 0.5rem 1rem;
  }
`;

// Cập nhật ResetPasswordCard để responsive hơn
const ResetPasswordCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-width: 450px;
  width: 100%;
  
  @media (max-width: 768px) {
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.35);
    border-radius: 8px;
  }
  
  @media (max-width: 576px) {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    border-radius: 6px;
  }
`;

// Cập nhật CardHeader để responsive hơn
const CardHeader = styled(Card.Header)`
  background: transparent;
  border-bottom: 1px solid #3f425a;
  padding: 1.5rem 1.5rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem 1.25rem 0.9rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem 1rem 0.8rem;
    
    .d-flex {
      align-items: flex-start !important;
    }
  }
`;

// Cập nhật CardBody để responsive hơn
const CardBody = styled(Card.Body)`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
  }
`;

// Cập nhật PageTitle để responsive hơn
const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 0.4rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.4rem;
    margin-bottom: 0.3rem;
  }
`;

// Cập nhật PageSubtitle để responsive hơn
const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

// Cập nhật FormControl để responsive hơn
const FormControl = styled(Form.Control)`
  background-color: #1e1e30;
  border: 1px solid #3f425a;
  color: #f3f4f6;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  font-size: 0.9rem;
  
  &:focus {
    background-color: #1e1e30;
    box-shadow: 0 0 0 0.25rem rgba(249, 55, 110, 0.25);
    border-color: #F9376E;
    color: #f3f4f6;
  }
  
  &::placeholder {
    color: #6c757d;
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1rem 0.7rem 2.3rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.65rem 0.9rem 0.65rem 2.1rem;
    font-size: 0.8rem;
  }
`;

// Cập nhật InputGroup để responsive hơn
const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.3rem;
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.1rem;
  }
`;

// Cập nhật InputIcon để responsive hơn
const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  z-index: 2;
  
  @media (max-width: 768px) {
    left: 0.7rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 576px) {
    left: 0.65rem;
    font-size: 0.85rem;
  }
`;

// Cập nhật TogglePasswordIcon để responsive hơn
const TogglePasswordIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  cursor: pointer;
  z-index: 2;
  
  &:hover {
    color: #F9376E;
  }
  
  @media (max-width: 768px) {
    right: 0.7rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 576px) {
    right: 0.65rem;
    font-size: 0.85rem;
  }
`;

// Cập nhật LoginLink để responsive hơn
const LoginLink = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #9ca3af;
  font-size: 0.9rem;
  
  a {
    color: #F9376E;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  @media (max-width: 768px) {
    margin-top: 1.25rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 576px) {
    margin-top: 1rem;
    font-size: 0.8rem;
  }
`;

// Cập nhật BackButton để responsive hơn
const BackButton = styled(Button)`
  color: #9ca3af;
  background: transparent;
  border: none;
  padding: 0.6rem;
  margin-right: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    color: #F9376E;
    background-color: rgba(249, 55, 110, 0.1);
    transform: translateX(-2px);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 0.55rem;
    margin-right: 0.8rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem;
    margin-right: 0.6rem;
    align-self: flex-start;
    
    svg {
      font-size: 0.85rem;
    }
  }
`;

// Cập nhật SuccessContainer để responsive hơn
const SuccessContainer = styled.div`
  text-align: center;
  padding: 1rem 0;
  
  @media (max-width: 768px) {
    padding: 0.8rem 0;
  }
  
  @media (max-width: 576px) {
    padding: 0.6rem 0;
  }
`;

// Cập nhật SuccessIcon để responsive hơn
const SuccessIcon = styled.div`
  width: 70px;
  height: 70px;
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    width: 50px;
    height: 50px;
    font-size: 1.6rem;
    margin-bottom: 1rem;
  }
`;

// Cập nhật RequirementsList để responsive hơn
const RequirementsList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  
  li {
    padding: 0.2rem 0;
    color: #9ca3af;
    
    &.valid {
      color: #10b981;
      
      &::before {
        content: "✓ ";
      }
    }
    
    &.invalid {
      color: #ef4444;
      
      &::before {
        content: "✗ ";
      }
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1.3rem;
    font-size: 0.8rem;
    
    li {
      padding: 0.18rem 0;
    }
  }
  
  @media (max-width: 576px) {
    margin-bottom: 1.1rem;
    font-size: 0.75rem;
    
    li {
      padding: 0.15rem 0;
    }
  }
`;

// Cập nhật IconWrapper để responsive hơn
const IconWrapper = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  color: ${props => props.success ? '#10B981' : props.error ? '#EF4444' : '#F9376E'};
  
  .spinner {
    animation: spin 1s infinite linear;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    font-size: 4.5rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 576px) {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
`;

// Cập nhật CountdownText để responsive hơn
const CountdownText = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #6B7280;
  
  @media (max-width: 768px) {
    margin-top: 0.9rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 576px) {
    margin-top: 0.8rem;
    font-size: 0.8rem;
  }
`;

// Hàm giải mã token JWT để lấy payload
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('initial'); // 'initial', 'loading', 'success', 'error'
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const navigate = useNavigate();
  
  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false
  });
  
  useEffect(() => {
    // Lấy token từ URL
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    
    if (!urlToken) {
      setStatus('error');
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    } else {
      setToken(urlToken);
      
      // Giải mã token để lấy isStaff
      try {
        const decodedToken = decodeJwt(urlToken);
        if (decodedToken && decodedToken.IsStaff) {
          // Chuyển chuỗi "True" hoặc "False" thành boolean
          setIsStaff(decodedToken.IsStaff === "True");
        }
        
        if (urlEmail) {
          setEmail(urlEmail);
        }
      } catch (error) {
        console.error('Error processing token:', error);
      }
      
      setStatus('initial');
    }
  }, [searchParams]);
  
  // Kiểm tra yêu cầu mật khẩu khi người dùng nhập
  useEffect(() => {
    setPasswordRequirements({
      length: newPassword.length >= 8
    });
  }, [newPassword]);
  
  const validateForm = () => {
    // Chỉ kiểm tra độ dài mật khẩu
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return false;
    }
    
    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setStatus('loading');
      
      // Chuẩn bị dữ liệu theo format yêu cầu
      const resetPasswordData = {
        token: token,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
        isStaff: isStaff
      };
      
      // Gọi API đặt lại mật khẩu
      await resetPassword(resetPasswordData);
      
      // Đặt lại mật khẩu thành công
      setStatus('success');
      
      // Bắt đầu đếm ngược để chuyển hướng
      let count = 5;
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        
        if (count <= 0) {
          clearInterval(timer);
          navigate('/login');
        }
      }, 1000);
      
      return () => clearInterval(timer);
      
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus('error');
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Hàm kiểm tra password strength
  const getPasswordStrengthText = () => {
    const { length } = passwordRequirements;
    const validCount = [length].filter(Boolean).length;
    
    if (validCount <= 1) return { text: "Rất yếu", color: "#EF4444" };
    if (validCount === 2) return { text: "Yếu", color: "#F59E0B" };
    if (validCount === 3) return { text: "Trung bình", color: "#F59E0B" };
    if (validCount === 4) return { text: "Mạnh", color: "#10B981" };
    return { text: "Rất mạnh", color: "#10B981" };
  };
  
  return (
    <PageContainer>
      <ContentContainer>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <ResetPasswordCard>
                <CardHeader>
                  <div className="d-flex align-items-center mb-3">
                    <BackButton 
                      variant="text" 
                      onClick={() => navigate('/login')}
                    >
                      <FaArrowLeft size={18} />
                    </BackButton>
                    <div>
                      <PageTitle>Đặt lại mật khẩu</PageTitle>
                      <PageSubtitle>Tạo mật khẩu mới cho tài khoản của bạn</PageSubtitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardBody>
                  {error && (
                    <Alert variant="danger" className="mb-3" style={{
                      fontSize: window.innerWidth <= 576 ? '0.85rem' : '0.9rem',
                      padding: window.innerWidth <= 576 ? '0.65rem 0.75rem' : '0.75rem 1rem'
                    }}>
                      {error}
                    </Alert>
                  )}
                  
                  {status === 'loading' && (
                    <SuccessContainer>
                      <IconWrapper>
                        <FaSpinner className="spinner" />
                      </IconWrapper>
                      <PageTitle>Đang xử lý...</PageTitle>
                      <PageSubtitle style={{ 
                        fontSize: window.innerWidth <= 576 ? '0.9rem' : '1rem', 
                        color: '#f3f4f6' 
                      }}>
                        Vui lòng đợi trong giây lát.
                      </PageSubtitle>
                    </SuccessContainer>
                  )}
                  
                  {status === 'success' && (
                    <SuccessContainer>
                      <IconWrapper success>
                        <FaCheck />
                      </IconWrapper>
                      <PageTitle>Đặt lại mật khẩu thành công!</PageTitle>
                      <PageSubtitle style={{ 
                        fontSize: window.innerWidth <= 576 ? '0.9rem' : '1rem', 
                        color: '#f3f4f6', 
                        marginBottom: window.innerWidth <= 576 ? '1.25rem' : '1.5rem' 
                      }}>
                        Mật khẩu của bạn đã được cập nhật thành công.
                        <br />
                        Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới.
                      </PageSubtitle>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/login')}
                        style={{ 
                          width: '100%', 
                          padding: window.innerWidth <= 576 ? '0.65rem' : '0.75rem', 
                          fontWeight: '500' 
                        }}
                      >
                        Đăng nhập ngay
                      </Button>
                      <CountdownText>
                        Tự động chuyển hướng sau {countdown} giây...
                      </CountdownText>
                    </SuccessContainer>
                  )}
                  
                  {status === 'error' && !token && (
                    <SuccessContainer>
                      <IconWrapper error>
                        <FaTimesCircle />
                      </IconWrapper>
                      <PageTitle>Liên kết không hợp lệ</PageTitle>
                      <PageSubtitle style={{ 
                        fontSize: window.innerWidth <= 576 ? '0.9rem' : '1rem', 
                        color: '#f3f4f6', 
                        marginBottom: window.innerWidth <= 576 ? '1.25rem' : '1.5rem' 
                      }}>
                        Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                        <br />
                        Vui lòng yêu cầu đặt lại mật khẩu mới.
                      </PageSubtitle>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/forgot-password')}
                        style={{ 
                          width: '100%', 
                          padding: window.innerWidth <= 576 ? '0.65rem' : '0.75rem', 
                          fontWeight: '500' 
                        }}
                      >
                        Yêu cầu đặt lại mật khẩu
                      </Button>
                    </SuccessContainer>
                  )}
                  
                  {(status === 'initial' || (status === 'error' && token)) && (
                    <Form noValidate onSubmit={handleSubmit}>
                      <InputGroup>
                        <InputIcon>
                          <FaLock />
                        </InputIcon>
                        <FormControl
                          type={showPassword ? "text" : "password"}
                          placeholder="Mật khẩu mới"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <TogglePasswordIcon onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </TogglePasswordIcon>
                      </InputGroup>
                      
                      {/* Enhanced Password requirements list */}
                      {newPassword && (
                        <RequirementsList>
                          <li className={passwordRequirements.length ? 'valid' : 'invalid'}>
                            Ít nhất 8 ký tự
                          </li>
                        </RequirementsList>
                      )}
                      
                      <InputGroup>
                        <InputIcon>
                          <FaLock />
                        </InputIcon>
                        <FormControl
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Xác nhận mật khẩu mới"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <TogglePasswordIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </TogglePasswordIcon>
                      </InputGroup>
                      
                      {/* Password match indicator */}
                      {confirmPassword && (
                        <div style={{ 
                          marginTop: '-1rem', 
                          marginBottom: '1rem', 
                          fontSize: '0.85rem',
                          color: newPassword === confirmPassword ? '#10B981' : '#EF4444' 
                        }}>
                          {newPassword === confirmPassword ? (
                            <span><FaCheck style={{marginRight: '5px'}} /> Mật khẩu khớp</span>
                          ) : (
                            <span><FaTimesCircle style={{marginRight: '5px'}} /> Mật khẩu không khớp</span>
                          )}
                        </div>
                      )}
                      
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || 
                          !newPassword || 
                          !confirmPassword || 
                          newPassword !== confirmPassword || 
                          newPassword.length < 8}
                        style={{ 
                          width: '100%', 
                          padding: window.innerWidth <= 576 ? '0.65rem' : '0.75rem', 
                          fontWeight: '500', 
                          marginTop: '1rem',
                          opacity: isSubmitting || 
                            !newPassword || 
                            !confirmPassword || 
                            newPassword !== confirmPassword || 
                            newPassword.length < 8 ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                      </Button>
                      
                      <LoginLink>
                        Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
                      </LoginLink>
                    </Form>
                  )}
                </CardBody>
              </ResetPasswordCard>
            </Col>
          </Row>
        </Container>
      </ContentContainer>
    </PageContainer>
  );
};

export default ResetPasswordPage;