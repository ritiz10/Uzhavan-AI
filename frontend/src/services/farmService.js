import api from './api';

export const farmService = {
  async getFarms() {
    const res = await api.get('/farms');
    return res.data;
  },

  async getFarmById(id) {
    const res = await api.get(`/farms/${id}`);
    return res.data;
  },

  async createFarm(data) {
    const res = await api.post('/farms', data);
    return res.data;
  },

  async updateFarm(id, data) {
    const res = await api.put(`/farms/${id}`, data);
    return res.data;
  },

  async deleteFarm(id) {
    const res = await api.delete(`/farms/${id}`);
    return res.data;
  },

  async getMetadataOptions() {
    const res = await api.get('/farms/metadata/options');
    return res.data;
  }
};
