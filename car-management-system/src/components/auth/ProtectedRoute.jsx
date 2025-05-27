import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, hasRole, userRoles } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Not logged in → redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const path = location.pathname;

  // Role-based route enforcement
  const routeAccess = {
    '/dashboard': 'Admin',
    '/admin': 'Admin',
    '/mechanic': 'Mechanic',
    '/userdashboard': 'User',
  };

  for (const prefix in routeAccess) {
    if (path.startsWith(prefix) && !hasRole(routeAccess[prefix])) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If the route requires specific roles, enforce them
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
