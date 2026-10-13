import api from './api';

export const irrigationService = {
  async generateAdvisory(data) {
    const res = await api.post('/irrigation/advisory', data);
    return res.data;
  },

  async getHistory(limit = 50) {
    const res = await api.get(`/irrigation/history?limit=${limit}`);
    return res.data;
  },

  async getDetail(id) {
    const res = await api.get(`/irrigation/${id}`);
    return res.data;
  }
};
