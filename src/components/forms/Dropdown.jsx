import React from 'react';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const DropdownContainer = styled.div`
  margin-bottom: 1rem;
  width: 100%;
  position: relative;
`;

const DropdownLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  font-size: 0.9rem;
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  color: #f8fafc;
  background-color: #2a2d3e;
  border: 1px solid #3f425a;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none; /* Removes default browser styling */
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #F9376E;
    box-shadow: 0 0 0 2px rgba(249, 55, 110, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Styling for options */
  option {
    background-color: #2a2d3e;
    color: #f8fafc;
    padding: 0.5rem;
  }
`;

const ChevronIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
  transition: transform 0.2s ease;
  
  ${SelectField}:focus + & {
    transform: translateY(-50%) rotate(180deg);
    color: #F9376E;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const Dropdown = ({ 
  label, 
  id, 
  options = [], 
  placeholder = "Select an option", 
  error,
  ...props 
}) => {
  return (
    <DropdownContainer>
      {label && <DropdownLabel htmlFor={id}>{label}</DropdownLabel>}
      <SelectWrapper>
        <SelectField id={id} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <ChevronIcon>
          <FaChevronDown size={14} />
        </ChevronIcon>
      </SelectWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </DropdownContainer>
  );
};

export default Dropdown;