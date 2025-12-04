import api from './api';

export const applicationService = {
  async getUserApplications() {
    const response = await api.get('/api/applications/');
    return response.data;
  },

  async getApplication(id) {
    const response = await api.get(`/api/applications/${id}/`);
    return response.data;
  },

  async createApplication(applicationData) {
    const formData = new FormData();
    formData.append('job', applicationData.job);
    formData.append('cover_letter', applicationData.cover_letter);
    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }

    const response = await api.post('/api/applications/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async withdrawApplication(id) {
    const response = await api.delete(`/api/applications/${id}/`);
    return response.data;
  },

  async updateApplicationStatus(id, statusData) {
    const response = await api.patch(`/api/applications/${id}/status/`, statusData);
    return response.data;
  },
};

