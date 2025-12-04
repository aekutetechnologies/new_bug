import api from './api';

export const jobService = {
  async getJobs(params = {}) {
    const response = await api.get('/api/jobs/', { params });
    return response.data;
  },

  async getJob(id) {
    const response = await api.get(`/api/jobs/${id}/`);
    return response.data;
  },

  async createJob(jobData) {
    const response = await api.post('/api/jobs/', jobData);
    return response.data;
  },

  async updateJob(id, jobData) {
    const response = await api.put(`/api/jobs/${id}/`, jobData);
    return response.data;
  },

  async partialUpdateJob(id, jobData) {
    const response = await api.patch(`/api/jobs/${id}/`, jobData);
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(`/api/jobs/${id}/`);
    return response.data;
  },

  async getProviderJobs() {
    const response = await api.get('/api/provider/jobs/');
    return response.data;
  },

  async getProviderApplicants(params = {}) {
    const response = await api.get('/api/provider/applicants/', { params });
    return response.data;
  },
};

