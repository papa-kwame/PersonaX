import { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../services/auth';
import { jwtDecode } from 'jwt-decode';
import activityService from '../services/activityService';
import inactivityService from '../services/inactivityService';
import InactivityWarningModal from '../components/auth/InactivityWarningModal';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authData = localStorage.getItem('authData');
    return authData ? Boolean(JSON.parse(authData).token) : false;
  });
  const [userRoles, setUserRoles] = useState(() => {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData).roles || [] : [];
  });
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [inactivityCountdown, setInactivityCountdown] = useState(30);

  const hasRole = (role) => userRoles.includes(role);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      console.log('🔍 Starting authentication check...');
      try {
        const authData = localStorage.getItem('authData');
        console.log('📦 Auth data from localStorage:', authData ? 'Found' : 'Not found');
        
        if (authData) {
          const { token } = JSON.parse(authData);
          console.log('🎫 Token found:', token ? 'Yes' : 'No');
          
        if (token) {
          // First, try to decode the token locally to check if it's valid
          try {
            const decoded = jwtDecode(token);
            console.log('🔓 Token decoded successfully');
            
            const userId = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || null;
            const email = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || null;
            const username = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;

            // Check if token is expired
            const currentTime = Date.now() / 1000;
            console.log('⏰ Current time:', currentTime, 'Token exp:', decoded.exp);
            
            if (decoded.exp && decoded.exp < currentTime) {
              // Token is expired, clear it
              console.log('❌ Token expired, clearing auth data');
              localStorage.removeItem('authData');
              setIsAuthenticated(false);
              setUserId(null);
              setUserEmail(null);
              setUsername(null);
            } else {
              // Token appears valid locally, set user data
              console.log('✅ Token valid, setting user as authenticated');
              setIsAuthenticated(true);
              setUserId(userId);
              setUserEmail(email);
              setUsername(username);
              
              // Start activity tracking for existing authenticated session
              activityService.startActivityTracking();
              
              // Skip backend verification for now to prevent logout issues
              // The token will be validated when making actual API calls
              console.log('User authenticated locally, skipping backend verification');
            }
          } catch (decodeError) {
            // Token is malformed, clear it
            console.log('❌ Token decode error:', decodeError.message);
            localStorage.removeItem('authData');
            setIsAuthenticated(false);
            setUserId(null);
            setUserEmail(null);
            setUsername(null);
          }
        } else {
          console.log('❌ No token found in auth data');
          setIsAuthenticated(false);
          setUserId(null);
          setUserEmail(null);
          setUsername(null);
        }
      } else {
        console.log('❌ No auth data found');
        setIsAuthenticated(false);
        setUserId(null);
        setUserEmail(null);
        setUsername(null);
      }
      } catch (error) {
        // Auth check failed - silently handle error and clear invalid data
        console.warn('❌ Authentication check failed:', error.message);
        localStorage.removeItem('authData');
        setIsAuthenticated(false);
        setUserId(null);
        setUserEmail(null);
        setUsername(null);
      } finally {
        if (active) {
          console.log('🏁 Authentication check complete, setting loading to false');
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    return () => { active = false; };
  }, []);

  // Effect to handle activity tracking when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      activityService.startActivityTracking();
      // Start inactivity monitoring
      inactivityService.setCallbacks({
        onInactivityWarning: (countdown) => {
          setShowInactivityWarning(true);
          if (countdown !== undefined) {
            setInactivityCountdown(countdown);
          }
        },
        onLogout: () => {
          logout();
        },
        onStayLoggedIn: () => {
          setShowInactivityWarning(false);
          setInactivityCountdown(30);
        }
      });
      inactivityService.start();
    } else {
      activityService.stopActivityTracking();
      inactivityService.stop();
      setShowInactivityWarning(false);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      activityService.stopActivityTracking();
      inactivityService.stop();
    };
  }, [isAuthenticated]);

  const login = (authData) => {
    // Store the complete authData object in localStorage (already done by auth service)
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

    // Start activity tracking after successful login
    activityService.startActivityTracking();
  };

  const logout = async () => {
    // Stop activity tracking and logout from backend
    await activityService.logout();
    
    // Stop inactivity monitoring
    inactivityService.stop();
    
    // Use the auth service logout function which handles both API call and localStorage cleanup
    const { logout: authLogout } = await import('../services/auth');
    await authLogout();
    
    setIsAuthenticated(false);
    setUserRoles([]);
    setUserId(null);
    setUserEmail(null);
    setUsername(null);
    setMustChangePassword(false);
    setShowInactivityWarning(false);
  };

  const handleStayLoggedIn = () => {
    inactivityService.stayLoggedIn();
  };

  const handleLogoutNow = () => {
    inactivityService.performLogout();
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
      <InactivityWarningModal
        isOpen={showInactivityWarning}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleLogoutNow}
        countdown={inactivityCountdown}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
