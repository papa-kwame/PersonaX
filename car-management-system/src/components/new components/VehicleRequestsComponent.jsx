import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Card,
  CardContent,
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
  Tooltip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloseIcon from '@mui/icons-material/Close';
import VehicleRequestForm from './VehicleRequestForm';

// Professional color palette
const professionalColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0'
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: professionalColors.surface,
  border: `1px solid ${professionalColors.border}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    borderColor: professionalColors.primary
  }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    maxWidth: '900px',
    maxHeight: '85vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${professionalColors.border}`,
    background: professionalColors.surface
  }
}));

const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.9)} 0%, ${professionalColors.primary} 100%)`
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: professionalColors.border,
    color: professionalColors.text,
    '&:hover': {
      borderColor: professionalColors.primary,
      backgroundColor: alpha(professionalColors.primary, 0.04)
    }
  })
}));

const workflowStages = ['Comment', 'Review', 'Commit', 'Approval', 'Completed'];

const statusChip = (status) => {
  switch (status) {
    case 0:
      return (
        <Chip 
          icon={<HourglassEmptyIcon />} 
          label="Pending" 
          color="warning" 
          variant="filled" 
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${professionalColors.warning} 0%, ${alpha(professionalColors.warning, 0.8)} 100%)`,
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-icon': { color: 'white' }
          }}
        />
      );
    case 1:
      return (
        <Chip 
          icon={<CheckCircleIcon />} 
          label="Approved" 
          color="success" 
          variant="filled" 
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${professionalColors.success} 0%, ${alpha(professionalColors.success, 0.8)} 100%)`,
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-icon': { color: 'white' }
          }}
        />
      );
    case 2:
      return (
        <Chip 
          icon={<CancelIcon />} 
          label="Rejected" 
          color="error" 
          variant="filled" 
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${professionalColors.error} 0%, ${alpha(professionalColors.error, 0.8)} 100%)`,
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-icon': { color: 'white' }
          }}
        />
      );
    default:
      return (
        <Chip 
          icon={<HistoryIcon />} 
          label="Unknown" 
          color="default" 
          variant="filled" 
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${professionalColors.secondary} 0%, ${alpha(professionalColors.secondary, 0.8)} 100%)`,
            color: 'white',
            fontWeight: 600,
            '& .MuiChip-icon': { color: 'white' }
          }}
        />
      );
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
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight={400}
        sx={{
          background: `linear-gradient(135deg, ${professionalColors.background} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
          borderRadius: '20px',
          border: `1px solid ${professionalColors.border}`
        }}
      >
        <CircularProgress 
          size={48}
          sx={{ 
            color: professionalColors.primary,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          my: 3, 
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${alpha(professionalColors.error, 0.1)} 0%, ${alpha(professionalColors.error, 0.05)} 100%)`,
          border: `1px solid ${alpha(professionalColors.error, 0.2)}`,
          '& .MuiAlert-icon': { color: professionalColors.error }
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{
      background: `linear-gradient(135deg, ${professionalColors.background} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${professionalColors.border}`,
      padding: '2rem',
      paddingTop: '3rem',
      minHeight: '349px'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
          }}>
            <DirectionsCarIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h7" fontWeight={400} color={professionalColors.text}>
              My Vehicle Requests
            </Typography>
          </Box>
        </Box>
        <VehicleRequestForm />
      </Box>

      <Box>
        {requests.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height={150}
            sx={{
              background: `linear-gradient(135deg, ${alpha(professionalColors.surface, 0.8)} 0%, ${professionalColors.surface} 100%)`,
              borderRadius: '20px',
              border: `2px dashed ${alpha(professionalColors.border, 0.5)}`,
              margin: '2rem 0'
            }}
          >
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.secondary, 0.05)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2
            }}>
              <DirectionsCarIcon sx={{ color: alpha(professionalColors.secondary, 0.6), fontSize: 40 }} />
            </Box>
            <Typography variant="h7" color={professionalColors.text} fontWeight={600} gutterBottom>
              No Vehicle Requests
            </Typography>

          </Box>
        ) : (
          <Stack spacing={2}>
            {requests.map((request) => (
              <StyledCard
                key={request.id}
                onClick={() => handleRequestClick(request)}
              >
                <CardContent sx={{ p: 1.4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{
                      width: 46,
                      height: 46,
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
                    }}>
                      <DirectionsCarIcon sx={{ fontSize: 28 }} />
                    </Box>
                    
                    <Box flexGrow={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color={professionalColors.text}>
                            {request.vehicle?.make || 'No vehicle'} {request.vehicle?.model || ''}
                          </Typography>
                          <Typography variant="body2" color={professionalColors.secondary} sx={{ mt: 0.5 }}>
                            License: <strong>{request.vehicle?.licensePlate || 'N/A'}</strong>
                          </Typography>
                        </Box>
                        {statusChip(request.status)}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ fontSize: 18, color: alpha(professionalColors.secondary, 0.7) }} />
                          <Typography variant="body2" color={professionalColors.secondary}>
                            {formatDate(request.requestDate)}
                          </Typography>
                        </Box>
                        
                        {request.startDate && request.endDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HistoryIcon sx={{ fontSize: 18, color: alpha(professionalColors.secondary, 0.7) }} />
                            <Typography variant="body2" color={professionalColors.secondary}>
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            ))}
          </Stack>
        )}
      </Box>

      <StyledDialog open={showModal} onClose={handleCloseModal} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.9)} 100%)`,
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AssignmentIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Request Details
            </Typography>
          </Box>
          <IconButton 
            onClick={handleCloseModal}
            sx={{ 
              color: 'white',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 4,
          background: professionalColors.background,
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          {selectedRequest && (
            <Box>
              {/* Workflow Progress */}
              <Card sx={{
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
                border: `1px solid ${professionalColors.border}`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                mb: 3,
                mt: 1.5
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} color={professionalColors.text} mb={3}>
                    Workflow Progress
                  </Typography>
                  
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    {/* Progress Bar */}
                    <Box sx={{
                      height: 8,
                      background: alpha(professionalColors.border, 0.5),
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        height: '100%',
                        width: `${((workflowStages.indexOf(workflowStatus?.currentStage) + 1) / workflowStages.length) * 100}%`,
                        background: `linear-gradient(90deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                        borderRadius: 4,
                        transition: 'width 0.5s ease',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                      }} />
                    </Box>
                    
                    {/* Stage Indicators */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      position: 'relative',
                      mt: 2
                    }}>
                      {workflowStages.map((stage, index) => {
                        const isActive = workflowStatus?.currentStage === stage;
                        const isCompleted = workflowStatus?.completedActions?.[stage];
                        const isPending = !isActive && !isCompleted;
                        
                        return (
                          <Box key={stage} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: isActive 
                                ? `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`
                                : isCompleted
                                ? `linear-gradient(135deg, ${professionalColors.success} 0%, ${alpha(professionalColors.success, 0.8)} 100%)`
                                : `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.secondary, 0.05)} 100%)`,
                              border: isPending ? `2px solid ${alpha(professionalColors.border, 0.5)}` : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isActive || isCompleted ? 'white' : professionalColors.secondary,
                              fontWeight: 700,
                              fontSize: 16,
                              boxShadow: isActive || isCompleted ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                              transition: 'all 0.3s ease'
                            }}>
                              {index + 1}
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                mt: 1,
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? professionalColors.primary : isCompleted ? professionalColors.success : professionalColors.secondary,
                                textAlign: 'center',
                                fontSize: '0.75rem'
                              }}
                            >
                              {stage}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                  
                  {workflowStatus?.pendingActions?.length > 0 && (
                    <Alert 
                      severity="warning" 
                      icon={<HistoryIcon />} 
                      sx={{ 
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${alpha(professionalColors.warning, 0.1)} 0%, ${alpha(professionalColors.warning, 0.05)} 100%)`,
                        border: `1px solid ${alpha(professionalColors.warning, 0.2)}`,
                        '& .MuiAlert-icon': { color: professionalColors.warning }
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Pending Action: {workflowStatus.pendingActions[0].userName} ({workflowStatus.pendingActions[0].role})
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle and Request Details */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3, 
                mb: 3 
              }}>
                {/* Vehicle Information */}
                <Card sx={{
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
                  border: `1px solid ${professionalColors.border}`,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <DirectionsCarIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color={professionalColors.text}>
                        Vehicle Information
                      </Typography>
                    </Box>
                    
                    {selectedRequest.vehicle ? (
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                            Make
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                            {selectedRequest.vehicle.make || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                            Model
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                            {selectedRequest.vehicle.model || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                            License Plate
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                            {selectedRequest.vehicle.licensePlate || 'N/A'}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.secondary, 0.05)} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 1rem'
                        }}>
                          <DirectionsCarIcon sx={{ color: alpha(professionalColors.secondary, 0.6), fontSize: 32 }} />
                        </Box>
                        <Typography color={professionalColors.secondary} fontWeight={500}>
                          No vehicle assigned
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Request Details */}
                <Card sx={{
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
                  border: `1px solid ${professionalColors.border}`,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color={professionalColors.text} mb={3}>
                      Request Details
                    </Typography>
                    
                    <Stack spacing={2}>
                      <Box>{statusChip(selectedRequest.status)}</Box>
                      
                      <Box>
                        <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                          Request Date
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                          {formatDate(selectedRequest.requestDate)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                          Duration
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                          {selectedRequest.startDate && selectedRequest.endDate
                            ? `${formatDate(selectedRequest.startDate)} to ${formatDate(selectedRequest.endDate)}`
                            : 'Not specified'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                          Reason
                        </Typography>
                        <Box sx={{
                          background: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.8)} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
                          p: 2,
                          borderRadius: '12px',
                          border: `1px solid ${alpha(professionalColors.border, 0.5)}`
                        }}>
                          <Typography variant="body2" fontWeight={500} color={professionalColors.text}>
                            {selectedRequest.requestReason || 'No reason provided'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Activity & Comments */}
              <Card sx={{
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
                border: `1px solid ${professionalColors.border}`,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700} color={professionalColors.text}>
                      Activity & Comments
                    </Typography>
                  </Box>
                  
                  {commentsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress 
                        size={32}
                        sx={{ color: professionalColors.primary }}
                      />
                    </Box>
                  ) : comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.secondary, 0.05)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                      }}>
                        <ChatBubbleOutlineIcon sx={{ color: alpha(professionalColors.secondary, 0.6), fontSize: 32 }} />
                      </Box>
                      <Typography color={professionalColors.secondary} fontWeight={500} gutterBottom>
                        No activity yet
                      </Typography>
                      <Typography variant="body2" color={professionalColors.secondary}>
                        Comments and updates will appear here
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      <Stack spacing={2}>
                        {comments.map((comment, index) => (
                          <Box 
                            key={index} 
                            sx={{
                              p: 3,
                              background: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.8)} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
                              borderRadius: '16px',
                              border: `1px solid ${alpha(professionalColors.border, 0.5)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Chip 
                                label={comment.stage} 
                                size="small" 
                                variant="outlined" 
                                sx={{ 
                                  textTransform: 'uppercase',
                                  fontWeight: 600,
                                  borderColor: professionalColors.primary,
                                  color: professionalColors.primary
                                }} 
                              />
                              <Typography variant="caption" color={professionalColors.secondary}>
                                {formatDate(comment.timestamp)}
                              </Typography>
                              {comment.action === 'approve' && (
                                <Chip 
                                  label="Approved" 
                                  color="success" 
                                  size="small"
                                  sx={{
                                    background: `linear-gradient(135deg, ${professionalColors.success} 0%, ${alpha(professionalColors.success, 0.8)} 100%)`,
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                              {comment.action === 'reject' && (
                                <Chip 
                                  label="Rejected" 
                                  color="error" 
                                  size="small"
                                  sx={{
                                    background: `linear-gradient(135deg, ${professionalColors.error} 0%, ${alpha(professionalColors.error, 0.8)} 100%)`,
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                              <Avatar sx={{ 
                                bgcolor: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                                color: 'white',
                                width: 40,
                                height: 40,
                                fontWeight: 700,
                                fontSize: '0.875rem'
                              }}>
                                {comment.userInitials || (comment.user ? comment.user.charAt(0).toUpperCase() : '?')}
                              </Avatar>
                              <Box flexGrow={1}>
                                <Typography fontWeight={600} variant="body2" color={professionalColors.text} gutterBottom>
                                  {comment.user || 'Unknown User'}
                                </Typography>
                                <Typography variant="body2" color={professionalColors.text} sx={{ lineHeight: 1.6 }}>
                                  {comment.comment}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${professionalColors.border}`,
          background: professionalColors.surface
        }}>
          <StyledButton onClick={handleCloseModal} variant="contained">
            Close
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    </Box>
  );
};

export default VehicleRequestsComponent;