import api from './api';

export const adminService = {
  async getStatistics() {
    const res = await api.get('/admin/statistics');
    return res.data;
  },

  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async getFarms(params = {}) {
    const res = await api.get('/admin/farms', { params });
    return res.data;
  },

  async getCropRecommendations(params = {}) {
    const res = await api.get('/admin/crop-recommendations', { params });
    return res.data;
  },

  async getDiseasePredictions(params = {}) {
    const res = await api.get('/admin/disease-predictions', { params });
    return res.data;
  },

  async getIrrigationAdvisories(params = {}) {
    const res = await api.get('/admin/irrigation-advisories', { params });
    return res.data;
  },

  async getSystemLogs(limit = 100) {
    const res = await api.get(`/admin/system-logs?limit=${limit}`);
    return res.data;
  },

  async getCrops() {
    const res = await api.get('/admin/crops');
    return res.data;
  },

  async createCrop(data) {
    const res = await api.post('/admin/crops', data);
    return res.data;
  },

  async updateCrop(id, data) {
    const res = await api.put(`/admin/crops/${id}`, data);
    return res.data;
  },

  async deleteCrop(id) {
    const res = await api.delete(`/admin/crops/${id}`);
    return res.data;
  },

  async getDiseases() {
    const res = await api.get('/admin/diseases');
    return res.data;
  },

  async createDisease(data) {
    const res = await api.post('/admin/diseases', data);
    return res.data;
  },

  async updateDisease(id, data) {
    const res = await api.put(`/admin/diseases/${id}`, data);
    return res.data;
  },

  async deleteDisease(id) {
    const res = await api.delete(`/admin/diseases/${id}`);
    return res.data;
  }
};
