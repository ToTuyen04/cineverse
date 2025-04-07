import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaCheck, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { resetPassword } from '../api/services/authService';
import Button from '../components/common/Button';

// Sử dụng các styled components từ LoginPage và ForgotPasswordPage
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 2rem;
`;

const ResetPasswordCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-width: 450px;
  width: 100%;
`;

const CardHeader = styled(Card.Header)`
  background: transparent;
  border-bottom: 1px solid #3f425a;
  padding: 1.5rem 1.5rem 1rem;
`;

const CardBody = styled(Card.Body)`
  padding: 1.5rem;
`;

const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 0.9rem;
`;

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
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  z-index: 2;
`;

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
`;

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
`;

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
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 1rem 0;
`;

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
`;

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
`;

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
`;

const CountdownText = styled.div`
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #6B7280;
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
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false
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
        
        // Email không còn cần thiết, nhưng vẫn giữ code để tương thích
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
    // Kiểm tra độ dài mật khẩu
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
      
      
      // Gọi API đặt lại mật khẩu với format mới
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
      setError(error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}
                  
                  {status === 'loading' && (
                    <SuccessContainer>
                      <IconWrapper>
                        <FaSpinner className="spinner" />
                      </IconWrapper>
                      <PageTitle>Đang xử lý...</PageTitle>
                      <PageSubtitle style={{ fontSize: '1rem', color: '#f3f4f6' }}>
                        Vui lòng đợi trong giây lát.
                      </PageSubtitle>
                    </SuccessContainer>
                  )}
                  
                  {status === 'success' && (
                    <SuccessContainer>
                      <IconWrapper success>
                        <FaCheck />
                      </IconWrapper>
                      <PageTitle success>Đặt lại mật khẩu thành công!</PageTitle>
                      <PageSubtitle style={{ fontSize: '1rem', color: '#f3f4f6', marginBottom: '1.5rem' }}>
                        Mật khẩu của bạn đã được cập nhật thành công.
                        <br />
                        Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới.
                      </PageSubtitle>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/login')}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
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
                      <PageTitle error>Liên kết không hợp lệ</PageTitle>
                      <PageSubtitle style={{ fontSize: '1rem', color: '#f3f4f6', marginBottom: '1.5rem' }}>
                        Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                        <br />
                        Vui lòng yêu cầu đặt lại mật khẩu mới.
                      </PageSubtitle>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/forgot-password')}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
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
                      
                      {/* Password requirements list */}
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
                      
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: '500', marginTop: '1rem' }}
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