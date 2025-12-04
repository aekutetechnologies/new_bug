import { create } from 'zustand';
import { applicationService } from '../services/applicationService';

export const useApplicationStore = create((set) => ({
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const data = await applicationService.getUserApplications();
      set({ applications: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch applications', loading: false });
    }
  },

  fetchApplication: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await applicationService.getApplication(id);
      set({ currentApplication: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch application', loading: false });
    }
  },

  createApplication: async (applicationData) => {
    set({ loading: true, error: null });
    try {
      const data = await applicationService.createApplication(applicationData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to submit application', loading: false });
      throw error;
    }
  },

  withdrawApplication: async (id) => {
    set({ loading: true, error: null });
    try {
      await applicationService.withdrawApplication(id);
      set({ loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to withdraw application', loading: false });
      throw error;
    }
  },

  updateApplicationStatus: async (id, statusData) => {
    set({ loading: true, error: null });
    try {
      const data = await applicationService.updateApplicationStatus(id, statusData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to update application status', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

