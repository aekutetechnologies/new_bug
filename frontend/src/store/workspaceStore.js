import { create } from 'zustand';
import { workspaceService } from '../services/workspaceService';

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentWorkspace: null,
  cloudCredentials: [],
  loading: false,
  error: null,

  // Cloud Credentials
  fetchCloudCredentials: async () => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.getCloudCredentials();
      set({ cloudCredentials: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch cloud credentials', loading: false });
    }
  },

  createCloudCredential: async (credentialData) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.createCloudCredential(credentialData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to create cloud credential', loading: false });
      throw error;
    }
  },

  deleteCloudCredential: async (id) => {
    set({ loading: true, error: null });
    try {
      await workspaceService.deleteCloudCredential(id);
      set({ loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to delete cloud credential', loading: false });
      throw error;
    }
  },

  testCloudCredential: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.testCloudCredential(id);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to test cloud credential', loading: false });
      throw error;
    }
  },

  // Workspaces
  fetchWorkspaces: async () => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.getWorkspaces();
      set({ workspaces: data.results || data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch workspaces', loading: false });
    }
  },

  fetchWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.getWorkspace(id);
      set({ currentWorkspace: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch workspace', loading: false });
    }
  },

  createWorkspace: async (workspaceData) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.createWorkspace(workspaceData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to create workspace', loading: false });
      throw error;
    }
  },

  importWorkspace: async (workspaceData) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.importWorkspace(workspaceData);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to import workspace', loading: false });
      throw error;
    }
  },

  assignWorkspace: async (workspaceId, applicationId) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.assignWorkspace(workspaceId, applicationId);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to assign workspace', loading: false });
      throw error;
    }
  },

  deleteWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      await workspaceService.deleteWorkspace(id);
      set({ loading: false });
    } catch (error) {
      set({ error: error.response?.data || 'Failed to delete workspace', loading: false });
      throw error;
    }
  },

  startWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.startWorkspace(id);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to start workspace', loading: false });
      throw error;
    }
  },

  stopWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.stopWorkspace(id);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to stop workspace', loading: false });
      throw error;
    }
  },

  restartWorkspace: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.restartWorkspace(id);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to restart workspace', loading: false });
      throw error;
    }
  },

  getWorkspaceConnection: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.getWorkspaceConnection(id);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to get workspace connection', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Bundles
  fetchBundles: async (credentialId) => {
    set({ loading: true, error: null });
    try {
      const data = await workspaceService.getBundles(credentialId);
      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data || 'Failed to fetch bundles', loading: false });
      throw error;
    }
  },
}));

