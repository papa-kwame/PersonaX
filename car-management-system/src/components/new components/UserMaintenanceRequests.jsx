import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './UserMaintenanceRequests.css'; // We'll create this CSS file
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { Chip, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Avatar, CircularProgress, Divider, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CommentIcon from '@mui/icons-material/Comment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';

const UserMaintenanceRequests = () => {
  const { isAuthenticated, userId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [comments, setComments] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const priorityColors = {
    High: { bgcolor: '#ffebee', color: '#d32f2f' },
    Medium: { bgcolor: '#fffde7', color: '#fbc02d' },
    Low: { bgcolor: '#e8f5e9', color: '#388e3c' },
  };
  const statusColors = {
    Pending: { bgcolor: '#fff3e0', color: '#f57c00' },
    Completed: { bgcolor: '#e8f5e9', color: '#388e3c' },
    InProgress: { bgcolor: '#e3f2fd', color: '#1976d2' },
    Cancelled: { bgcolor: '#fbe9e7', color: '#d84315' },
    Rejected: { bgcolor: '#ffebee', color: '#d32f2f' },
  };

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
      <div className="empty-state-maintenance" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: '44vh',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
        border: '1px solid #e3eafc',
        padding: 32,
      }}>
        <BuildCircleIcon sx={{ fontSize: 64,  mb: 2 }} />
        <h3 style={{ fontWeight: 600, color: 'black', marginBottom: 8 }}>No Maintenance Requests Found</h3>
        <p style={{ color: '#607d8b', fontSize: 16, margin: 0 }}>
          You have no pending maintenance requests.<br />
          When you do, they'll appear here with their current status and details.
        </p>
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
              <Box
              key={request.id} 
                sx={{
                  background: '#fff',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(148, 148, 148, 0.88)',
                  p: 2.5,
                  mb: 2.5,
                  mt:2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  cursor :'pointer',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 6px 24px rgba(25,118,210,0.12)' }
                }}
                onClick={() => handleRequestClick(request)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {request.vehicleMake} <span style={{ color: '#1976d2', fontWeight: 800 }}>({request.licensePlate})</span>
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={`Priority: ${request.priority}`}
                      sx={{
                        fontWeight: 700,
                        ...(priorityColors[request.priority] || {}),
                        px: 1.5,
                        fontSize: 14,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                  {request.description}
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={request.requestType}
                    sx={{
                      bgcolor: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 600,
                      fontSize: 13,
                      px: 1.5,
                    }}
                  />
                  <Chip
                    label={request.status}
                    sx={{
                      fontWeight: 700,
                      ...(statusColors[request.status] || {}),
                      px: 1.5,
                      fontSize: 14,
                    }}
                  />
                  <Button
                    variant="text"
                    size="small"
                    sx={{ ml: 'auto', color: '#1976d2', fontWeight: 600, textTransform: 'none' }}
              onClick={() => handleRequestClick(request)}
            >
                    View Details 
                  </Button>
                </Box>
              </Box>
            ))}

        </div>
      </div>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onClose={handleCloseDetails} maxWidth="md" fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: '#f5f7fa',
              boxShadow: '0 8px 32px rgba(60,72,100,0.18)',
              p: 0,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 400, fontSize: 28, color: 'primary.main', pb: 0, display: 'flex', alignItems: 'center', gap: 1, background: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, minHeight: 80 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1, mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AssignmentIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            Maintenance Request Details
          </DialogTitle>
          <DialogContent sx={{ background: '#f5f7fa', p: { xs: 2, sm: 4 }, pt: 3 }}>
              {detailLoading ? (
              <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
                <CircularProgress color="primary" />
              </Box>
              ) : (
                <>
                {/* Workflow Progress */}
                <Paper elevation={0} sx={{ mb: 4, mt:4, p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
                  <Typography fontWeight={700} mb={2} color="primary.main" fontSize={18} display="flex" alignItems="center" gap={1}>
                    <Box sx={{ borderRadius: '50%', p: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DirectionsCarIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    Workflow Progress
                  </Typography>
                  <Box display="flex" alignItems="center" gap={3} justifyContent="space-between">
                    {getStageSteps().map((step, idx) => (
                      <Box key={idx} display="flex" flexDirection="column" alignItems="center" flex={1}>
                        <Avatar sx={{ bgcolor: step.completed ? 'success.main' : step.active ? 'primary.main' : 'grey.200', color: step.completed || step.active ? '#fff' : 'grey.500', mb: 1, width: 44, height: 44, fontWeight: 700, boxShadow: step.active ? 3 : 0, fontSize: 22 }}>
                          {step.completed ? <>&#10003;</> : idx + 1}
                        </Avatar>
                        <Typography fontWeight={step.active ? 700 : 500} color={step.active ? 'primary.main' : 'text.secondary'} fontSize={15}>
                          {step.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
                <Box display="flex" gap={4} flexWrap="wrap" mb={4}>
                  <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 4, minWidth: 280, background: '#fff', boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{  borderRadius: '50%', p: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
                        </Box>
                        <Typography fontWeight={700} color="info.main">Request Information</Typography>
                      </Box>
                      <Chip label={selectedRequest?.status} sx={{ fontWeight: 700, fontSize: 15, px: 1.5, boxShadow: 1, bgcolor: '#ff9800', color: '#fff' }} />
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Request Date</Typography>
                        <Typography fontWeight={600}>{formatDate(selectedRequest?.requestDate)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Request Type</Typography>
                        <Typography fontWeight={600}>{selectedRequest?.requestType}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Vehicle Details</Typography>
                        <Typography fontWeight={600}><DirectionsCarIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />{selectedRequest?.vehicleMake} {selectedRequest?.vehicleModel} ({selectedRequest?.licensePlate})</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Description</Typography>
                        <Typography fontWeight={600}>{selectedRequest?.description}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                  <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 4, minWidth: 280, background: '#fff', boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Box sx={{ borderRadius: '50%', p: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HourglassEmptyIcon sx={{ color: 'info.main', fontSize: 20 }} />
                      </Box>
                      <Typography fontWeight={700} color="info.main">Pending Actions</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                      {workflowStatus?.pendingActions?.length > 0 ? (
                      <Box>
                        {workflowStatus.pendingActions.map((action, idx) => (
                          <Box key={idx} display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>{action.userName.charAt(0)}</Avatar>
                            <Box>
                              <Typography fontWeight={700}>{action.userName}</Typography>
                              <Typography variant="caption" color="text.secondary">{action.role}</Typography>
                            </Box>
                              {action.isPending && (
                              <Chip label="Pending Approval" sx={{ fontWeight: 700, ml: 2, bgcolor: '#ff9800', color: '#fff' }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box textAlign="center" color="success.main" py={2}>
                        <InfoIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                        <Typography>No pending actions</Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, background: '#fff', boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Box sx={{ borderRadius: '50%', p: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CommentIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Typography fontWeight={700} color="primary.main">Comments History</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {comments?.comments?.length > 0 ? (
                    <Box>
                      {comments.comments.map((comment, idx) => (
                        <Box key={idx} mb={2}>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Avatar sx={{ bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>{comment.userName.charAt(0)}</Avatar>
                            <Box>
                              <Typography fontWeight={700}>{comment.userName}</Typography>
                              <Typography variant="caption" color="text.secondary">{comment.role || 'System User'}</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" ml="auto">{formatDate(comment.timestamp)}</Typography>
                          </Box>
                          <Typography color="text.secondary" mb={0.5}>{comment.comment}</Typography>
                          <Box display="flex" gap={1}>
                            <Chip label={`Stage: ${comment.stage}`} size="small" />
                            {comment.isFinalDecision && (
                              <Chip label="Final Decision" color="success" size="small" />
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box textAlign="center" color="text.secondary" py={3}>
                      <InfoIcon color="info" sx={{ fontSize: 32, mb: 1 }} />
                      No comments available for this request
                    </Box>
                  )}
                </Paper>
                </>
              )}
          </DialogContent>
          <DialogActions sx={{ background: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, p: 2 }}>
            <Button onClick={handleCloseDetails} color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 2, px: 4, py: 1.2 }}>CLOSE</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default UserMaintenanceRequests;