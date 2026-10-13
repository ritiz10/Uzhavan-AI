import api from './api';

export const diseaseService = {
  async predictDisease(formData) {
    const res = await api.post('/disease-detection/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getHistory(limit = 50) {
    const res = await api.get(`/disease-detection/history?limit=${limit}`);
    return res.data;
  },

  async getDetail(id) {
    const res = await api.get(`/disease-detection/${id}`);
    return res.data;
  }
};
