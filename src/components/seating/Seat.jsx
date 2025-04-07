import React from 'react';
import styled, { css } from 'styled-components';

const getSeatTypeStyles = (type) => {
  switch (type) {
    case 'VIP':
      return css`
        background-color: #8b5cf6;
      `;
    case 'COUPLE':
      return css`
        background-color: #f59e0b;
        width: 55px;
      `;
    case 'SWEETBOX':
      return css`
        background-color: #ec4899;
        width: 55px;
      `;
    case 'DELUXE':
      return css`
        background-color: #10b981;
      `;
    case 'REGULAR':
    default:
      return css`
        background-color: #9ca3af;
      `;
  }
};

const SeatContainer = styled.div`
  height: 25px;
  width: 25px;
  border-radius: 4px;
  margin: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isBooked ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-size: 0.75rem;
  color: white;
  user-select: none;
  
  ${props => getSeatTypeStyles(props.seatType)}
  
  ${props => props.isBooked && css`
    background-color: #2A2D3E;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #6b7280;
  `}
  
  ${props => props.isSelected && css`
    background-color: #F9376E !important;
    box-shadow: 0 0 8px rgba(249, 55, 110, 0.8);
    transform: scale(1.1);
  `}
  
  &:hover {
    ${props => !props.isBooked && css`
      transform: ${props.isSelected ? 'scale(1.1)' : 'scale(1.05)'};
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
    `}
  }
`;

const Seat = ({ seat, isSelected, onClick }) => {
  const handleClick = () => {
    if (!seat.isBooked && onClick) {
      onClick(seat);
    }
  };

  return (
    <SeatContainer
      seatType={seat.type}
      isBooked={seat.isBooked}
      isSelected={isSelected}
      onClick={handleClick}
      title={`${seat.rowLabel}${seat.seatNumber} - ${seat.price?.toLocaleString() || ''} VND`}
    >
      {seat.seatNumber}
    </SeatContainer>
  );
};

export default Seat;