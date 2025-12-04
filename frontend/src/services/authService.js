import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/api/auth/login/', { email, password });
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  async googleLogin(credential) {
    const response = await api.post('/api/auth/google/', { credential });
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  async sendVerificationCode(email, verificationType) {
    const response = await api.post('/api/auth/send-verification-code/', {
      email,
      verification_type: verificationType,
    });
    return response.data;
  },

  async verifyCode(email, code, verificationType) {
    const response = await api.post('/api/auth/verify-code/', {
      email,
      code,
      verification_type: verificationType,
    });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/api/auth/forgot-password/', { email });
    return response.data;
  },

  async resetPassword(email, code, newPassword, newPasswordConfirm) {
    const response = await api.post('/api/auth/reset-password/', {
      email,
      code,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },
};

