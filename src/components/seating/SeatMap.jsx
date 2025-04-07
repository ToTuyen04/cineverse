import React from 'react';
import styled from 'styled-components';

const SeatMapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow-x: auto;
  padding: 1rem;
`;

const Screen = styled.div`
  width: 80%;
  max-width: 500px;
  height: 20px;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  margin-bottom: 2rem;
  border-radius: 5px 5px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #1a1c26;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  position: relative;
  
  &::after {
    content: 'SCREEN';
    position: absolute;
  }
  
  &::before {
    content: '';
    position: absolute;
    width: 120%;
    height: 30px;
    bottom: -30px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
    z-index: -1;
  }
`;

const SeatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: min-content;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RowLabel = styled.div`
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #9ca3af;
  border-radius: 4px;
  margin-right: 0.5rem;
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
`;

const LegendSeat = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

const Summary = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #252837;
  border-radius: 0.5rem;
`;

const SeatItem = styled.div`
  background-color: ${props => 
    props.$isSelected ? '#F9376E' : 
    props.$isBooked ? '#2A2D3E' : 
    '#9ca3af'
  };
`;

const SeatComponent = ({ seat, isSelected, onClick }) => (
  <SeatItem 
    $isSelected={isSelected} 
    $isBooked={seat.isBooked}
    $seatType={seat.type}
    onClick={!seat.isBooked ? onClick : undefined}
  >
    {seat.seatNumber}
  </SeatItem>
);

const SeatMap = ({
  seats,
  selectedSeats,
  onSeatSelect
}) => {
  const seatsByRow = seats.reduce((rows, seat) => {
    if (!rows[seat.rowLabel]) {
      rows[seat.rowLabel] = [];
    }
    rows[seat.rowLabel].push(seat);
    return rows;
  }, {});

  const rowLabels = Object.keys(seatsByRow).sort();
  
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  
  return (
    <SeatMapContainer>
      <Screen />
      
      <Legend>
        <LegendItem>
          <LegendSeat color="#F9376E" />
          <span>Selected</span>
        </LegendItem>
        <LegendItem>
          <LegendSeat color="#9ca3af" />
          <span>Available</span>
        </LegendItem>
        <LegendItem>
          <LegendSeat color="#2A2D3E" />
          <span>Occupied</span>
        </LegendItem>
      </Legend>
      
      <SeatsContainer>
        {rowLabels.map(rowLabel => (
          <Row key={rowLabel}>
            <RowLabel>{rowLabel}</RowLabel>
            {seatsByRow[rowLabel].map(seat => (
              <SeatComponent
                key={seat.id}
                seat={seat}
                isSelected={selectedSeats.some(s => s.id === seat.id)}
                onClick={() => onSeatSelect(seat)}
              />
            ))}
            <RowLabel>{rowLabel}</RowLabel>
          </Row>
        ))}
      </SeatsContainer>
      
      <Summary>
        <h4 className="mb-3">Selected Seats</h4>
        <SelectedSeats>
          {selectedSeats.length === 0 ? (
            <p className="text-muted">No seats selected</p>
          ) : (
            selectedSeats.map(seat => (
              <SeatTag key={seat.id}>{seat.rowLabel}{seat.seatNumber}</SeatTag>
            ))
          )}
        </SelectedSeats>
        <TotalPrice>
          <span>Total</span>
          <span className="price">{totalPrice.toLocaleString()} VND</span>
        </TotalPrice>
      </Summary>
    </SeatMapContainer>
  );
};

export default SeatMap;