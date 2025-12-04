import { create } from 'zustand';
import { savedJobService } from '../services/savedJobService';

export const useSavedJobStore = create((set) => ({
  savedJobs: [],
  loading: false,
  error: null,

  fetchSavedJobs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await savedJobService.getSavedJobs();
      set({ savedJobs: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch saved jobs', loading: false });
    }
  },

  saveJob: async (jobId) => {
    set({ loading: true, error: null });
    try {
      const data = await savedJobService.saveJob(jobId);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to save job', loading: false });
      throw error;
    }
  },

  unsaveJob: async (id) => {
    set({ loading: true, error: null });
    try {
      await savedJobService.unsaveJob(id);
      set({ loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to unsave job', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

