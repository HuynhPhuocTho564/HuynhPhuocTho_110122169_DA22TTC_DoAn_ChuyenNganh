import api from './api';

const scholarshipService = {
  // Lấy danh sách học bổng
  getAll: async (params = {}) => {
    return await api.get('/scholarships', { params });
  },

  // Lấy chi tiết học bổng
  getById: async (id) => {
    return await api.get(`/scholarships/${id}`);
  },

  // Tạo học bổng mới (UNI_ADMIN)
  create: async (data) => {
    return await api.post('/scholarships', data);
  },

  // Cập nhật học bổng
  update: async (id, data) => {
    return await api.put(`/scholarships/${id}`, data);
  },

  // Xóa học bổng
  delete: async (id) => {
    return await api.delete(`/scholarships/${id}`);
  }
};

export default scholarshipService;
