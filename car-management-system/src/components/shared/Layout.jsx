import Navbar from './Navbar';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Layout({ children }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      overflow: 'hidden' 
    }}>
      {/* Fixed Navbar */}
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>

      {/* Main content area with sidebar + scrollable content */}
      <div style={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden',
        position: 'relative' // Needed for sticky sidebar
      }}>
        {/* Sidebar - now properly sticky */}
        <Sidebar />
        
        {/* Scrollable main content */}
        <div style={{ 
          flexGrow: 1, 
          padding: '1rem', 
          overflowY: 'auto',
          backgroundColor: '#f8f9fa' // Light gray background
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}