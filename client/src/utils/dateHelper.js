// Ngày giả lập cho hệ thống (dùng để test)
// Trong production, đổi thành new Date() để dùng ngày thực
const SIMULATED_DATE = new Date('2025-09-10');

// Lấy ngày hiện tại (giả lập hoặc thực)
export const getCurrentDate = () => {
  // Uncomment dòng dưới để dùng ngày thực
  // return new Date();
  return SIMULATED_DATE;
};

// Kiểm tra đã hết hạn chưa
export const isExpired = (endDate) => {
  return getCurrentDate() > new Date(endDate);
};

// Kiểm tra đã đến ngày bắt đầu chưa
export const hasStarted = (startDate) => {
  return getCurrentDate() >= new Date(startDate);
};

// Format ngày theo locale Việt Nam
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format ngày ngắn gọn
export const formatDateShort = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};
