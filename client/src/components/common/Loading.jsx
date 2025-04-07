import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.fullPage ? '2rem' : '1rem'};
  height: ${props => props.fullPage ? '80vh' : 'auto'};
`;

const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid rgba(249, 55, 110, 0.3);
  border-top-color: #F9376E;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: #9ca3af;
  margin-top: 1rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Loading = ({ fullPage = false, size, text = "Loading..." }) => {
  return (
    <LoadingContainer fullPage={fullPage}>
      <Spinner size={size} />
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

export default Loading;