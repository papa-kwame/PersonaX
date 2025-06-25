import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import backgroundImage from '../../assets/3345275.jpg'; // Adjust the path to your image

export default function LayoutUser({ children }) {
  const authData = JSON.parse(localStorage.getItem('authData')) || {};

  const hasRole = (role) => authData?.roles?.includes(role);
  const hasRouteRoles = Array.isArray(authData?.routeRoles) && authData.routeRoles.length > 0;

  const shouldShowSidebar = hasRole('Admin') || hasRouteRoles;

  const containerStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>

      <div style={{
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {shouldShowSidebar && <Sidebar />}

        <div style={{
          flexGrow: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: shouldShowSidebar ? 'flex-start' : 'center'
        }}>
          <div style={{
            width: '100%',
            minWidth: shouldShowSidebar ? '100%' : '1800px',
            margin: '0 auto',
            marginTop:'35px'
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
