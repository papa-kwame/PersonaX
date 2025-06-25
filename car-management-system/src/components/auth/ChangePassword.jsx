import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarHome from '../shared/NavbarHome';
import { Toast, ToastContainer, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

export default function ChangePasswordOnFirstLogin() {
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Spinner loader state

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('loginEmail');
    const savedPassword = sessionStorage.getItem('loginPassword');

    if (savedEmail && savedPassword) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        currentPassword: savedPassword
      }));
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowToast(false);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setToastMessage('New passwords do not match.');
      setShowToast(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/api/auth/change-password-on-first-login', {
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      // Remove sensitive data after password change
      sessionStorage.removeItem('loginEmail');
      sessionStorage.removeItem('loginPassword');

      setToastMessage('Password changed successfully. Please log in with your new password.');
      setShowToast(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Password change error:', err);
      const msg = err?.response?.data?.message || err?.response?.data || err.message || 'Password change failed. Please try again.';
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
          {isLoading ? (
            <div className="d-flex flex-column align-items-center justify-content-center p-4">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3 text-center">
                Welcome! This is your first login.<br />
                Please change your default password to continue.
              </p>
            </div>
          ) : (
            <>
              <h2 className="login-title">Change Password</h2>
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
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmNewPassword"
                    placeholder="Confirm your new password"
                    value={formData.confirmNewPassword}
                    onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  className="btn login-btn w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} bg="danger" delay={5000} autohide>
          <Toast.Header closeButton>
            <strong className="me-auto text-danger">Change Password</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
