// assignmentService.js
import api from './api';

export const getAssignments = async () => {
  const response = await api.get('/api/VehicleAssignments');
  return response.data;
};

export const assignVehicle = async (assignmentData) => {
  const response = await api.post('/api/VehicleAssignments', assignmentData);
  return response.data;
};

export const returnVehicle = async (assignmentId, returnNotes) => {
  const response = await api.put(`/api/VehicleAssignments/Return/${assignmentId}`, { returnNotes });
  return response.data;
};



export const getUsers = async () => {
  const response = await api.get('/api/Users');
  return response.data;
};



export const getVehicles = async () => {
  const response = await api.get('/api/Vehicles');
  return response.data;
};