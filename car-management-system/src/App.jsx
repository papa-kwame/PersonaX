import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import AdminRoles from './components/admin/RoleManagementPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import RouteManagementPage from './components/admin/RouteManagementPage';
import VehicleEditForm from './components/vehicles/VehicleEditForm';
import RegisterPage from './components/auth/RegisterPage';
import UserDashboard from './components/users/UserDashboard';
import AssignmentHistory from './components/assignments/AssignmentHistory';
import NotificationButton from './components/users/Notifications';
import VehicleAssignmentApp from './components/assignments/UserAssignments';
import AdminFuelLogger from './components/admin/AdminFuelLogger';
import ChangePasswordOnFirstLogin from './components/auth/ChangePassword';
import SchedulePage from './components/new components/Schedule';
import VehicleForm from './components/vehicles/VehicleForm';
import CompleteInvoiceForm from './components/new components/InvoiceForm';
import MaintenanceSchedulesPage from './components/new components/MaintenanceSchedulesPage';
import LayoutUser from './components/shared/LayoutUser';

function RequirePasswordChange({ children }) {
  const { mustChangePassword } = useAuth();
  const location = useLocation();
  const allowed = ["/", "/login", "/change-password"];

  if (mustChangePassword && !allowed.includes(location.pathname)) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RequirePasswordChange>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePasswordOnFirstLogin />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/notification" element={<NotificationButton />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/dashboard" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            
                        <Route path="/schedule" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><SchedulePage /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/userdashboard" element={
              <ProtectedRoute requiredRoles={['User']}>
                <LayoutUser><UserDashboard /></LayoutUser>
              </ProtectedRoute>
            } />

            <Route path="/vehicles/new" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><VehicleForm /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/vehicles/:id" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><VehicleShowPage /></Layout>
              </ProtectedRoute>
            } />
 
            <Route path="/mechanic" element={
              <ProtectedRoute requiredRoles={['Mechanic']}>
                <Layout><MaintenanceSchedulesPage /></Layout>
              </ProtectedRoute>
            } />
          
            <Route path="/requestsss" element={
              <ProtectedRoute requiredRoles={['User', 'Admin']}>
                <Layout><VehicleAssignmentApp /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/vehicles/:id/edit" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><VehicleEditForm /></Layout>
              </ProtectedRoute>
            } />
 
            <Route path="/vehicles" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><Assignments /></Layout>
              </ProtectedRoute>
            } />


            <Route path="/invoicing" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><CompleteInvoiceForm /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/assignments/:id/history" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><AssignmentHistory /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/maintenance" element={
              <ProtectedRoute requiredRoles={['User', 'Admin']}>
                <Layout><Maintenance /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/approvals" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><Approvals /></Layout>
              </ProtectedRoute>
            } />

            <Route path="/mechanic" element={
              <ProtectedRoute requiredRoles={['Mechanic']}>
                <MechanicDashboard/>
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
                <Layout><RouteManagementPage /></Layout>
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

            <Route path="/admin/logger" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><AdminFuelLogger /></Layout>
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
        </RequirePasswordChange>
      </Router>
    </AuthProvider>
  );
}

export default App;
