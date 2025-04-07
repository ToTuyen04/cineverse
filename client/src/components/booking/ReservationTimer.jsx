import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TimerDisplay = styled.div`
  font-weight: 700;
  font-family: monospace;
  color: ${props => props.expiring ? '#ef4444' : 'inherit'};
`;

const ReservationTimer = ({ initialTime, onTimeout, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      if (onTimeUpdate) onTimeUpdate(timeLeft - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, onTimeout, onTimeUpdate]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <TimerDisplay expiring={timeLeft < 120}>
      {formatTime(timeLeft)}
    </TimerDisplay>
  );
};

export default ReservationTimer;