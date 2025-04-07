import { useState, useCallback } from 'react';
import axios from 'axios';

const useReservation = (showtimeId) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Toggle seat selection
  const toggleSeatSelection = useCallback((seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  }, []);
  
  // Clear all selected seats
  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);
  
  // Calculate total price
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  
  // Submit reservation
  const submitReservation = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await axios.post('/api/reservations', {
        userId,
        showtimeId,
        seatIds: selectedSeats.map(seat => seat.id),
        totalAmount: totalPrice
      });
      
      setSuccess(true);
      setSelectedSeats([]);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to complete reservation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showtimeId, selectedSeats, totalPrice]);
  
  return {
    selectedSeats,
    toggleSeatSelection,
    clearSelection,
    totalPrice,
    loading,
    error,
    success,
    submitReservation
  };
};

export default useReservation;