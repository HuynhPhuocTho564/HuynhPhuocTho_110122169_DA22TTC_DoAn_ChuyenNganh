import api from './api';

/**
 * Service xử lý authentication
 */
const authService = {
  /**
   * Đăng nhập
   * @param {string} identifier - Username hoặc email
   * @param {string} password - Mật khẩu
   */
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password });
    
    // Response structure: { success, data: { user, token }, message }
    const { user, token } = response.data;
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response;
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getProfile: async () => {
    return await api.get('/auth/me');
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    return await api.put('/auth/change-password', {
      oldPassword,
      newPassword,
      confirmPassword
    });
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Lấy user từ localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};

export default authService;
