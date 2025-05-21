// components/LoadingSpinner.js
import React from 'react';
import '../styles/Approvals.css';

const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="loading-spinner">
      <div className="spinner-circle"></div>
      <div className="spinner-text">Loading...</div>
    </div>
  </div>
);
export default LoadingSpinner;