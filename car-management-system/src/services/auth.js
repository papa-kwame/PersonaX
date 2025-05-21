import axios from 'axios';

const API_URL = 'https://localhost:7092/api';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    localStorage.setItem('authData', JSON.stringify({
      token: response.data.token,
      roles: response.data.roles,
      userId: response.data.userId
    }));
    return {
      token: response.data.token,
      roles: response.data.roles,
      userId :response.data.userId
    };
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
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000
    });

    return response.data.isValid === true;
  } catch (error) {
    if (error.response) {
      console.error('Server responded with:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Axios config error:', error.message);
    }
    return false;
  }
};

// 🆕 Add this:
export const register = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
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
  return authData?.userId;
};