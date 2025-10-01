// src/services/vehicleService.js
import api from './api';

export const getVehicles = async () => {
  try {
    const response = await api.get('/api/Vehicles');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`/api/vehicles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createVehicle = async (vehicleData, userId) => {
  try {
    const response = await api.post(`/api/vehicles?userId=${userId}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateVehicle = async (id, vehicleData, userId) => {
  try {
    const response = await api.put(`/api/vehicles/${id}?userId=${userId}`, vehicleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteVehicle = async (id) => {
  try {
    const response = await api.delete(`/api/vehicles/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMaintenanceRecords = async (vehicleId) => {
  const response = await api.get(`/vehicles/${vehicleId}/maintenance`);
  return response.data;
};

export const getAssignments = async (vehicleId) => {
  const response = await api.get(`/vehicles/${vehicleId}/assignments`);
  return response.data;
};

export const getAssignedVehicles = (userId) => {
  return axios.get(`/api/VehicleAssignment/ByUser/${userId}`);
};

export const unassignVehicle = (vehicleId) => {
  return axios.post('/api/VehicleAssignment/Unassign', `"${vehicleId}"`, {
      headers: { 'Content-Type': 'application/json' }
  });
};

export const getAllVehiclesSimple = async () => {
  try {
    const response = await api.get('/api/Vehicles');
    // Only return id, vin, licensePlate for efficiency
    return response.data.map(v => ({
      id: v.id,
      vin: v.vin,
      licensePlate: v.licensePlate
    }));
  } catch (error) {
    throw error;
  }
};

export const getVehiclesWithDueDates = async (days = 30) => {
  try {
    const response = await api.get(`/api/vehicles/due-dates?days=${days}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};