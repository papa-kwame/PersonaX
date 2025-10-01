import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Avatar,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  styled,
  useTheme,
  Fade,
  Slide
} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import InfoIcon from '@mui/icons-material/Info';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CommentIcon from '@mui/icons-material/Comment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDateDisplay } from '../../utils/dateUtils';

// Enhanced styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const RequestCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  padding: '24px',
  marginBottom: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)',
    transform: 'translateY(-4px)',
    '&::before': {
      opacity: 1
    }
  }
}));

const priorityColors = {
  High: { bgcolor: alpha('#d32f2f', 0.1), color: '#d32f2f', border: alpha('#d32f2f', 0.2) },
  Medium: { bgcolor: alpha('#f57c00', 0.1), color: '#f57c00', border: alpha('#f57c00', 0.2) },
  Low: { bgcolor: alpha('#388e3c', 0.1), color: '#388e3c', border: alpha('#388e3c', 0.2) },
};

const statusColors = {
  Pending: { bgcolor: alpha('#f57c00', 0.1), color: '#f57c00', border: alpha('#f57c00', 0.2) },
  Completed: { bgcolor: alpha('#388e3c', 0.1), color: '#388e3c', border: alpha('#388e3c', 0.2) },
  InProgress: { bgcolor: alpha('#1976d2', 0.1), color: '#1976d2', border: alpha('#1976d2', 0.2) },
  Cancelled: { bgcolor: alpha('#d84315', 0.1), color: '#d84315', border: alpha('#d84315', 0.2) },
  Rejected: { bgcolor: alpha('#d32f2f', 0.1), color: '#d32f2f', border: alpha('#d32f2f', 0.2) },
};

const UserMaintenanceRequests = () => {
  const theme = useTheme();
  const { isAuthenticated, userId } = useAuth();

  // Helper functions for colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#dc3545';
      case 'Medium': return '#fd7e14';
      case 'Low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#fd7e14';
      case 'Completed': return '#28a745';
      case 'InProgress': return '#007bff';
      case 'Cancelled': return '#dc3545';
      case 'Rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [comments, setComments] = useState(null);
  const [requestDocuments, setRequestDocuments] = useState([]);
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
      } finally {
      setIsLoading(false);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      setDetailLoading(true);
      const [statusResponse, commentsResponse, documentsResponse] = await Promise.all([
        api.get(`/api/MaintenanceRequest/${requestId}/workflow-status`),
        api.get(`/api/MaintenanceRequest/${requestId}/comments`),
        api.get(`/api/MaintenanceRequest/${requestId}/documents`)
      ]);
      setWorkflowStatus(statusResponse.data);
      setComments(commentsResponse.data);
      setRequestDocuments(documentsResponse.data.documents || []);
    } catch (err) {
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
    setRequestDocuments([]);
  };

  const handleDocumentDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/documents/${documentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      }
  };

  const getStageSteps = () => {
    const allStages = ['Create', 'Comment', 'Review','Approve','Commit'];
    return allStages.map((stage) => ({
      label: stage,
      completed: workflowStatus?.completedActions[stage] !== undefined,
      active: workflowStatus?.currentStage === stage
    }));
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '460px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e0e0e0',
        position: 'relative'
      }}>
        <Box sx={{ textAlign: 'center', p: 6 }}>
          <Box sx={{
            background: '#f5f5f5',
            borderRadius: '50%',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '2px solid #e0e0e0'
          }}>
            <BuildCircleIcon sx={{ fontSize: 48, color: '#666' }} />
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#333', 
            mb: 2
          }}>
            Authentication Required
          </Typography>
          <Typography sx={{ 
            color: '#666', 
            fontSize: '1.1rem',
            fontWeight: 400
          }}>
            Please sign in to view your maintenance requests.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '460px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e0e0e0'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#333', mb: 3 }} />
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: '#333'
          }}>
            Loading Requests...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '460px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e0e0e0'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            background: '#f5f5f5',
            borderRadius: '50%',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '2px solid #e0e0e0'
          }}>
            <Typography sx={{ fontSize: 36, color: '#666', fontWeight: 600 }}>!</Typography>
          </Box>
          <Typography sx={{ 
            color: '#333', 
            fontSize: '1.2rem', 
            mb: 3, 
            fontWeight: 600
          }}>
            {error}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{ 
              color: '#333',
              borderColor: '#333',
              borderRadius: '8px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                background: '#f5f5f5',
                borderColor: '#000'
              }
            }}
            onClick={fetchRequests}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '460px',
        borderRadius: '12px',
        background: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '48px',
        textAlign: 'center',
        border: '1px solid #e0e0e0'
      }}>
        <Box sx={{
          background: '#f5f5f5',
          borderRadius: '50%',
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          border: '2px solid #e0e0e0'
        }}>
          <BuildCircleIcon sx={{ 
            fontSize: 60, 
            color: '#666'
          }} />
        </Box>
        <Typography variant="h4" sx={{ 
          fontWeight: 600, 
          color: '#333', 
          mb: 3,
          fontSize: '1.8rem'
        }}>
          No Maintenance Requests
        </Typography>
        <Typography sx={{ 
          color: '#666', 
          fontSize: '1.1rem',
          maxWidth: '450px',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          You have no pending maintenance requests at the moment.
          <br />
          When you do, they'll appear here with their current status and details.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '1000px',
      height: '465px',
      margin: '0 auto',
      color: '#333',
    }}>
      <Box sx={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        height: '460px',
        border: '1px solid #e0e0e0'
      }}>
        {/* Professional Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          background: '#f8f9fa',
          color: '#333',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              background: '#333',
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AssignmentIcon sx={{ fontSize: 24, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: 600, 
                color: '#333',
                mb: 0.5
              }}>
                My Maintenance Requests
              </Typography>
              <Typography sx={{
                color: '#666',
                fontSize: '0.9rem',
                fontWeight: 400
              }}>
                Track and manage your vehicle maintenance
              </Typography>
            </Box>
          </Box>

        </Box>

        {/* Professional Content Area */}
        <Box sx={{
          maxHeight: '380px',
          overflowY: 'auto',
          padding: '24px 32px',
          background: '#ffffff',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f5f5f5',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c0c0c0',
            borderRadius: '4px',
            '&:hover': {
              background: '#a0a0a0',
            },
          },
        }}>
          {requests.map((request, index) => (
            <Fade in timeout={300 + index * 100} key={request.id}>
              <Box
                onClick={() => handleRequestClick(request)}
                sx={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e0e0e0',
                  padding: '24px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    borderColor: '#333',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      fontSize: '1.1rem',
                      color: '#333',
                      mb: 1
                    }}>
                      {request.vehicleMake} {request.vehicleModel}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      px: 2,
                      py: 1,
                      width: 'fit-content',
                      border: '1px solid #e0e0e0'
                    }}>
                      <DirectionsCarIcon sx={{ fontSize: 16, color: '#666' }} />
                      <Typography sx={{ 
                        color: '#666', 
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}>
                        {request.licensePlate}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={`Priority: ${request.priority}`}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 28,
                        borderRadius: '14px',
                        background: getPriorityColor(request.priority),
                        color: '#fff',
                        border: 'none'
                      }}
                    />
                    <Typography sx={{ 
                      color: '#666',
                      fontWeight: 500,
                      fontSize: '0.8rem'
                    }}>
                      {formatDateDisplay(request.requestDate)}
                    </Typography>
                  </Box>
                </Box>

                <Typography sx={{ 
                  color: '#666', 
                  mb: 2,
                  lineHeight: 1.6,
                  fontSize: '0.9rem',
                  fontWeight: 400
                }}>
                  {request.description}
                </Typography>

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={request.requestType}
                      sx={{
                        background: '#f8f9fa',
                        color: '#333',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 28,
                        borderRadius: '14px',
                        border: '1px solid #e0e0e0',
                      }}
                    />
                    <Chip
                      label={request.status}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 28,
                        borderRadius: '14px',
                        background: getStatusColor(request.status),
                        color: '#fff',
                        border: 'none'
                      }}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ 
                      color: '#333',
                      borderColor: '#333',
                      fontWeight: 600, 
                      textTransform: 'none',
                      borderRadius: '6px',
                      px: 3,
                      py: 0.8,
                      fontSize: '0.85rem',
                      '&:hover': {
                        background: '#f5f5f5',
                        borderColor: '#000'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestClick(request);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>
      </Box>

      {/* Enhanced Dialog */}
      {selectedRequest && (
        <Dialog
          open={!!selectedRequest}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          TransitionComponent={Slide}
          transitionDuration={300}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              background: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 600,
            fontSize: '1.3rem',
            color: '#333',
            pb: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: '#f8f9fa',
            minHeight: 60,
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Box sx={{
              background: '#333',
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AssignmentIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Typography>
              Maintenance Request Details
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ 
            background: '#ffffff', 
            p: { xs: 2, sm: 3 }, 
            pt: 3 
          }}>
                          {detailLoading ? (
                <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={40} thickness={4} sx={{ mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 500, color: '#333' }}>
                      Loading Details...
                    </Typography>
                  </Box>
                </Box>
              ) : (
              <Fade in timeout={500}>
                <Box sx={{marginTop: '15px'}}>
                  {/* Compact Workflow Progress */}
                  <StyledPaper sx={{
                    mb: 3,
                    p: 2.5,
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography sx={{ 
                      fontWeight: 600, 
                      mb: 2, 
                      color: '#333', 
                      fontSize: '1.1rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1 
                    }}>
                      <Box sx={{
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DirectionsCarIcon sx={{ color: '#666', fontSize: 18 }} />
                      </Box>
                      Workflow Progress
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} justifyContent="space-between" flexWrap="wrap">
                      {getStageSteps().map((step, idx) => (
                        <Box key={idx} display="flex" flexDirection="column" alignItems="center" flex={1} minWidth={60}>
                          <Avatar sx={{
                            bgcolor: step.completed ? '#28a745' : step.active ? '#007bff' : '#e9ecef',
                            color: step.completed || step.active ? '#fff' : '#6c757d',
                            mb: 1,
                            width: 36,
                            height: 36,
                            fontWeight: 600,
                            fontSize: 14,
                            transition: 'all 0.2s ease'
                          }}>
                            {step.completed ? <>&#10003;</> : idx + 1}
                          </Avatar>
                          <Typography sx={{ 
                            fontWeight: step.active ? 600 : 500, 
                            color: step.active ? '#007bff' : '#666', 
                            fontSize: '0.75rem',
                            textAlign: 'center'
                          }}>
                            {step.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </StyledPaper>

                  {/* Compact Information Cards */}
                  <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                    <StyledPaper sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: '8px',
                      minWidth: 280,
                      background: '#ffffff',
                      border: '1px solid #e0e0e0'
                    }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{
                            background: '#f8f9fa',
                            borderRadius: '6px',
                            p: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <InfoIcon sx={{ color: '#666', fontSize: 18 }} />
                          </Box>
                          <Typography sx={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>
                            Request Information
                          </Typography>
                        </Box>
                        <Chip
                          label={selectedRequest?.status}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            px: 1,
                            py: 0.5,
                            borderRadius: '8px',
                            background: getStatusColor(selectedRequest?.status),
                            color: '#fff'
                          }}
                        />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#666', 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            Request Date
                          </Typography>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mt: 0.5 }}>
                            {formatDateDisplay(selectedRequest?.requestDate)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#666', 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            Request Type
                          </Typography>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mt: 0.5 }}>
                            {selectedRequest?.requestType}
                          </Typography>
                        </Box>
                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                          <Typography variant="caption" sx={{ 
                            color: '#666', 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            Vehicle Details
                          </Typography>
                          <Typography sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.85rem', 
                            mt: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <DirectionsCarIcon sx={{ fontSize: 16, color: '#666' }} />
                            {selectedRequest?.vehicleMake} {selectedRequest?.vehicleModel} ({selectedRequest?.licensePlate})
                          </Typography>
                        </Box>
                        <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                          <Typography variant="caption" sx={{ 
                            color: '#666', 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}>
                            Description
                          </Typography>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', mt: 0.5, lineHeight: 1.4 }}>
                            {selectedRequest?.description}
                          </Typography>
                        </Box>
                      </Box>
                    </StyledPaper>

                    <StyledPaper sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: '20px',
                      minWidth: 300,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                    }}>
                      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                        <Box sx={{
                          background: alpha(theme.palette.info.main, 0.1),
                          borderRadius: '12px',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <HourglassEmptyIcon sx={{ color: 'info.main', fontSize: 24 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, color: 'info.main', fontSize: '1.1rem' }}>
                          Pending Actions
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      {workflowStatus?.pendingActions?.length > 0 ? (
                        <Box>
                          {workflowStatus.pendingActions.map((action, idx) => (
                            <Box key={idx} display="flex" alignItems="center" gap={2} mb={2.5}>
                              <Avatar sx={{
                                bgcolor: 'primary.main',
                                color: '#fff',
                                fontWeight: 700,
                                width: 40,
                                height: 40
                              }}>
                                {action.userName.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                  {action.userName}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.75rem'
                                }}>
                                  {action.role}
                                </Typography>
                              </Box>
                              {action.isPending && (
                                <Chip
                                  label="Pending Approval"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    bgcolor: '#ff9800',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    px: 1.5
                                  }}
                                />
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: 'center', color: 'success.main', py: 3 }}>
                          <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                          <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                            No pending actions
                          </Typography>
                        </Box>
                      )}
                    </StyledPaper>
                  </Box>

                  {/* Enhanced Comments Section */}
                  <StyledPaper sx={{
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    mb: 4
                  }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                      <Box sx={{
                        background: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: '12px',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CommentIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>
                        Comments History
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    {comments?.comments?.length > 0 ? (
                      <Box>
                        {comments.comments.map((comment, idx) => (
                          <Box key={idx} sx={{ 
                            mb: 3, 
                            p: 2.5, 
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                          }}>
                            <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                              <Avatar sx={{
                                bgcolor: 'primary.main',
                                color: '#fff',
                                fontWeight: 700,
                                width: 36,
                                height: 36
                              }}>
                                {comment.userName.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                  {comment.userName}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.75rem'
                                }}>
                                  {comment.role || 'System User'}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                fontWeight: 500
                              }}>
                                {formatDateDisplay(comment.timestamp, true)}
                              </Typography>
                            </Box>
                            <Typography sx={{ 
                              color: 'text.secondary', 
                              mb: 1.5,
                              lineHeight: 1.6,
                              fontSize: '0.9rem'
                            }}>
                              {comment.comment}
                            </Typography>
                            <Box display="flex" gap={1}>
                              <Chip 
                                label={`Stage: ${comment.stage}`} 
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 24,
                                  borderRadius: '12px',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main'
                                }}
                              />
                              {comment.isFinalDecision && (
                                <Chip 
                                  label="Final Decision" 
                                  color="success" 
                                  size="small"
                                  sx={{
                                    fontSize: '0.7rem',
                                    height: 24,
                                    borderRadius: '12px'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                        <InfoIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography sx={{ fontWeight: 600, fontSize: '1rem', mb: 1 }}>
                          No comments available
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', opacity: 0.7 }}>
                          No comments have been added to this request yet.
                        </Typography>
                      </Box>
                    )}
                  </StyledPaper>

                  {/* Enhanced Documents Section */}
                  <StyledPaper sx={{
                    p: 3,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`
                  }}>
                    <Typography variant="overline" sx={{
                      display: 'block',
                      color: 'text.secondary',
                      fontWeight: 700,
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      mb: 3,
                      textTransform: 'uppercase'
                    }}>
                      Attached Documents ({requestDocuments.length})
                    </Typography>
                    {requestDocuments.length > 0 ? (
                      <List disablePadding>
                        {requestDocuments.map((document, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                              py: 2,
                              px: 0,
                              borderRadius: '12px',
                              mb: 1,
                              '&:last-child': { borderBottom: 'none', mb: 0 },
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.02),
                                borderRadius: '12px'
                              }
                            }}
                            secondaryAction={
                              <Tooltip title="Download">
                                <IconButton
                                  edge="end"
                                  aria-label="download"
                                  onClick={() => handleDocumentDownload(document.documentId, document.fileName)}
                                  sx={{
                                    background: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <DownloadRoundedIcon />
                                </IconButton>
                              </Tooltip>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                width: 40,
                                height: 40
                              }}>
                                <InsertDriveFileRoundedIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600, 
                                  color: 'text.primary',
                                  fontSize: '0.9rem'
                                }}>
                                  {document.fileName}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" sx={{
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  fontSize: '0.75rem',
                                  mt: 0.5
                                }}>
                                  <EventRoundedIcon sx={{ fontSize: '0.8rem' }} />
                                  {formatDateDisplay(document.uploadDate, true)}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                        <InsertDriveFileRoundedIcon sx={{
                          fontSize: 64,
                          color: alpha(theme.palette.text.secondary, 0.3),
                          mb: 3
                        }} />
                        <Typography variant="h6" sx={{ 
                          color: 'text.secondary', 
                          fontWeight: 600, 
                          mb: 1,
                          fontSize: '1.1rem'
                        }}>
                          No Documents Attached
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: alpha(theme.palette.text.secondary, 0.7),
                          fontSize: '0.9rem'
                        }}>
                          No documents have been uploaded for this request yet.
                        </Typography>
                      </Box>
                    )}
                  </StyledPaper>
                </Box>
              </Fade>
            )}
          </DialogContent>

          <DialogActions sx={{
            background: '#f8f9fa',
            p: 2,
            borderTop: '1px solid #e0e0e0'
          }}>
            <Button
              onClick={handleCloseDetails}
              variant="outlined"
              sx={{ 
                fontWeight: 600, 
                borderRadius: '6px', 
                px: 3, 
                py: 1,
                color: '#333',
                borderColor: '#333',
                '&:hover': {
                  background: '#f5f5f5',
                  borderColor: '#000'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default UserMaintenanceRequests;
