import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './UserMaintenanceRequests.css'; // We'll create this CSS file

const UserMaintenanceRequests = () => {
  const { isAuthenticated, userId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [comments, setComments] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchRequests();
    }
  }, [isAuthenticated, userId]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/api/MaintenanceRequest/my-requests?userId=${userId}`);
      setRequests(response.data);
    } catch (err) {
      setError('Failed to load maintenance requests. Please try again.');
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      setDetailLoading(true);
      const [statusResponse, commentsResponse] = await Promise.all([
        api.get(`/api/MaintenanceRequest/${requestId}/workflow-status`),
        api.get(`/api/MaintenanceRequest/${requestId}/comments`)
      ]);
      setWorkflowStatus(statusResponse.data);
      setComments(commentsResponse.data);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Failed to load request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    fetchRequestDetails(request.id);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setWorkflowStatus(null);
    setComments(null);
  };

const getStatusBadge = (status) => {
  let className = 'status-badge ';
  switch (status) {
    case 'Pending':
      className += 'pending';
      break;
    case 'Completed':
      className += 'completed';
      break;
    case 'InProgress':
      className += 'in-progress';
      break;
    case 'Cancelled':
      className += 'cancelled';
      break;
    case 'Rejected':
      className += 'rejected';
      break;
    default:
      className += 'default';
  }
  return <span className={className}>{status}</span>;
};
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageSteps = () => {
    const allStages = ['Create', 'Comment', 'Review', 'Commit', 'Approve'];
    return allStages.map((stage) => ({
      label: stage,
      completed: workflowStatus?.completedActions[stage] !== undefined,
      active: workflowStatus?.currentStage === stage
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-message">
        <p>Please sign in to view your maintenance requests.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={fetchRequests}>
          <span className="refresh-icon">↻</span> Retry
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state-maintenance">
        <div className="empty-icon">🛠️</div>
        <h3>No Maintenance Requests Found</h3>
        <p>You have no pending maintenance requests. When you do, they'll appear here with their current status and details.</p>
      </div>
    );
  }

  return (
    <div className="maintenance-requests-container">
      <div className="requests-list">
        <div className="list-header">
          <h2>My Maintenance Requests</h2>
          <button 
            className="refresh-button" 
            onClick={fetchRequests} 
            disabled={isLoading}
          >
            {isLoading ? <span className="mini-spinner"></span> : '↻'}
          </button>
        </div>
        
        <div className="requests-scroll-container">
          {requests.map((request) => (
            <div 
              key={request.id} 
              className="request-card"
              onClick={() => handleRequestClick(request)}
            >
              <div className="request-header">
                <h4>
                  {request.vehicleMake} {request.vehicleModel}
                  <span className="license-plate">({request.licensePlate})</span>
                </h4>
                <div className='ckgmech'>
                <span className="request-date">
                  {new Date(request.requestDate).toLocaleDateString()}
                </span>
                                  {request.priority && (
                    <span className={`priority-badge ${request.priority.toLowerCase()}`}>
                      Priority: {request.priority}
                    </span>
                  )}
                  </div>
              </div>
              
              <p className="request-description">
                {request.description}
              </p>
              
              <div className="request-footer">
                <span className={`request-type ${request.requestType.toLowerCase()}`}>
                  {request.requestType}
                </span>
                <div className="status-container">
                  {getStatusBadge(request.status)}

                  <span className="view-details">View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRequest && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>Maintenance Request Details</h3>
              <button className="close-button" onClick={handleCloseDetails}>
                ×
              </button>
            </div>

            <div className="modal-content">
              {detailLoading ? (
                <div className="detail-loading">
                  <div className="spinner"></div>
                </div>
              ) : (
                <>
                  <div className="workflow-section">
                    <h4>Workflow Progress</h4>
                    <div className="stepper">
                      {getStageSteps().map((step, index) => (
                        <div 
                          key={index} 
                          className={`step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
                        >
                          <div className="step-icon">
                            {step.completed ? '✓' : index + 1}
                          </div>
                          <div className="step-label">{step.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="details-grid">
                    <div className="request-info">
                      <h4>
                        <span className="info-icon">ℹ️</span>
                        Request Information
                        <div className="status-display">
                          {getStatusBadge(selectedRequest?.status)}
                        </div>
                      </h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Request Date</label>
                          <p>{formatDate(selectedRequest?.requestDate)}</p>
                        </div>
                        <div className="info-item">
                          <label>Request Type</label>
                          <p>{selectedRequest?.requestType}</p>
                        </div>
                        <div className="info-item">
                          <label>Vehicle Details</label>
                          <p>
                            {selectedRequest?.vehicleMake} {selectedRequest?.vehicleModel} 
                            ({selectedRequest?.licensePlate})
                          </p>
                        </div>
                        <div className="info-item">
                          <label>Description</label>
                          <p>{selectedRequest?.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pending-actions">
                      <h4><span className="action-icon">⏳</span> Pending Actions</h4>
                      {workflowStatus?.pendingActions?.length > 0 ? (
                        <div className="actions-list">
                          {workflowStatus.pendingActions.map((action, index) => (
                            <div key={index} className="action-item">
                              <div className="user-avatar">
                                {action.userName.charAt(0)}
                              </div>
                              <div className="user-info">
                                <strong>{action.userName}</strong>
                                <span>{action.role}</span>
                              </div>
                              {action.isPending && (
                                <span className="pending-tag">Pending Approval</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-actions">
                          <span className="check-icon">✓</span>
                          <p>No pending actions</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="comments-section">
                    <h4><span className="comments-icon">💬</span> Comments History</h4>
                    {comments?.comments?.length > 0 ? (
                      <div className="comments-list">
                        {comments.comments.map((comment, index) => (
                          <div key={index} className="comment-item">
                            <div className="comment-header">
                              <div className="comment-user">
                                <div className="user-avatar">
                                  {comment.userName.charAt(0)}
                                </div>
                                <div>
                                  <strong>{comment.userName}</strong>
                                  <span>{comment.role || 'System User'}</span>
                                </div>
                              </div>
                              <span className="comment-date">
                                {formatDate(comment.timestamp)}
                              </span>
                            </div>
                            <p className="comment-text">{comment.comment}</p>
                            <div className="comment-footer">
                              <span className="stage-tag">Stage: {comment.stage}</span>
                              {comment.isFinalDecision && (
                                <span className="final-tag">Final Decision</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-comments">
                        <span className="info-icon">ℹ️</span>
                        <p>No comments available for this request</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMaintenanceRequests;