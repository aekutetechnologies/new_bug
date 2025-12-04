import { create } from 'zustand';
import { jobService } from '../services/jobService';

export const useJobStore = create((set, get) => ({
  jobs: [],
  currentJob: null,
  providerJobs: [],
  applicants: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    job_type: '',
    experience_level: '',
    location: '',
    min_salary: '',
    max_salary: '',
    skills: '',
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  fetchJobs: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const queryParams = { ...filters, ...params };
      const data = await jobService.getJobs(queryParams);
      set({ jobs: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch jobs', loading: false });
    }
  },

  fetchJob: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await jobService.getJob(id);
      set({ currentJob: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch job', loading: false });
    }
  },

  createJob: async (jobData) => {
    set({ loading: true, error: null });
    try {
      const data = await jobService.createJob(jobData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to create job', loading: false });
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    set({ loading: true, error: null });
    try {
      const data = await jobService.updateJob(id, jobData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to update job', loading: false });
      throw error;
    }
  },

  partialUpdateJob: async (id, jobData) => {
    set({ loading: true, error: null });
    try {
      const data = await jobService.partialUpdateJob(id, jobData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to update job', loading: false });
      throw error;
    }
  },

  deleteJob: async (id) => {
    set({ loading: true, error: null });
    try {
      await jobService.deleteJob(id);
      set({ loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to delete job', loading: false });
      throw error;
    }
  },

  fetchProviderJobs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await jobService.getProviderJobs();
      set({ providerJobs: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch provider jobs', loading: false });
    }
  },

  fetchApplicants: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await jobService.getProviderApplicants(params);
      set({ applicants: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch applicants', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

