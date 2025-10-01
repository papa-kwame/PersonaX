import React, { useState, useEffect } from 'react';
import './InactivityWarningModal.css';

const InactivityWarningModal = ({ isOpen, onStayLoggedIn, onLogout, countdown }) => {
  if (!isOpen) return null;

  return (
    <div className="inactivity-modal-overlay">
      <div className="inactivity-modal">
        <div className="inactivity-modal-header">
          <h3>Session Timeout Warning</h3>
        </div>
        <div className="inactivity-modal-body">
          <div className="warning-icon">⚠️</div>
          <p>You have been inactive for a while.</p>
          <p>You will be automatically logged out in:</p>
          <div className="countdown-timer">
            <span className="countdown-number">{countdown}</span>
            <span className="countdown-text">seconds</span>
          </div>
        </div>
        <div className="inactivity-modal-footer">
          <button 
            className="btn-stay-logged-in" 
            onClick={onStayLoggedIn}
          >
            Stay Logged In
          </button>
          <button 
            className="btn-logout-now" 
            onClick={onLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarningModal;





