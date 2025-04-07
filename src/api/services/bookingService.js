import theaters from '../mock/theaters.json';
import showtimes from '../mock/showtimes.json';
import seats from '../mock/seats.json';
import seatsData from '../mock/seats.json';
import apiClient from './apiClient';



// Lấy lịch chiếu của một phim tại một rạp
export const getShowtimesByTheater = async (theaterId) => {
  try {
    // TODO: Thay thế bằng API call thật
    // const response = await fetch(`${API_BASE_URL}/api/showtimes?theaterId=${theaterId}`);
    // if (!response.ok) throw new Error('Failed to fetch showtimes');
    // return await response.json();
    
    // Mock data
    return showtimes[theaterId]?.dates || [];
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw error;
  }
};

export const getSeatsByShowtime = async (showtimeId) => {
  try {
    const response = await apiClient.get(`/Showtime/Booking/${showtimeId}`);
    const { chairs, combos } = response.data;

    // Map dữ liệu ghế
    const mappedSeats = chairs.map(chair => ({
      chairId: chair.chairId,
      chairName: chair.chairName,
      chairPosition: chair.chairPosition,
      chairTypeName: chair.chairTypeName,
      available: chair.available,
      version: chair.version,
      price: chair.chairPrice,
    }));

    // Map dữ liệu combo (nếu cần sử dụng sau này)
    const mappedCombos = combos.map(combo => ({
      comboId: combo.comboId,
      comboName: combo.comboName,
      comboDescription: combo.comboDescription,
      comboPrice: combo.comboDetails.reduce((total, detail) => total + detail.fnbPrice * detail.quantity, 0),
      comboDetails: combo.comboDetails
    }));

    return { seats: mappedSeats, combos: mappedCombos };
  } catch (error) {
    console.error('Error fetching seats:', error);
    throw error;
  }
};

// Đặt vé
export const bookTickets = async (bookingData) => {
  try {
    // TODO: Thay thế bằng API call thật
    // Mock response
    console.log('Booking data:', bookingData);
    return {
      success: true,
      bookingId: 'BK' + Math.floor(Math.random() * 10000),
      message: 'Đặt vé thành công!'
    };
  } catch (error) {
    console.error('Error booking tickets:', error);
    throw error;
  }
};