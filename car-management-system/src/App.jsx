import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Home from './pages/Home';
import Login from './components/auth/Login';
import Unauthorized from './pages/Unauthorized';

import Layout from './components/shared/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleNewPage from './components/vehicles/VehicleNewPage';
import VehicleShowPage from './components/vehicles/VehicleShowPage';
import Assignments from './pages/Assignments';

import Maintenance from './pages/Maintenance';

import Approvals from './pages/Approvals';
import MechanicDashboard from './pages/MechanicDashboard';

import Admin from './pages/Admin';
import AdminUsers from './components/admin/AdminUsers';
import AdminSettings from './components/admin/AdminSettings';
import AdminAudit from './components/admin/AdminAudit';
import AdminReports from './components/admin/AdminReports';
import  AdminRoles from './components/admin/RoleManagementPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import RouteManagementPage from './components/admin/RouteManagementPage';
import VehicleEditForm from './components/vehicles/VehicleEditForm';
import RegisterPage from './components/auth/RegisterPage';
import UserDashboard from './components/users/UserDashboard';
import AssignmentHistory from './components/assignments/AssignmentHistory';
import NotificationButton from './components/users/Notifications';
import VehicleAssignmentApp from './components/assignments/UserAssignments';


function App() {
  return (
    <AuthProvider>

      <Router>
        <Routes>
          {/* Public */}
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />


          <Route path='/notification' element={<NotificationButton/>} />
          
          <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/userdashboard" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><UserDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/vehicles/new" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><VehicleNewPage /></Layout>
            </ProtectedRoute>
          } />
        
          <Route path="/vehicles/:id" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><VehicleShowPage /></Layout>
            </ProtectedRoute>
          } />

         <Route path="/requestsss" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><VehicleAssignmentApp /></Layout>
            </ProtectedRoute>
          } />
  
            <Route path="/vehicles/:id/edit" element={
    <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><VehicleEditForm /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/vehicles" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><Assignments /></Layout>
            </ProtectedRoute>
          } />
                  <Route path="/assignments/:id/history" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><AssignmentHistory /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/maintenance" element={
            <ProtectedRoute requiredRoles={['User', 'Admin']}>
              <Layout><Maintenance /></Layout>
            </ProtectedRoute>
          } />
       ,
          

          <Route path="/approvals" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><Approvals /></Layout>
            </ProtectedRoute>
          } />

          {/* Mechanic */}
          <Route path="/mechanic" element={
            <ProtectedRoute requiredRoles={['Mechanic']}>
              <MechanicDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><Admin /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><AdminUsers /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/routes" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><RouteManagementPage/></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/roles" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><AdminRoles /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><AdminSettings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/audit" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><AdminAudit /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <Layout><AdminReports /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
