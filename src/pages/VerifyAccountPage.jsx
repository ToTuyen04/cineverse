import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaSignInAlt } from 'react-icons/fa';
import Button from '../components/common/Button';

// Import service xác thực
import { verifyAccount } from '../api/services/authService';

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

// Cập nhật VerifyCard để responsive hơn
const VerifyCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-width: 550px;
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
  }
`;

// Cập nhật CardBody để responsive hơn
const CardBody = styled(Card.Body)`
  padding: 1.5rem;
  text-align: center;
  
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
  text-align: center;
  
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
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

// Cập nhật StatusIcon để responsive hơn
const StatusIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  
  &.success {
    color: #4caf50;
  }
  
  &.error {
    color: #f44336;
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

// Thêm keyframes cho animation
const keyframesStyle = document.createElement('style');
keyframesStyle.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(keyframesStyle);

const VerifyAccountPage = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Logic code giữ nguyên không thay đổi
  
  // Thêm biến helper để kiểm tra kích thước màn hình
  const isMobile = window.innerWidth <= 576;
  const isTablet = window.innerWidth <= 768 && window.innerWidth > 576;

  useEffect(() => {
    const verifyUserAccount = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Liên kết có thể không hợp lệ hoặc đã hết hạn.');
        return;
      }

      try {
        await verifyAccount(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Xác thực tài khoản thất bại. Liên kết có thể không hợp lệ hoặc đã hết hạn.');
      }
    };

    verifyUserAccount();
  }, [token]);

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        message: status === 'success' 
          ? 'Tài khoản đã được xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.' 
          : undefined,
        type: 'success'
      } 
    });
  };

  return (
    <PageContainer>
      <ContentContainer>
        <VerifyCard>
          <CardHeader>
            <PageTitle>Xác thực tài khoản</PageTitle>
            <PageSubtitle>
              {status === 'loading' && 'Đang xác thực tài khoản của bạn...'}
              {status === 'success' && 'Tài khoản đã được xác thực thành công!'}
              {status === 'error' && 'Xác thực tài khoản thất bại'}
            </PageSubtitle>
          </CardHeader>

          <CardBody>
            {status === 'loading' && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                margin: isMobile ? '1.5rem 0' : isTablet ? '1.75rem 0' : '2rem 0' 
              }}>
                <div style={{ 
                  width: isMobile ? '32px' : isTablet ? '36px' : '40px', 
                  height: isMobile ? '32px' : isTablet ? '36px' : '40px', 
                  border: `${isMobile ? '3px' : '4px'} solid #e71a0f`, 
                  borderRadius: '50%', 
                  borderTopColor: 'transparent', 
                  animation: 'spin 1s linear infinite' 
                }} />
              </div>
            )}

            {status === 'success' && (
              <>
                <StatusIcon className="success">
                  <FaCheckCircle />
                </StatusIcon>
                <PageSubtitle style={{
                  fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                  marginBottom: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem',
                  color: '#f3f4f6'
                }}>
                  Chúc mừng! Tài khoản của bạn đã được xác thực thành công.
                  Bạn có thể đăng nhập ngay bây giờ để trải nghiệm dịch vụ của chúng tôi.
                </PageSubtitle>
              </>
            )}

            {status === 'error' && (
              <>
                <StatusIcon className="error">
                  <FaTimesCircle />
                </StatusIcon>
                <Alert 
                  variant="danger" 
                  className={isMobile ? 'mb-3' : 'mb-4'}
                  style={{
                    fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '0.95rem',
                    padding: isMobile ? '0.65rem 0.75rem' : isTablet ? '0.7rem 0.9rem' : '0.75rem 1rem'
                  }}
                >
                  {errorMessage}
                </Alert>
                <PageSubtitle style={{
                  fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem',
                  marginBottom: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem',
                  color: '#f3f4f6'
                }}>
                  Vui lòng liên hệ với chúng tôi để được hỗ trợ.
                </PageSubtitle>
              </>
            )}

            <Button
              variant="primary"
              onClick={handleGoToLogin}
              style={{ 
                width: '100%', 
                padding: isMobile ? '0.65rem' : isTablet ? '0.7rem' : '0.75rem', 
                fontWeight: '500',
                fontSize: isMobile ? '0.9rem' : isTablet ? '0.95rem' : '1rem'
              }}
            >
              <FaSignInAlt style={{ 
                marginRight: isMobile ? '0.3rem' : isTablet ? '0.4rem' : '0.5rem',
                fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '1rem'
              }} />
              {status === 'success' ? 'Đăng nhập ngay' : 'Quay lại đăng nhập'}
            </Button>
          </CardBody>
        </VerifyCard>
      </ContentContainer>
    </PageContainer>
  );
};

export default VerifyAccountPage;