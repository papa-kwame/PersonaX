import React from 'react';
import { format } from 'date-fns';

const MechanicWorkOrders = ({ requests, onComplete }) => {
  return (
    <div className="work-orders-container">
      {requests.length === 0 ? (
        <div className="empty-work-orders">
          <div className="empty-icon">
            <i className="bi bi-check2-all"></i>
          </div>
          <h3>No work orders assigned</h3>
          <p>All caught up! Enjoy your free time or check pending quotes.</p>
        </div>
      ) : (
        <div className="work-orders-grid">
          {requests.map(request => (
            <div key={request.id} className="work-order-card">
              <div className="work-order-header">
                <div className="order-number">
                  <span>WO-</span>
                  {request.id.split('-')[1]}
                </div>
                <div className="order-status in-progress">
                  <i className="bi bi-arrow-repeat"></i>
                  In Progress
                </div>
              </div>
              
              <div className="vehicle-info">
                <div className="vehicle-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <div className="vehicle-details">
                  <h4>{request.vehicleId}</h4>
                  <p>{request.department} Department</p>
                </div>
              </div>
              
              <div className="repair-details">
                <div className="detail-group">
                  <label>Issue</label>
                  <p>{request.issueDescription}</p>
                </div>
                
                <div className="detail-group">
                  <label>Started</label>
                  <p>{format(new Date(request.workStartedAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              
              <div className="quote-summary">
                <h5>Approved Quote</h5>
                <div className="quote-details">
                  <div className="quote-item">
                    <span>Labor</span>
                    <strong>${request.quote?.laborCost.toFixed(2)}</strong>
                  </div>
                  <div className="quote-item">
                    <span>Parts</span>
                    <strong>${request.quote?.partsCost.toFixed(2)}</strong>
                  </div>
                  <div className="quote-item total">
                    <span>Total</span>
                    <strong>${request.quote?.totalCost.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
              
              <div className="work-order-actions">
                <button 
                  className="complete-btn"
                  onClick={() => onComplete(request.id)}
                >
                  <i className="bi bi-check-circle"></i> Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MechanicWorkOrders;