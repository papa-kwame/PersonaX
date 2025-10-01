import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import PerformanceDashboard from './PerformanceDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

export default function Layout({ children }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const authData = JSON.parse(localStorage.getItem('authData')) || {};

  const hasRole = (role) => authData?.roles?.includes(role);
  const hasRouteRoles = Array.isArray(authData?.routeRoles) && authData.routeRoles.length > 0;

  const shouldShowSidebar = hasRole('Admin') || hasRouteRoles;

  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded);
  };

  // Keyboard shortcut for performance dashboard (Ctrl+M)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Ctrl+M is pressed
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault(); // Prevent browser default behavior
        if (hasRole('Admin')) {
          setShowPerformanceDashboard(prev => !prev);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasRole]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      overflow: 'hidden' 
    }}>
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>

      <div style={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden',
        position: 'relative' 
      }}>
        {shouldShowSidebar && (
          <Sidebar onSidebarToggle={handleSidebarToggle} />
        )}

        <div style={{ 
          flexGrow: 1, 
          padding: '1rem', 
          paddingTop: '10px',
          backgroundColor: '#f8f9fa', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: shouldShowSidebar ? 'flex-start' : 'center',
          alignItems: shouldShowSidebar ? 'flex-start' : 'center',
          transition: 'margin-left 0.3s ease-in-out',
          marginLeft: shouldShowSidebar && !sidebarExpanded ? '0 ' : '0px'
        }}>
          <Breadcrumbs />
          <div style={{
            width: '100%',
            minWidth: shouldShowSidebar ? '100%' : '1800px', 
            margin: '0 auto',
            maxWidth: '100%'
          }}>
            {React.cloneElement(children, { sidebarExpanded })}
          </div>
        </div>
      </div>

      {/* Performance Dashboard Overlay */}
      {hasRole('Admin') && (
        <PerformanceDashboard 
          isOpen={showPerformanceDashboard} 
          onClose={() => setShowPerformanceDashboard(false)} 
        />
      )}
    </div>
  );
}
