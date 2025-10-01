import axios from 'axios';

const API_URL = 'https://localhost:7092/api';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/Auth/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const authData = {
      token: response.data.token,
      roles: response.data.roles,
      routeRoles: response.data.routeRoles,
      userId: response.data.userId,
      mustChangePassword: response.data.mustChangePassword === true || response.data.mustChangePassword === 'true'
    };

    localStorage.setItem('authData', JSON.stringify(authData));
    return authData;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else {
      throw new Error('Login failed: ' + error.message);
    }
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/Auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });

    return response.data?.isValid === true;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired or unauthorized - handled by interceptor
      }
    }

    return false;
  }
};

export const register = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/Auth/register`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else {
      throw new Error('Registration failed: ' + error.message);
    }
  }
};

export const getAuthData = () => {
  const authData = localStorage.getItem('authData');
  return authData ? JSON.parse(authData) : null;
};

export const getCurrentUserId = () => {
  const authData = getAuthData();
  return authData?.userId || null;
};

export const getRouteRoles = () => {
  const authData = getAuthData();
  return authData?.routeRoles || null;
};

export const logout = async () => {
  try {
    const authData = getAuthData();
    if (authData?.token) {
      // Call the backend logout endpoint if it exists
      try {
        await axios.post(`${API_URL}/Auth/logout`, {}, {
          headers: { Authorization: `Bearer ${authData.token}` },
          timeout: 5000
        });
      } catch (error) {
        // If backend logout fails, we still want to clear local storage
      }
    }
    
    // Clear local storage regardless of backend response
    localStorage.removeItem('authData');
    sessionStorage.removeItem('loginEmail');
    sessionStorage.removeItem('loginPassword');
    
    return true;
  } catch (error) {
    // Even if there's an error, clear local storage
    localStorage.removeItem('authData');
    sessionStorage.removeItem('loginEmail');
    sessionStorage.removeItem('loginPassword');
    return false;
  }
};
