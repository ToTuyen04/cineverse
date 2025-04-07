import React from 'react';
import styled from 'styled-components';

const StyledTitle = styled.h1`
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #f3f4f6;
`;

const PageTitle = ({ children, className }) => {
  return <StyledTitle className={className}>{children}</StyledTitle>;
};

export default PageTitle;