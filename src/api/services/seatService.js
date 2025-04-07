// Mock data
const mockSeats = {
  // Showtime ID 1
  '1': generateTheaterSeats('1'),
  // Add more showtimes as needed
};

// Generate theater seating
function generateTheaterSeats(showtimeId) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats = [];
  let seatId = 1;
  
  rows.forEach(row => {
    for (let i = 1; i <= seatsPerRow; i++) {
      // Make some seats unavailable randomly
      const isAvailable = Math.random() > 0.2;
      
      // Make some seats VIP
      const isVIP = (row === 'E' || row === 'F') && (i >= 4 && i <= 9);
      
      seats.push({
        id: seatId++,
        row,
        number: i,
        isAvailable,
        isVIP,
        price: isVIP ? 15.00 : 10.00,
        showtimeId
      });
    }
  });
  
  return seats;
}

// Get seats by showtime
export const getSeatsByShowtime = async (showtimeId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // If we have mock data for this showtime, return it
  if (mockSeats[showtimeId]) {
    return mockSeats[showtimeId];
  }
  
  // Otherwise generate new seats
  const generatedSeats = generateTheaterSeats(showtimeId);
  mockSeats[showtimeId] = generatedSeats;
  return generatedSeats;
};

// Reserve seats
export const reserveSeats = async (showtimeId, seatIds) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would send a request to the backend
  return {
    success: true,
    message: 'Seats reserved successfully',
    reservationId: 'RES-' + Math.floor(Math.random() * 1000000)
  };
};