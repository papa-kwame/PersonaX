import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavbarHome from '../shared/NavbarHome';
import FloatingShapes from '../shared/FloatingShapes';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // Ensure you have the appropriate styling

const Register = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    department: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('danger'); // 'danger' or 'success'
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const navigate = useNavigate();

  // Fetch departments from backend API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('https://localhost:7092/api/Routes/departments');
        // Filter out 'Default' department for registration
        const filteredDepartments = response.data.filter(dept => dept !== 'Default');
        setDepartments(filteredDepartments);
      } catch (error) {
        // Fallback to hardcoded list if API fails
        setDepartments([
          'Audit',
          'Business Development',
          'Consulting',
          'Customer Support',
          'Finance',
          'HR',
          'Legal',
          'Management',
          'Operations',
          'Software',
          'Support',
          'Systems Integration'
        ]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowToast(false);

    if (formData.password !== formData.confirmPassword) {
      setToastMessage('Passwords do not match.');
      setToastType('danger');
      setShowToast(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const registrationData = {
        userName: formData.userName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        department: formData.department
      };

      // Replace with your actual API endpoint
      const response = await axios.post('https://localhost:7092/api/Auth/register', registrationData);
      // Show success toast
      setToastMessage('Registration successful! Redirecting to login page...');
      setToastType('success');
      setShowToast(true);
      
      // Redirect after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
      
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setToastMessage(msg);
      setToastType('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavbarHome />
      <div className="login-page" style={{ position: 'relative' }}>
        <FloatingShapes />
        <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="login-title">Create Account</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-3">
              <label htmlFor="userName" className="form-label">User Name</label>
              <input
                type="text"
                className="form-control"
                id="userName"
                placeholder="Enter your user name"
                value={formData.userName}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Enter your e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="department" className="form-label">Department</label>
              <select
                className="form-control"
                id="department"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={isSubmitting || loadingDepartments}
              >
                <option value="">
                  {loadingDepartments ? 'Loading departments...' : 'Select your Department'}
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="btn login-btn w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Sign Up'}
            </button>
          </form>
          <div className="signup-link">
            <small>
              Already have an account? <a href="/login">Sign in</a>
            </small>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          bg={toastType} 
          delay={5000} 
          autohide
        >
          <Toast.Header closeButton>
            <strong className="me-auto">
              {toastType === 'success' ? 'Registration Success' : 'Registration Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toastType === 'success' ? 'text-white' : 'text-white'}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default Register;