// components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullPage = false }) => {
  // Size options: sm, md, lg
  const spinnerSize = {
    sm: { width: '1.5rem', height: '1.5rem', borderWidth: '3px' },
    md: { width: '3rem', height: '3rem', borderWidth: '5px' },
    lg: { width: '5rem', height: '5rem', borderWidth: '7px' }
  };

  return (
    <div className={`loading-spinner-container${fullPage ? ' overlay' : ''}`}> 
      <div
        className="spinner-circle"
        style={spinnerSize[size]}
        role="status"
      ></div>
      {text && (
        <div className="spinner-text">{text}</div>
      )}
    </div>
  );
};

export default LoadingSpinner;