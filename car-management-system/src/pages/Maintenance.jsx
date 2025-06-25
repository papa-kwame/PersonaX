import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
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
  styled
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
  Download as DownloadIcon,
  DescriptionRounded as DescriptionRoundedIcon,
  EventRounded as EventRoundedIcon,
  TimelineRounded as TimelineRoundedIcon,
  MonetizationOnRounded as MonetizationOnRoundedIcon,
  AdminPanelSettingsRounded as AdminPanelSettingsRoundedIcon,
  CloudUploadRounded as CloudUploadRoundedIcon,
  DownloadRounded as DownloadRoundedIcon,
  InsertDriveFileRounded as InsertDriveFileRoundedIcon,
  AccessTimeRounded as AccessTimeRoundedIcon,
  FiberManualRecord as FiberManualRecordIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';

const stringToColor = (string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

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

const requestTypeMap = {
  'Repair': 0,
  'Maintenance': 1,
  'Inspection': 2,
  'Other': 3
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
  'InProgress': 2,
  'Completed': 3,
  'Rejected': 4
};

const stageOrder = ['Comment', 'Review', 'Commit', 'Approve', 'Complete'];

const reverseMappings = {
  requestType: {
    0: 'Repair',
    1: 'Maintenance',
    2: 'Inspection',
    3: 'Other'
  },
  priority: {
    0: 'Low',
    1: 'Medium',
    2: 'High',
    3: 'Critical'
  },
  status: {
    0: 'Pending',
    1: 'Approved',
    2: 'In Progress',
    3: 'Completed',
    4: 'Rejected'
  }
};

const MaintenanceRequestApp = () => {
  const theme = useTheme();
  const { isAuthenticated, userId, token, userRoles } = useAuth();
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myRequests');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openStageDialog, setOpenStageDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [pendingActions, setPendingActions] = useState([]);
  const [stageComments, setStageComments] = useState('');
  const [requestComments, setRequestComments] = useState([]);
  const [requestDocuments, setRequestDocuments] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const processStageButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    vehicleId: '',
    requestType: 'Repair',
    description: '',
    priority: 'Medium',
    estimatedCost: 0,
    adminComments: '',
    department: 'HR'
  });

  const formatRequestData = (request) => {
    const formatted = {
      ...request,
      requestType: reverseMappings.requestType[request.requestType] || request.requestType,
      priority: reverseMappings.priority[request.priority] || request.priority,
      status: reverseMappings.status[request.status] || request.status
    };

    if (request.requestDate) {
      formatted.requestDate = parseISO(request.requestDate);
    }
    if (request.completionDate) {
      formatted.completionDate = parseISO(request.completionDate);
    }
    if (request.approvedDate) {
      formatted.approvedDate = parseISO(request.approvedDate);
    }

    return formatted;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [requestsRes, vehiclesRes, historyRes] = await Promise.all([
          api.get('/api/MaintenanceRequest/active-requests'),
          api.get('/api/Vehicles'),
          api.get('/api/MaintenanceRequest/approved-rejected')
        ]);

        setRequests(requestsRes.data.map(formatRequestData));
        setVehicles(vehiclesRes.data);
        setHistory(historyRes.data.map(formatRequestData));

        const pendingRes = await api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
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
    setActiveTab('myRequests');
  }, []);

  useEffect(() => {
    if (activeTab === 'myRequestsTab') {
      fetchMyRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    console.log('Selected Request State:', selectedRequest);
  }, [selectedRequest]);

  const fetchWorkflowStatus = async (requestId) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/workflow-status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Workflow Status:', response.data);
      setWorkflowStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch workflow status:', error);
      showNotification('Failed to fetch workflow status', 'error');
    }
  };

  const fetchRequestComments = async (requestId) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/comments`);
      console.log('Request Comments:', response.data.comments);
      setRequestComments(response.data.comments);
    } catch (error) {
      console.error('Failed to fetch request comments:', error);
      showNotification('Failed to fetch request comments', 'error');
    }
  };

  const fetchRequestDocuments = async (requestId) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/documents`);
      console.log('Request Documents:', response.data.documents);
      setRequestDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch request documents:', error);
      showNotification('Failed to fetch request documents', 'error');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/my-requests?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMyRequests(response.data.map(formatRequestData));
    } catch (error) {
      showNotification('Failed to fetch your requests', 'error');
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
        vehicleId: formData.vehicleId,
        requestType: requestTypeMap[formData.requestType],
        description: formData.description,
        priority: priorityMap[formData.priority],
        estimatedCost: formData.estimatedCost,
        adminComments: formData.adminComments || null,
        department: formData.department
      };

      const response = await api.post(`/api/MaintenanceRequest?userId=${userId}`, requestPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      showNotification('Request submitted successfully!');

      const [requestsRes, pendingRes] = await Promise.all([
        api.get('/api/MaintenanceRequest'),
        api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
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
        requestType: 'Repair',
        description: '',
        priority: 'Medium',
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

    try {
      if (shouldSkipForRequestor(selectedRequest, userId)) {
        await api.post(`/api/MaintenanceRequest/${selectedRequest.id}/process-stage?userId=${userId}`, {
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

        await api.post(`/api/MaintenanceRequest/${selectedRequest.id}/process-stage?userId=${userId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      showNotification('Stage processed successfully!');

      const [requestsRes, pendingRes] = await Promise.all([
        api.get('/api/MaintenanceRequest'),
        api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      setRequests(requestsRes.data.map(formatRequestData));
      setPendingActions(pendingRes.data.map(formatRequestData));
      setOpenStageDialog(false);
      setStageComments('');
      fetchWorkflowStatus(selectedRequest.id);
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to process stage';
      showNotification(errorMessage, 'error');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      const request = requests.find(r => r.id === id);
      if (!request) {
        showNotification('Request not found', 'error');
        return;
      }

      if (request.currentStage !== 'Approve') {
        showNotification('Only the final role can reject the request', 'error');
        return;
      }

      const rejectionReason = prompt("Please enter the reason for rejection:");
      if (rejectionReason === null) return;

      await api.post(
        `/api/MaintenanceRequest/${id}/reject?userId=${userId}`,
        rejectionReason,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showNotification('Request rejected successfully!');

      const [requestsRes, pendingRes] = await Promise.all([
        api.get('/api/MaintenanceRequest/AllRequests'),
        api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);

      setRequests(requestsRes.data.map(formatRequestData));
      setPendingActions(pendingRes.data.map(formatRequestData));
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
        error.response?.data?.message ||
        error.message ||
        'Failed to reject request';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDocumentUpload = async (requestId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/api/MaintenanceRequest/${requestId}/upload-document?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      showNotification('Document uploaded successfully!');
      fetchRequestDocuments(requestId);
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to upload document';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDocumentDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/documents/${documentId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      const errorMessage = error.response?.data?.title ||
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to download document';
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

  const renderRequestDetails = (request) => {
    return (
      <Box sx={{ mt: 4, px: { xs: 2, md: 4 }, pb: 4 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
          p: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          borderRadius: 3,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          boxShadow: theme.shadows[1]
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 700,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <DescriptionRoundedIcon color="primary" />
            Request Details
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            backgroundColor: 'action.hover',
            p: 1.5,
            borderRadius: 2
          }}>
            <Avatar sx={{
              width: 36,
              height: 36,
              bgcolor: professionalColors.primary,
              color: 'common.white'
            }}>
              {request.requestedByUserName?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="caption" sx={{
                color: 'text.secondary',
                display: 'block',
                lineHeight: 1.2
              }}>
                Requested by
              </Typography>
              <Typography variant="body2" sx={{
                color: 'text.primary',
                fontWeight: 500
              }}>
                {request.requestedByUserName || 'Unknown User'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 2,
          mb: 4
        }}>
          {[
            {
              label: 'Request Type',
              value: request.requestType,
              icon: getRequestTypeIcon(request.requestType),
              color: 'primary.main'
            },
            {
              label: 'Priority',
              value: request.priority,
              icon: getPriorityIcon(request.priority),
              color: request.priority === 'High' ? 'error.main' :
                     request.priority === 'Medium' ? 'warning.main' : 'success.main'
            },
            {
              label: 'Status',
              value: request.status,
              icon: getStatusIcon(request.status),
              color: request.status === 'Approved' ? 'success.main' :
                     request.status === 'Rejected' ? 'error.main' : 'warning.main'
            },
            {
              label: 'Request Date',
              value: format(request.requestDate, 'PPpp'),
              icon: <EventRoundedIcon />
            },
            {
              label: 'Current Stage',
              value: request.currentStage,
              icon: <TimelineRoundedIcon />
            },
            {
              label: 'Estimated Cost',
              value: `$${request.estimatedCost?.toFixed(2) || '0.00'}`,
              icon: <MonetizationOnRoundedIcon />,
              color: 'success.main'
            }
          ].map((item, index) => (
            <StyledPaper
              key={index}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.65rem',
                  mb: 1,
                  display: 'block'
                }}
              >
                {item.label}
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}>
                {item.icon &&
                  React.cloneElement(item.icon, {
                    sx: {
                      color: item.color || 'text.secondary',
                      fontSize: '1.4rem'
                    }
                  })}
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: item.color || 'text.primary'
                }}>
                  {item.value}
                </Typography>
              </Box>
            </StyledPaper>
          ))}
        </Box>

        <StyledPaper elevation={0} sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="overline" sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 1,
            fontSize: '0.7rem',
            mb: 2
          }}>
            Description
          </Typography>
          <Typography variant="body1" sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            color: 'text.primary'
          }}>
            {request.description}
          </Typography>
        </StyledPaper>

        {request.adminComments && (
          <StyledPaper elevation={0} sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.secondary.main, 0.03),
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 2
            }}>
              <AdminPanelSettingsRoundedIcon color="secondary" />
              <Typography variant="overline" sx={{
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: '0.7rem'
              }}>
                Admin Comments
              </Typography>
            </Box>
            <Typography variant="body1" sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.6,
              color: 'text.primary'
            }}>
              {request.adminComments}
            </Typography>
          </StyledPaper>
        )}

        <StyledPaper elevation={0} sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="overline" sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 1,
            fontSize: '0.7rem',
            mb: 2
          }}>
            Upload Document
          </Typography>
          <Box
            sx={{
              p: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
              backgroundColor: 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
                cursor: 'pointer'
              }
            }}
          >
            <input
              type="file"
              style={{ display: 'none' }}
              id={`upload-${request.id}`}
              onChange={(e) => handleDocumentUpload(request.id, e.target.files[0])}
            />
            <label htmlFor={`upload-${request.id}`}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}>
                <CloudUploadRoundedIcon sx={{
                  color: 'primary.main',
                  fontSize: '2.5rem'
                }} />
                <Typography variant="body2" sx={{
                  color: 'primary.main',
                  fontWeight: 500
                }}>
                  Click to select file or drag and drop
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'text.secondary'
                }}>
                  PDF, DOCX, XLSX up to 10MB
                </Typography>
              </Box>
            </label>
          </Box>
        </StyledPaper>

        {requestDocuments.length > 0 && (
          <StyledPaper elevation={0} sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="overline" sx={{
              display: 'block',
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: 1,
              fontSize: '0.7rem',
              mb: 2
            }}>
              Attached Documents ({requestDocuments.length})
            </Typography>
            <List disablePadding>
              {requestDocuments.map((document, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    px: 0,
                    '&:last-child': {
                      borderBottom: 'none'
                    }
                  }}
                  secondaryAction={
                    <Tooltip title="Download">
                      <IconButton
                        edge="end"
                        aria-label="download"
                        onClick={() => handleDocumentDownload(document.documentId, document.fileName)}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <DownloadRoundedIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}>
                      <InsertDriveFileRoundedIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{
                        fontWeight: 500,
                        color: 'text.primary'
                      }}>
                        {document.fileName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        <EventRoundedIcon sx={{ fontSize: '0.9rem' }} />
                        {format(new Date(document.uploadDate), 'PPpp')}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </StyledPaper>
        )}

        {(workflowStatus || requestComments.length > 0) && (
          <StyledPaper
            elevation={0}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
              transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
              '&:hover': {
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {workflowStatus && (
              <Box sx={{ mb: requestComments.length > 0 ? 4 : 0 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    fontSize: '0.65rem',
                    mb: 2.5,
                    textTransform: 'uppercase'
                  }}
                >
                  Workflow Progress
                </Typography>

                <Stepper
                  activeStep={stageOrder.indexOf(request.currentStage)}
                  orientation="horizontal"
                  sx={{
                    '& .MuiStepConnector-line': {
                      borderColor: 'divider',
                      borderWidth: 2
                    }
                  }}
                >
                  {stageOrder.map((stage) => (
                    <Step key={stage}>
                      <StepLabel
                        StepIconProps={{
                          sx: {
                            '&.Mui-completed': {
                              color: 'success.main'
                            },
                            '&.Mui-active': {
                              color: 'primary.main'
                            },
                            '&.Mui-disabled': {
                              color: 'action.disabled'
                            }
                          }
                        }}
                        sx={{
                          '& .MuiStepLabel-label': {
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: 'text.secondary',
                            '&.Mui-active': {
                              color: 'primary.main',
                              fontWeight: 700
                            },
                            '&.Mui-completed': {
                              color: 'success.main'
                            }
                          }
                        }}
                      >
                        {stage}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}

            {requestComments.length > 0 && (
              <Box sx={{ mt: workflowStatus ? 3 : 0 }}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    fontSize: '0.65rem',
                    mb: 2,
                    textTransform: 'uppercase'
                  }}
                >
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: '1rem' }} />
                  Comments ({requestComments.length})
                </Typography>

                <List disablePadding sx={{
                  '& .MuiListItem-root': {
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderRadius: 1
                    }
                  }
                }}>
                  {requestComments.map((comment, index) => (
                    <ListItem
                      key={index}
                      alignItems="flex-start"
                      sx={{
                        py: 2.5,
                        px: 1.5,
                        '&:not(:last-child)': {
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Tooltip title={comment.userName || 'Unknown User'} arrow>
                          <Avatar
                            alt={comment.userName}
                            src={comment.avatarUrl}
                            sx={{
                              bgcolor: stringToColor(comment.userName || 'Unknown User'),
                              width: 36,
                              height: 36,
                              '&:hover': {
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s ease'
                              }
                            }}
                          >
                            {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                        </Tooltip>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 0.5
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                lineHeight: 1.3
                              }}
                            >
                              {comment.userName || 'Unknown User'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                minWidth: 'max-content',
                                ml: 1
                              }}
                            >
                              <AccessTimeRoundedIcon sx={{
                                fontSize: '0.85rem',
                                opacity: 0.8
                              }} />
                              {format(new Date(comment.timestamp), 'PPpp')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: 'pre-line',
                                color: 'text.primary',
                                lineHeight: 1.7,
                                fontSize: '0.875rem'
                              }}
                            >
                              {comment.comment}
                            </Typography>
                          </Box>
                        }
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </StyledPaper>
        )}
      </Box>
    );
  };

  const renderActionButtons = (request) => {
    const canProcessStage = pendingActions.some(r => r.id === request.id);
    const isFinalStage = request.currentStage === 'Approve';
    const isCommitStage = request.currentStage === 'Commit';

    return (
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {canProcessStage && (
          <StyledButton
            ref={processStageButtonRef}
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => {
              setSelectedRequest(request);
              setOpenStageDialog(true);
              fetchWorkflowStatus(request.id);
            }}
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

        {isCommitStage && (
          <StyledTextField
            label="Estimated Cost ($)"
            type="number"
            value={formData.estimatedCost}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
            inputProps={{ min: 0, step: 0.01 }}
          />
        )}

        {isFinalStage && (
          <StyledButton
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleRejectRequest(request.id)}
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

  const hasRoutingRole = userRoles.some(role => role !== null);
  const isAdmin = userRoles.includes('Admin');

  return (
    <Container maxWidth="xl" sx={{
      py: 4,
      backgroundColor: professionalColors.background,
      minHeight: '100vh'
    }}>
      <StyledPaper elevation={3}>
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
              fontSize: { xs: '1.5rem', sm: '1.7rem' },
              letterSpacing: '-0.5px'
            }}>
              Requests
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

              <StyledButton
                variant="outlined"
                onClick={() => setOpenHistoryDialog(true)}
                startIcon={<HistoryIcon />}
                sx={{
                  borderColor: professionalColors.border,
                  color: professionalColors.text,
                  '&:hover': {
                    borderColor: professionalColors.primary,
                    color: professionalColors.primary
                  }
                }}
              >
                History
              </StyledButton>
            </Box>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="maintenance tabs"
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${professionalColors.border}`,
            '& .MuiTabs-indicator': {
              height: 3,
              backgroundColor: professionalColors.primary
            }
          }}
        >
          {(hasRoutingRole || isAdmin) && (
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
          )}

          {(hasRoutingRole || isAdmin) && (
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
          )}

          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentReturnedIcon fontSize="small" />
                <span>My Requests</span>
                {myRequests.length > 0 && (
                  <Badge
                    badgeContent={myRequests.length}
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
            value="myRequestsTab"
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

        <Box sx={{ p: 3 }}>
          {activeTab === 'inbox' && (
            <>
              {requests.length > 0 ? (
                <List sx={{ '& > * + *': { mt: 1.5 } }}>
                  {requests.map((request) => (
                    <StyledPaper
                      key={request.id}
                      elevation={0}
                      onClick={() => {
                        console.log('Selected Request:', request);
                        setSelectedRequest(request);
                        setOpenDetailsDialog(true);
                        fetchWorkflowStatus(request.id);
                        fetchRequestComments(request.id);
                        fetchRequestDocuments(request.id);
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                        p: 2,
                        [theme.breakpoints.down('sm')]: {
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }
                      }}>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {request.vehicleMake} {request.vehicleModel} ({request.licensePlate})
                          </Typography>
                          <Typography variant="body2" sx={{ color: professionalColors.textSecondary }}>
                            {request.requestType} • {format(request.requestDate, 'PP')}
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
                          <PriorityBadge
                            label={request.priority}
                            size="small"
                            priority={request.priority}
                            icon={getPriorityIcon(request.priority)}
                          />
                          <Chip
                            label={request.currentStage}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                            }}
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
                    No Maintenance Requests
                  </Typography>
                </Box>
              )}
            </>
          )}

          {activeTab === 'myRequests' && (
            <>
              {pendingActions.length > 0 ? (
                <List sx={{ '& > * + *': { mt: 1.5 } }}>
                  {pendingActions.map((request) => (
                    <StyledPaper
                      key={request.id}
                      elevation={0}
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.03),
                        '&:hover': {
                          borderColor: professionalColors.warning,
                        }
                      }}
                      onClick={() => {
                        console.log('Selected Request:', request);
                        setSelectedRequest(request);
                        setOpenDetailsDialog(true);
                        fetchWorkflowStatus(request.id);
                        fetchRequestComments(request.id);
                        fetchRequestDocuments(request.id);
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                        p: 2,
                        [theme.breakpoints.down('sm')]: {
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }
                      }}>
                        <Box sx={{ flex: 1, minWidth: 200 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {request.vehicleMake} {request.vehicleModel} ({request.licensePlate})
                          </Typography>
                          <Typography variant="body2" sx={{ color: professionalColors.textSecondary }}>
                            {request.requestType} • {format(request.requestDate, 'PP')}
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
                          <Chip
                            label={request.currentStage}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                            }}
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
                    You don't have any pending actions for maintenance requests at this time.
                  </Typography>
                </Box>
              )}
            </>
          )}

          {activeTab === 'myRequestsTab' && (
            <>
              {myRequests.length > 0 ? (
                <List sx={{ '& > * + *': { mt: 1.5 } }}>
                  {myRequests.map((request) => (
                    <StyledPaper
                      key={request.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        border: `1px solid ${professionalColors.border}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: professionalColors.primary,
                          boxShadow: `0 2px 12px ${alpha(professionalColors.primary, 0.1)}`
                        }
                      }}
                      onClick={() => {
                        console.log('Selected Request:', request);
                        setSelectedRequest(request);
                        setOpenDetailsDialog(true);
                        fetchWorkflowStatus(request.id);
                        fetchRequestComments(request.id);
                        fetchRequestDocuments(request.id);
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
                            {request.vehicleMake} {request.vehicleModel} ({request.licensePlate})
                          </Typography>
                          <Typography variant="body2" sx={{ color: professionalColors.textSecondary }}>
                            {request.requestType} • {format(request.requestDate, 'PP')}
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
                          <PriorityBadge
                            label={request.priority}
                            size="small"
                            priority={request.priority}
                            icon={getPriorityIcon(request.priority)}
                          />
                          <Chip
                            label={request.currentStage}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              backgroundColor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                            }}
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
                  <AssignmentReturnedIcon sx={{
                    fontSize: 80,
                    color: alpha(professionalColors.textSecondary, 0.3),
                    mb: 2
                  }} />
                  <Typography variant="h6" sx={{
                    fontWeight: 500,
                    color: professionalColors.textSecondary,
                    mb: 1
                  }}>
                    No Requests Found
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: alpha(professionalColors.textSecondary, 0.7),
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    You haven't created any maintenance requests yet.
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
            Create Maintenance Request
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
                    Request Type
                  </InputLabel>
                  <StyledSelect
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleInputChange}
                    required
                  >
                    {Object.entries(requestTypeMap).map(([key]) => (
                      <MenuItem key={key} value={key}>{key}</MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

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

              <StyledTextField
                fullWidth
                margin="normal"
                name="description"
                label="Description"
                value={formData.description}
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
                  backgroundColor: alpha(professionalColors.primary, 0.9),
                },
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
                {renderRequestDetails(selectedRequest)}
                {activeTab === 'myRequests' && renderActionButtons(selectedRequest)}
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
          onClose={() => setOpenStageDialog(false)}
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
              onClick={() => setOpenStageDialog(false)}
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
              onClick={handleProcessStage}
              variant="contained"
              sx={{
                backgroundColor: professionalColors.primary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.primary, 0.9)
                }
              }}
            >
              Submit
            </StyledButton>
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
            Maintenance History
          </DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            {history.length > 0 ? (
              <List sx={{ '& > * + *': { mt: 1.5 } }}>
                {history.map((request) => (
                  <StyledPaper
                    key={request.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      border: `1px solid ${professionalColors.border}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: professionalColors.primary,
                        boxShadow: `0 2px 12px ${alpha(professionalColors.primary, 0.1)}`
                      }
                    }}
                    onClick={() => {
                      console.log('Selected Request:', request);
                      setSelectedRequest(request);
                      setOpenDetailsDialog(true);
                      fetchWorkflowStatus(request.id);
                      fetchRequestComments(request.id);
                      fetchRequestDocuments(request.id);
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
                          {request.vehicleMake} {request.vehicleModel} ({request.licensePlate})
                        </Typography>
                        <Typography variant="body2" sx={{ color: professionalColors.textSecondary }}>
                          {request.requestType} • Completed on {format(request.completionDate, 'PP')}
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
                  No Maintenance History
                </Typography>
                <Typography variant="body2" sx={{
                  color: alpha(professionalColors.textSecondary, 0.7),
                  maxWidth: 400,
                  mx: 'auto'
                }}>
                  There are no completed maintenance requests in the history.
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

export default MaintenanceRequestApp;
