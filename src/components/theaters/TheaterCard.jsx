import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import styled from 'styled-components';
import { FaMapMarkerAlt } from 'react-icons/fa';

const StyledCard = styled(Card)`
  background-color: #2A2D3E;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TheaterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TheaterInfo = styled.div`
  padding: 1.5rem;
`;

const TheaterName = styled.h5`
  color: #f3f4f6;
  margin-bottom: 0.5rem;
`;

const TheaterLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  
  svg {
    color: #F9376E;
  }
`;

const TheaterFacilities = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const ShowtimesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Showtime = styled.span`
  background-color: rgba(255, 255, 255, 0.1);
  color: #f3f4f6;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
`;

const TheaterCard = ({ theater }) => {
  return (
    <StyledCard>
      <Row className="g-0">
        <Col md={4}>
          <TheaterImage src={theater.imageUrl} alt={theater.name} />
        </Col>
        <Col md={8}>
          <TheaterInfo>
            <TheaterName>{theater.name}</TheaterName>
            <TheaterLocation>
              <FaMapMarkerAlt />
              <span>{theater.location}</span>
            </TheaterLocation>
            
            <TheaterFacilities>
              {theater.facilities.join(' • ')}
            </TheaterFacilities>
            
            <ShowtimesContainer>
              {theater.showtimes.map((time, index) => (
                <Showtime key={index}>{time}</Showtime>
              ))}
            </ShowtimesContainer>
          </TheaterInfo>
        </Col>
      </Row>
    </StyledCard>
  );
};

export default TheaterCard;