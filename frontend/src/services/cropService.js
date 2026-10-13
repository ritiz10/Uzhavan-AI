import api from './api';

export const cropService = {
  async predictCrop(data) {
    const res = await api.post('/crop-recommendation/predict', data);
    return res.data;
  },

  async getHistory(limit = 50) {
    const res = await api.get(`/crop-recommendation/history?limit=${limit}`);
    return res.data;
  },

  async getDetail(id) {
    const res = await api.get(`/crop-recommendation/${id}`);
    return res.data;
  }
};
