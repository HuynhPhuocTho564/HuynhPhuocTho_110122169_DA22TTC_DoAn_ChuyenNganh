import api from './api';

const universityService = {
  // Lấy danh sách trường
  getAll: async (params = {}) => {
    return await api.get('/universities', { params });
  },

  // Lấy chi tiết trường
  getById: async (id) => {
    return await api.get(`/universities/${id}`);
  }
};

export default universityService;
