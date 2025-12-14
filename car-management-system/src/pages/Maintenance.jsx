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
  Download as DownloadIcon,
  DescriptionRounded as DescriptionRoundedIcon,
  EventRounded as EventRoundedIcon,
  TimelineRounded as TimelineRoundedIcon,
  MonetizationOnRounded as MonetizationOnRoundedIcon,
  AdminPanelSettingsRounded as AdminPanelSettingsRoundedIcon,
  CloudUploadRounded as CloudUploadRoundedIcon,
  DownloadRounded as DownloadRoundedIcon,
  InsertDriveFileRounded as InsertDriveFileRoundedIcon,
  Visibility as ViewIcon,
  AccessTimeRounded as AccessTimeRoundedIcon,
  FiberManualRecord as FiberManualRecordIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { formatDate, formatDateDisplay, safeFormat } from '../utils/dateUtils';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CostDeliberationModal from '../components/maintenance/CostDeliberationModal';
import CostDeliberationBadge from '../components/maintenance/CostDeliberationBadge';
import DocumentViewer from '../components/maintenance/DocumentViewer';

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
  borderRadius: '16px',
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0,0,0,0.06)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    cursor: 'pointer',
    borderColor: 'rgba(59, 130, 246, 0.2)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover::before': {
    opacity: 1
  },
  padding: theme.spacing(3),
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
    case 'Low': color = theme.palette.success.main; break;
    case 'Medium': color = theme.palette.warning.main; break;
    case 'High': color = theme.palette.error.main; break;
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

const stageOrder = ['Comment', 'Review', 'Approve', 'Commit', 'Complete'];

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
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  // COST DELIBERATION STATE
  const [costDeliberationModalOpen, setCostDeliberationModalOpen] = useState(false);
  const [selectedRequestForCost, setSelectedRequestForCost] = useState(null);

  // DOCUMENT VIEWER STATE
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

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

  const [submitLoading, setSubmitLoading] = useState(false);
  const [processStageLoading, setProcessStageLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

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
        const [requestsRes, vehiclesRes, historyRes, myRequestsRes] = await Promise.all([
          api.get('/api/MaintenanceRequest/active-requests'),
          api.get('/api/Vehicles'),
          api.get('/api/MaintenanceRequest/approved-rejected'),
          api.get(`/api/MaintenanceRequest/my-requests?userId=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setRequests(requestsRes.data.map(formatRequestData));
        setVehicles(vehiclesRes.data);
        setHistory(historyRes.data.map(formatRequestData));
        setMyRequests(myRequestsRes.data.map(formatRequestData));

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

  const fetchWorkflowStatus = async (requestId) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/workflow-status`, {
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
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/comments`);
      setRequestComments(response.data.comments);
    } catch (error) {
      showNotification('Failed to fetch request comments', 'error');
    }
  };

  const fetchRequestDocuments = async (requestId) => {
    try {
      const url = `/api/MaintenanceRequest/${requestId}/documents`;
      const response = await api.get(url, {
        params: { _t: Date.now() } // Cache busting
      });
      setRequestDocuments(response.data.documents || []);
    } catch (error) {
      setRequestDocuments([]);
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
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Get current items for pagination
  const getCurrentItems = (items) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Calculate total pages
  const getTotalPages = (items) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
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
    } finally {
      setSubmitLoading(false);
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
    setProcessStageLoading(true);
    try {
      // Check if cost deliberation is required for Review stage
      if (selectedRequest.currentStage === 'Review') {
        const canProcessResponse = await api.get(`/api/MaintenanceRequest/${selectedRequest.id}/can-process-review`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!canProcessResponse.data.canProcess) {
          showNotification(canProcessResponse.data.reason, 'error');
          setProcessStageLoading(false);
          
          // Highlight the cost deliberation card if cost deliberation is required
          if (canProcessResponse.data.reason?.toLowerCase().includes('cost deliberation')) {
            // Close the process stage modal first
            setOpenStageDialog(false);
            setStageComments('');
            
            // Then highlight the cost deliberation card
            setTimeout(() => {
              highlightCostDeliberationCard(selectedRequest.id);
            }, 300); // Small delay to allow modal to close smoothly
          }
          
          return;
        }
      }

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
      const [requestsRes, historyRes, pendingRes] = await Promise.all([
        api.get('/api/MaintenanceRequest/active-requests'),
        api.get('/api/MaintenanceRequest/approved-rejected'),
        api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ]);
      setRequests(requestsRes.data.map(formatRequestData));
      setHistory(historyRes.data.map(formatRequestData));
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
    } finally {
      setProcessStageLoading(false);
    }
  };

  const handleRejectRequest = (id) => {
    const request = requests.find(r => r.id === id);
    if (!request) {
      showNotification('Request not found', 'error');
      return;
    }

    // Allow rejection at any stage, not just 'Approve'
    // The backend will handle the proper validation
    setRejectingRequestId(id);
    setRejectionReason('');
    setOpenRejectModal(true);
  };

  const confirmRejectRequest = async () => {
    if (!rejectionReason.trim()) {
      showNotification('Please enter a reason for rejection', 'error');
      return;
    }
    
    if (!rejectingRequestId) {
      showNotification('No request selected for rejection', 'error');
      return;
    }
    
    setRejectLoading(true);
    
    try {
      // Rejecting request
      const requestData = {
        reason: rejectionReason
      };

      const response = await api.post(
        `/api/MaintenanceRequest/${rejectingRequestId}/reject?userId=${userId}`,
        JSON.stringify(requestData), // Ensure it's properly JSON stringified
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showNotification('Request rejected successfully!', 'success');

      // Refresh data
      const [requestsRes, pendingRes, myRequestsRes] = await Promise.all([
        api.get('/api/MaintenanceRequest/active-requests'),
        api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/api/MaintenanceRequest/my-requests?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRequests(requestsRes.data.map(formatRequestData));
      setPendingActions(pendingRes.data.map(formatRequestData));
      setMyRequests(myRequestsRes.data.map(formatRequestData));
      
      // Close modal and reset state
      setOpenRejectModal(false);
      setRejectionReason('');
      setRejectingRequestId(null);
      
    } catch (error) {
      
      let errorMessage = 'Failed to reject request';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || data?.title || 'Invalid request data';
            break;
          case 401:
            errorMessage = 'You are not authorized to perform this action';
            break;
          case 403:
            errorMessage = 'You do not have permission to reject this request';
            break;
          case 404:
            errorMessage = 'Request not found';
            break;
          case 409:
            errorMessage = 'Request has already been processed';
            break;
          default:
            errorMessage = data?.message || data?.title || `Server error (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error - please check your connection';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setRejectLoading(false);
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
    setNotification({ ...notification, open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // COST DELIBERATION HELPER FUNCTIONS
  const getCostDeliberationDisplayText = (status, proposedCost, negotiatedCost) => {
    switch (status) {
      case 'Pending':
        return 'In Progress';
      case 'MechanicsSelected':
        return 'Mechanics Selected';
      case 'Proposed':
        return proposedCost ? `$${proposedCost.toFixed(2)}` : 'Proposed';
      case 'Negotiating':
        return negotiatedCost ? `$${negotiatedCost.toFixed(2)}` : 'Negotiating';
      case 'Agreed':
        return 'Agreed';
      default:
        return 'In Progress';
    }
  };

  const getCostDeliberationColor = (status, finalCost) => {
    if (finalCost) return 'success.main';
    
    switch (status) {
      case 'Pending':
      case 'MechanicsSelected':
        return 'warning.main';
      case 'Proposed':
      case 'Negotiating':
        return 'info.main';
      case 'Agreed':
        return 'success.main';
      default:
        return 'text.secondary';
    }
  };

  const getCostDeliberationSubtitle = (status) => {
    switch (status) {
      case 'Pending':
        return 'Selecting mechanics...';
      case 'MechanicsSelected':
        return 'Waiting for proposals';
      case 'Proposed':
        return 'Reviewing proposals';
      case 'Negotiating':
        return 'Negotiating terms';
      case 'Agreed':
        return 'Cost finalized';
      default:
        return 'In progress';
    }
  };

  // COST DELIBERATION HANDLERS
  const handleOpenCostDeliberation = (request) => {
    setSelectedRequestForCost(request);
    setCostDeliberationModalOpen(true);
  };

  const highlightCostDeliberationCard = (requestId) => {
    // Find the cost deliberation card for this request
    const cardElement = document.querySelector(`[data-request-id="${requestId}"][data-card-type="cost-deliberation"]`);
    if (cardElement) {
      // Scroll to the card
      cardElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Add highlight effect
      cardElement.style.animation = 'costDeliberationHighlight 2s ease-in-out';
      
      // Remove animation after it completes
      setTimeout(() => {
        cardElement.style.animation = '';
      }, 2000);
    }
  };

  const handleCloseCostDeliberation = () => {
    setCostDeliberationModalOpen(false);
    setSelectedRequestForCost(null);
  };

  // DOCUMENT VIEWER HANDLERS
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setDocumentViewerOpen(true);
  };

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false);
    setSelectedDocument(null);
  };

  const handleCostUpdated = async () => {
    // Refresh the data to show updated cost information
    try {
      const [requestsRes, myRequestsRes] = await Promise.all([
        api.get('/api/MaintenanceRequest/active-requests'),
        api.get(`/api/MaintenanceRequest/my-requests?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setRequests(requestsRes.data.map(formatRequestData));
      setMyRequests(myRequestsRes.data.map(formatRequestData));

      const pendingRes = await api.get(`/api/MaintenanceRequest/my-pending-actions?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingActions(pendingRes.data.map(formatRequestData));

      showNotification('Cost deliberation updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to refresh data after cost update', 'error');
    }
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
      <Box sx={{ 
        mt: 4, 
        px: { xs: 2, md: 4 }, 
        pb: 4,
        '@keyframes costDeliberationHighlight': {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 193, 7, 0.7)',
            borderColor: '#ffc107'
          },
          '50%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 0 10px rgba(255, 193, 7, 0.3)',
            borderColor: '#ff9800'
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 193, 7, 0)',
            borderColor: 'divider'
          }
        }
      }}>
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
                                          value: formatDateDisplay(request.requestDate, true),
              icon: <EventRoundedIcon />
            },
            {
              label: 'Current Stage',
              value: request.currentStage,
              icon: <TimelineRoundedIcon />
            },
            {
              label: 'Cost Deliberation',
              value: request.finalCost 
                ? `$${request.finalCost.toFixed(2)}` 
                : request.costDeliberationStatus 
                  ? getCostDeliberationDisplayText(request.costDeliberationStatus, request.proposedCost, request.negotiatedCost)
                  : 'Not Started',
              icon: <AttachMoneyIcon />,
              color: getCostDeliberationColor(request.costDeliberationStatus, request.finalCost),
              clickable: true,
              onClick: (e) => {
                e.stopPropagation();
                handleOpenCostDeliberation(request);
              },
              subtitle: request.costDeliberationStatus ? getCostDeliberationSubtitle(request.costDeliberationStatus) : null
            }
          ].map((item, index) => (
            <StyledPaper
              key={index}
              elevation={0}
              onClick={item.clickable ? item.onClick : undefined}
              data-request-id={request.id}
              data-card-type={item.label === 'Cost Deliberation' ? 'cost-deliberation' : 'other'}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                cursor: item.clickable ? 'pointer' : 'default',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[2],
                  ...(item.clickable && {
                    borderColor: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    '& .clickable-icon': {
                      opacity: 1,
                      transform: 'scale(1.1)'
                    }
                  })
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{
                    fontWeight: 500,
                    color: item.color || 'text.primary',
                    fontSize: '1rem'
                  }}>
                    {item.value}
                  </Typography>
                  {item.subtitle && (
                    <Typography variant="caption" sx={{
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      fontWeight: 400,
                      display: 'block',
                      mt: 0.5
                    }}>
                      {item.subtitle}
                    </Typography>
                  )}
                </Box>
                {item.clickable && (
                  <Box className="clickable-icon" sx={{
                    ml: 'auto',
                    opacity: 0.6,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }}>
                    <MonetizationOnIcon sx={{ 
                      fontSize: '0.9rem',
                      color: 'primary.main'
                    }} />
                  </Box>
                )}
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

        {(
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
            {requestDocuments.length > 0 ? (
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
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Document">
                          <IconButton
                            edge="end"
                            aria-label="view"
                            onClick={() => handleViewDocument(document)}
                            sx={{
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              mr: 1,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.2),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <ViewIcon color="success" sx={{ fontSize: '1.2rem' }} />
                          </IconButton>
                        </Tooltip>
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
                      </Box>
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
                          {formatDateDisplay(document.uploadDate, true)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                px: 2
              }}>
                <InsertDriveFileRoundedIcon sx={{
                  fontSize: 48,
                  color: alpha(theme.palette.text.secondary, 0.4),
                  mb: 2
                }} />
                <Typography variant="body2" sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  mb: 1
                }}>
                  No Documents Attached
                </Typography>
                <Typography variant="caption" sx={{
                  color: alpha(theme.palette.text.secondary, 0.7)
                }}>
                  No documents have been uploaded for this request yet.
                </Typography>
              </Box>
            )}
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
                              {formatDateDisplay(comment.timestamp, true)}
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
      <Container maxWidth={false} sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        backgroundColor: professionalColors.background,
        maxWidth: '100% !important'
      }}>
        <CircularProgress size={60} thickness={4} sx={{ color: professionalColors.primary }} />
      </Container>
    );
  }

  const hasRoutingRole = userRoles.some(role => role !== null);
  const isAdmin = userRoles.includes('Admin');

  return (
    <Container maxWidth={false} sx={{
      py: 4,
      backgroundColor: professionalColors.background,
      maxWidth: '100% !important'
    }}>
      <StyledPaper elevation={3}>
        <Box sx={{
          p: 4,
          borderBottom: `1px solid ${professionalColors.border}`,
          backgroundColor: professionalColors.surface,
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            
          }}>
            <Typography variant="h4" sx={{
              fontWeight: 300,
              color: professionalColors.text,
              fontSize: { xs: '1.5rem', sm: '1.7rem' },
              letterSpacing: '-0.5px'
            }}>
              Maintenance Requests
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

        <Box sx={{ 
          px: 3, 
          pt: 3, 
          pb: 0, 
          height: '630px', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeTab === 'inbox' && (
            <>
              {requests.length > 0 ? (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ '& > * + *': { mt: 1.5 } }}>
                    {getCurrentItems(requests).map((request) => (
                      <StyledPaper
                        key={request.id}
                        elevation={0}
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
                        onClick={async () => {
                          setSelectedRequest(request);
                          setOpenDetailsDialog(true);
                          
                          // Fetch the latest request data to get updated cost deliberation info
                          try {
                            const response = await api.get(`/api/MaintenanceRequest/${request.id}`);
                            const updatedRequest = formatRequestData(response.data);
                            setSelectedRequest(updatedRequest);
                          } catch (error) {
                          }
                          
                          fetchWorkflowStatus(request.id);
                          fetchRequestComments(request.id);
                          fetchRequestDocuments(request.id);
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
                               <Box sx={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 gap: 1.5
                               }}>
                                 <Box sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1.5,
                                   flexWrap: 'wrap'
                                 }}>
                                   <Typography variant="h6" sx={{
                                     fontWeight: 700,
                                     color: '#1f2937',
                                     fontSize: '1.1rem',
                                     lineHeight: 1.2
                                   }}>
                                     {request.vehicleMake} {request.vehicleModel}
                                   </Typography>
                                   <Box sx={{
                                     width: 4,
                                     height: 4,
                                     borderRadius: '50%',
                                     backgroundColor: '#9ca3af'
                                   }} />
                                   <Typography variant="body2" sx={{
                                     color: '#6b7280',
                                     fontSize: '0.9rem',
                                     fontFamily: 'monospace',
                                     fontWeight: 600,
                                     backgroundColor: '#f3f4f6',
                                     px: 1.5,
                                     py: 0.5,
                                     borderRadius: '6px',
                                     border: '1px solid #e5e7eb'
                                   }}>
                                     {request.licensePlate}
                                   </Typography>
                                 </Box>

                                 <Box sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1.5,
                                   flexWrap: 'wrap'
                                 }}>
                                   <Typography variant="body1" sx={{
                                     color: '#374151',
                                     fontSize: '1rem',
                                     fontWeight: 600
                                   }}>
                                     {request.requestType}
                                   </Typography>
                                   <Box sx={{
                                     width: 4,
                                     height: 4,
                                     borderRadius: '50%',
                                     backgroundColor: '#9ca3af'
                                   }} />
                                   <Typography variant="body2" sx={{
                                     color: '#6b7280',
                                     fontSize: '0.9rem',
                                     fontWeight: 500
                                   }}>
                                     {format(request.requestDate, 'dd MMM yyyy')}
                                   </Typography>
                                 </Box>
                               </Box>
                            </Box>

                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            alignItems: 'flex-end',
                            [theme.breakpoints.down('sm')]: {
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '100%',
                              justifyContent: 'flex-start'
                            }
                          }}>
                            <Box sx={{
                              display: 'flex',
                              gap: 1,
                              flexWrap: 'wrap',
                              justifyContent: 'flex-end',
                              [theme.breakpoints.down('sm')]: {
                                justifyContent: 'flex-start'
                              }
                            }}>
                              <StatusBadge
                                label={request.status}
                                size="small"
                                status={request.status}
                                icon={getStatusIcon(request.status)}
                                sx={{
                                  px: 2,
                                  py: 0.8,
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderRadius: '20px',
                                  height: 28,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                              <PriorityBadge
                                label={request.priority}
                                size="small"
                                priority={request.priority}
                                icon={getPriorityIcon(request.priority)}
                                sx={{
                                  px: 2,
                                  py: 0.8,
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  borderRadius: '20px',
                                  height: 28,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              />
                            </Box>
                            
                            <Chip
                              label={request.currentStage}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                border: '1px solid #bae6fd',
                                borderRadius: '20px',
                                height: 28,
                                px: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '& .MuiChip-label': {
                                  px: 1
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </StyledPaper>
                    ))}
                  </List>
                  </Box>
                  {getTotalPages(requests) > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 0 }}>
                      <Pagination
                        count={getTotalPages(requests)}
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
                  py: 4,
                  px: 2,
                  border: `1px dashed ${professionalColors.border}`,
                  borderRadius: '8px',
                  backgroundColor: alpha(professionalColors.primary, 0.02),
                  height: '100%',
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
                    No Maintenance Requests
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: alpha(professionalColors.textSecondary, 0.7),
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    No maintenance requests have been created yet.
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
                    {getCurrentItems(pendingActions).map((request) => (
                    <StyledPaper
                      key={request.id}
                      elevation={0}
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
                      onClick={() => {
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
                               <Box sx={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 gap: 1.5
                               }}>
                                 <Box sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1.5,
                                   flexWrap: 'wrap'
                                 }}>
                                   <Typography variant="h6" sx={{
                                     fontWeight: 700,
                                     color: '#1f2937',
                                     fontSize: '1.1rem',
                                     lineHeight: 1.2
                                   }}>
                                     {request.vehicleMake} {request.vehicleModel}
                                   </Typography>
                                   <Box sx={{
                                     width: 4,
                                     height: 4,
                                     borderRadius: '50%',
                                     backgroundColor: '#9ca3af'
                                   }} />
                                   <Typography variant="body2" sx={{
                                     color: '#6b7280',
                                     fontSize: '0.9rem',
                                     fontFamily: 'monospace',
                                     fontWeight: 600,
                                     backgroundColor: '#f3f4f6',
                                     px: 1.5,
                                     py: 0.5,
                                     borderRadius: '6px',
                                     border: '1px solid #e5e7eb'
                                   }}>
                                     {request.licensePlate}
                                   </Typography>
                                 </Box>

                                 <Box sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1.5,
                                   flexWrap: 'wrap'
                                 }}>
                                   <Typography variant="body1" sx={{
                                     color: '#374151',
                                     fontSize: '1rem',
                                     fontWeight: 600
                                   }}>
                                     {request.requestType}
                                   </Typography>
                                   <Box sx={{
                                     width: 4,
                                     height: 4,
                                     borderRadius: '50%',
                                     backgroundColor: '#9ca3af'
                                   }} />
                                   <Typography variant="body2" sx={{
                                     color: '#6b7280',
                                     fontSize: '0.9rem',
                                     fontWeight: 500
                                   }}>
                                     {format(request.requestDate, 'dd MMM yyyy')}
                                   </Typography>
                                 </Box>
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
                  {getTotalPages(pendingActions) > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 0 }}>
                      <Pagination
                        count={getTotalPages(pendingActions)}
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
                  height: '530px',
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
                    You don't have any pending actions for maintenance requests at this time.
                  </Typography>
                </Box>
              )}
            </>
          )}

          {activeTab === 'myRequestsTab' && (
            <>
              {myRequests.length > 0 ? (
                <>
                  <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <List sx={{ '& > * + *': { mt: 1.5 } }}>
                    {getCurrentItems(myRequests).map((request) => (
                    <StyledPaper
                      key={request.id}
                      elevation={0}
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
                      onClick={() => {
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
                               <Box sx={{
                                 display: 'flex',
                                 flexDirection: 'column',
                                 gap: 1.5
                               }}>
                                 <Box sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1.5,
                                   flexWrap: 'wrap'
                                 }}>
                                   <Typography variant="h6" sx={{
                                     fontWeight: 700,
                                     color: '#1f2937',
                                     fontSize: '1.1rem',
                                     lineHeight: 1.2
                                   }}>
                                     {request.vehicleMake} {request.vehicleModel}
                                   </Typography>
                                   <Box sx={{
                                     width: 4,
                                     height: 4,
                                     borderRadius: '50%',
                                     backgroundColor: '#9ca3af'
                                   }} />
                                   <Typography variant="body2" sx={{
                                     color: '#6b7280',
                                     fontSize: '0.9rem',
                                     fontFamily: 'monospace',
                                     fontWeight: 600,
                                     backgroundColor: '#f3f4f6',
                                     px: 1.5,
                                     py: 0.5,
                                     borderRadius: '6px',
                                     border: '1px solid #e5e7eb'
                                   }}>
                                     {request.licensePlate}
                                   </Typography>
                                 </Box>

                                 <Box sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: 1.5,
                                   flexWrap: 'wrap'
                                 }}>
                                   <Typography variant="body1" sx={{
                                     color: '#374151',
                                     fontSize: '1rem',
                                     fontWeight: 600
                                   }}>
                                     {request.requestType}
                                   </Typography>
                                   <Box sx={{
                                     width: 4,
                                     height: 4,
                                     borderRadius: '50%',
                                     backgroundColor: '#9ca3af'
                                   }} />
                                   <Typography variant="body2" sx={{
                                     color: '#6b7280',
                                     fontSize: '0.9rem',
                                     fontWeight: 500
                                   }}>
                                     {format(request.requestDate, 'dd MMM yyyy')}
                                   </Typography>
                                 </Box>
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
                          <PriorityBadge
                            label={request.priority}
                            size="small"
                            priority={request.priority}
                            icon={getPriorityIcon(request.priority)}
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
                  {getTotalPages(myRequests) > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 0 }}>
                      <Pagination
                        count={getTotalPages(myRequests)}
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
                  py: 4,
                  px: 2,
                  border: `1px dashed ${professionalColors.border}`,
                  borderRadius: '8px',
                  backgroundColor: alpha(professionalColors.primary, 0.02),
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
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
                    No Maintenance Requests
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: alpha(professionalColors.textSecondary, 0.7),
                    maxWidth: 400,
                    mx: 'auto'
                  }}>
                    You have no maintenance requests at this time.
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
            <Box component="form" id="maintenance-request-form" onSubmit={handleSubmit}>
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
              disabled={submitLoading}
            >
              Cancel
            </StyledButton>
            <StyledButton
              type="submit"
              form="maintenance-request-form"
              variant="contained"
              sx={{
                backgroundColor: professionalColors.primary,
                '&:hover': {
                  backgroundColor: alpha(professionalColors.primary, 0.9),
                },
              }}
              disabled={submitLoading}
              startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitLoading ? 'Submitting...' : 'Submit Request'}
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
              disabled={processStageLoading}
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
              disabled={processStageLoading}
              startIcon={processStageLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processStageLoading ? 'Submitting...' : 'Submit'}
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
                          {request.requestType} 
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
                py: 4,
                px: 2,
                border: `1px dashed ${professionalColors.border}`,
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <HistoryIcon sx={{
                  fontSize: 48,
                  color: alpha(professionalColors.textSecondary, 0.4),
                  mb: 2
                }} />
                <Typography variant="body1" sx={{
                  fontWeight: 500,
                  color: professionalColors.textSecondary,
                  mb: 1
                }}>
                  No Request History
                </Typography>
                <Typography variant="caption" sx={{
                  color: alpha(professionalColors.textSecondary, 0.7)
                }}>
                  No maintenance requests have been completed yet.
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
          open={openRejectModal}
          onClose={() => setOpenRejectModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '16px' } }}
        >
          <DialogTitle sx={{ fontWeight: 600, borderBottom: `1px solid ${professionalColors.border}`, backgroundColor: professionalColors.surface, fontSize: '1.25rem' }}>
            Reject Maintenance Request
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <StyledTextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              required
              autoFocus
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${professionalColors.border}`, backgroundColor: professionalColors.surface }}>
            <StyledButton
              onClick={() => setOpenRejectModal(false)}
              sx={{ color: professionalColors.textSecondary, '&:hover': { backgroundColor: alpha(professionalColors.textSecondary, 0.05) } }}
              disabled={rejectLoading}
            >
              Cancel
            </StyledButton>
            <StyledButton
              onClick={confirmRejectRequest}
              variant="contained"
              color="error"
              sx={{ backgroundColor: professionalColors.error, '&:hover': { backgroundColor: alpha(professionalColors.error, 0.9) } }}
              disabled={rejectLoading}
              startIcon={rejectLoading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {rejectLoading ? 'Rejecting...' : 'Reject'}
            </StyledButton>
          </DialogActions>
        </Dialog>

        <CostDeliberationModal
          open={costDeliberationModalOpen}
          onClose={handleCloseCostDeliberation}
          requestId={selectedRequestForCost?.id}
          currentStage={selectedRequestForCost?.currentStage}
          currentUserId={userId}
          onCostUpdated={handleCostUpdated}
        />

        <DocumentViewer
          open={documentViewerOpen}
          onClose={handleCloseDocumentViewer}
          documentId={selectedDocument?.documentId}
          fileName={selectedDocument?.fileName}
          token={token}
          onDownload={handleDocumentDownload}
        />

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
