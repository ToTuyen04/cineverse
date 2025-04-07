// Các dịch vụ liên quan đến vé và lịch sử mua vé

/**
 * Lấy lịch sử mua vé
 * @returns {Promise<Array>} - Danh sách vé đã mua
 */
export const getTicketHistory = async () => {
  // TODO: Thay thế bằng API thật khi có
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Dữ liệu mẫu
  return [
    {
      id: 'TK-001',
      movieName: 'Người Nhện: Không Còn Nhà',
      theater: 'CineVerse Sài Gòn',
      date: '2024-03-15',
      time: '19:30',
      seats: ['H7', 'H8'],
      price: 170000,
      status: 'completed',
      bookingDate: '2024-03-10T12:45:00',
      paymentMethod: 'Thẻ tín dụng/ghi nợ',
      code: 'QR12345678'
    },
    {
      id: 'TK-002',
      movieName: 'Black Panther: Wakanda Mãi Mãi',
      theater: 'CineVerse Hà Nội',
      date: '2024-04-01',
      time: '20:15',
      seats: ['F5', 'F6', 'F7', 'F8'],
      price: 340000,
      status: 'pending',
      bookingDate: '2024-03-28T10:15:00',
      paymentMethod: 'Ví điện tử MoMo',
      code: 'QR87654321'
    },
    {
      id: 'TK-003',
      movieName: 'Sát Thủ John Wick 4',
      theater: 'CineVerse Đà Nẵng',
      date: '2024-02-20',
      time: '21:00',
      seats: ['D12'],
      price: 85000,
      status: 'completed',
      bookingDate: '2024-02-15T18:30:00',
      paymentMethod: 'Tiền mặt',
      code: 'QR13579246'
    },
    {
      id: 'TK-004',
      movieName: 'Avatar: Dòng Chảy Của Nước',
      theater: 'CineVerse Sài Gòn',
      date: '2023-12-25',
      time: '15:45',
      seats: ['J10', 'J11', 'J12'],
      price: 255000,
      status: 'cancelled',
      bookingDate: '2023-12-20T09:00:00',
      paymentMethod: 'Thẻ tín dụng/ghi nợ',
      code: 'QR24681357'
    },
    {
      id: 'TK-005',
      movieName: 'Oppenheimer',
      theater: 'CineVerse Hà Nội',
      date: '2024-01-10',
      time: '18:30',
      seats: ['E15', 'E16'],
      price: 170000,
      status: 'completed',
      bookingDate: '2024-01-05T13:20:00',
      paymentMethod: 'Ví điện tử ZaloPay',
      code: 'QR36925814'
    }
  ];
};

/**
 * Tải xuống hóa đơn vé
 * @param {string} ticketId - ID vé cần tải hóa đơn
 * @returns {Promise<Blob>} - File hóa đơn
 */
export const downloadTicketInvoice = async (ticketId) => {
  // TODO: Thay thế bằng API thật khi có
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Giả lập tạo file hóa đơn
  const invoiceText = `Hóa đơn vé xem phim
ID vé: ${ticketId}
Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
Cảm ơn quý khách đã sử dụng dịch vụ của CineVerse!`;
  
  return new Blob([invoiceText], { type: 'text/plain' });
};

/**
 * Lọc danh sách vé theo trạng thái
 * @param {Array} tickets - Danh sách vé
 * @param {string} status - Trạng thái cần lọc
 * @returns {Array} - Danh sách vé đã lọc
 */
export const filterTicketsByStatus = (tickets, status) => {
  if (status === 'all') return tickets;
  return tickets.filter(ticket => ticket.status === status);
};

/**
 * Lọc danh sách vé theo khoảng thời gian
 * @param {Array} tickets - Danh sách vé
 * @param {string} dateFilter - Loại lọc thời gian
 * @returns {Array} - Danh sách vé đã lọc
 */
export const filterTicketsByDate = (tickets, dateFilter) => {
  const now = new Date();
  
  switch (dateFilter) {
    case 'month':
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return tickets.filter(ticket => new Date(ticket.date) >= oneMonthAgo);
      
    case 'three-months':
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      return tickets.filter(ticket => new Date(ticket.date) >= threeMonthsAgo);
      
    case 'year':
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      return tickets.filter(ticket => new Date(ticket.date) >= oneYearAgo);
      
    default:
      return tickets;
  }
};

/**
 * Tìm kiếm vé theo từ khóa
 * @param {Array} tickets - Danh sách vé
 * @param {string} query - Từ khóa tìm kiếm
 * @returns {Array} - Danh sách vé đã lọc
 */
export const searchTickets = (tickets, query) => {
  if (!query.trim()) return tickets;
  
  const queryLower = query.toLowerCase();
  return tickets.filter(ticket => 
    ticket.movieName.toLowerCase().includes(queryLower) ||
    ticket.theater.toLowerCase().includes(queryLower) ||
    ticket.id.toLowerCase().includes(queryLower)
  );
};

/**
 * Lấy text hiển thị cho trạng thái vé
 * @param {string} status - Trạng thái vé
 * @returns {string} - Text hiển thị
 */
export const getTicketStatusText = (status) => {
  switch(status) {
    case 'completed': return 'Đã hoàn thành';
    case 'pending': return 'Đang xử lý';
    case 'cancelled': return 'Đã hủy';
    default: return 'Không xác định';
  }
};