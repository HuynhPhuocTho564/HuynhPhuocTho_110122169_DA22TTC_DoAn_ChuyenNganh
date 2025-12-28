const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Ngày giả lập cho hệ thống (dùng để test)
// Trong production, đổi thành new Date() để dùng ngày thực
const SIMULATED_DATE = new Date('2025-09-10');

// Lấy ngày hiện tại (giả lập hoặc thực)
const getCurrentDate = () => {
  // Uncomment dòng dưới để dùng ngày thực
  // return new Date();
  return new Date(SIMULATED_DATE);
};

// Mã hóa mật khẩu với bcrypt (10 rounds - cân bằng security vs performance)
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// So sánh mật khẩu plain text với hash
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Tạo JWT token với payload: {id, role, school_id}
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Verify và decode JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getCurrentDate
};
