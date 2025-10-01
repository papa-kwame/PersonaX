import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
  styled,
  Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  CarRepair as CarRepairIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Visibility as VisibilityIcon,
  AssignmentReturned as AssignmentReturnedIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MonetizationOnIcon,
  DoneAll as DoneAllIcon,
  Info as InfoIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRef} from 'react';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
    cursor: 'pointer'
  },
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: '8px',
  padding: '8px 16px',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)'
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: theme.palette.divider
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '1px'
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: '8px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status) {
    case 'Completed': color = theme.palette.success.main; break;
    case 'Approved': color = theme.palette.info.main; break;
    case 'Rejected': color = theme.palette.error.main; break;
    case 'In Progress': color = theme.palette.warning.main; break;
    default: color = theme.palette.grey[500];
  }
  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 600,
    padding: '4px 8px',
    border: `1px solid ${alpha(color, 0.3)}`
  };
});

const PriorityBadge = styled(Chip)(({ theme, priority }) => {
  let color;
  switch (priority) {
    case 'High': color = theme.palette.error.main; break;
    case 'Medium': color = theme.palette.warning.main; break;
    case 'Low': color = theme.palette.success.main; break;
    case 'Critical': color = theme.palette.error.dark; break;
    default: color = theme.palette.grey[500];
  }
  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: 600,
    padding: '4px 8px',
    border: `1px solid ${alpha(color, 0.3)}`
  };
});

// Professional color palette
const professionalColors = {
  primary: '#3f51b5',
  secondary: '#9c27b0',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  accent: '#6366f1',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1',
  success: '#2e7d32',
  border: '#e2e8f0',
  highlight: '#f0f4ff'
};

const priorityMap = {
  'Low': 0,
  'Medium': 1,
  'High': 2,
  'Critical': 3
};

const statusMap = {
  'Pending': 0,
  'Approved': 1,
  'Rejected': 2,
  'Completed': 3,
};

const stageOrder = ['Comment', 'Review', 'Approve', 'Commit', 'Complete'];

const reverseMappings = {
  priority: {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Critical'
  },
  status: {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    3: 'Completed',
  }
};

// Function to safely format a date
const safeFormat = (date, formatStr) => {
  if (!date) return 'N/A';
  try {
    return format(parseISO(date), formatStr);
  } catch (error) {
    return 'N/A';
  }
};

const RequestDetails = ({ request, workflowStatus, requestComments }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          p: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderRadius: 3,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          boxShadow: theme.shadows[1]
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: professionalColors.text }}>
          Requestor
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: professionalColors.primary }}>
            {request.requestorName?.charAt(0)?.toUpperCase() || request.requestedByUserName?.charAt(0)?.toUpperCase() || request.userName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ color: professionalColors.textSecondary, fontWeight: 500 }}>
            {request.requestorName || request.requestedByUserName || request.userName || 'Unknown User'}
          </Typography>
          <StatusBadge
            label={request.status}
            size="small"
            status={request.status}
            sx={{
              px: 1.5,
              py: 0.5,
              fontSize: '0.8rem'
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 2,
          mb: 2
        }}
      >
        {[
          {
            label: 'Request Reason',
            value: request.requestReason
          },
          {
            label: 'Request Date',
            value: request.requestDate
          },
          {
            label: 'Vehicle',
            value: request.vehicle ? `${request.vehicle.make} ${request.vehicle.model} (${request.vehicle.licensePlate})` : 'N/A'
          }
        ].map((item, index) => (
          <StyledPaper
            key={index}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: professionalColors.textSecondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontSize: '0.68rem',
                mb: 0.5,
                display: 'block'
              }}
            >
              {item.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {item.value}
              </Typography>
            </Box>
          </StyledPaper>
        ))}
      </Box>
      {workflowStatus && (
        <StyledPaper elevation={0} sx={{ mb: 4, px: 2, py: 3, borderRadius: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: professionalColors.textSecondary,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.72rem',
              mb: 2
            }}
          >
            Workflow Status
          </Typography>

          <Stepper activeStep={stageOrder.indexOf(request.currentStage)} orientation="horizontal">
            {stageOrder.map((stage, index) => (
              <Step key={stage}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }
                  }}
                >
                  {stage}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{
            mt: 4,
            p: 4,
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <CheckCircleOutlineRoundedIcon
                  sx={{
                    color: 'success.main',
                    mr: 1.5,
                    fontSize: 24
                  }}
                />
                <Typography variant="subtitle1" sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  letterSpacing: 0.5
                }}>
                  Completed Actions
                </Typography>
              </Box>

              {Object.entries(workflowStatus.completedActions).map(([stage, actions]) => (
                <Box key={stage} sx={{
                  mb: 3,
                  pl: 2,
                  borderLeft: '2px solid',
                  borderColor: 'success.light'
                }}>
                  <Typography variant="body1" sx={{
                    fontWeight: 500,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.primary',
                    '&:before': {
                      content: '""',
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      backgroundColor: 'success.main',
                      borderRadius: '50%',
                      mr: 2,
                      flexShrink: 0
                    }
                  }}>
                    {stage}
                  </Typography>

                  <Box sx={{ pl: 3 }}>
                    {actions.map((action, index) => (
                      <Box key={index} sx={{
                        mb: 2.5,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'action.hover',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccountCircleRoundedIcon
                            sx={{
                              color: 'action.active',
                              mr: 1.5,
                              fontSize: 20
                            }}
                          />
                          <Typography variant="body2" sx={{
                            fontWeight: 500,
                            color: 'text.primary'
                          }}>
                            {action.userName}
                          </Typography>
                          <Box sx={{
                            ml: 'auto',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 4,
                            backgroundColor: 'success.light',
                            fontSize: '0.7rem',
                            color: 'success.dark'
                          }}>
                            Completed
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{
                          color: 'text.secondary',
                          pl: 3.5,
                          mb: 1
                        }}>
                          {action.comments}
                        </Typography>

                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          pl: 3.5
                        }}>
                          <AccessTimeRoundedIcon
                            sx={{
                              color: 'text.disabled',
                              mr: 1,
                              fontSize: 16
                            }}
                          />
                          <Typography variant="caption" sx={{
                            color: 'text.disabled'
                          }}>
                            {safeFormat(action.timestamp, 'PPpp')}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <PendingActionsRoundedIcon
                  sx={{
                    color: 'warning.main',
                    mr: 1.5,
                    fontSize: 24
                  }}
                />
                <Typography variant="subtitle1" sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  letterSpacing: 0.5
                }}>
                  Pending Actions
                </Typography>
              </Box>

              <Box sx={{
                display: 'grid',
                gap: 2
              }}>
                {workflowStatus.pendingActions.map((action, index) => (
                  <Box key={index} sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: action.isPending ? 'warning.lightest' : 'success.lightest',
                    border: '1px solid',
                    borderColor: action.isPending ? 'warning.light' : 'success.light',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: action.isPending ? 'warning.main' : 'success.main',
                        mr: 2,
                        flexShrink: 0,
                        boxShadow: '0 0 0 4px rgba(255, 167, 38, 0.2)'
                      }} />

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 600,
                          color: 'text.primary'
                        }}>
                          {action.role}
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: 'text.secondary',
                          display: 'flex',
                          alignItems: 'center',
                          mt: 0.5
                        }}>
                          <PersonOutlineRoundedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {action.userName || 'Unassigned'}
                        </Typography>
                      </Box>

                      <Chip
                        label={action.isPending ? 'Pending' : 'Completed'}
                        size="small"
                        color={action.isPending ? 'warning' : 'success'}
                        sx={{
                          ml: 2,
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                          borderRadius: 6
                        }}
                        icon={action.isPending ?
                          <HourglassBottomRoundedIcon fontSize="small" /> :
                          <CheckCircleRoundedIcon fontSize="small" />
                        }
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </StyledPaper>
      )}
    </Box>
  );
};

const ActionButtons = ({ request, onProcessStage, onRejectRequest, currentTab, isProcessed }) => {
  const canProcessStage = currentTab === 'myRequests';
  const isFinalStage = request.currentStage === 'Approve';

  return (
    <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {canProcessStage && !isProcessed && (
        <StyledButton
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={onProcessStage}
          sx={{
            minWidth: 200,
            backgroundColor: professionalColors.primary,
            '&:hover': {
              backgroundColor: alpha(professionalColors.primary, 0.9)
            }
          }}
        >
          Process Current Stage
        </StyledButton>
      )}
      {isFinalStage && (
        <StyledButton
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={onRejectRequest}
          sx={{
            minWidth: 200,
            borderColor: professionalColors.error,
            color: professionalColors.error,
            '&:hover': {
              backgroundColor: alpha(professionalColors.error, 0.05),
              borderColor: professionalColors.error
            }
          }}
        >
          Reject Request
        </StyledButton>
      )}
    </Box>
  );
};

const VehicleAssignmentApp = () => {
  const theme = useTheme();
  const { isAuthenticated, userId, token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myRequests');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStageDialog, setOpenStageDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [pendingActions, setPendingActions] = useState([]);
  const [stageComments, setStageComments] = useState('');
  const [requestComments, setRequestComments] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingStage, setProcessingStage] = useState(false);
  const [processStageError, setProcessStageError] = useState(null);
  const [processStageSuccess, setProcessStageSuccess] = useState(false);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [detailsFromHistory, setDetailsFromHistory] = useState(false); // <-- add this
  const [highlightedRequest, setHighlightedRequest] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const highlightId = new URLSearchParams(location.search).get('highlight');
  const pendingRefs = useRef({});
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    vehicleId: '',
    requestReason: '',
    priority: 'Medium',
    estimatedCost: 0,
    adminComments: '',
    department: 'HR'
  });

  const formatRequestData = (request) => {
    const formatted = {
      ...request,
      id: request.id || request.requestId || request._id,
      priority: reverseMappings.priority[request.priority] || request.priority,
      status: reverseMappings.status[request.status] || request.status,
      requestedByUserName: request.userName || request.requestedByUserName,
      requestedByUserEmail: request.email || request.userEmail || request.requestedByUserEmail || '',
      requestReason: request.requestReason || request.reason || '',
      requestType: request.requestType || request.type || '',
      completionDate: request.completionDate || request.completedDate || request.dateCompleted || '',
      vehicle: request.vehicle || {},
    };

    if (formatted.requestDate) {
      formatted.requestDate = safeFormat(formatted.requestDate, 'PPpp');
    }
    if (formatted.completionDate) {
      formatted.completionDate = safeFormat(formatted.completionDate, 'PPpp');
    }
    if (formatted.approvedDate) {
      formatted.approvedDate = safeFormat(formatted.approvedDate, 'PPpp');
    }

    return formatted;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsRes, vehiclesRes, historyRes, myRequestsRes] = await Promise.all([
          api.get('/api/VehicleAssignment/RequestsBeforeApproval'),
          api.get('/api/Vehicles'),
          api.get('/api/VehicleAssignment/ApprovedRequests'), // <-- updated endpoint
          api.get(`/api/VehicleAssignment/MyVehicleRequests/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
        ]);

        // TEMP: Log the API response for debugging
        setRequests(requestsRes.data.map(formatRequestData));
        setVehicles(vehiclesRes.data);
        setHistory(historyRes.data.map(formatRequestData));
        setMyRequests(myRequestsRes.data.map(formatRequestData));

        const pendingRes = await api.get(`/api/VehicleAssignment/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPendingActions(pendingRes.data.map(formatRequestData));
      } catch (error) {
        if (error.response) {
          showNotification(`Failed to fetch data: ${error.response.data.message || error.response.statusText}`, 'error');
        } else if (error.request) {
          showNotification('Failed to fetch data: No response received', 'error');
        } else {
          showNotification(`Failed to fetch data: ${error.message}`, 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, token, userId]);

  useEffect(() => {
    if (activeTab === 'myRequests' && highlightId && pendingRefs.current[highlightId]) {
      setHighlightedRequest(highlightId);
      pendingRefs.current[highlightId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Remove highlight param from URL
      const params = new URLSearchParams(location.search);
      params.delete('highlight');
      navigate({ search: params.toString() }, { replace: true });
      // Remove highlight after 5 seconds
      const timeout = setTimeout(() => setHighlightedRequest(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [pendingActions, highlightId, location.search, navigate, activeTab]);

  useEffect(() => {
    // After history is loaded, fetch workflowStatus for each
    const fetchAllWorkflowStatuses = async () => {
      if (!history.length) return;
      const updatedHistory = await Promise.all(history.map(async (req) => {
        try {
          const res = await api.get(`/api/VehicleAssignment/vehicle-requests/${req.id}/workflow-status`);
          return { ...req, workflowStatus: res.data };
        } catch {
          return req; // fallback if error
        }
      }));
      setHistory(updatedHistory);
    };
    fetchAllWorkflowStatuses();
    // eslint-disable-next-line
  }, [history.length]);

  const fetchWorkflowStatus = async (requestId) => {
    try {
      const response = await api.get(`/api/VehicleAssignment/vehicle-requests/${requestId}/workflow-status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWorkflowStatus(response.data);
    } catch (error) {
      showNotification('Failed to fetch workflow status', 'error');
    }
  };

  const fetchRequestComments = async (requestId) => {
    try {
      const response = await api.get(`/api/VehicleAssignment/vehicle-requests/${requestId}/comments`);
      setRequestComments(response.data.comments || []);
    } catch (error) {
      showNotification('Failed to fetch request comments', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestPayload = {
        userId: userId,
        vehicleId: formData.vehicleId,
        requestReason: formData.requestReason,
        priority: priorityMap[formData.priority],
      };

      const response = await api.post('/api/VehicleAssignment/RequestVehicle', requestPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showNotification('Request submitted successfully!');

      const [requestsRes, pendingRes] = await Promise.all([
        api.get('/api/VehicleAssignment/RequestsBeforeApproval'),
        api.get(`/api/VehicleAssignment/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);
      setRequests(requestsRes.data.map(formatRequestData));
      setPendingActions(pendingRes.data.map(formatRequestData));
      setOpenDialog(false);
      setFormData({
        vehicleId: '',
        requestReason: '',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to submit request';
      showNotification(errorMessage, 'error');
    }
  };

  const shouldSkipForRequestor = (request, userId) => {
    const currentStage = request.currentStage;
    const isRequestor = request.requestedByUserId === userId;
    const stageUsers = request.route?.userRoles
      ?.filter(ur => ur.role.toLowerCase() === currentStage.toLowerCase())
      ?.map(ur => ur.userId);

    return isRequestor && stageUsers?.includes(userId);
  };

  const handleProcessStage = async () => {
    if (!selectedRequest) return;
    setProcessingStage(true);
    setProcessStageError(null);
    try {
      if (shouldSkipForRequestor(selectedRequest, userId)) {
        await api.post(`/api/VehicleAssignment/vehicle-requests/${selectedRequest.id}/process-stage?userId=${userId}`, {
          comments: 'Automatically skipped'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        const payload = {
          comments: stageComments
        };
        if (selectedRequest.currentStage === 'Commit') {
          payload.estimatedCost = formData.estimatedCost;
        }
        const response = await api.post(`/api/VehicleAssignment/vehicle-requests/${selectedRequest.id}/process-stage?userId=${userId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.message) {
          showNotification(response.data.message, 'success');
        }
      }
      const [requestsRes, historyRes, pendingRes] = await Promise.all([
        api.get('/api/VehicleAssignment/RequestsBeforeApproval'),
        api.get('/api/VehicleAssignment/ApprovedRequests'),
        api.get(`/api/VehicleAssignment/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);
      setRequests(requestsRes.data.map(formatRequestData));
      setHistory(historyRes.data.map(formatRequestData));
      setPendingActions(pendingRes.data.map(formatRequestData));
      setProcessStageSuccess(true);
      setProcessedRequests(prev => [...prev, selectedRequest.id]);
      setStageComments('');
      fetchWorkflowStatus(selectedRequest.id);
      fetchRequestComments(selectedRequest.id);
      // Close the modal after successful process
      setOpenStageDialog(false);
      setProcessStageSuccess(false);
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to process stage';
      setProcessStageError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setProcessingStage(false);
    }
  };

  const handleRejectRequest = (id) => {
    const request = requests.find(r => r.id === id);
    if (!request) {
      showNotification('Request not found', 'error');
      return;
    }

    if (request.currentStage !== 'Approve') {
      showNotification('Only the final role can reject the request', 'error');
      return;
    }

    setSelectedRequest(request);
    setOpenRejectDialog(true);
  };

  const confirmRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      const payload = JSON.stringify(rejectionReason);

      const response = await api.post(
        `/api/VehicleAssignment/${selectedRequest.id}/reject?userId=${userId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showNotification('Request rejected successfully!');

      const [requestsRes, pendingRes] = await Promise.all([
        api.get('/api/VehicleAssignment/RequestsBeforeApproval'),
        api.get(`/api/VehicleAssignment/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      setRequests(requestsRes.data.map(formatRequestData));
      setPendingActions(pendingRes.data.map(formatRequestData));
      setOpenRejectDialog(false);
      setRejectionReason('');
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to reject request';
      showNotification(errorMessage, 'error');
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'Repair': return <CarRepairIcon fontSize="small" />;
      case 'Maintenance': return <BuildIcon fontSize="small" />;
      case 'Inspection': return <AssignmentIcon fontSize="small" />;
      default: return <LocalShippingIcon fontSize="small" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Low': return <LowPriorityIcon fontSize="small" />;
      case 'Medium': return <PriorityHighIcon fontSize="small" />;
      case 'High': return <PriorityHighIcon fontSize="small" />;
      case 'Critical': return <PriorityHighIcon fontSize="small" />;
      default: return <LowPriorityIcon fontSize="small" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon fontSize="small" />;
      case 'Rejected': return <CancelIcon fontSize="small" />;
      case 'Approved': return <ThumbUpIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  // Helper to get Approve action timestamp for history cards
  const getApproveDate = (request) => {
    if (
      request.workflowStatus &&
      request.workflowStatus.completedActions &&
      request.workflowStatus.completedActions.Approve &&
      request.workflowStatus.completedActions.Approve.length > 0
    ) {
      // Use the last Approve action (in case of multiple)
      const approveAction = request.workflowStatus.completedActions.Approve.slice(-1)[0];
      return approveAction.timestamp;
    }
    return request.completionDate || request.completedDate || request.dateCompleted || null;
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        backgroundColor: professionalColors.background
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: professionalColors.primary }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{
      py: 4,
      backgroundColor: professionalColors.background,
      maxHeight: '80vh'
    }}>
      <StyledPaper elevation={2}>
        <Box sx={{
          p: 4,
          borderBottom: `1px solid ${professionalColors.border}`,
          backgroundColor: professionalColors.surface
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h4" sx={{
              fontWeight: 300,
              color: professionalColors.text,
              fontSize: { xs: '1rem', sm: '1.8rem' },
              letterSpacing: '-0.5px'
            }}>
              Vehicle Requests
            </Typography>
            <StyledButton
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setOpenHistoryDialog(true)}
              sx={{
                minWidth: 150,
                borderColor: professionalColors.primary,
                color: professionalColors.primary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.primary, 0.05),
                  borderColor: professionalColors.primary
                }
              }}
            >
              History
            </StyledButton>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="vehicle assignment tabs"
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${professionalColors.border}`,
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: professionalColors.primary
            }
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" />
                <span>My Pending Actions</span>
                {pendingActions.length > 0 && (
                  <Badge
                    badgeContent={pendingActions.length}
                    color="secondary"
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -10,
                        top: -10,
                        fontWeight: 500
                      }
                    }}
                  />
                )}
              </Box>
            }
            value="myRequests"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              py: 2,
              minHeight: 'auto',
              '&.Mui-selected': {
                color: professionalColors.primary
              }
            }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" />
                <span>All Requests</span>
                {requests.length > 0 && (
                  <Badge
                    badgeContent={requests.length}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -10,
                        top: -10,
                        fontWeight: 500
                      }
                    }}
                  />
                )}
              </Box>
            }
            value="inbox"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              py: 2,
              minHeight: 'auto',
              '&.Mui-selected': {
                color: professionalColors.primary
              }
            }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" />
                <span>My Requests</span>
              </Box>
            }
            value="myVehicleRequests"
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              py: 2,
              minHeight: 'auto',
              '&.Mui-selected': {
                color: professionalColors.primary
              }
            }}
          />
        </Tabs>

        <Box sx={{ p: 3 , height: '670px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'inbox' && (
            <>
              {requests.length > 0 ? (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ '& > * + *': { mt: 1.5 } }}>
                      {requests.map((request) => (
                        <StyledPaper
                          key={request.id}
                          elevation={0}
                          onClick={() => {
                            setSelectedRequest(request);
                            setOpenDetailsDialog(true);
                            setDetailsFromHistory(false);
                            fetchWorkflowStatus(request.id);
                            fetchRequestComments(request.id);
                          }}
                          sx={{
                            cursor: 'pointer',
                            p: 2.5,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            flexWrap: 'wrap',
                            [theme.breakpoints.down('sm')]: {
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 1.5
                            }
                          }}>
                            <Box sx={{
                              flex: 1,
                              minWidth: 250,
                              [theme.breakpoints.down('sm')]: {
                                width: '100%'
                              }
                            }}>
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 700,
                                mb: 0.5,
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                Vehicle Assignment Request
                              </Typography>

                              <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                mt: 1.5,
                                mb: 1.5,
                                [theme.breakpoints.down('sm')]: {
                                  flexDirection: 'column',
                                  gap: 1
                                }
                              }}>
                                <Typography variant="body2" sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.secondary'
                                }}>
                                  {request.requestedByUserEmail}
                                </Typography>

                                <Typography variant="body2" sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.secondary'
                                }}>
                                  {request.vehicle ? (
                                    <>
                                      {request.vehicle.make} {request.vehicle.model}
                                      <Chip
                                        label={request.vehicle.licensePlate}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          ml: 1,
                                          fontSize: '0.7rem',
                                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                                          color: theme.palette.success.dark
                                        }}
                                      />
                                    </>
                                  ) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{
                              display: 'flex',
                              gap: 1.5,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              [theme.breakpoints.down('sm')]: {
                                width: '100%',
                                justifyContent: 'flex-start'
                              }
                            }}>
                              <StatusBadge
                                label={request.status}
                                size="small"
                                status={request.status}
                                icon={getStatusIcon(request.status)}
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: '0.8rem'
                                }}
                              />
                              <Chip
                                label={request.currentStage}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                                  color: theme.palette.info.dark,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  height: 24
                                }}
                              />
                            </Box>
                          </Box>
                        </StyledPaper>
                      ))}
                    </List>
                  </Box>
                </>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  p: 6,
                  border: `1px dashed ${professionalColors.border}`,
                  borderRadius: '8px',
                  backgroundColor: alpha(professionalColors.primary, 0.02),
                  height: '670px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <AssignmentIcon sx={{
                    fontSize: 80,
                    color: alpha(professionalColors.textSecondary, 0.3),
                    mb: 2
                  }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 500,
                    color: professionalColors.textSecondary,
                    mb: 1
                  }}>
                    No Vehicle Assignment Requests
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: alpha(professionalColors.textSecondary, 0.7),
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    There are currently no vehicle assignment requests. Click "New Request" to create one.
                  </Typography>
                </Box>
              )}
            </>
          )}

          {activeTab === 'myRequests' && (
            <>
              {pendingActions.length > 0 ? (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ '& > * + *': { mt: 1.5 } }}>
                      {pendingActions.map((request) => (
                        <StyledPaper
                          key={request.id}
                          ref={el => pendingRefs.current[request.id] = el}
                          elevation={0}
                          sx={{
                            cursor: 'pointer',
                            p: 2.5,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            backgroundColor: highlightedRequest === String(request.id) ? 'rgba(59,130,246,0.08)' : 'background.paper',
                            border: highlightedRequest === String(request.id) ? '2.5px solid #2563eb' : '1px solid',
                            borderColor: highlightedRequest === String(request.id) ? '#2563eb' : 'divider',
                            boxShadow: highlightedRequest === String(request.id) ? '0 4px 24px rgba(37,99,235,0.12)' : undefined,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              borderColor: 'primary.light'
                            },
                          }}
                          onClick={() => {
                            setSelectedRequest(request);
                            setOpenDetailsDialog(true);
                            setDetailsFromHistory(false);
                            fetchWorkflowStatus(request.id);
                            fetchRequestComments(request.id);
                          }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            flexWrap: 'wrap',
                            [theme.breakpoints.down('sm')]: {
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 1.5
                            }
                          }}>
                            <Box sx={{
                              flex: 1,
                              minWidth: 250,
                              [theme.breakpoints.down('sm')]: {
                                width: '100%'
                              }
                            }}>
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 700,
                                mb: 0.5,
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                Vehicle Assignment Request
                              </Typography>

                              <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                mt: 1.5,
                                mb: 1.5,
                                [theme.breakpoints.down('sm')]: {
                                  flexDirection: 'column',
                                  gap: 1
                                }
                              }}>
                                <Typography variant="body2" sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.secondary'
                                }}>
                                  {request.requestedByUserEmail}
                                </Typography>

                                <Typography variant="body2" sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.secondary'
                                }}>
                                  {request.vehicle ? (
                                    <>
                                      {request.vehicle.make} {request.vehicle.model}
                                      <Chip
                                        label={request.vehicle.licensePlate}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          ml: 1,
                                          fontSize: '0.7rem',
                                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                                          color: theme.palette.success.dark
                                        }}
                                      />
                                    </>
                                  ) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{
                              display: 'flex',
                              gap: 1.5,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              [theme.breakpoints.down('sm')]: {
                                width: '100%',
                                justifyContent: 'flex-start'
                              }
                            }}>
                              <StatusBadge
                                label={request.status}
                                size="small"
                                status={request.status}
                                icon={getStatusIcon(request.status)}
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: '0.8rem'
                                }}
                              />
                              <Chip
                                label={request.currentStage}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                                  color: theme.palette.info.dark,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  height: 24
                                }}
                              />
                            </Box>
                          </Box>
                        </StyledPaper>
                      ))}
                    </List>
                  </Box>
                  {pendingActions.length > 4 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 0 }}>
                      <Pagination
                        count={Math.ceil(pendingActions.length / 4)}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  p: 6,
                  border: `1px dashed ${professionalColors.border}`,
                  borderRadius: '8px',
                  backgroundColor: alpha(professionalColors.primary, 0.02),
                  height: '670px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <AssignmentIcon sx={{
                    fontSize: 80,
                    color: alpha(professionalColors.textSecondary, 0.3),
                    mb: 2
                  }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 500,
                    color: professionalColors.textSecondary,
                    mb: 1
                  }}>
                    No Pending Actions
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: alpha(professionalColors.textSecondary, 0.7),
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    You don't have any pending actions for vehicle assignment requests at this time.
                  </Typography>
                </Box>
              )}
            </>
          )}

          {activeTab === 'myVehicleRequests' && (
            <>
              {myRequests.length > 0 ? (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ '& > * + *': { mt: 1.5 } }}>
                      {myRequests.map((request) => (
                        <StyledPaper
                          key={request.id}
                          elevation={0}
                          onClick={() => {
                            setSelectedRequest(request);
                            setOpenDetailsDialog(true);
                            setDetailsFromHistory(false);
                            fetchWorkflowStatus(request.id);
                            fetchRequestComments(request.id);
                          }}
                          sx={{
                            cursor: 'pointer',
                            p: 2.5,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              borderColor: 'primary.light'
                            }
                          }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            flexWrap: 'wrap',
                            [theme.breakpoints.down('sm')]: {
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 1.5
                            }
                          }}>
                            <Box sx={{
                              flex: 1,
                              minWidth: 250,
                              [theme.breakpoints.down('sm')]: {
                                width: '100%'
                              }
                            }}>
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 700,
                                mb: 0.5,
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                Vehicle Assignment Request
                              </Typography>

                              <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                mt: 1.5,
                                mb: 1.5,
                                [theme.breakpoints.down('sm')]: {
                                  flexDirection: 'column',
                                  gap: 1
                                }
                              }}>
                                <Typography variant="body2" sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.secondary'
                                }}>
                                  {request.requestedByUserEmail}
                                </Typography>

                                <Typography variant="body2" sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.secondary'
                                }}>
                                  {request.vehicle ? (
                                    <>
                                      {request.vehicle.make} {request.vehicle.model}
                                      <Chip
                                        label={request.vehicle.licensePlate}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          ml: 1,
                                          fontSize: '0.7rem',
                                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                                          color: theme.palette.success.dark
                                        }}
                                      />
                                    </>
                                  ) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{
                              display: 'flex',
                              gap: 1.5,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              [theme.breakpoints.down('sm')]: {
                                width: '100%',
                                justifyContent: 'flex-start'
                              }
                            }}>
                              <StatusBadge
                                label={request.status}
                                size="small"
                                status={request.status}
                                icon={getStatusIcon(request.status)}
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  fontSize: '0.8rem'
                                }}
                              />
                              <Chip
                                label={request.currentStage}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  backgroundColor: alpha(theme.palette.info.main, 0.15),
                                  color: theme.palette.info.dark,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  height: 24
                                }}
                              />
                            </Box>
                          </Box>
                        </StyledPaper>
                      ))}
                    </List>
                  </Box>
                </>
              ) : (
                <Box sx={{
                  textAlign: 'center',
                  p: 6,
                  border: `1px dashed ${professionalColors.border}`,
                  borderRadius: '8px',
                  backgroundColor: alpha(professionalColors.primary, 0.02),
                  height: '670px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <AssignmentIcon sx={{
                    fontSize: 80,
                    color: alpha(professionalColors.textSecondary, 0.3),
                    mb: 2
                  }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 500,
                    color: professionalColors.textSecondary,
                    mb: 1
                  }}>
                    No Vehicle Assignment Requests
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: alpha(professionalColors.textSecondary, 0.7),
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    There are currently no vehicle assignment requests. Click "New Request" to create one.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 600,
            borderBottom: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface,
            fontSize: '1.25rem'
          }}>
            Create Vehicle Assignment Request
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel sx={{
                  color: professionalColors.textSecondary,
                  '&.Mui-focused': {
                    color: professionalColors.primary
                  }
                }}>
                  Vehicle
                </InputLabel>
                <StyledSelect
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  required
                >
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel sx={{
                    color: professionalColors.textSecondary,
                    '&.Mui-focused': {
                      color: professionalColors.primary
                    }
                  }}>
                    Priority
                  </InputLabel>
                  <StyledSelect
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.entries(priorityMap).map(([key]) => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel sx={{
                    color: professionalColors.textSecondary,
                    '&.Mui-focused': {
                      color: professionalColors.primary
                    }
                  }}>
                    Department
                  </InputLabel>
                  <StyledSelect
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Operations">SWD</MenuItem>
                    <MenuItem value="IT">S.Iy</MenuItem>
                  </StyledSelect>
                </FormControl>

                <StyledTextField
                  fullWidth
                  name="estimatedCost"
                  label="Estimated Cost ($)"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={handleInputChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Box>

              <StyledTextField
                fullWidth
                margin="normal"
                name="requestReason"
                label="Request Reason"
                value={formData.requestReason}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            borderTop: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            <StyledButton
              onClick={() => setOpenDialog(false)}
              sx={{
                color: professionalColors.textSecondary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.textSecondary, 0.05)
                }
              }}
            >
              Cancel
            </StyledButton>
            <StyledButton
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: professionalColors.primary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.primary, 0.9)
                }
              }}
            >
              Submit Request
            </StyledButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 600,
            borderBottom: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            Request Details
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            {selectedRequest && (
              <>
                <RequestDetails
                  request={selectedRequest}
                  workflowStatus={workflowStatus}
                  requestComments={requestComments}
                />
                {!detailsFromHistory && (
                  <ActionButtons
                    request={selectedRequest}
                    onProcessStage={() => {
                      setOpenStageDialog(true);
                      fetchWorkflowStatus(selectedRequest.id);
                    }}
                    onRejectRequest={() => handleRejectRequest(selectedRequest.id)}
                    currentTab={activeTab}
                    isProcessed={processedRequests.includes(selectedRequest.id)}
                  />
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            borderTop: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            <StyledButton
              onClick={() => setOpenDetailsDialog(false)}
            >
              Close
            </StyledButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openStageDialog}
          onClose={() => { setOpenStageDialog(false); setProcessStageSuccess(false); }}
          PaperProps={{
            sx: {
              borderRadius: '12px'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 600,
            borderBottom: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            Process Current Stage
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            {selectedRequest && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You are processing the <strong>{selectedRequest.currentStage}</strong> stage.
                </Typography>
                <StyledTextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Comments"
                  value={stageComments}
                  onChange={(e) => setStageComments(e.target.value)}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            borderTop: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            <StyledButton
              onClick={() => { setOpenStageDialog(false); setProcessStageSuccess(false); }}
              sx={{
                color: professionalColors.textSecondary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.textSecondary, 0.05)
                }
              }}
            >
              Cancel
            </StyledButton>
            {!processStageSuccess && (
              <StyledButton
                onClick={handleProcessStage}
                variant="contained"
                sx={{
                  backgroundColor: professionalColors.primary,
                  '&:hover': {
                    backgroundColor: alpha(professionalColors.primary, 0.9)
                  }
                }}
                disabled={processingStage}
                endIcon={processingStage ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {processingStage ? 'Processing...' : 'Submit'}
              </StyledButton>
            )}
            {processStageError && (
              <Alert severity="error" sx={{ mt: 1 }}>{processStageError}</Alert>
            )}
          </DialogActions>
        </Dialog>

        <Dialog
          open={openHistoryDialog}
          onClose={() => setOpenHistoryDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 600,
            borderBottom: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            Vehicle Assignment History
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            {history.length > 0 ? (
              <List sx={{ '& > * + *': { mt: 1.5 } }}>
                {history.map((request) => (
                  <StyledPaper
                    key={request.id}
                    elevation={0}
                    onClick={() => {
                      setSelectedRequest(request);
                      setOpenDetailsDialog(true);
                      setDetailsFromHistory(true); 
                      fetchWorkflowStatus(request.id);
                      fetchRequestComments(request.id);
                    }}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: '0 6px 24px rgba(0,0,0,0.1)'
                      },
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${professionalColors.border}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: professionalColors.primary,
                        boxShadow: `0 2px 12px ${alpha(professionalColors.primary, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      flexWrap: 'wrap',
                      [theme.breakpoints.down('sm')]: {
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }
                    }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {(request.requestReason || request.reason || 'No reason provided') + ' - Requested by ' + ( request.userName || 'Unknown')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: professionalColors.textSecondary }}>
                          {(request.requestType || 'Vehicle Request')}    Completed on {getApproveDate(request) ? safeFormat(getApproveDate(request), 'PP') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        [theme.breakpoints.down('sm')]: {
                          width: '100%'
                        }
                      }}>
                        <StatusBadge
                          label={request.status}
                          size="small"
                          status={request.status}
                          icon={getStatusIcon(request.status)}
                        />
                      </Box>
                    </Box>
                  </StyledPaper>
                ))}
              </List>
            ) : (
              <Box sx={{
                textAlign: 'center',
                p: 6,
                border: `1px dashed ${professionalColors.border}`,
                borderRadius: '8px',
                backgroundColor: alpha(professionalColors.primary, 0.02)
              }}>
                <HistoryIcon sx={{
                  fontSize: 80,
                  color: alpha(professionalColors.textSecondary, 0.3),
                  mb: 2
                }} />
                <Typography variant="h6" sx={{
                  fontWeight: 500,
                  color: professionalColors.textSecondary,
                  mb: 1
                }}>
                  No Vehicle Assignment History
                </Typography>
                <Typography variant="body2" sx={{
                  color: alpha(professionalColors.textSecondary, 0.7),
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  There are no completed vehicle assignment requests in the history.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            borderTop: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            <StyledButton
              onClick={() => setOpenHistoryDialog(false)}
            >
              Close
            </StyledButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openRejectDialog}
          onClose={() => setOpenRejectDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: '12px'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: 600,
            borderBottom: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            Reject Request
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <StyledTextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{
            p: 2,
            borderTop: `1px solid ${professionalColors.border}`,
            backgroundColor: professionalColors.surface
          }}>
            <StyledButton
              onClick={() => setOpenRejectDialog(false)}
              sx={{
                color: professionalColors.textSecondary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.textSecondary, 0.05)
                }
              }}
            >
              Cancel
            </StyledButton>
            <StyledButton
              onClick={confirmRejectRequest}
              variant="contained"
              color="error"
              sx={{
                backgroundColor: professionalColors.error,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.error, 0.9)
                }
              }}
            >
              Reject
            </StyledButton>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{
              width: '100%',
              borderRadius: '8px',
              boxShadow: theme.shadows[6],
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </StyledPaper>
    </Container>
  );
};

export default VehicleAssignmentApp;
