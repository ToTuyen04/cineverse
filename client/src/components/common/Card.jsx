import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background-color: #1e2132;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: ${props => props.height || '180px'};
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

const CardTitle = styled.h3`
  color: #f3f4f6;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const CardText = styled.p`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const CardFooter = styled.div`
  padding: 0.75rem 1.25rem;
  background-color: #252837;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const Card = ({ 
  image, 
  imageHeight,
  title, 
  children, 
  footer 
}) => {
  return (
    <CardContainer>
      {image && <CardImage src={image} height={imageHeight} />}
      <CardBody>
        {title && <CardTitle>{title}</CardTitle>}
        {typeof children === 'string' ? <CardText>{children}</CardText> : children}
      </CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </CardContainer>
  );
};

export default Card;