import React from 'react';
import styled, { css } from 'styled-components';

const ButtonVariants = {
  primary: css`
    background: linear-gradient(to right,rgb(190, 77, 255),rgb(147, 16, 235));
    color: #ffffff;
    border: none;
    
    &:hover {
      background: linear-gradient(to right,rgb(147, 16, 235),rgb(190, 77, 255));
    }
    
    &:active {
      background: linear-gradient(to right,rgb(153, 78, 218),rgb(115, 31, 241));
    }
  `,
  secondary: css`
    background-color: #3f425a;
    color: #ffffff;
    border: none;
    
    &:hover {
      background-color: #4b4f6c;
    }
    
    &:active {
      background-color: #333548;
    }
  `,
  outline: css`
    background: transparent;
    color: #F9376E;
    border: 2px solid #F9376E;
    
    &:hover {
      background-color: rgba(249, 55, 110, 0.1);
    }
    
    &:active {
      background-color: rgba(249, 55, 110, 0.2);
    }
  `,
  ghost: css`
    background: transparent;
    color: #e2e8f0;
    border: none;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 0.15);
    }
  `
};

const ButtonSizes = {
  sm: css`
    padding: 0.4rem 0.8rem;
    font-size: 0.875rem;
  `,
  md: css`
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
  `,
  lg: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  `
};

const StyledButton = styled.button`
  border-radius: 0.375rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  ${props => ButtonVariants[props.$variant || 'primary']}
  ${props => ButtonSizes[props.$size || 'md']}
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .icon-left {
    margin-right: 0.5rem;
  }
  
  .icon-right {
    margin-left: 0.5rem;
  }
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  leftIcon,
  rightIcon,
  ...props 
}) => {
  return (
    <StyledButton 
      $variant={variant} 
      $size={size} 
      $fullWidth={fullWidth} 
      {...props}
    >
      {leftIcon && <span className="icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="icon-right">{rightIcon}</span>}
    </StyledButton>
  );
};

export default Button;