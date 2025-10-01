import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./components/auth/Login'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

const Layout = lazy(() => import('./components/shared/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const VehicleNewPage = lazy(() => import('./components/vehicles/VehicleNewPage'));
const VehicleShowPage = lazy(() => import('./components/vehicles/VehicleShowPage'));
const Assignments = lazy(() => import('./pages/Assignments'));

const Maintenance = lazy(() => import('./pages/Maintenance'));

const Approvals = lazy(() => import('./pages/Approvals'));
const MechanicDashboard = lazy(() => import('./pages/MechanicDashboard'));

const Admin = lazy(() => import('./pages/Admin'));
const AdminUsers = lazy(() => import('./components/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'));
const AdminAudit = lazy(() => import('./components/admin/AdminAudit'));
const AdminReports = lazy(() => import('./components/admin/AdminReports'));
const AdminRoles = lazy(() => import('./components/admin/RoleManagementPage'));

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import PerformanceDashboard from './components/shared/PerformanceDashboard';

const RouteManagementPage = lazy(() => import('./components/admin/RouteManagementPage'));
const VehicleEditForm = lazy(() => import('./components/vehicles/VehicleEditForm'));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage'));
const UserDashboard = lazy(() => import('./components/users/UserDashboard'));
const AssignmentHistory = lazy(() => import('./components/assignments/AssignmentHistory'));
const NotificationButton = lazy(() => import('./components/users/Notifications'));
const VehicleAssignmentApp = lazy(() => import('./components/assignments/UserAssignments'));
const AdminFuelLogger = lazy(() => import('./components/admin/AdminFuelLogger'));
const ChangePasswordOnFirstLogin = lazy(() => import('./components/auth/ChangePassword'));
const SchedulePage = lazy(() => import('./components/new components/Schedule'));
const VehicleForm = lazy(() => import('./components/vehicles/VehicleForm'));
const CompleteInvoiceForm = lazy(() => import('./components/new components/InvoiceForm'));
const Mechanic = lazy(() => import('./components/new components/Mechanic'));
const LayoutUser = lazy(() => import('./components/shared/LayoutUser'));

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
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading application..." fullPage={true} />}>
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
                <Layout><Mechanic /></Layout>
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
            
            <Route path="/admin/performance" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <Layout><PerformanceDashboard /></Layout>
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
          </Suspense>
        </RequirePasswordChange>
      </Router>
    </AuthProvider>
  );
}

export default App;
