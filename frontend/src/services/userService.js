import api from './api';

export const userService = {
  async getProfile() {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/api/auth/profile/', profileData);
    return response.data;
  },

  async partialUpdateProfile(profileData) {
    const response = await api.patch('/api/auth/profile/', profileData);
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/api/auth/profile/');
    return response.data;
  },

  async changePassword(passwordData) {
    const response = await api.post('/api/auth/change-password/', passwordData);
    return response.data;
  },

  async sendVerificationCode(email) {
    const response = await api.post('/api/auth/send-verification-code/', {
      email,
      verification_type: 'change_password',
    });
    return response.data;
  },

  async uploadAvatar(formData) {
    const response = await api.post('/api/auth/upload-avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

