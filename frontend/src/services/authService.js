import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data && res.data.access_token) {
      localStorage.setItem('tn_agri_token', res.data.access_token);
      localStorage.setItem('tn_agri_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.access_token) {
      localStorage.setItem('tn_agri_token', res.data.access_token);
      localStorage.setItem('tn_agri_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    if (res.data) {
      localStorage.setItem('tn_agri_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    if (res.data) {
      localStorage.setItem('tn_agri_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async changePassword(oldPassword, newPassword) {
    const res = await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return res.data;
  },

  logout() {
    localStorage.removeItem('tn_agri_token');
    localStorage.removeItem('tn_agri_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('tn_agri_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('tn_agri_token');
  }
};
