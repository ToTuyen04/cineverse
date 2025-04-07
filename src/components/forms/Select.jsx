import React from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const SelectContainer = styled.div`
  margin-bottom: 1rem;
  width: 100%;
  position: relative;
`;

const SelectLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  font-size: 0.9rem;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  color: #f8fafc;
  background-color: #2a2d3e;
  border: 1px solid #3f425a;
  border-radius: 0.375rem;
  font-size: 1rem;
  appearance: none;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #F9376E;
    box-shadow: 0 0 0 2px rgba(249, 55, 110, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 1rem;
  top: calc(50% + 0.5rem);
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const Select = ({ 
  label, 
  id, 
  options = [], 
  error, 
  ...props 
}) => {
  return (
    <SelectContainer>
      {label && <SelectLabel htmlFor={id}>{label}</SelectLabel>}
      <StyledSelect id={id} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      <IconWrapper>
        <FaChevronDown size={14} />
      </IconWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </SelectContainer>
  );
};

export default Select;