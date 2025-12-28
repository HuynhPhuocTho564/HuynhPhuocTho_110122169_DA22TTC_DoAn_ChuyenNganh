import api from './api';

const applicationService = {
  // Nộp hồ sơ (STUDENT)
  submit: async (scholarshipId) => {
    return await api.post('/applications', { scholarship_id: scholarshipId });
  },

  // Upload minh chứng
  uploadDocuments: async (applicationId, files, type = 'KHAC') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('type', type);

    return await api.post(`/applications/${applicationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Lịch sử hồ sơ của sinh viên
  getMyHistory: async () => {
    return await api.get('/applications/my-history');
  },

  // Danh sách hồ sơ (UNI_ADMIN)
  getAll: async (params = {}) => {
    return await api.get('/applications', { params });
  },

  // Chi tiết hồ sơ
  getById: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  // Xét duyệt hồ sơ (UNI_ADMIN)
  review: async (id, status, adminNote) => {
    return await api.put(`/applications/${id}/review`, {
      status,
      admin_note: adminNote
    });
  }
};

export default applicationService;
