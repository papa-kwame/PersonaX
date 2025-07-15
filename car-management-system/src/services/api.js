// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7092',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => response, error => {
  if (error.response) {
    if (error.response.status === 401) {
    }
    if (error.response.data && error.response.data.title) {
      error.message = error.response.data.title;
    }
  }
  return Promise.reject(error);
});

/**
 * Soft delete a notification by ID
 * @param {string} id - Notification ID (GUID)
 * @returns {Promise}
 */
api.softDeleteNotification = function(id) {
  return api.delete(`/api/Notifications/${id}`);
};

export default api;