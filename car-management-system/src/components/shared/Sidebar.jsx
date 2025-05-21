import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const { hasRole } = useAuth();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showMaintenanceMenu, setShowMaintenanceMenu] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  let menuItems = [
    { path: '/vehicles', icon: 'bi-car-front', label: 'Vehicles', roles: ['Admin'] },
  ];

  if (hasRole('Admin')) {
    menuItems.unshift({
      path: '/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      roles: ['Admin'],
    });
  } else if (hasRole('User')) {
    menuItems.unshift({
      path: '/userdashboard',
      icon: 'bi-speedometer2',
      label: 'User Dashboard',
      roles: ['User'],
    });
  }
  
  const maintenanceMenuItems = [
    { path: '/maintenance', icon: 'bi-list', label: 'Maintenance Requests' },
    { path: '/requestsss', icon: 'bi-clock-history', label: 'Vehicle Requests' },
  ];

  const adminMenuItems = [
    { path: '/admin/users', icon: 'bi-people', label: 'User Management' },
    { path: '/admin/roles', icon: 'bi-person-badge', label: 'Role Management' },
    { path: '/admin/routes', icon: 'bi-signpost', label: 'Routes' },
  ];


  return (
    <div
      className={`sidebar bg-white border-end shadow-sm d-flex flex-column ${className}`}
      style={{
        width: '280px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        padding: '1.5rem 1rem',
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      <ul className="nav flex-column gap-2">
        {menuItems.map((item) =>
          item.roles.some(role => hasRole(role)) && (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center px-3 py-2 rounded fw-medium ${
                  isActive(item.path) ? 'bg-primary text-white' : 'text-dark'
                }`}
              >
                <i className={`bi ${item.icon} me-3 fs-5`} />
                {item.label}
              </Link>
            </li>
          )
        )}

{(hasRole('Admin') || hasRole('User') || hasRole('Mechanic')) && (
          <li className="nav-item mt-2">
            <button
              className={`btn w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded fw-medium ${
                isActive('/maintenance') || showMaintenanceMenu ? 'bg-primary text-white' : 'text-dark'
              }`}
              onClick={() => setShowMaintenanceMenu(prev => !prev)}
            >
              <span className="d-flex align-items-center">
                <i className="bi bi-box-arrow-in-right me-3 fs-5" />
                Maintenance
              </span>
              <i className={`bi ${showMaintenanceMenu ? 'bi-chevron-up' : 'bi-chevron-down'} fs-6`} />
            </button>

            {showMaintenanceMenu && (
              <ul className="mt-2 ms-3 ps-2 border-start">
                {maintenanceMenuItems.map((item) => (
                  <li key={item.path} className="nav-item mb-1">
                    <Link
                      to={item.path}
                      className={`nav-link d-flex align-items-center ${
                        isActive(item.path) ? 'bg-primary text-white' : 'text-dark'
                      }`}
                    >
                      <i className={`bi ${item.icon} me-2`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}
        {hasRole('Admin') && (
          <li className="nav-item mt-4">
            <button
              className={`btn w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded fw-medium ${
                isActive('/admin') || showAdminMenu ? 'bg-primary text-white' : 'text-dark'
              }`}
              onClick={() => setShowAdminMenu(prev => !prev)}
            >
              <span className="d-flex align-items-center">
                <i className="bi bi-shield-lock me-3 fs-5" />
                Admin
              </span>
              <i className={`bi ${showAdminMenu ? 'bi-chevron-up' : 'bi-chevron-down'} fs-6`} />
            </button>

            {showAdminMenu && (
              <ul className="mt-2 ms-3 ps-2 border-start">
                {adminMenuItems.map((item) => (
                  <li key={item.path} className="nav-item mb-1">
                    <Link
                      to={item.path}
                      className={`nav-link d-flex align-items-center ${
                        isActive(item.path) ? 'bg-primary text-white' : 'text-dark'
                      }`}
                    >
                      <i className={`bi ${item.icon} me-2`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        )}

      </ul>
    </div>
  );
}
