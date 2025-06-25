import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Modal, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  CarFront,
  Calendar,
  ChatLeftText,
  CheckCircle,
  ClockHistory,
  XCircle,
  Hourglass,
  CardChecklist
} from 'react-bootstrap-icons';
import VehicleRequestForm from './VehicleRequestForm';

const workflowStages = ['Comment', 'Review', 'Commit', 'Approval', 'Completed'];

const statusBadge = (status) => {
  switch (status) {
    case 0:
      return <Badge bg="warning" className="d-flex align-items-center gap-1">
        <Hourglass size={14} /> Pending
      </Badge>;
    case 1:
      return <Badge bg="success" className="d-flex align-items-center gap-1">
        <CheckCircle size={14} /> Approved
      </Badge>;
    case 2:
      return <Badge bg="danger" className="d-flex align-items-center gap-1">
        <XCircle size={14} /> Rejected
      </Badge>;
    default:
      return <Badge bg="secondary" className="d-flex align-items-center gap-1">
        <ClockHistory size={14} /> Unknown
      </Badge>;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const VehicleRequestsComponent = () => {
  const { userId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchVehicleRequests(userId);
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchVehicleRequests = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/VehicleAssignment/MyVehicleRequests/${userId}`);
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching vehicle requests:', err);
      setError('Failed to fetch vehicle requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (requestId) => {
    try {
      setCommentsLoading(true);
      const response = await api.get(`/api/VehicleAssignment/vehicle-requests/${requestId}/comments`);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to fetch comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchWorkflowStatus = async (requestId) => {
    try {
      setWorkflowLoading(true);
      const response = await api.get(`/api/VehicleAssignment/vehicle-requests/${requestId}/workflow-status`);
      setWorkflowStatus(response.data);
    } catch (err) {
      console.error('Error fetching workflow status:', err);
      setError('Failed to fetch workflow status');
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleRequestClick = async (request) => {
    setSelectedRequest(request);
    await fetchComments(request.id);
    await fetchWorkflowStatus(request.id);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '250px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3 rounded">
        {error}
      </Alert>
    );
  }

  return (
    <div className="p-4 bg-white rounded-3 shadow-sm" style={{ minHeight: '250px', maxHeight: '250px', overflowY: 'auto' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="d-flex align-items-center gap-2 mb-0">
          <CarFront className="text-primary" /> My Vehicle Requests
        </h5>
        <VehicleRequestForm className="btn-sm" />
      </div>

      <div className="row">
        <div className="col-12">
          {requests.length === 0 ? (
            <div className="d-flex flex-column align-items-center justify-content-center" 
                 style={{ 
                   height: 'calc(250px - 100px)', // Adjust based on your header height
                   marginTop: '-1rem' // Compensate for padding
                 }}>
              <div className="bg-light rounded-circle p-4 mb-3">
                <CarFront size={32} className="text-muted" />
              </div>
              <h6 className="text-muted mb-2">No vehicle requests found</h6>
              <p className="text-muted small text-center mb-0" style={{ maxWidth: '300px' }}>
                Click the button above to create a new request
              </p>
            </div>
          ) : (
            <div className="list-group list-group-flush border-top border-bottom">
              {requests.map((request) => (
                <button
                  key={request.id}
                  className="list-group-item list-group-item-action p-3 border-0 border-bottom"
                  onClick={() => handleRequestClick(request)}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}>
                      <CarFront size={18} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1 fw-semibold">
                          {request.vehicle?.make || 'No vehicle'} {request.vehicle?.model || ''}
                        </h6>
                        <div className="ms-2">
                          {statusBadge(request.status)}
                        </div>
                      </div>
                      <div className="mb-1">
                        <span className="text-muted small">License: </span>
                        <span className="fw-semibold">{request.vehicle?.licensePlate || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <div className="d-flex align-items-center gap-1 text-muted small">
                          <Calendar size={12} />
                          <span>{formatDate(request.requestDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <CardChecklist className="text-primary" /> Request Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {selectedRequest && (
            <div>
              <div className="card mb-4 border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title text-muted mb-3">REQUEST STATUS</h6>
                  <div className="d-flex flex-column gap-3">
                    <div style={{ overflowX: 'auto' }}>
                      <div className="d-flex justify-content-between position-relative" style={{ width: '100%' }}>
                        <div className="position-absolute top-50 start-0 end-0" style={{ height: '2px', backgroundColor: '#e9ecef', zIndex: 1 }}>
                          <div
                            className="h-100 bg-primary"
                            style={{
                              width: `${((workflowStages.indexOf(workflowStatus?.currentStage) + 1) / workflowStages.length) * 100}%`,
                              transition: 'width 0.3s ease'
                            }}
                          ></div>
                        </div>

                        {workflowStages.map((stage, index) => {
                          const isActive = workflowStatus?.currentStage === stage;
                          const isCompleted = workflowStatus?.completedActions?.[stage];
                          const isPending = !isActive && !isCompleted;

                          return (
                            <div
                              key={stage}
                              className="d-flex flex-column align-items-center position-relative"
                              style={{ width: `${100 / workflowStages.length}%`, zIndex: 2 }}
                            >
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center mb-1
                                  ${isActive ? 'bg-primary text-white' :
                                    isCompleted ? 'bg-success text-white' :
                                      'bg-light text-muted border'}`}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  border: isPending ? '1px solid #dee2e6' : 'none'
                                }}
                              >
                                {index + 1}
                              </div>
                              <small className={`text-center ${isActive ? 'fw-bold text-primary' : isCompleted ? 'text-success' : 'text-muted'}`}>
                                {stage}
                              </small>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {workflowStatus?.pendingActions?.length > 0 && (
                      <div className="alert alert-warning d-flex align-items-center gap-2 mb-0 py-2 border-0">
                        <ClockHistory size={16} />
                        <div className="small">
                          <strong>Pending Action:</strong> {workflowStatus.pendingActions[0].userName} ({workflowStatus.pendingActions[0].role})
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-5">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex align-items-center gap-2 py-3">
                      <CarFront size={16} className="text-primary" /> <span className="fw-semibold">Vehicle Information</span>
                    </div>
                    <div className="card-body pt-0">
                      {selectedRequest.vehicle ? (
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-muted small mb-1">Make</label>
                            <p className="mb-0 fw-medium">{selectedRequest.vehicle.make || 'N/A'}</p>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-muted small mb-1">Model</label>
                            <p className="mb-0 fw-medium">{selectedRequest.vehicle.model || 'N/A'}</p>
                          </div>
          
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-muted small mb-1">License Plate</label>
                            <p className="mb-0 fw-medium">{selectedRequest.vehicle.licensePlate || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="bg-light rounded-circle p-3 d-inline-block mb-3">
                            <CarFront size={24} className="text-muted" />
                          </div>
                          <p className="text-muted mb-0">No vehicle assigned</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex align-items-center gap-2 py-3">
                      <span className="fw-semibold">Request Details </span>
                    </div>
                    <div className="card-body pt-0">
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2">
                          {statusBadge(selectedRequest.status)}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small mb-1">Request Date</label>
                        <p className="mb-0 fw-medium">{formatDate(selectedRequest.requestDate)}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small mb-1">Duration</label>
                        <p className="mb-0 fw-medium">
                          {selectedRequest.startDate && selectedRequest.endDate
                            ? `${formatDate(selectedRequest.startDate)} to ${formatDate(selectedRequest.endDate)}`
                            : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="form-label text-muted small mb-1">Reason</label>
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0 fw-medium">{selectedRequest.requestReason || 'No reason provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 d-flex align-items-center gap-2 py-3">
                      <ChatLeftText size={16} className="text-primary" /> <span className="fw-semibold">Activity & Comments</span>
                    </div>
                    <div className="card-body p-0">
                      {commentsLoading ? (
                        <div className="d-flex justify-content-center py-4">
                          <Spinner animation="border" size="sm" />
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-4">
                          <div className="bg-light rounded-circle p-3 d-inline-block mb-3">
                            <ChatLeftText size={24} className="text-muted" />
                          </div>
                          <h6 className="text-muted">No activity yet</h6>
                          <p className="text-muted small mb-0">Comments and updates will appear here</p>
                        </div>
                      ) : (
                        <div className="overflow-none" style={{ maxHeight: '300px' }}>
                          {comments.map((comment, index) => (
                            <div key={index} className="border-bottom p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <Badge bg="light" text="dark" className="text-uppercase small fw-normal">
                                    {comment.stage}
                                  </Badge>
                                  <small className="text-muted">{formatDate(comment.timestamp)}</small>
                                </div>
                                {comment.action === 'approve' && (
                                  <Badge bg="success" className="small">Approved</Badge>
                                )}
                                {comment.action === 'reject' && (
                                  <Badge bg="danger" className="small">Rejected</Badge>
                                )}
                              </div>
                              <div className={`p-3 rounded ${index % 2 === 0 ? 'bg-white' : 'bg-light bg-opacity-50'}`}>
                                <div className="d-flex gap-2">
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                                      style={{ width: '36px', height: '36px' }}>
                                      {comment.userInitials || comment.user.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                  <div>
                                    <h6 className="mb-1 small fw-semibold">{comment.user || 'Unknown User'}</h6>
                                    <p className="mb-0 small">{comment.comment}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default VehicleRequestsComponent;