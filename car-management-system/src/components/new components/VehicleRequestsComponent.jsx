import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Fade,
  Backdrop,
  Stepper,
  Step,
  StepLabel,
  Chip,
  styled
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarTodayIcon,
  Comment as CommentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  HourglassTop as HourglassTopIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon
} from '@mui/icons-material';
import { blue } from '@mui/material/colors';
import VehicleRequestForm from './VehicleRequestForm';

// Custom styled components
const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontSize: '0.7rem'
}));

const RequestPaper = styled(Paper)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const VehicleAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText
}));

const WorkflowStep = styled(Step)(({ theme }) => ({
  '& .MuiStepLabel-label': {
    fontSize: '0.75rem',
    '&.Mui-active, &.Mui-completed': {
      fontWeight: 600,
    }
  },
  '& .MuiStepIcon-root': {
    color: theme.palette.grey[400],
    '&.Mui-active': {
      color: theme.palette.primary.main
    },
    '&.Mui-completed': {
      color: theme.palette.success.main
    }
  }
}));

const MinimalAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: 'none',
  '&:before': {
    display: 'none'
  },
  '&.Mui-expanded': {
    margin: 0
  }
}));

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '90%', md: '850px' },
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: '3px'
  }
};

const workflowStages = ['Create', 'Comment', 'Review', 'Commit', 'Approval', 'Completed'];

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
  const [open, setOpen] = useState(false);

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
      setComments(response.data.Comments || []);
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
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const getStatusChip = (status) => {
    switch (status) {
      case 0:
        return (
          <StatusChip
            icon={<HourglassTopIcon fontSize="small" />}
            label="Pending"
            color="warning"
            variant="outlined"
            size="small"
          />
        );
      case 1:
        return (
          <StatusChip
            icon={<CheckCircleOutlineIcon fontSize="small" />}
            label="Approved"
            color="success"
            variant="outlined"
            size="small"
          />
        );
      case 2:
        return (
          <StatusChip
            icon={<CancelIcon fontSize="small" />}
            label="Rejected"
            color="error"
            variant="outlined"
            size="small"
          />
        );
      default:
        return (
          <StatusChip
            icon={<PendingIcon fontSize="small" />}
            label="Unknown"
            color="default"
            variant="outlined"
            size="small"
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3,minWidth:'400px',height: '245px', borderRadius: '12px', background :'white'}}}>
      <Typography variant="h8" component="h" gutterBottom sx={{
        fontWeight: 200,
        color: 'text.primary',
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        
      }}>
        <DirectionsCarIcon color="primary" />
        My Vehicle Requests
      </Typography>

 <Grid container spacing={2}>
  <Grid item xs={12}>
    {requests.length === 0 ? (
      <Box 
        textAlign="center" 
        py={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        width={550}
      >
        <Typography variant="body1" color="text.secondary">
          No vehicle requests found.
        </Typography>
        <VehicleRequestForm />
      </Box>
    ) : (
      <List disablePadding sx={{ width: '100%' }}>
        {requests.map((request) => (
          <React.Fragment key={request.id}>
            <ListItem
              button
              onClick={() => handleRequestClick(request)}
              sx={{
                py: 2,
                px: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'action.hover'
                },
                display: 'flex',
                alignItems: 'flex-start'
              }}
            >
              <ListItemAvatar sx={{ minWidth: 48, mr: 1.5 }}>
                <VehicleAvatar sx={{ width: 40, height: 40 }}>
                  <DirectionsCarIcon fontSize="small" />
                </VehicleAvatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={500}>
                    {request.vehicle?.make || 'No vehicle'} {request.vehicle?.model || ''}
                  </Typography>
                }
                secondary={
                  <>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1} 
                      mb={1}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        fontWeight={500}
                      >
                        {request.vehicle?.licensePlate || 'No license plate'}
                      </Typography>
                    </Box>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1.5} 
                      flexWrap="wrap"
                    >
                      {getStatusChip(request.status)}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={0.8}
                        sx={{ color: 'text.secondary' }}
                      >
                        <CalendarTodayIcon fontSize="inherit" />
                        <Typography variant="caption">
                          {formatDate(request.requestDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                }
                sx={{ my: 0 }}
              />
            </ListItem>
            <Divider 
              component="li" 
              sx={{ 
                mx: 2,
                my: 0.5
              }} 
            />
          </React.Fragment>
        ))}
      </List>
    )}
  </Grid>
</Grid>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2" sx={{
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <AssignmentTurnedInIcon color="primary" />
              Request Details
            </Typography>

            {selectedRequest && (
              <Box>
                {/* Workflow Status Section */}
                <Paper elevation={0} sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: 'background.default'
                }}>
                  <Box sx={{ width: '100%', overflowX: 'auto', pb: 1 }}>
                    <Stepper
                      activeStep={workflowStages.indexOf(workflowStatus?.currentStage || 'Create')}
                      alternativeLabel
                      sx={{ minWidth: '700px' }}
                    >
                      {workflowStages.map((label) => (
                        <WorkflowStep key={label}>
                          <StepLabel>{label}</StepLabel>
                        </WorkflowStep>
                      ))}
                    </Stepper>
                  </Box>

                  {workflowStatus?.pendingActions && workflowStatus.pendingActions.length > 0 && (
                    <Box sx={{
                      mt: 2,
                      p: 1.5,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <PendingIcon fontSize="small" color="warning" />
                      <Typography variant="body2">
                        <strong>Pending:</strong> {workflowStatus.pendingActions[0].userName} ({workflowStatus.pendingActions[0].role})
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={9}>
                    <Paper variant="outlined" sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      borderColor: 'divider'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <DirectionsCarIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Vehicle Information
                        </Typography>
                      </Box>

                      {selectedRequest.vehicle ? (
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <DetailItem
                              label="Make"
                              value={selectedRequest.vehicle.make}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <DetailItem
                              label="Model"
                              value={selectedRequest.vehicle.model}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <DetailItem
                              label="License Plate"
                              value={selectedRequest.vehicle.licensePlate}
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No vehicle assigned
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 2,
                      borderColor: 'divider'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <CalendarTodayIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Request Details
                        </Typography>
                      </Box>

                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <DetailItem
                            label="Status"
                            value={<Box sx={{ mt: 0.5 }}>{getStatusChip(selectedRequest.status)}</Box>}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <DetailItem
                            label="Request Date"
                            value={formatDate(selectedRequest.requestDate)}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" component="div">
                            Reason
                          </Typography>
                          <Paper variant="outlined" sx={{
                            p: 1.5,
                            mt: 0.5,
                            borderRadius: 1,
                            backgroundColor: 'action.hover',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="body2" whiteSpace="pre-line">
                              {selectedRequest.requestReason || 'No reason provided'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Comments Section */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: 'divider'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        pb: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <CommentIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Activity & Comments
                        </Typography>
                      </Box>

                      {commentsLoading ? (
                        <Box display="flex" justifyContent="center" py={3}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : comments.length === 0 ? (
                        <Box textAlign="center" py={2}>
                          <Typography variant="body2" color="text.secondary">
                            No comments or activity recorded
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{
                          maxHeight: '400px',
                          overflowY: 'auto',
                          pr: 1,
                          '&::-webkit-scrollbar': {
                            width: '6px'
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: '3px'
                          }
                        }}>
                          {comments.map((comment, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 2,
                                '&:last-child': { mb: 0 }
                              }}
                            >
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={comment.Stage}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      fontWeight: 500,
                                      fontSize: '0.65rem',
                                      height: '22px'
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(comment.Timestamp)}
                                  </Typography>
                                </Box>
                              </Box>
                              <Paper variant="outlined" sx={{
                                p: 1.5,
                                borderRadius: 1,
                                borderColor: 'divider',
                                backgroundColor: index % 2 === 0 ? 'background.paper' : 'action.hover'
                              }}>
                                <Typography variant="body2" whiteSpace="pre-line">
                                  {comment.Comment}
                                </Typography>
                              </Paper>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

const DetailItem = ({
  label,
  value,
  icon = null,
  dense = false,
  valueBold = false,
  valueColor = 'text.primary'
}) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    mb: dense ? 0.5 : 1,
    '&:last-child': { mb: 0 }
  }}>
    {icon && (
      <Box sx={{
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        height: '24px',
        mt: '2px'
      }}>
        {icon}
      </Box>
    )}
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          display: 'block',
          lineHeight: 1.3,
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 0.25,
          color: valueColor,
          fontWeight: valueBold ? 600 : 'normal',
          wordBreak: 'break-word'
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

export default VehicleRequestsComponent;
