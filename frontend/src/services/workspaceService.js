import api from './api';

export const workspaceService = {
  // Cloud Credentials
  async getCloudCredentials() {
    const response = await api.get('/api/cloud-credentials/');
    return response.data;
  },

  async getCloudCredential(id) {
    const response = await api.get(`/api/cloud-credentials/${id}/`);
    return response.data;
  },

  async createCloudCredential(credentialData) {
    const response = await api.post('/api/cloud-credentials/', credentialData);
    return response.data;
  },

  async updateCloudCredential(id, credentialData) {
    const response = await api.put(`/api/cloud-credentials/${id}/`, credentialData);
    return response.data;
  },

  async deleteCloudCredential(id) {
    const response = await api.delete(`/api/cloud-credentials/${id}/`);
    return response.data;
  },

  async testCloudCredential(id) {
    const response = await api.post(`/api/cloud-credentials/${id}/test/`);
    return response.data;
  },

  // Workspaces
  async getWorkspaces() {
    const response = await api.get('/api/workspaces/');
    return response.data;
  },

  async getWorkspace(id) {
    const response = await api.get(`/api/workspaces/${id}/`);
    return response.data;
  },

  async createWorkspace(workspaceData) {
    const response = await api.post('/api/workspaces/', workspaceData);
    return response.data;
  },

  async importWorkspace(workspaceData) {
    const response = await api.post('/api/workspaces/import/', workspaceData);
    return response.data;
  },

  async updateWorkspace(id, workspaceData) {
    const response = await api.patch(`/api/workspaces/${id}/`, workspaceData);
    return response.data;
  },

  async assignWorkspace(id, applicationId) {
    const response = await api.patch(`/api/workspaces/${id}/`, { application_id: applicationId });
    return response.data;
  },

  async deleteWorkspace(id) {
    const response = await api.delete(`/api/workspaces/${id}/`);
    return response.data;
  },

  async startWorkspace(id) {
    const response = await api.post(`/api/workspaces/${id}/start/`);
    return response.data;
  },

  async stopWorkspace(id) {
    const response = await api.post(`/api/workspaces/${id}/stop/`);
    return response.data;
  },

  async restartWorkspace(id) {
    const response = await api.post(`/api/workspaces/${id}/restart/`);
    return response.data;
  },

  async getWorkspaceConnection(id) {
    const response = await api.get(`/api/workspaces/${id}/connection/`);
    return response.data;
  },

  async getProviderWorkspaces() {
    const response = await api.get('/api/provider/workspaces/');
    return response.data;
  },

  async getSeekerWorkspaces() {
    const response = await api.get('/api/seeker/workspaces/');
    return response.data;
  },

  // Bundles
  async getBundles(credentialId) {
    const response = await api.get(`/api/bundles/${credentialId}/`);
    return response.data;
  },
};

