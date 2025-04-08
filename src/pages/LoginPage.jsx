import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaLock, FaPhone, FaArrowLeft } from 'react-icons/fa';
import { loginWithEmail, loginWithPhone, checkIsLoggedIn } from '../api/services/authService';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

// Styled components
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
  
  @media (max-width: 576px) {
    padding: 0.5rem 0.5rem 1.5rem;
  }
`;

const LoginCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-width: 450px;
  width: 100%;
  
  @media (max-width: 576px) {
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
`;

const CardHeader = styled(Card.Header)`
  background: transparent;
  border-bottom: 1px solid #3f425a;
  padding: 1.5rem 1.5rem 1rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem 1.25rem 0.8rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem 1rem 0.7rem;
  }
`;

const CardBody = styled(Card.Body)`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 576px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
  
  @media (max-width: 576px) {
    font-size: 1.4rem;
    margin-bottom: 0.4rem;
  }
`;

const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 0.9rem;
  
  @media (max-width: 576px) {
    font-size: 0.85rem;
  }
`;

const FormLabel = styled(Form.Label)`
  color: #f3f4f6;
  font-weight: 500;
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
  
  @media (max-width: 576px) {
    padding: 0.65rem 1rem 0.65rem 2.3rem;
    font-size: 0.85rem;
  }
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 1.25rem;
  
  @media (max-width: 576px) {
    margin-bottom: 1rem;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #F9376E;
  z-index: 2;
  
  @media (max-width: 576px) {
    left: 0.7rem;
    font-size: 0.9rem;
  }
`;

const ForgotPassword = styled(Link)`
  color: #F9376E;
  font-size: 0.85rem;
  text-decoration: none;
  display: inline-block;
  margin-top: 0.5rem;
  
  &:hover {
    text-decoration: underline;
    color: #FF4D4D;
  }
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
    margin-top: 0.4rem;
  }
`;

const LoginDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #3f425a;
  }
  
  span {
    margin: 0 0.5rem;
    color: #9ca3af;
    font-size: 0.9rem;
  }
  
  @media (max-width: 576px) {
    margin: 1.25rem 0;
    
    span {
      font-size: 0.85rem;
    }
  }
`;

const SocialButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #3f425a;
  font-weight: 500;
  
  svg {
    margin-right: 0.5rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.65rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
`;

const RegisterText = styled.div`
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
  
  @media (max-width: 576px) {
    margin-top: 1.25rem;
    font-size: 0.85rem;
  }
`;

const TabButtons = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #3f425a;
  
  @media (max-width: 576px) {
    margin-bottom: 1.25rem;
  }
`;

const TabButton = styled.button`
  flex: 1;
  background: transparent;
  color: ${props => props.active ? '#f3f4f6' : '#9ca3af'};
  border: none;
  padding: 0.75rem;
  font-weight: ${props => props.active ? '600' : '400'};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${props => props.active ? '#F9376E' : 'transparent'};
  }
  
  &:hover {
    color: #f3f4f6;
  }
  
  @media (max-width: 576px) {
    padding: 0.65rem;
    font-size: 0.9rem;
    
    svg {
      font-size: 0.9rem;
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
  
  @media (max-width: 576px) {
    padding: 0.5rem;
    margin-right: 0.75rem;
    
    svg {
      font-size: 16px;
    }
  }
`;

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  // Kiểm tra đã đăng nhập chưa khi vừa vào trang
  useEffect(() => {
    if (checkIsLoggedIn()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  
  const handleTabChange = (method) => {
    setLoginMethod(method);
    setError(null);
  };
  
  const validateForm = () => {
    if (loginMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Vui lòng nhập email hợp lệ');
        return false;
      }
    } else {
      const phoneRegex = /^(0|84|\+84)([0-9]{9})$/;
      if (!phoneRegex.test(phone)) {
        setError('Vui lòng nhập số điện thoại hợp lệ (ví dụ: 0912345678)');
        return false;
      }
    }
    
    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Gọi API đăng nhập thật
      let userData;
      if (loginMethod === 'email') {
        userData = await loginWithEmail(email, password);
      } else {
        userData = await loginWithPhone(phone, password);
      }

      // Cập nhật context với thông tin user
      login(userData);

      // Kiểm tra nếu user là staff thì chuyển đến trang DASHBOARD
      if (userData.isStaff) {
        console.log('Staff user logged in:', userData);
        navigate('/admin', { replace: true });
        return;
      }

      // Đăng nhập thành công, chuyển về trang chủ hoặc trang yêu cầu trước đó
      if (from === '/login') {
        // Nếu người dùng truy cập trực tiếp vào trang đăng nhập, chuyển về trang chủ
        console.log('Thông tin logger: ', userData);
        navigate('/');
      } else {
        // Nếu người dùng bị chuyển hướng đến trang đăng nhập từ trang khác, quay lại trang đó
        navigate(from, { replace: true });
      }
      
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  return (
    <PageContainer>
      <ContentContainer>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <LoginCard>
                <CardHeader>
                  <div className="d-flex align-items-center mb-3">
                    <BackButton 
                      variant="text" 
                      onClick={handleBackToHome}
                    >
                      <FaArrowLeft size={18} />
                    </BackButton>
                    <div>
                      <PageTitle>Đăng nhập</PageTitle>
                      <PageSubtitle>Chào mừng bạn trở lại CineVerse</PageSubtitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardBody>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}
                  
                  <TabButtons>
                    <TabButton 
                      active={loginMethod === 'email'} 
                      onClick={() => handleTabChange('email')}
                    >
                      <FaEnvelope style={{ marginRight: '0.5rem' }} /> Email
                    </TabButton>
                    <TabButton 
                      active={loginMethod === 'phone'} 
                      onClick={() => handleTabChange('phone')}
                    >
                      <FaPhone style={{ marginRight: '0.5rem' }} /> Số điện thoại
                    </TabButton>
                  </TabButtons>
                  
                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    {loginMethod === 'email' ? (
                      <InputGroup>
                        <InputIcon>
                          <FaEnvelope />
                        </InputIcon>
                        <FormControl
                          type="email"
                          placeholder="Nhập email của bạn"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </InputGroup>
                    ) : (
                      <InputGroup>
                        <InputIcon>
                          <FaPhone />
                        </InputIcon>
                        <FormControl
                          type="tel"
                          placeholder="Nhập số điện thoại của bạn"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </InputGroup>
                    )}
                    
                    <InputGroup>
                      <InputIcon>
                        <FaLock />
                      </InputIcon>
                      <FormControl
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </InputGroup>
                    
                    <div className="d-flex justify-content-end mb-3">
                      <ForgotPassword to="/forgot-password">Quên mật khẩu?</ForgotPassword>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
                    >
                      {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                    
                    <RegisterText>
                      Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </RegisterText>
                  </Form>
                </CardBody>
              </LoginCard>
            </Col>
          </Row>
        </Container>
      </ContentContainer>
    </PageContainer>
  );
};

export default LoginPage;