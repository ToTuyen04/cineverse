import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaSignInAlt } from 'react-icons/fa';
import Button from '../components/common/Button';

// Import service xác thực
import { verifyAccount } from '../api/services/authService';

// Tái sử dụng styled components từ RegisterPage
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

const VerifyCard = styled(Card)`
  background-color: #2a2d3e;
  border: none;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-width: 550px;
  width: 100%;
`;

const CardHeader = styled(Card.Header)`
  background: transparent;
  border-bottom: 1px solid #3f425a;
  padding: 1.5rem 1.5rem 1rem;
`;

const CardBody = styled(Card.Body)`
  padding: 1.5rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  color: #f3f4f6;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const PageSubtitle = styled.p`
  color: #9ca3af;
  font-size: 0.9rem;
  text-align: center;
`;

const StatusIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  
  &.success {
    color: #4caf50;
  }
  
  &.error {
    color: #f44336;
  }
`;

const VerifyAccountPage = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                      <div style={{ width: '40px', height: '40px', border: '4px solid #e71a0f', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}

                  {status === 'success' && (
                    <>
                      <StatusIcon className="success">
                        <FaCheckCircle />
                      </StatusIcon>
                      <PageSubtitle style={{
                        fontSize: '1rem',
                        marginBottom: '1.5rem',
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
                      <Alert variant="danger" className="mb-4">
                        {errorMessage}
                      </Alert>
                      <PageSubtitle style={{
                        fontSize: '1rem',
                        marginBottom: '1.5rem',
                        color: '#f3f4f6'
                      }}>
                        Vui lòng liên hệ với chúng tôi để được hỗ trợ.
                      </PageSubtitle>
                    </>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleGoToLogin}
                    style={{ width: '100%', padding: '0.75rem', fontWeight: '500' }}
                  >
                    <FaSignInAlt style={{ marginRight: '0.5rem' }} />
                    {status === 'success' ? 'Đăng nhập ngay' : 'Quay lại đăng nhập'}
                  </Button>
                </CardBody>
              </VerifyCard>
      </ContentContainer>
    </PageContainer>
  );
};

export default VerifyAccountPage;