// src/services/vehicleService.js
import api from './api';

export const getVehicles = async () => {
  try {
    const response = await api.get('/api/Vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`/api/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle ${id}:`, error);
    throw error;
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const response = await api.post('/api/vehicles', vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const updateVehicle = async (id, vehicleData) => {
  try {
    const response = await api.put(`/api/vehicles/${id}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${id}:`, error);
    throw error;
  }
};

export const deleteVehicle = async (id) => {
  try {
    const response = await api.delete(`/api/vehicles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting vehicle ${id}:`, error);
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
    console.error('Error fetching vehicles for duplicate check:', error);
    throw error;
  }
};