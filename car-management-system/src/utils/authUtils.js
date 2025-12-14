// Authentication utility functions
export const getAuthData = () => {
  try {
    const authData = localStorage.getItem('authData');
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getToken = () => {
  const authData = getAuthData();
  return authData?.token || null;
};

export const getUserId = () => {
  const authData = getAuthData();
  return authData?.userId || null;
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const clearAuthData = () => {
  localStorage.removeItem('authData');
  localStorage.removeItem('token'); // Legacy cleanup
  localStorage.removeItem('userId'); // Legacy cleanup
};














