import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VehicleRequestForm from './VehicleRequestForm';
import './VehicleRequestsComponent.css';

const workflowStages = ['Comment', 'Review', 'Commit', 'Approval', 'Completed'];

const statusChip = (status) => {
  switch (status) {
    case 0:
      return <Chip icon={<HourglassEmptyIcon />} label="Pending" color="warning" variant="filled" size="small" />;
    case 1:
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" variant="filled" size="small" />;
    case 2:
      return <Chip icon={<CancelIcon />} label="Rejected" color="error" variant="filled" size="small" />;
    default:
      return <Chip icon={<HistoryIcon />} label="Unknown" color="default" variant="filled" size="small" />;
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={250}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 3, borderRadius: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box className="vehicle-requests-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h5" display="flex" alignItems="center" gap={1} fontWeight={600}>
          <DirectionsCarIcon color="primary" /> My Vehicle Request
        </Typography>
        <VehicleRequestForm />
      </Box>
      <Box>
        {requests.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height={180}>
            <Avatar sx={{ bgcolor: 'grey.100', mb: 2, width: 56, height: 56 }}>
              <DirectionsCarIcon sx={{ color: 'grey.400', fontSize: 32 }} />
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">No vehicle requests found</Typography>
            <Typography variant="body2" color="text.secondary" align="center" maxWidth={300}>
              Click the button above to create a new request
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2} className="vehicle-request-list">
            {requests.map((request) => (
              <Card
                key={request.id}
                variant="outlined"
                sx={{ cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}
                onClick={() => handleRequestClick(request)}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{  width: 40, height: 40 }}>
                    <DirectionsCarIcon fontSize="small" />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {request.vehicle?.make || 'No vehicle'} {request.vehicle?.model || ''}
                      </Typography>
                      {statusChip(request.status)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      License: <b>{request.vehicle?.licensePlate || 'N/A'}</b>
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">{formatDate(request.requestDate)}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" /> Request Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader title={<Typography variant="subtitle2" color="text.secondary">REQUEST STATUS</Typography>} sx={{ pb: 0 }} />
                <CardContent>
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <div style={{ overflowX: 'auto' }}>
                      <div className="d-flex justify-content-between position-relative align-items-center" style={{ width: '100%', minHeight: '98px' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0,  transform: 'translateY(-50%)', height: '4px', backgroundColor: '#e9ecef', zIndex: 1 }}>
                          <div
                            className="h-100 bg-primary"
                            style={{
                              height: '100%',
                              width: `${((workflowStages.indexOf(workflowStatus?.currentStage) + 1) / workflowStages.length) * 100}%`,
                              background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
                              borderRadius: '2px',
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
                                  border: isPending ? '1px solid #dee2e6' : 'none',
                                  position: 'relative',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  fontWeight: 600,
                                  fontSize: 16
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
                      <Alert severity="warning" icon={<HistoryIcon />} sx={{ py: 1, mb: 0, borderRadius: 1 }}>
                        <b>Pending Action:</b> {workflowStatus.pendingActions[0].userName} ({workflowStatus.pendingActions[0].role})
                      </Alert>
                    )}
                  </Box>
                </CardContent>
              </Card>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} mb={3}>
                <Card variant="outlined">
                  <CardHeader
                    avatar={<DirectionsCarIcon color="primary" />}
                    title={<Typography fontWeight={600}>Vehicle Information</Typography>}
                    sx={{ pb: 0 }}
                  />
                  <CardContent>
                    {selectedRequest.vehicle ? (
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Make</Typography>
                          <Typography fontWeight={500}>{selectedRequest.vehicle.make || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Model</Typography>
                          <Typography fontWeight={500}>{selectedRequest.vehicle.model || 'N/A'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">License Plate</Typography>
                          <Typography fontWeight={500}>{selectedRequest.vehicle.licensePlate || 'N/A'}</Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Box textAlign="center" py={3}>
                        <Avatar sx={{ bgcolor: 'grey.100', mb: 2, width: 48, height: 48 }}>
                          <DirectionsCarIcon sx={{ color: 'grey.400', fontSize: 28 }} />
                        </Avatar>
                        <Typography color="text.secondary">No vehicle assigned</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardHeader title={<Typography fontWeight={600}>Request Details</Typography>} sx={{ pb: 0 }} />
                  <CardContent>
                    <Stack spacing={1}>
                      <Box>{statusChip(selectedRequest.status)}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Request Date</Typography>
                        <Typography fontWeight={500}>{formatDate(selectedRequest.requestDate)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Duration</Typography>
                        <Typography fontWeight={500}>
                          {selectedRequest.startDate && selectedRequest.endDate
                            ? `${formatDate(selectedRequest.startDate)} to ${formatDate(selectedRequest.endDate)}`
                            : 'Not specified'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Reason</Typography>
                        <Box bgcolor="grey.100" p={2} borderRadius={2}>
                          <Typography fontWeight={500}>{selectedRequest.requestReason || 'No reason provided'}</Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Card variant="outlined">
                <CardHeader
                  avatar={<ChatBubbleOutlineIcon color="primary" />}
                  title={<Typography fontWeight={600}>Activity & Comments</Typography>}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ p: 0 }}>
                  {commentsLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : comments.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <Avatar sx={{ bgcolor: 'grey.100', mb: 2, width: 48, height: 48 }}>
                        <ChatBubbleOutlineIcon sx={{ color: 'grey.400', fontSize: 28 }} />
                      </Avatar>
                      <Typography color="text.secondary">No activity yet</Typography>
                      <Typography variant="body2" color="text.secondary">Comments and updates will appear here</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      {comments.map((comment, index) => (
                        <Box key={index} px={2} py={2} borderBottom={index !== comments.length - 1 ? 1 : 0} borderColor="grey.100">
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Chip label={comment.stage} size="small" variant="outlined" sx={{ textTransform: 'uppercase' }} />
                            <Typography variant="caption" color="text.secondary">{formatDate(comment.timestamp)}</Typography>
                            {comment.action === 'approve' && (
                              <Chip label="Approved" color="success" size="small" />
                            )}
                            {comment.action === 'reject' && (
                              <Chip label="Rejected" color="error" size="small" />
                            )}
                          </Box>
                          <Box display="flex" gap={2} alignItems="flex-start">
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 36, height: 36, fontWeight: 700 }}>
                              {comment.userInitials || (comment.user ? comment.user.charAt(0).toUpperCase() : '?')}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} variant="body2">{comment.user || 'Unknown User'}</Typography>
                              <Typography variant="body2">{comment.comment}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary" variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehicleRequestsComponent;