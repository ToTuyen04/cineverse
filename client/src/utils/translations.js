const translations = {
  en: {
    common: {
      language: 'English',
    },
    showcase: {
      title: 'Cinema UI Component Library',
      colorPalette: 'Color Palette',
      background: 'Background',
      cardBg: 'Card BG',
      primary: 'Primary',
      secondary: 'Secondary',
      textLight: 'Text Light',
      textMuted: 'Text Muted',
      textDark: 'Text Dark',
      commonUI: 'Common UI',
      buttons: 'Buttons',
      primaryButton: 'Primary Button',
      secondaryButton: 'Secondary Button',
      outlineButton: 'Outline Button',
      smallButton: 'Small Button',
      bookNow: 'Book Now',
      viewDetails: 'View Details',
      cancel: 'Cancel',
      buyTicket: 'Buy Ticket',
      cardsLoading: 'Cards & Loading',
      card: 'Card',
      loadingIndicator: 'Loading Indicator',
      infoCard: 'Information Card',
      cardContent: 'This is a sample content inside a card component.',
      modal: 'Modal',
      modalDialog: 'Modal Dialog',
      openModal: 'Open Modal',
      sampleModal: 'Sample Modal',
      modalContent: 'This is a sample modal dialog content.',
      close: 'Close',
      formComponents: 'Form Components',
      formElements: 'Form Elements',
      textInput: 'Text Input',
      fullName: 'Full Name',
      enterFullName: 'Enter your full name',
      selectComponent: 'Select Component',
      theaterLocation: 'Theater Location',
      hoChiMinhCity: 'Ho Chi Minh City',
      hanoi: 'Hanoi',
      danang: 'Da Nang',
      searchBar: 'Search Bar',
      searchPlaceholder: 'Search for movies, theaters...',
      movieComponents: 'Movie Components',
      movieUI: 'Movie UI Components',
      movieCard: 'Movie Card',
      seating: 'Seating',
      theaterSeating: 'Theater Seating Components',
      seatTypes: 'Seat Types',
      regular: 'Regular',
      vip: 'VIP',
      couple: 'Couple',
      selected: 'Selected',
      booked: 'Booked',
    },
    movies: {
      darkKnight: 'The Dark Knight',
      genres: {
        action: 'Action',
        crime: 'Crime',
        drama: 'Drama',
      }
    }
  },
  vi: {
    common: {
      language: 'Tiếng Việt',
    },
    showcase: {
      title: 'Thư Viện Giao Diện Rạp Chiếu Phim',
      colorPalette: 'Bảng Màu',
      background: 'Nền',
      cardBg: 'Nền Thẻ',
      primary: 'Chính',
      secondary: 'Phụ',
      textLight: 'Chữ Sáng',
      textMuted: 'Chữ Mờ',
      textDark: 'Chữ Tối',
      commonUI: 'Giao Diện Chung',
      buttons: 'Nút Bấm',
      primaryButton: 'Nút Chính',
      secondaryButton: 'Nút Phụ',
      outlineButton: 'Nút Viền',
      smallButton: 'Nút Nhỏ',
      bookNow: 'Đặt Ngay',
      viewDetails: 'Xem Chi Tiết',
      cancel: 'Hủy',
      buyTicket: 'Mua Vé',
      cardsLoading: 'Thẻ & Đang Tải',
      card: 'Thẻ',
      loadingIndicator: 'Biểu Tượng Đang Tải',
      infoCard: 'Thẻ Thông Tin',
      cardContent: 'Đây là nội dung mẫu trong thành phần thẻ.',
      modal: 'Cửa Sổ',
      modalDialog: 'Hộp Thoại',
      openModal: 'Mở Cửa Sổ',
      sampleModal: 'Cửa Sổ Mẫu',
      modalContent: 'Đây là nội dung mẫu của hộp thoại.',
      close: 'Đóng',
      formComponents: 'Thành Phần Biểu Mẫu',
      formElements: 'Các Phần Tử Biểu Mẫu',
      textInput: 'Ô Nhập Liệu',
      fullName: 'Họ và Tên',
      enterFullName: 'Nhập họ và tên của bạn',
      selectComponent: 'Thành Phần Lựa Chọn',
      theaterLocation: 'Vị Trí Rạp',
      hoChiMinhCity: 'Thành phố Hồ Chí Minh',
      hanoi: 'Hà Nội',
      danang: 'Đà Nẵng',
      searchBar: 'Thanh Tìm Kiếm',
      searchPlaceholder: 'Tìm kiếm phim, rạp chiếu...',
      movieComponents: 'Thành Phần Phim',
      movieUI: 'Giao Diện Phim',
      movieCard: 'Thẻ Phim',
      seating: 'Chỗ Ngồi',
      theaterSeating: 'Thành Phần Chỗ Ngồi',
      seatTypes: 'Loại Ghế',
      regular: 'Thường',
      vip: 'VIP',
      couple: 'Đôi',
      selected: 'Đã Chọn',
      booked: 'Đã Đặt',
    },
    movies: {
      darkKnight: 'Kỵ Sĩ Bóng Đêm',
      genres: {
        action: 'Hành Động',
        crime: 'Tội Phạm',
        drama: 'Kịch',
      }
    }
  }
};

// Translation utility function
export const useTranslation = (lang) => {
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Fallback to key if translation not found
      }
    }
    
    return value;
  };
  
  return { t };
};

export const getTranslatedMovie = (movie, lang) => {
  if (!movie) return null;
  
  // Create a copy to avoid modifying the original
  const translated = { ...movie };
  
  // Translate movie title if available
  if (movie.title === "The Dark Knight") {
    translated.title = lang === 'vi' ? translations.vi.movies.darkKnight : movie.title;
  }
  
  // Translate genres
  if (movie.genres && Array.isArray(movie.genres)) {
    translated.genres = movie.genres.map(genre => {
      if (genre === "Action") {
        return lang === 'vi' ? translations.vi.movies.genres.action : genre;
      }
      if (genre === "Crime") {
        return lang === 'vi' ? translations.vi.movies.genres.crime : genre;
      }
      if (genre === "Drama") {
        return lang === 'vi' ? translations.vi.movies.genres.drama : genre;
      }
      return genre;
    });
  }
  
  return translated;
};

export default translations;