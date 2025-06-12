import Navbar from './Navbar';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Layout({ children }) {
  // Fetch the user's authData from localStorage
  const authData = JSON.parse(localStorage.getItem('authData')) || {};

  const hasRole = (role) => authData?.roles?.includes(role);
  const hasRouteRoles = Array.isArray(authData?.routeRoles) && authData.routeRoles.length > 0;

  // Determine whether to show Sidebar
  const shouldShowSidebar = hasRole('Admin') || hasRouteRoles;

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
        {shouldShowSidebar && <Sidebar />}

        <div style={{ 
          flexGrow: 1, 
          padding: '1rem', 
          overflowY: 'auto',
          backgroundColor: '#f8f9fa', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: shouldShowSidebar ? 'flex-start' : 'center'
        }}>
          <div style={{
            width: '100%',
            minWidth: shouldShowSidebar ? '100%' : '1800px', // limit width when centered
            margin: '0 auto'
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
