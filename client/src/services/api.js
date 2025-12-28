import axios from 'axios';

// Tạo axios instance với base config
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Xử lý response và lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Backend trả về { success, data, message }
    // Unwrap và trả về trực tiếp object này
    return response.data;
  },
  (error) => {
    // Xử lý lỗi 401 - Token hết hạn
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const message = error.response?.data?.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

export default api;
