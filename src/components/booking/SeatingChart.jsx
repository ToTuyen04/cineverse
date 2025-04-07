import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getSeatsByShowtime } from '../../api/services/seatService';

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 2rem;
`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const RowLabel = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #9ca3af;
`;

const Seat = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  color: ${props => props.isSelected ? '#fff' : props.isVIP ? '#fff' : '#f3f4f6'};
  background-color: ${props => 
    props.isSelected ? '#F9376E' : 
    props.isReserved ? '#64748b' : 
    props.isVIP ? '#9333ea' : 
    '#3f425a'
  };
  transition: all 0.2s ease;
  font-size: 0.8rem;
  
  &:hover {
    transform: ${props => props.isAvailable ? 'scale(1.1)' : 'none'};
    box-shadow: ${props => props.isAvailable ? '0 0 5px rgba(249, 55, 110, 0.5)' : 'none'};
  }
`;

const SeatingChart = ({ showtimeId, selectedSeats, onSeatSelect }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const seatData = await getSeatsByShowtime(showtimeId);
        setSeats(seatData);
      } catch (error) {
        console.error('Error fetching seats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeats();
  }, [showtimeId]);
  
  // Group seats by row
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});
  
  // Sort rows alphabetically
  const sortedRows = Object.keys(groupedSeats).sort();
  
  const handleSeatClick = (seat) => {
    if (!seat.isAvailable) return;
    onSeatSelect(seat);
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading seats...</div>;
  }
  
  return (
    <ChartContainer>
      {sortedRows.map(row => (
        <Row key={row}>
          <RowLabel>{row}</RowLabel>
          {groupedSeats[row].map(seat => {
            const isSelected = selectedSeats.some(s => s.id === seat.id);
            
            return (
              <Seat 
                key={seat.id}
                isAvailable={seat.isAvailable}
                isSelected={isSelected}
                isReserved={!seat.isAvailable}
                isVIP={seat.isVIP}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.number}
              </Seat>
            );
          })}
        </Row>
      ))}
    </ChartContainer>
  );
};

export default SeatingChart;