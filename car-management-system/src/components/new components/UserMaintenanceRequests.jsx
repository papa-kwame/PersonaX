import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Modal,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Avatar,
  Chip,
  IconButton,
  alpha,
  styled,
  useTheme
} from '@mui/material';
import { Close, Refresh, CheckCircle, Error, Info, Schedule, DoneAll, ChevronRight } from '@mui/icons-material';

// Custom styled components with enhanced styling
const StyledStepIcon = styled('div')(({ theme, active, completed }) => ({
  backgroundColor: completed 
    ? theme.palette.success.main 
    : active 
      ? theme.palette.primary.main 
      : alpha(theme.palette.text.secondary, 0.2),
  color: completed || active ? theme.palette.common.white : theme.palette.text.secondary,
  width: 32,
  height: 32,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.875rem',
  fontWeight: 600,
  boxShadow: active ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
  transition: 'all 0.3s ease',
}));

const StatusBadge = styled(Chip)(({ theme, status }) => {
  const statusStyles = {
    Pending: {
      bgcolor: alpha(theme.palette.warning.main, 0.15),
      color: theme.palette.warning.dark,
      icon: <Schedule fontSize="small" />,
      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
    },
    Completed: {
      bgcolor: alpha(theme.palette.success.main, 0.15),
      color: theme.palette.success.dark,
      icon: <CheckCircle fontSize="small" />,
      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
    },
    InProgress: {
      bgcolor: alpha(theme.palette.info.main, 0.15),
      color: theme.palette.info.dark,
      icon: <Info fontSize="small" />,
      border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
    },
    Cancelled: {
      bgcolor: alpha(theme.palette.error.main, 0.15),
      color: theme.palette.error.dark,
      icon: <Error fontSize="small" />,
      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
    }
  };
  
  const style = statusStyles[status] || {
    bgcolor: alpha(theme.palette.text.secondary, 0.05),
    color: theme.palette.text.secondary,
    icon: <Info fontSize="small" />,
    border: `1px solid ${alpha(theme.palette.text.secondary, 0.1)}`
  };

  return {
    backgroundColor: style.bgcolor,
    color: style.color,
    fontWeight: 600,
    padding: '4px 8px',
    border: style.border,
    '& .MuiChip-icon': {
      color: style.color,
      marginLeft: 0,
      marginRight: theme.spacing(0.5)
    },
    '&:hover': {
      backgroundColor: alpha(style.bgcolor, 0.8)
    }
  };
});

const StyledStepper = styled(Stepper)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: theme.spacing(3, 0),
  '& .MuiStepLabel-root': {
    padding: 0,
    cursor: 'pointer',
    '&:hover .MuiStepLabel-label': {
      color: theme.palette.primary.main
    }
  },
  '& .MuiStepLabel-label': {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginTop: theme.spacing(1.5),
    letterSpacing: '0.2px',
    '&.Mui-active': {
      color: theme.palette.primary.main,
      fontWeight: 700
    },
    '&.Mui-completed': {
      color: theme.palette.success.main,
      fontWeight: 600
    }
  },
  '& .MuiStepConnector-root': {
    top: 16,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  '& .MuiStepConnector-line': {
    borderColor: alpha(theme.palette.divider, 0.5),
    borderTopWidth: 3,
    borderRadius: 2
  },
  '& .Mui-active .MuiStepConnector-line, & .Mui-completed .MuiStepConnector-line': {
    borderColor: theme.palette.primary.main,
  }
}));

const CustomCard = styled(Card)(({ theme }) => ({
borderRadius: 12   

}));

const UserMaintenanceRequests = () => {
  const theme = useTheme();
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

  const getStatusChip = (status) => (
    <StatusBadge 
      status={status} 
      label={status} 
      size="small" 
      icon={status === 'Completed' ? <DoneAll fontSize="small" /> : undefined}
    />
  );

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

  const StepIcon = (props) => {
    const { active, completed, icon } = props;
    const icons = {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5'
    };

    return (
      <StyledStepIcon active={active} completed={completed}>
        {completed ? <CheckCircle fontSize="small" /> : icons[icon]}
      </StyledStepIcon>
    );
  };

  if (!isAuthenticated) {
    return (
      <Paper sx={{ 
        p: 3, 
        textAlign: 'center', 
        height: 460, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.default, 0.6)
      }}>
        <Typography variant="body1" color="text.secondary">
          Please sign in to view your maintenance requests.
        </Typography>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        height: 460, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: alpha(theme.palette.background.default, 0.6),
        borderRadius: 3
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ 
        p: 3, 
        textAlign: 'center', 
        height: 460, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.default, 0.6)
      }}>
        <Typography color="error" sx={{ mb: 2, fontSize: '1.1rem' }}>{error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchRequests} 
          startIcon={<Refresh />}
          sx={{ 
            mt: 2,
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)'
            }
          }}
        >
          Retry
        </Button>
      </Paper>
    );
  }

if (requests.length === 0) {
  return (
    <Paper sx={{ 
      p: 3, 
      textAlign: 'center', 
      height: 460, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      borderRadius: 3,
      bgcolor: alpha(theme.palette.background.paper, 0.8),
      boxShadow: '0 8px 20px 0 rgba(0,0,0,0.05)',
      border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
      backgroundImage: 'linear-gradient(to bottom right, rgba(25, 118, 210, 0.02), rgba(25, 118, 210, 0.01))'
    }}>
      <Box sx={{
        width: 120,
        height: 120,
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3
      }}>
        <Schedule 
          sx={{ 
            fontSize: 48, 
            color: alpha(theme.palette.primary.main, 0.6) 
          }} 
        />
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 1, 
          fontWeight: 600,
          color: theme.palette.text.primary
        }}
      >
        No Maintenance Requests Found
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          maxWidth: 400,
          mb: 3,
          lineHeight: 1.6
        }}
      >
        You have no pending  maintenance requests. When you do, they'll appear here with their current status and details.
      </Typography>

    </Paper>
  );
}

  return (
    <Box sx={{ width: 850, height: 460 ,  borderRadius: 3 }}>
      <CustomCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title="My Maintenance Requests"
          titleTypographyProps={{ 
            variant: 'h8  ', 
            fontWeight: 300,
            letterSpacing: '0.2px',
            color: theme.palette.text.primary
          }}
          action={
            <IconButton 
              onClick={fetchRequests} 
              disabled={isLoading}
              aria-label="refresh"
              size="medium"

            >
              {isLoading ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          }
          sx={{ 
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2,
            px: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)'
          }}  
        />
        
        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
          <List disablePadding>
            {requests.map((request) => (
              <ListItem
                key={request.id}
                button
                onClick={() => handleRequestClick(request)}
                sx={{
                  border: '1px solid black',
                  borderColor: alpha(theme.palette.divider, 0.3),
                  py: 2,
                  px: 2.5,
                   
                  borderRadius: 3,
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ letterSpacing: '0.1px' }}>
                        {request.vehicleMake} {request.vehicleModel} 
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({request.licensePlate})
                        </Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          my: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem',
                          lineHeight: 1.5
                        }}
                      >
                        {request.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={request.requestType}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.dark',
                            border: 'none',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusChip(request.status)}
                          {request.priority && (
                            <Chip
                              label={`Priority: ${request.priority}`}
                              size="small"
                              sx={{ 
                                backgroundColor: request.priority === 'High' 
                                  ? alpha(theme.palette.error.main, 0.1) 
                                  : alpha(theme.palette.warning.main, 0.1),
                                color: request.priority === 'High' ? 'error.dark' : 'warning.dark',
                                border: 'none',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                          <ChevronRight sx={{ 
                            color: 'text.secondary',
                            fontSize: '1.2rem'
                          }} />
                        </Box>
                      </Box>
                    </>
                  }
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CustomCard>

      <Modal open={!!selectedRequest} onClose={handleCloseDetails}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1000, // Increased width
          height: 700, 
          bgcolor: 'background.paper',
          boxShadow: '0 10px 40px 0 rgba(0,0,0,0.2)',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          overflow: 'hidden'
        }}>
          <Box sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(8px)'
          }}>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '0.2px' }}>
              Maintenance Request Details
            </Typography>
            <IconButton 
              onClick={handleCloseDetails}
              size="medium"
              sx={{
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
            {detailLoading ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2, letterSpacing: '0.2px' }}>
                    Workflow Progress
                  </Typography>
                  <StyledStepper activeStep={workflowStatus ? getStageSteps().findIndex(step => step.active) : 0} alternativeLabel>
                    {getStageSteps().map((step, index) => (
                      <Step key={index} completed={step.completed}>
                        <StepLabel 
                          StepIconComponent={StepIcon}
                          sx={{
                            '& .MuiStepLabel-label': {
                              fontSize: '0.875rem',
                              color: step.active ? 'primary.main' : step.completed ? 'success.main' : 'text.secondary'
                            }
                          }}
                        >
                          {step.label}
                        </StepLabel>
                      </Step>
                    ))}
                  </StyledStepper>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                  <CustomCard sx={{ flex: 1 }} variant="outlined">
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' ,justifyContent:'space-between'}}>
                       <div>
                        <Info sx={{ mr: 1, color: 'primary.main' }} />
                        Request Information
                       </div> 
                                                  <Box sx={{ display: 'inline-block' }}>
                            {getStatusChip(selectedRequest?.status)}
                          </Box>
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: 2 }}>
 
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 ,border:'1px solid black', width:'fit-content',padding:'4px' ,borderRadius:'8px'}}>
                            Request Date
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(selectedRequest?.requestDate)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 ,border:'1px solid black', width:'fit-content',padding:'4px' ,borderRadius:'8px'}}>
                            Request Type
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedRequest?.requestType}</Typography>
                        </Box>
                        <Box >
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 ,border:'1px solid black', width:'fit-content',padding:'4px' ,borderRadius:'8px'}}>
                            Vehicle Details
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {selectedRequest?.vehicleMake} {selectedRequest?.vehicleModel} ({selectedRequest?.licensePlate})
                          </Typography>
                        </Box>
                        <Box >
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Description
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedRequest?.description}</Typography>
                        </Box>

                      </Box>
                    </CardContent>
                  </CustomCard>

                  <CustomCard sx={{ flex: 1 }} variant="outlined">
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ mr: 1, color: 'warning.main' }} />
                        Pending Actions
                      </Typography>
                      {workflowStatus?.pendingActions?.length > 0 ? (
                        <List disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {workflowStatus.pendingActions.map((action, index) => (
                            <ListItem 
                              key={index} 
                              sx={{ 
                                px: 0,
                                py: 1.5,
                                '&:not(:last-child)': {
                                  borderBottom: '1px solid',
                                  borderColor: 'divider'
                                }
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        fontSize: '0.875rem',
                                        bgcolor: 'primary.main',
                                        color: 'common.white',
                                        fontWeight: 600
                                      }}
                                    >
                                      {action.userName.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {action.userName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {action.role}
                                      </Typography>
                                    </Box>
                                    {action.isPending && (
                                      <Chip 
                                        label="Pending Approval" 
                                        size="small"
                                        sx={{ 
                                          bgcolor: alpha('#ed6c02', 0.1),
                                          color: 'warning.dark',
                                          fontWeight: 600,
                                          fontSize: '0.75rem'
                                        }}
                                      />
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: 100,
                          bgcolor: alpha(theme.palette.success.main, 0.05),
                          borderRadius: 2,
                          p: 2
                        }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: '2rem', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" align="center">
                            No pending actions
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </CustomCard>
                </Box>

                <CustomCard variant="outlined">
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <DoneAll sx={{ mr: 1, color: 'success.main' }} />
                      Comments History
                    </Typography>
                    {comments?.comments?.length > 0 ? (
                      <List disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {comments.comments.map((comment, index) => (
                          <ListItem 
                            key={index} 
                            sx={{ 
                              px: 0,
                              py: 2,
                              '&:not(:last-child)': {
                                borderBottom: '1px solid',
                                borderColor: 'divider'
                              }
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        fontSize: '0.875rem',
                                        bgcolor: 'primary.main',
                                        color: 'common.white',
                                        fontWeight: 600
                                      }}
                                    >
                                      {comment.userName.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {comment.userName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        {comment.role || 'System User'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {formatDate(comment.timestamp)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                      mt: 1,
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                      fontSize: '0.875rem',
                                      lineHeight: 1.6
                                    }}
                                  >
                                    {comment.comment}
                                  </Typography>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                                    <Chip
                                      label={`Stage: ${comment.stage}`}
                                      size="small"
                                      sx={{ 
                                        bgcolor: alpha('#1976d2', 0.1),
                                        color: 'primary.dark',
                                        fontWeight: 500,
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                    {comment.isFinalDecision && (
                                      <Chip
                                        label="Final Decision"
                                        size="small"
                                        sx={{ 
                                          bgcolor: alpha('#4caf50', 0.1),
                                          color: 'success.dark',
                                          fontWeight: 500,
                                          fontSize: '0.75rem'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: 100,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        borderRadius: 2,
                        p: 2
                      }}>
                        <Info sx={{ color: 'text.secondary', fontSize: '2rem', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" align="center">
                          No comments available for this request
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </CustomCard>
              </>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default UserMaintenanceRequests;