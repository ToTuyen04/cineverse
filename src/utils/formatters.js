/**
 * Định dạng số tiền theo định dạng tiền tệ VNĐ
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng (vd: 150.000 ₫)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0 ₫";

  return (
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₫", "")
      .trim() + " ₫"
  );
};

/**
 * Định dạng phần trăm
 * @param {number} value - Giá trị cần định dạng
 * @returns {string} Chuỗi phần trăm đã định dạng (vd: 10%)
 */
export const formatPercent = (value) => {
  if (value === undefined || value === null) return "0%";

  return new Intl.NumberFormat("vi-VN", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

/**
 * Định dạng số tiền theo định dạng tiền tệ VNĐ
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng (vd: 150.000 ₫)
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return "0 ₫";

  return (
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₫", "")
      .trim() + " ₫"
  );
};

/**
 * Định dạng ngày tháng (dùng cho ngày phát hành)
 * @param {string} dateString - Chuỗi ngày dạng ISO
 * @returns {string} Ngày đã định dạng (vd: 25/12/2023)
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

/**
 * Định dạng ngày giờ đầy đủ (dùng cho suất chiếu)
 * @param {string} dateString - Chuỗi ngày dạng ISO
 * @returns {string} Ngày giờ đã định dạng (vd: Thứ Hai, 25/12/2023)
 */
export const formatShowDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(
    date
  );
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return `${weekday}, ${formattedDate}`;
};

/**
 * Định dạng thời lượng phim
 * @param {number} minutes - Thời lượng phim tính bằng phút
 * @returns {string} Thời lượng đã định dạng (vd: 2h 30p)
 */
export const formatDuration = (minutes) => {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}p` : ""}`;
  }

  return `${mins}p`;
};

/**
 * Rút gọn văn bản dài
 * @param {string} text - Văn bản cần rút gọn
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Văn bản đã rút gọn
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text || "";

  return text.substring(0, maxLength) + "...";
};

/**
 * Định dạng ngày giờ đầy đủ
 * @param {string} dateString - Chuỗi ngày dạng ISO
 * @returns {string} Ngày giờ đã định dạng (vd: 25/12/2023 15:30)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};