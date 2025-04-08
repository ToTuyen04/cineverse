import apiClient from './apiClient';

/**
 * Lấy lịch sử mua vé
 * @returns {Promise<Array>} - Danh sách vé đã mua
 */
export const getTicketHistory = async () => {
  try {
    const token = localStorage.getItem('token');
        // Gọi API với userEmail
    const response = await apiClient.get(`/users/profile/purchase-history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    } );
    
    // Trả về data từ response
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ticket history:', error);
    throw error;
  }
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