// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7092',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(response => response, error => {
  if (error.response) {
    // Handle specific status codes
    if (error.response.status === 401) {
      // Handle unauthorized
    }
    // Transform error message from API if available
    if (error.response.data && error.response.data.title) {
      error.message = error.response.data.title;
    }
  }
  return Promise.reject(error);
});

export default api;