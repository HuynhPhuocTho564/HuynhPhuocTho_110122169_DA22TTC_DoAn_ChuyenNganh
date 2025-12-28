import { create } from 'zustand';
import authService from '../services/authService';

/**
 * Kiểm tra và xác thực token khi khởi tạo
 */
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  const user = authService.getCurrentUser();
  
  if (!token || !user) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, isAuthenticated: false };
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { user: null, isAuthenticated: false };
    }
    
    return { user, isAuthenticated: true };
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, isAuthenticated: false };
  }
};

const initialState = initializeAuth();

/**
 * Zustand store cho authentication
 */
const useAuthStore = create((set) => ({
  user: initialState.user,
  isAuthenticated: initialState.isAuthenticated,
  loading: false,

  /**
   * Login action
   */
  login: async (identifier, password) => {
    set({ loading: true });
    try {
      const response = await authService.login(identifier, password);
      const user = response.data?.user;
      
      set({
        user,
        isAuthenticated: true,
        loading: false
      });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Logout action
   */
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  /**
   * Clear auth (không redirect)
   */
  clearAuth: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  /**
   * Update user info
   */
  setUser: (user) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  }
}));

export default useAuthStore;
