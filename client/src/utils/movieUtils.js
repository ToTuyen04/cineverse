// Hàm để xác định phân loại độ tuổi dựa vào dữ liệu phim
export const getAgeRating = (movie) => {
  if (!movie) return 'P';
  
  // Nếu phim có trường ageRating, sử dụng nó
  if (movie.ageRating) return movie.ageRating;
  
  // Nếu không có, thử đoán từ các trường khác (thể loại, rating, v.v.)
  if (movie.genres) {
    if (movie.genres.includes('Kinh dị') || movie.genres.includes('Bạo lực')) {
      return 'C16';
    }
    if (movie.genres.includes('Hành động')) {
      return 'C13';
    }
    if (movie.genres.includes('Hoạt hình') || movie.genres.includes('Gia đình')) {
      return 'P';
    }
  }
  
  // Mặc định là P
  return 'P';
};

// Hàm lấy màu cho bookmark dựa trên rating
export const getBookmarkColor = (ageRating) => {
  switch(ageRating) {
    case 'P': return '#27ae60';  // Xanh lá - Phim dành cho mọi lứa tuổi
    case 'K': return '#27ae60';  // Xanh lá - Khuyến khích phụ huynh đi cùng
    case 'C13': return '#f39c12'; // Vàng cam - Cấm dưới 13 tuổi
    case 'C16': return '#e67e22'; // Cam - Cấm dưới 16 tuổi
    case 'C18': return '#e74c3c'; // Đỏ - Cấm dưới 18 tuổi
    case 'PG-13': return '#f39c12'; // Tương tự C13
    default: return '#2980b9';   // Xanh dương - Mặc định
  }
};

// Hàm định dạng ngày tháng
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
};