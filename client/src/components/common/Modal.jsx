import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${props => props.$show ? 'flex' : 'none'};
  justify-content: center;
  align-items: ${props => props.$fullPage ? 'flex-start' : 'center'};
  z-index: 1050;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: #2A2D3E;
  border-radius: 8px;
  overflow: hidden;
  width: ${props => props.$width || '500px'};
  max-width: 95%;
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: ${props => props.$show ? 'modalFadeIn 0.3s ease' : 'none'};
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    margin: 0;
    color: #f3f4f6;
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: #F9376E;
  }
`;

const ModalBody = styled.div`
  padding: 1rem;
  overflow-y: auto;
  color: #f3f4f6;
`;

const Modal = ({ show, title, children, onClose, fullPage = false, ...props }) => {
  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (show) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [show, onClose]);

  // Prevent click inside modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <ModalOverlay $show={show} $fullPage={fullPage} onClick={onClose}>
      <ModalContent $show={show} $width={props.width} onClick={handleContentClick}>
        <ModalHeader>
          <h3>{title}</h3>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;