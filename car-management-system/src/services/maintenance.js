// src/services/maintenanceService.js
import api from './api';

const MaintenanceService = {
  getAllRequests: async () => {
    try {
      const response = await api.get('api/MaintenanceRequests');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch maintenance requests');
    }
  },

  getRequestById: async (id) => {
    try {
      const response = await api.get(`api/MaintenanceRequests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch maintenance request');
    }
  },

  createRequest: async (requestData) => {
    try {
      const response = await api.post('api/MaintenanceRequests', requestData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create maintenance request');
    }
  },

  updateRequest: async (id, requestData) => {
    try {
      const response = await api.put(`api/MaintenanceRequests/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update maintenance request');
    }
  },

  deleteRequest: async (id) => {
    try {
      await api.delete(`api/MaintenanceRequests/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete maintenance request');
    }
  },

  getRequestApprovals: async (id) => {
    try {
      const response = await api.get(`api/MaintenanceRequests/${id}/approvals`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch approvals');
    }
  }
};

export default MaintenanceService;