// components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullPage = false }) => {
  // Size options: sm, md, lg
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg' // Note: Bootstrap 5 doesn't have lg by default, we'll handle this
  };

  const spinnerSize = {
    sm: { width: '1.5rem', height: '1.5rem' },
    md: { width: '3rem', height: '3rem' },
    lg: { width: '5rem', height: '5rem' }
  };

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center ${fullPage ? 'vh-100' : ''}`}>
      <div 
        className="spinner-border text-primary" 
        style={spinnerSize[size]}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <div className="mt-2 text-muted">
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;