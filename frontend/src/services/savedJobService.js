import api from './api';

export const savedJobService = {
  async getSavedJobs() {
    const response = await api.get('/api/saved-jobs/');
    return response.data;
  },

  async saveJob(jobId) {
    const response = await api.post('/api/saved-jobs/', { job: jobId });
    return response.data;
  },

  async unsaveJob(id) {
    const response = await api.delete(`/api/saved-jobs/${id}/`);
    return response.data;
  },
};

