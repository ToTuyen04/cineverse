import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmEmail } from '../api/services/authService';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { Container, Row, Col } from 'react-bootstrap';

const PageContainer = styled.div`
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1A1A2E;
  padding: 2rem 1rem;
`;

const ConfirmCard = styled.div`
  background-color: #242538;
  border-radius: 10px;
  padding: 2.5rem;
  width: 100%;
  max-width: 550px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${props => props.success ? '#10B981' : props.error ? '#EF4444' : '#F9376E'};
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #9ca3af;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.75rem;
  background-color: #F9376E;
  color: white;
  font-weight: 600;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e71a5a;
    transform: translateY(-2px);
    color: white;
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

function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');  // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Đang xác thực email của bạn...');
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn hoặc liên hệ hỗ trợ.');
      return;
    }
    
    const verifyEmail = async () => {
      try {
        // Gọi API xác thực email
        const result = await confirmEmail(token);
        
        // Xử lý kết quả thành công
        setStatus('success');
        setMessage(result.message || 'Email của bạn đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.');
        
        // Bắt đầu đếm ngược để chuyển hướng đến trang đăng nhập
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
        // Xử lý lỗi
        setStatus('error');
        setMessage(error.message || 'Có lỗi xảy ra khi xác thực email. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      }
    };
    
    verifyEmail();
  }, [searchParams, navigate]);
  
  return (
    <PageContainer>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <ConfirmCard>
              {status === 'processing' && (
                <>
                  <IconWrapper>
                    <FaSpinner className="spinner" />
                  </IconWrapper>
                  <Title>Đang xác thực email</Title>
                  <Message>{message}</Message>
                </>
              )}
              
              {status === 'success' && (
                <>
                  <IconWrapper success>
                    <FaCheckCircle />
                  </IconWrapper>
                  <Title success>Xác thực thành công!</Title>
                  <Message>{message}</Message>
                  <Button to="/login">Đăng nhập ngay</Button>
                  <CountdownText>
                    Tự động chuyển hướng đến trang đăng nhập sau {countdown} giây...
                  </CountdownText>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <IconWrapper error>
                    <FaTimesCircle />
                  </IconWrapper>
                  <Title error>Xác thực thất bại</Title>
                  <Message>{message}</Message>
                  <Button to="/login">Về trang đăng nhập</Button>
                </>
              )}
            </ConfirmCard>
          </Col>
        </Row>
      </Container>
    </PageContainer>
  );
}

export default ConfirmEmailPage;