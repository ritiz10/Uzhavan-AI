import api from './api';

export const weatherService = {
  async getCurrentWeather(district = 'Thanjavur') {
    const res = await api.get(`/weather/current?district=${encodeURIComponent(district)}`);
    return res.data;
  },

  async getForecast(district = 'Thanjavur') {
    const res = await api.get(`/weather/forecast?district=${encodeURIComponent(district)}`);
    return res.data;
  }
};
