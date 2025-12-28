// Validation helpers - Tránh lặp code validate
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  // Ít nhất 6 ký tự
  return password && password.length >= 6;
};

const isValidRole = (role) => {
  const validRoles = ['SUPER_ADMIN', 'UNI_ADMIN', 'STUDENT', 'SPONSOR'];
  return validRoles.includes(role);
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidRole
};
