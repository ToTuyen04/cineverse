import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  font-size: 0.9rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  color: #f8fafc;
  background-color: #2a2d3e;
  border: 1px solid #3f425a;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #F9376E;
    box-shadow: 0 0 0 2px rgba(249, 55, 110, 0.2);
  }
  
  &::placeholder {
    color: #64748b;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const Input = ({ 
  label, 
  id, 
  error, 
  ...props 
}) => {
  return (
    <StyledInput>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <InputField id={id} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </StyledInput>
  );
};

export default Input;