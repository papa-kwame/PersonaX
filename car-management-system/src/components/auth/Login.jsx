import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import NavbarHome from '../shared/NavbarHome';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated, userRoles } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (userRoles.includes('Admin')) {
        navigate('/dashboard', { replace: true });
      } else if (userRoles.includes('Mechanic')) {
        navigate('/mechanic', { replace: true });
      } else if (userRoles.includes('User')) {
        navigate('/userdashboard', { replace: true });
      } else {
        navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, userRoles, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowToast(false);

    try {
      const response = await apiLogin(formData.email, formData.password);
      const { token, roles, mustChangePassword } = response;

      login({ token, roles, mustChangePassword });

      // Save email and password for auto-fill on ChangePasswordOnFirstLogin page
      sessionStorage.setItem('loginEmail', formData.email);
      sessionStorage.setItem('loginPassword', formData.password);

      if (mustChangePassword === true || mustChangePassword === 'true') {
        navigate('/change-password', { replace: true });
      } else if (roles.includes('Admin')) {
        navigate('/dashboard', { replace: true });
      } else if (roles.includes('User')) {
        navigate('/userdashboard', { replace: true });
      }
       else if (roles.includes('Mechanic')) {
        navigate('/mechanic', { replace: true });
      }  else {
        navigate('/unauthorized', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err?.response?.data?.message || err.message || 'Login failed. Please try again.';
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavbarHome />
      <div className="login-page">
        <div className="login-card">
          <h2 className="login-title">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your e-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="btn login-btn w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div className="signup-link">
            <small>
              Don't have an account? <a href="/register">Register</a>
            </small>
          </div>
        </div>
      </div>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} bg="danger" delay={5000} autohide>
          <Toast.Header closeButton>
            <strong className="me-auto text-danger">Login Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
