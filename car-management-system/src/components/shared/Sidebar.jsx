import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const { hasRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    admin: false,
    maintenance: false
  });

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Menu configuration
  let menuItems = [
    { path: '/vehicles', icon: 'bi-truck', label: 'Vehicles', roles: ['Admin'] },
  ];

  if (hasRole('Admin')) {
    menuItems.unshift({
      path: '/dashboard',
      icon: 'bi-speedometer',
      label: 'Dashboard',
      roles: ['Admin'],
    });
  } else if (hasRole('User')) {
    menuItems.unshift({
      path: '/userdashboard',
      icon: 'bi-speedometer',
      label: 'User Dashboard',
      roles: ['User'],
    });
  }

  const maintenanceMenuItems = [
    { path: '/maintenance', icon: 'bi-tools', label: 'Maintenance Requests' },
    { path: '/requestsss', icon: 'bi-calendar-check', label: 'Vehicle Requests' },
  ];

  const adminMenuItems = [
    { path: '/admin/users', icon: 'bi-people-fill', label: 'User Management' },
    { path: '/admin/roles', icon: 'bi-shield-lock', label: 'Role Management' },
    { path: '/admin/routes', icon: 'bi-signpost-split-fill', label: 'Routes' },
    { path: '/admin/logger', icon: 'bi-fuel-pump', label: 'Fuel Logger' },
     { path: '/schedule', icon: 'bi-schedule', label: 'Schedule' },
  ];

  const authData = JSON.parse(localStorage.getItem('authData'));
  const hasRouteRoles = Array.isArray(authData?.routeRoles) && authData.routeRoles.length > 0;
  const shouldShowRequestsMenu = hasRole('Admin') || hasRouteRoles;

  return (
    <div
      className={`sidebar d-flex flex-column ${className}`}
      style={{
        width: '280px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        padding: '1.5rem 0.75rem',
        overflowY: 'auto',
        zIndex: 1000,
        background: 'linear-gradient(180deg, #2c3e50 0%, #1a1a2e 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '2px 0 15px rgba(0, 0, 0, 0.2)',
        color: '#f8f9fa',
      }}
    >
      <ul className="nav flex-column gap-2">
        {menuItems.map((item) =>
          item.roles.some(role => hasRole(role)) && (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center px-3 py-2 rounded fw-medium ${
                  isActive(item.path) 
                    ? 'bg-primary text-white shadow' 
                    : 'text-light hover-bg-primary-soft'
                }`}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <i className={`bi ${item.icon} me-3 fs-5`} />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        )}

        {shouldShowRequestsMenu && (
          <li className="nav-item mt-3">
            <button
              className={`btn w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded fw-medium ${
                isActive('/maintenance') || expandedMenus.maintenance 
                  ? 'bg-primary text-white shadow' 
                  : 'text-light hover-bg-primary-soft'
              }`}
              onClick={() => toggleMenu('maintenance')}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
              }}
            >
              <span className="d-flex align-items-center">
                <i className="bi bi-clipboard2-pulse me-3 fs-5" />
                <span>Requests</span>
              </span>
              <i 
                className={`bi ${expandedMenus.maintenance ? 'bi-chevron-up' : 'bi-chevron-down'} fs-6`}
                style={{ transition: 'transform 0.3s ease' }}
              />
            </button>

            <div 
              className="overflow-hidden"
              style={{
                maxHeight: expandedMenus.maintenance ? '200px' : '0',
                transition: 'max-height 0.3s ease-in-out',
              }}
            >
              <ul className="mt-2 ms-4 ps-2" >
                {maintenanceMenuItems.map((item) => (
                  <li key={item.path} className="nav-item mb-2">
                    <Link
                      to={item.path}
                      className={`nav-link d-flex align-items-center px-3 py-2 rounded ${
                        isActive(item.path) 
                          ? 'bg-primary text-white shadow-sm' 
                          : 'text-light hover-bg-primary-soft'
                      }`}
                      style={{
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem',
                      }}
                    >
                      <i className={`bi ${item.icon} me-2`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )}

        {hasRole('Admin') && (
          <li className="nav-item mt-3">
            <button
              className={`btn w-100 text-start d-flex align-items-center justify-content-between px-3 py-2 rounded fw-medium ${
                isActive('/admin') || expandedMenus.admin 
                  ? 'bg-dark text-white shadow' 
                  : 'text-light hover-bg-dark-soft'
              }`}
              onClick={() => toggleMenu('admin')}
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
              }}
            >
              <span className="d-flex align-items-center">
                <i className="bi bi-shield-shaded me-3 fs-5" />
                <span>Admin</span>
              </span>
              <i 
                className={`bi ${expandedMenus.admin ? 'bi-chevron-up' : 'bi-chevron-down'} fs-6`}
                style={{ transition: 'transform 0.3s ease' }}
              />
            </button>

            <div 
              className="overflow-hidden"
              style={{
                maxHeight: expandedMenus.admin ? '300px' : '0',
                transition: 'max-height 0.3s ease-in-out',
              }}
            >
              <ul className="mt-2 ms-4 ps-2">
                {adminMenuItems.map((item) => (
                  <li key={item.path} className="nav-item mb-2">
                    <Link
                      to={item.path}
                      className={`nav-link d-flex align-items-center px-3 py-2 rounded ${
                        isActive(item.path) 
                          ? 'bg-dark text-white shadow-sm' 
                          : 'text-light hover-bg-dark-soft'
                      }`}
                      style={{
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem',
                      }}
                    >
                      <i className={`bi ${item.icon} me-2`} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )}
      </ul>

      <div className="mt-auto mb-3 px-3 py-2 text-muted" style={{ fontSize: '0.8rem' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle me-2"></i>
          <span>v1.0.0</span>
        </div>
      </div>

      <style jsx>{`
        .hover-bg-primary-soft:hover {
          background-color: rgba(13, 110, 253, 0.15) !important;
        }
        .hover-bg-dark-soft:hover {
          background-color: rgba(33, 37, 41, 0.15) !important;
        }
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
        .nav-link {
          position: relative;
        }
        .nav-link:hover {
          transform: translateX(5px);
        }
            ul {
    list-style: none;
    padding-left: 0;
  }
  li::marker {
    display: none;
  }
      `}</style>
    </div>
  );
}