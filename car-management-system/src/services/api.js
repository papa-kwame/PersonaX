// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7092',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    const { token } = JSON.parse(authData);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => response, error => {
  if (error.response) {
    if (error.response.status === 401) {
      // Handle 401 errors - clear auth data and redirect
      localStorage.removeItem('authData');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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