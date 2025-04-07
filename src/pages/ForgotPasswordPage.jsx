import React, { useState } from 'react';
import { Container, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEnvelope, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { requestPasswordReset } from '../api/services/authService';
import Button from '../components/common/Button';

// Sử dụng các styled components tương tự như LoginPage
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

const ForgotPasswordCard = styled(Card)`
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  
  const navigate = useNavigate();
  
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ');
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
      
      // Log yêu cầu để debug
      console.log('Requesting password reset for email:', email);
      
      // Gọi API quên mật khẩu
      await requestPasswordReset(email);
      
      // Lưu email để hiển thị sau khi thành công
      setSentEmail(email);
      setIsSuccess(true);
      
    } catch (err) {
      console.error('Password reset request error:', err);
      
      // Hiển thị lỗi thân thiện với người dùng
      if (err.message && err.message.includes('Error interno')) {
        setError('Hệ thống đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
      } else {
        setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    navigate('/login');
  };
  
  return (
    <PageContainer>
      <ContentContainer>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <ForgotPasswordCard>
                <CardHeader>
                  <div className="d-flex align-items-center mb-3">
                    <BackButton 
                      variant="text" 
                      onClick={handleBackToLogin}
                    >
                      <FaArrowLeft size={18} />
                    </BackButton>
                    <div>
                      <PageTitle>Quên mật khẩu</PageTitle>
                      <PageSubtitle>Nhập email của bạn để lấy lại mật khẩu</PageSubtitle>
                    </div>
                  </div>
                </CardHeader>
                
                <CardBody>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}
                  
                  {isSuccess ? (
                    <SuccessContainer>
                      <SuccessIcon>
                        <FaCheck />
                      </SuccessIcon>
                      <PageTitle>Kiểm tra email của bạn</PageTitle>
                      <PageSubtitle style={{ fontSize: '1rem', color: '#f3f4f6', marginBottom: '1.5rem' }}>
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                        <br />
                        <strong>{sentEmail}</strong>
                        <br /><br />
                        Vui lòng kiểm tra hộp thư đến (và thư mục spam) của bạn để tìm email với liên kết đặt lại mật khẩu.
                      </PageSubtitle>
                      <Button
                        variant="primary"
                        onClick={handleBackToLogin}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
                      >
                        Trở về trang đăng nhập
                      </Button>
                    </SuccessContainer>
                  ) : (
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                      <InputGroup>
                        <InputIcon>
                          <FaEnvelope />
                        </InputIcon>
                        <FormControl
                          type="email"
                          placeholder="Nhập email đã đăng ký"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </InputGroup>
                      
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
                      >
                        {isLoading ? 'Đang xử lý...' : 'Gửi yêu cầu đặt lại mật khẩu'}
                      </Button>
                      
                      <LoginLink>
                        Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
                      </LoginLink>
                    </Form>
                  )}
                </CardBody>
              </ForgotPasswordCard>
            </Col>
          </Row>
        </Container>
      </ContentContainer>
    </PageContainer>
  );
};

export default ForgotPasswordPage;