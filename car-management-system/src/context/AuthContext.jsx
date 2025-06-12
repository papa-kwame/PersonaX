import { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../services/auth';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [userRoles, setUserRoles] = useState(() => JSON.parse(localStorage.getItem('roles')) || []);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasRole = (role) => userRoles.includes(role);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const isValid = await verifyToken(token);
          if (!active) return;

          setIsAuthenticated(isValid);
          if (isValid) {
            const decoded = jwtDecode(token);
            const userId = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
            const email = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null;
            const username = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;

            setUserId(userId);
            setUserEmail(email);
            setUsername(username);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('roles');
            setUserId(null);
            setUserEmail(null);
            setUsername(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    checkAuth();
    return () => { active = false; };
  }, []);

  const login = (authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('roles', JSON.stringify(authData.roles));
    setIsAuthenticated(true);
    setUserRoles(authData.roles);
    setError(null);

    const decoded = jwtDecode(authData.token);
    const userId = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
    const email = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null;
    const username = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;

    setUserId(userId);
    setUserEmail(email);
    setUsername(username);

    // Set the mustChangePassword flag
    setMustChangePassword(authData.mustChangePassword === true || authData.mustChangePassword === 'true');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    setIsAuthenticated(false);
    setUserRoles([]);
    setUserId(null);
    setUserEmail(null);
    setUsername(null);
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRoles,
        hasRole,
        isLoading,
        error,
        login,
        logout,
        userId,
        userEmail,
        username,
        mustChangePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
