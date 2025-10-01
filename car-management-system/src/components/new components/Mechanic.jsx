import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import './MaintenanceDashboard.css';
import { useOptimizedState, useApiState, useDebounce } from '../../hooks/useOptimizedState';
import { usePerformanceMonitor, useMemoryLeakDetector } from '../../hooks/usePerformanceMonitor';
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, Button, Typography, Paper, TextField, Select, MenuItem, InputLabel, FormControl, Grid, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Pending as PendingIcon,
  DirectionsCar as DirectionsCarIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Search, Hourglass } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StandardDatePicker from '../shared/StandardDatePicker';
import StandardDateTimePicker from '../shared/StandardDateTimePicker';

const Mechanic = ({ sidebarExpanded = true }) => {
  const { userId, hasRole } = useAuth();
  
  // Performance monitoring
  usePerformanceMonitor('Mechanic', { logRenderTime: false, trackReRenders: true });
  const { trackTimer, trackInterval, cleanup } = useMemoryLeakDetector('Mechanic');
  
  // Optimized state management
  const [schedules, setSchedules] = useOptimizedState([], { deepCompare: true });
  const [selectedSchedule, setSelectedSchedule] = useOptimizedState(null);
  const [progressUpdates, setProgressUpdates] = useOptimizedState([], { deepCompare: true });
  const [costDeliberationRequests, setCostDeliberationRequests] = useOptimizedState([], { deepCompare: true });
  const [selectedCostRequest, setSelectedCostRequest] = useOptimizedState(null);
  const [costDeliberationPage, setCostDeliberationPage] = useOptimizedState(1);
  const [costDeliberationSearch, setCostDeliberationSearch] = useOptimizedState('', { debounceMs: 300 });
  const [costDeliberationFilter, setCostDeliberationFilter] = useOptimizedState('all');
  const [costDeliberationFiltersOpen, setCostDeliberationFiltersOpen] = useOptimizedState(false);
  const [selectedCostDeliberationRequest, setSelectedCostDeliberationRequest] = useOptimizedState(null);
  const [costDeliberationDetailOpen, setCostDeliberationDetailOpen] = useOptimizedState(false);
  const [historyModalOpen, setHistoryModalOpen] = useOptimizedState(false);
  const [negotiationHistory, setNegotiationHistory] = useOptimizedState([], { deepCompare: true });
  const [openCostProposalDialog, setOpenCostProposalDialog] = useOptimizedState(false);
  const [openCostNegotiationDialog, setOpenCostNegotiationDialog] = useOptimizedState(false);
  const [openCostAcceptanceDialog, setOpenCostAcceptanceDialog] = useOptimizedState(false);
  const [costProposalForm, setCostProposalForm] = useOptimizedState({ proposedCost: '', comments: '' }, { deepCompare: true });
  const [costNegotiationForm, setCostNegotiationForm] = useOptimizedState({ negotiatedCost: '', comments: '' }, { deepCompare: true });
  const [costAcceptanceForm, setCostAcceptanceForm] = useOptimizedState({ comments: '' }, { deepCompare: true });
  const [openProgressDialog, setOpenProgressDialog] = useOptimizedState(false);
  const [loading, setLoading] = useOptimizedState(false);
  const [viewMode, setViewMode] = useOptimizedState('list');
  const [logisticsBySchedule, setLogisticsBySchedule] = useOptimizedState({}, { deepCompare: true });
  const [logisticsForms, setLogisticsForms] = useOptimizedState({}, { deepCompare: true });
  const [progressForm, setProgressForm] = useOptimizedState({ expectedCompletionDate: '', comment: '' }, { deepCompare: true });
  const [currentPage, setCurrentPage] = useOptimizedState(1);
  const [filterStatus, setFilterStatus] = useOptimizedState('all');
  const [filterVehicle, setFilterVehicle] = useOptimizedState('all');
  const [filterMechanic, setFilterMechanic] = useOptimizedState('all');
  const [filterStartDate, setFilterStartDate] = useOptimizedState(null);
  const [filterEndDate, setFilterEndDate] = useOptimizedState(null);
  const [searchText, setSearchText] = useOptimizedState('', { debounceMs: 300 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const assignmentsPerPage = 9;
  const totalPages = Math.ceil(schedules.length / assignmentsPerPage);

  // Memoized calculations for better performance
  const uniqueVehicles = useMemo(() => 
    Array.from(new Set(schedules.map(s => `${s.vehicleMake} ${s.vehicleModel} (${s.licensePlate})`))), 
    [schedules]
  );
  
  const uniqueMechanics = useMemo(() => 
    Array.from(new Set(schedules.map(s => s.assignedMechanicName).filter(Boolean))), 
    [schedules]
  );

  // Cost deliberation pagination and filtering
  const costDeliberationPerPage = 4;
  
  const filteredCostDeliberationRequests = useMemo(() => 
    costDeliberationRequests.filter(request => {
      let match = true;
      
      // Search filter
      if (costDeliberationSearch && !(
        request.requestTitle?.toLowerCase().includes(costDeliberationSearch.toLowerCase()) ||
        request.vehicleInfo?.toLowerCase().includes(costDeliberationSearch.toLowerCase()) ||
        request.requestedBy?.toLowerCase().includes(costDeliberationSearch.toLowerCase())
      )) match = false;
      
      // Status filter
      if (costDeliberationFilter !== 'all') {
        if (costDeliberationFilter === 'active' && request.status !== 'MechanicsSelected') match = false;
        if (costDeliberationFilter === 'proposed' && request.status !== 'Proposed') match = false;
        if (costDeliberationFilter === 'negotiating' && request.status !== 'Negotiating') match = false;
        if (costDeliberationFilter === 'agreed' && request.status !== 'Agreed') match = false;
      }
      
      return match;
    }), 
    [costDeliberationRequests, costDeliberationSearch, costDeliberationFilter]
  );

  const totalCostDeliberationPages = useMemo(() => 
    Math.ceil(filteredCostDeliberationRequests.length / costDeliberationPerPage), 
    [filteredCostDeliberationRequests.length, costDeliberationPerPage]
  );

  const paginatedCostDeliberationRequests = useMemo(() => 
    filteredCostDeliberationRequests.slice(
      (costDeliberationPage - 1) * costDeliberationPerPage,
      costDeliberationPage * costDeliberationPerPage
    ), 
    [filteredCostDeliberationRequests, costDeliberationPage, costDeliberationPerPage]
  );

  const filteredSchedules = schedules
    .filter(schedule => {
    let match = true;
    if (filterStatus !== 'all' && schedule.status !== filterStatus) match = false;
    if (filterVehicle !== 'all' && `${schedule.vehicleMake} ${schedule.vehicleModel} (${schedule.licensePlate})` !== filterVehicle) match = false;
    if (filterMechanic !== 'all' && schedule.assignedMechanicName !== filterMechanic) match = false;
    if (filterStartDate && new Date(schedule.scheduledDate) < filterStartDate) match = false;
    if (filterEndDate && new Date(schedule.scheduledDate) > filterEndDate) match = false;
    if (searchText && !(
      schedule.vehicleMake?.toLowerCase().includes(searchText.toLowerCase()) ||
      schedule.vehicleModel?.toLowerCase().includes(searchText.toLowerCase()) ||
      schedule.licensePlate?.toLowerCase().includes(searchText.toLowerCase()) ||
      schedule.reason?.toLowerCase().includes(searchText.toLowerCase())
    )) match = false;
    return match;
    })
    .slice((currentPage - 1) * assignmentsPerPage, currentPage * assignmentsPerPage);

  // Memoized API functions to prevent unnecessary re-renders
  const fetchUserSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/MaintenanceRequest/user/${userId}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      showAlert('Failed to fetch your schedules', 'danger');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCostDeliberationRequests = useCallback(async () => {
    if (!userId) {
      console.error('❌ No userId available for cost deliberation requests');
      setLoading(false);
      return;
    }

    try {
      console.log('🔧 Fetching cost deliberation requests for user:', userId);
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      const apiPromise = api.get(`/api/MaintenanceRequest/cost-deliberation-requests/${userId}`);
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      console.log('✅ Cost deliberation requests response:', response);
      console.log('📊 Cost deliberation requests data:', response.data);
      console.log('📊 Data type:', typeof response.data, 'Is array:', Array.isArray(response.data));
      console.log('📊 Data length:', response.data?.length);
      
      setCostDeliberationRequests(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching cost deliberation requests:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.message.includes('timeout')) {
        showAlert('Request timed out. Please check your connection and try again.', 'warning');
      } else if (error.response?.status === 401) {
        showAlert('Authentication failed. Please log in again.', 'error');
      } else if (error.response?.status === 500) {
        showAlert('Server error. Please try again later.', 'error');
      } else {
        showAlert(`Failed to fetch cost deliberation requests: ${error.message}`, 'danger');
      }
      
      // Set empty array on error to show "no requests" state
      setCostDeliberationRequests([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchProgressUpdates = useCallback(async (requestId) => {
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/progress-updates`);
      setProgressUpdates(response.data);
    } catch (error) {
      showAlert('Failed to fetch progress updates', 'danger');
    }
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedSchedule(null);
    setViewMode('list');
  }, []);

  // Optimized useEffect hooks with proper cleanup
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await Promise.all([
        fetchUserSchedules(),
        fetchCostDeliberationRequests()
      ]);
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchUserSchedules, fetchCostDeliberationRequests]);

  useEffect(() => {
    if (selectedSchedule && viewMode === 'detail') {
      fetchProgressUpdates(selectedSchedule.maintenanceRequestId);
    }
  }, [selectedSchedule, viewMode, fetchProgressUpdates]);

  useEffect(() => {
    if (selectedSchedule && viewMode === 'detail') {
      const handleEsc = (e) => {
        if (e.key === 'Escape') handleBackToList();
      };
      
      const timerId = trackTimer(setTimeout(() => {
        window.addEventListener('keydown', handleEsc);
      }, 0));
      
      return () => {
        clearTimeout(timerId);
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [selectedSchedule, viewMode, handleBackToList, trackTimer]);

  // Remove duplicate functions - they're already defined above as useCallback

  const handleCompleteWithInvoice = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    try {
      await api.post(`/api/MaintenanceRequest/${selectedSchedule.id}/complete`, {}, {
        params: { user: userId }
      });
      showAlert('Maintenance completed successfully', 'success');
      fetchUserSchedules();
      setViewMode('list');
    } catch (error) {
      showAlert('Failed to complete maintenance', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProgressUpdate = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    try {
      await api.post(`/api/MaintenanceRequest/${selectedSchedule.id}/progress-update`, progressForm, {
        params: { user: userId }
      });
      showAlert('Progress update submitted', 'success');
      fetchProgressUpdates(selectedSchedule.maintenanceRequestId);
      setOpenProgressDialog(false);
    } catch (error) {
      showAlert('Failed to submit progress update', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const toIso = (v) => (v ? new Date(v).toISOString() : null);

  const loadLogistics = async (scheduleId) => {
    try {
      const res = await api.get(`/api/MaintenanceRequest/${scheduleId}/schedule/logistics-snapshot`);
      setLogisticsBySchedule(prev => ({ ...prev, [scheduleId]: res.data }));
      toast.success('Loaded logistics');
    } catch (e) {
      toast.error('Failed to load logistics');
    }
  };

  const togglePlanForm = (scheduleId) => {
    setLogisticsForms(prev => ({
      ...prev,
      [scheduleId]: {
        pickupRequired: prev[scheduleId]?.pickupRequired ?? true,
        pickupAddress: prev[scheduleId]?.pickupAddress ?? '',
        pickupWindowStart: prev[scheduleId]?.pickupWindowStart ?? null,
        pickupWindowEnd: prev[scheduleId]?.pickupWindowEnd ?? null,
        returnRequired: prev[scheduleId]?.returnRequired ?? true,
        returnAddress: prev[scheduleId]?.returnAddress ?? '',
        returnWindowStart: prev[scheduleId]?.returnWindowStart ?? null,
        returnWindowEnd: prev[scheduleId]?.returnWindowEnd ?? null,
        contactName: prev[scheduleId]?.contactName ?? '',
        contactPhone: prev[scheduleId]?.contactPhone ?? '',
        notes: prev[scheduleId]?.notes ?? '',
        open: !prev[scheduleId]?.open
      }
    }));
  };

  const updatePlanField = (scheduleId, field, value) => {
    setLogisticsForms(prev => ({
      ...prev,
      [scheduleId]: { ...(prev[scheduleId] || {}), [field]: value }
    }));
  };

  const submitPlan = async (scheduleId) => {
    const form = logisticsForms[scheduleId] || {};
    const payload = {
      pickupRequired: !!form.pickupRequired,
      pickupAddress: form.pickupAddress || null,
      pickupWindowStart: toIso(form.pickupWindowStart),
      pickupWindowEnd: toIso(form.pickupWindowEnd),
      returnRequired: !!form.returnRequired,
      returnAddress: form.returnAddress || null,
      returnWindowStart: toIso(form.returnWindowStart),
      returnWindowEnd: toIso(form.returnWindowEnd),
      contactName: form.contactName || null,
      contactPhone: form.contactPhone || null,
      notes: form.notes || null
    };
    try {
      await api.post(`/api/MaintenanceRequest/${scheduleId}/schedule/plan-logistics`, payload, { params: { user: userId } });
      toast.success('Logistics planned');
      await loadLogistics(scheduleId);
    } catch (e) {
      toast.error(e.response?.data || 'Failed to save logistics');
    }
  };

  const postEvent = async (scheduleId, path, note) => {
    try {
      await api.post(`/api/MaintenanceRequest/${scheduleId}/schedule/${path}`, { timestamp: new Date().toISOString(), note: note || '' }, { params: { user: userId } });
      toast.success('Updated');
      await loadLogistics(scheduleId);
    } catch (e) {
      toast.error(e.response?.data || 'Failed to update');
    }
  };

  const handleSubmitCostProposal = async () => {
    if (!selectedCostRequest) return;
    setLoading(true);
    try {
      await api.post(`/api/MaintenanceRequest/${selectedCostRequest.maintenanceRequestId}/cost-deliberation/propose`, {
        proposedCost: parseFloat(costProposalForm.proposedCost),
        comments: costProposalForm.comments
      }, {
        params: { userId: userId }
      });
      showAlert('Cost proposal submitted successfully', 'success');
      fetchCostDeliberationRequests();
      setOpenCostProposalDialog(false);
      setCostProposalForm({ proposedCost: '', comments: '' });
    } catch (error) {
      showAlert('Failed to submit cost proposal', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCostNegotiation = async () => {
    if (!selectedCostRequest) return;
    setLoading(true);
    try {
      await api.post(`/api/MaintenanceRequest/${selectedCostRequest.maintenanceRequestId}/cost-deliberation/negotiate`, {
        negotiatedCost: parseFloat(costNegotiationForm.negotiatedCost),
        comments: costNegotiationForm.comments
      }, {
        params: { userId: userId }
      });
      showAlert('Cost negotiation submitted successfully', 'success');
      fetchCostDeliberationRequests();
      setOpenCostNegotiationDialog(false);
      setCostNegotiationForm({ negotiatedCost: '', comments: '' });
    } catch (error) {
      showAlert('Failed to submit cost negotiation', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCostAcceptance = async () => {
    if (!selectedCostRequest) return;
    setLoading(true);
    try {
      await api.post(`/api/MaintenanceRequest/${selectedCostRequest.maintenanceRequestId}/cost-deliberation/accept`, {
        comments: costAcceptanceForm.comments
      }, {
        params: { userId: userId }
      });
      showAlert('Cost accepted successfully', 'success');
      fetchCostDeliberationRequests();
      setOpenCostAcceptanceDialog(false);
      setCostAcceptanceForm({ comments: '' });
    } catch (error) {
      showAlert('Failed to accept cost', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant) => {
    if (variant === 'success') toast.success(message);
    else toast.error(message);
  };

  const getStatusBadge = (status) => {
    let className = 'status-badge';
    switch (status) {
      case 'Completed': className += ' status-completed'; break;
      case 'In Progress': className += ' status-in-progress'; break;
      case 'Pending': className += ' status-pending'; break;
      case 'Cancelled': className += ' status-cancelled'; break;
      default: className += ' status-default';
    }
    return <span className={className}>{status}</span>;
  };

  const handleViewDetails = async (schedule) => {
    setSelectedSchedule(schedule);
    setViewMode('detail');
    setLoading(true);
    try {
      const response = await api.get(`/api/MaintenanceRequest/progress-updates/request/${schedule.maintenanceRequestId}`);
      setProgressUpdates(response.data);
    } catch (error) {
      showAlert('Failed to fetch progress updates for this assignment', 'danger');
      setProgressUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  // handleBackToList is already defined above as useCallback

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', lg: 'row' },
      gap: { xs: 2, md: 3 },
      width: sidebarExpanded ? '100%' : 'calc(100% + 100px)',
      alignItems: 'flex-start',
      '& @keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
      },
      '& @keyframes shimmer': {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' }
      },
      '& @keyframes fadeIn': {
        '0%': { opacity: 0 },
        '100%': { opacity: 1 }
      },
      '& @keyframes slideInUp': {
        '0%': { 
          opacity: 0,
          transform: 'translateY(30px) scale(0.95)'
        },
        '100%': { 
          opacity: 1,
          transform: 'translateY(0) scale(1)'
        }
      },
       mt: { xs: 16, md: 20 },
       px: { xs: 1, sm: 2, md: 3, lg: 4 },
       pb: { xs: 2, md: 4 },
      transition: 'width 0.3s ease-in-out',
      minHeight: '100vh'
    }}>
      {/* Main Schedule/Assignments Section */}
      <Box sx={{
        flex: { xs: 'unset', lg: 7 },
        minWidth: 0,
        width: { xs: '100%', lg: '70%' },
        background: 'rgba(255,255,255,0.85)',
        borderRadius: { xs: 2, md: 4 },
        boxShadow: '0 2px 24px rgba(37,99,235,0.07)',
         p: { xs: 3, sm: 4, md: 5 },
         mb: { xs: 2, lg: 0 }
      }}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastStyle={{
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
        />
      <main className="dashboard-main">
        <div className="dashboard-container1">
          {loading && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                mb: 3
              }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  border: '3px solid rgba(37, 99, 235, 0.1)',
                  borderTop: '3px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
              </Box>
            )}
            {!loading && viewMode === 'list' && (
            <>
                <Box sx={{
                  width: '100%',
                   mb: { xs: 2, md: 3 },
                   px: { xs: 0, sm: 1, md: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <Box sx={{
                    width: '100%',
                    maxWidth: '100%',
                    display: 'flex',
                     flexDirection: { xs: 'column', sm: 'row' },
                     alignItems: { xs: 'stretch', sm: 'center' },
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                     borderRadius: { xs: 3, md: 5 },
                     boxShadow: '0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                     border: '1px solid rgba(37, 99, 235, 0.1)',
                     p: { xs: 3, md: 4 },
                    mb: 1,
                     gap: { xs: 1.5, sm: 2 },
                     position: 'relative',
                     overflow: 'hidden',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: '3px',
                       background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #3b82f6 100%)',
                       borderRadius: '5px 5px 0 0'
                     }
                   }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Search fontSize={{ xs: 20, md: 24 }} />
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Search by vehicle, mechanic, status, etc."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            fontSize: { xs: 16, md: 18 },
                            pl: 1,
                            background: 'transparent'
                          }
                        }}
                        sx={{
                          flex: 1,
                          fontWeight: 300,
                          fontSize: { xs: 14, md: 15 },
                          background: 'transparent'
                        }}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Hourglass/>}
                       endIcon={<span style={{ fontSize: 16 }}>{filtersOpen ? '▲' : '▼'}</span>}
                      onClick={() => setFiltersOpen(f => !f)}
                       sx={{ 
                         fontWeight: 600, 
                         borderRadius: 3, 
                         px: { xs: 2, md: 3 }, 
                         py: 1.5, 
                         fontSize: { xs: 14, md: 16 },
                         minWidth: { xs: 'auto', sm: '120px' },
                         background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                         border: '2px solid rgba(37, 99, 235, 0.2)',
                         color: '#2563eb',
                         boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                         '&:hover': {
                           background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                           color: 'white',
                           borderColor: '#2563eb',
                           boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
                           transform: 'translateY(-1px)'
                         },
                         transition: 'all 0.3s ease'
                       }}
                    >
                      Filters
                    </Button>
                  </Box>
                  <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
                    <Box sx={{
                      width: '100%',
                      maxWidth: 1200,
                      background: 'rgba(245,248,255,0.97)',
                      borderRadius: { xs: 2, md: 4 },
                      boxShadow: '0 2px 24px rgba(37,99,235,0.10)',
                      p: { xs: 2, md: 2.5 },
                      mt: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 1.5, md: 2 },
                      alignItems: 'center',
                    }}>
                      <FormControl sx={{ minWidth: { xs: 120, md: 140 }, flex: { xs: 1, sm: 'none' } }} size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="Status">
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="Scheduled">Scheduled</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: { xs: 150, md: 180 }, flex: { xs: 1, sm: 'none' } }} size="small">
                        <InputLabel>Vehicle</InputLabel>
                        <Select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} label="Vehicle">
                          <MenuItem value="all">All</MenuItem>
                          {uniqueVehicles.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: { xs: 130, md: 160 }, flex: { xs: 1, sm: 'none' } }} size="small">
                        <InputLabel>Mechanic</InputLabel>
                        <Select value={filterMechanic} onChange={e => setFilterMechanic(e.target.value)} label="Mechanic">
                          <MenuItem value="all">All</MenuItem>
                          {uniqueMechanics.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <StandardDatePicker
                        label="Start Date"
                        value={filterStartDate}
                        onChange={setFilterStartDate}
                        size="small"
                        sx={{ minWidth: { xs: 100, md: 120 } }}
                      />
                      <StandardDatePicker
                        label="End Date"
                        value={filterEndDate}
                        onChange={setFilterEndDate}
                        size="small"
                        sx={{ minWidth: { xs: 100, md: 120 } }}
                      />
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => {
                        setFilterStatus('all');
                        setFilterVehicle('all');
                        setFilterMechanic('all');
                        setFilterStartDate(null);
                        setFilterEndDate(null);
                        }}
                        sx={{
                          minWidth: { xs: 'auto', md: '80px' },
                          fontSize: { xs: 12, md: 14 }
                        }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Collapse>
                </Box>
                  {/* Schedules List */}
                <Box sx={{ mt: { xs: 2, md: 3 }, width: '100%', maxWidth: '100%', mx: 'auto' }}>
                   <Paper elevation={0} sx={{ 
                     p: { xs: 4, md: 5 }, 
                     borderRadius: { xs: 4, md: 6 }, 
                     minHeight: { xs: '400px', md: '500px' },
                     background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                     border: '2px solid rgba(37, 99, 235, 0.12)',
                     boxShadow: '0 12px 40px rgba(37, 99, 235, 0.08), 0 4px 16px rgba(0,0,0,0.04)',
                     position: 'relative',
                     overflow: 'hidden',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: '4px',
                       background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #3b82f6 100%)',
                       borderRadius: '6px 6px 0 0'
                     }
                   }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, mb: { xs: 2, md: 3 } }}>
                       <Box sx={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         width: { xs: 48, md: 56 },
                         height: { xs: 48, md: 56 },
                         borderRadius: '16px',
                         background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                         color: 'white',
                         boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(37, 99, 235, 0.2)',
                         position: 'relative',
                         '&::before': {
                           content: '""',
                           position: 'absolute',
                           inset: 0,
                           borderRadius: '16px',
                           padding: '2px',
                           background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                           mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                           maskComposite: 'xor'
                         }
                       }}>
                         <BuildIcon sx={{ fontSize: { xs: 24, md: 28 }, zIndex: 1 }} />
                       </Box>
                      <Typography variant="h5" fontWeight={600} sx={{
                        color: '#1e293b',
                        background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: { xs: 20, md: 24 }
                      }}>
                      Scheduled Maintenance
                    </Typography>
                    </Box>
                    {filteredSchedules.length === 0 ? (
                      <Box sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 4,
                        borderRadius: '12px',
                        background: 'rgba(37, 99, 235, 0.02)',
                        border: '2px dashed rgba(37, 99, 235, 0.2)'
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          background: 'rgba(37, 99, 235, 0.1)',
                          margin: '0 auto 16px',
                          color: '#2563eb'
                        }}>
                          <EventIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
                          No scheduled maintenance
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You have no scheduled maintenance at this time.
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
                        {filteredSchedules.map(schedule => (
                            <ListItem
                            key={schedule.id}
                              alignItems="flex-start"
                              selected={selectedSchedule && selectedSchedule.id === schedule.id}
                              onClick={() => { setSelectedSchedule(schedule); fetchProgressUpdates(schedule.maintenanceRequestId); }}
                              sx={{
                              mb: { xs: 2, md: 3 },
                              borderRadius: { xs: 3, md: 4 },
                              boxShadow: selectedSchedule && selectedSchedule.id === schedule.id
                                ? '0 12px 32px rgba(37, 99, 235, 0.15), 0 4px 16px rgba(0,0,0,0.1)'
                                : '0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(37, 99, 235, 0.06)',
                              background: selectedSchedule && selectedSchedule.id === schedule.id
                                ? 'linear-gradient(135deg, #f0f4ff 0%, #e0f2fe 100%)'
                                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              border: selectedSchedule && selectedSchedule.id === schedule.id
                                ? '2px solid rgba(37, 99, 235, 0.3)'
                                : '2px solid rgba(37, 99, 235, 0.12)',
                                position: 'relative',
                              pl: { xs: 4, md: 5 },
                              pr: { xs: 4, md: 5 },
                              py: { xs: 4, md: 5 },
                              '&:hover': {
                                background: 'linear-gradient(135deg, #f0f4ff 0%, #e0f2fe 100%)',
                                cursor: 'pointer',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 16px 40px rgba(37, 99, 235, 0.15), 0 8px 24px rgba(0,0,0,0.1)',
                                borderColor: 'rgba(37, 99, 235, 0.25)'
                              },
                              minHeight: { xs: 100, md: 120 },
                                display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                background: selectedSchedule && selectedSchedule.id === schedule.id
                                  ? 'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)'
                                  : 'linear-gradient(180deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 100%)',
                                borderRadius: '0 4px 4px 0'
                              }
                            }}
                          >
                            <ListItemAvatar sx={{ mr: { xs: 2, md: 3 }, mb: { xs: 1, sm: 0 } }}>
                              <Avatar sx={{ 
                                width: { xs: 56, md: 64 }, 
                                height: { xs: 56, md: 64 },
                                background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(37, 99, 235, 0.2)',
                                border: '3px solid rgba(255, 255, 255, 0.2)',
                                position: 'relative',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  inset: '-3px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                                  zIndex: -1
                                }
                              }}>
                                <DirectionsCarIcon sx={{ fontSize: { xs: 28, md: 32 }, color: 'white', zIndex: 1 }} />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                <Box sx={{
                                  display: 'flex',
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  alignItems: { xs: 'flex-start', sm: 'center' },
                                 gap: { xs: 2, sm: 3 }, 
                                 mb: 2,
                                  flexWrap: 'wrap'
                                }}>
                                  <Typography fontWeight={600} sx={{ fontSize: { xs: 16, md: 18 }, color: '#1e293b' }}>
                                    {schedule.vehicleMake} {schedule.vehicleModel}
                                    </Typography>
                                  <Typography variant="body2" sx={{ fontSize: { xs: 14, md: 15 }, color: '#64748b', fontWeight: 500 }}>
                                    ({schedule.licensePlate})
                                  </Typography>
                                  <Chip
                                    label={schedule.status}
                                    color={schedule.status === 'Completed' ? 'success' : schedule.status === 'In Progress' ? 'info' : 'warning'}
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: { xs: 10, md: 12 },
                                      height: { xs: 24, md: 28 },
                                      borderRadius: '6px'
                                    }}
                                  />
                                  </Box>
                                }
                                secondary={
                                <Box sx={{
                                  display: 'flex',
                                  flexDirection: { xs: 'column', sm: 'row' },
                                  alignItems: { xs: 'flex-start', sm: 'center' },
                                 gap: { xs: 1, sm: 3 }, 
                                 mt: 1.5,
                                  flexWrap: 'wrap'
                                }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: 12, md: 14 } }}>
                                    📅 {format(new Date(schedule.scheduledDate), 'PPP')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: { xs: 12, md: 14 } }}>
                                    🔧 {schedule.repairType}
                                    </Typography>
                                  </Box>
                                }
                              />
                            <Box sx={{
                              display: 'flex',
                                 gap: 2, 
                                 mt: { xs: 2, sm: 0 },
                              width: { xs: '100%', sm: 'auto' },
                              justifyContent: { xs: 'flex-end', sm: 'flex-start' }
                            }}>
                                <Button
                                   variant="contained"
                                  color="primary"
                                   size="small"
                                   sx={{ 
                                     fontWeight: 700, 
                                     borderRadius: 3, 
                                     px: { xs: 3, md: 4 }, 
                                     py: { xs: 1.5, md: 2 }, 
                                     textTransform: 'none', 
                                     fontSize: { xs: 13, md: 15 },
                                     background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                                     boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25), 0 2px 8px rgba(37, 99, 235, 0.15)',
                                     border: '2px solid rgba(255, 255, 255, 0.2)',
                                     position: 'relative',
                                     overflow: 'hidden',
                                     '&::before': {
                                       content: '""',
                                       position: 'absolute',
                                       top: 0,
                                       left: '-100%',
                                       width: '100%',
                                       height: '100%',
                                       background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                       transition: 'left 0.5s'
                                     },
                                     '&:hover': {
                                       background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                                       boxShadow: '0 8px 28px rgba(37, 99, 235, 0.35), 0 4px 16px rgba(37, 99, 235, 0.2)',
                                       transform: 'translateY(-1px)',
                                       '&::before': {
                                         left: '100%'
                                       }
                                     },
                                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                   }}
                                  onClick={e => { e.stopPropagation(); handleViewDetails(schedule); }}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Box>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 4,
                    gap: 1,
                    alignItems: 'center'
                  }}>
                    <Button
                      variant="outlined"
                      size="small"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                        py: 1,
                        borderColor: 'rgba(37, 99, 235, 0.3)',
                        color: '#2563eb',
                        '&:hover': {
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)'
                        },
                        '&:disabled': {
                          borderColor: 'rgba(37, 99, 235, 0.1)',
                          color: 'rgba(37, 99, 235, 0.3)'
                        }
                      }}
                    >
                      Previous
                    </Button>
                      {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                          key={i + 1}
                        variant={currentPage === i + 1 ? "contained" : "outlined"}
                        size="small"
                          onClick={() => setCurrentPage(i + 1)}
                        sx={{
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: '40px',
                          height: '40px',
                          ...(currentPage === i + 1 ? {
                            background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                          } : {
                            borderColor: 'rgba(37, 99, 235, 0.3)',
                            color: '#2563eb',
                            '&:hover': {
                              borderColor: '#2563eb',
                              backgroundColor: 'rgba(37, 99, 235, 0.04)'
                            }
                          })
                        }}
                        >
                          {i + 1}
                      </Button>
                      ))}
                    <Button
                      variant="outlined"
                      size="small"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2,
                        py: 1,
                        borderColor: 'rgba(37, 99, 235, 0.3)',
                        color: '#2563eb',
                        '&:hover': {
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(37, 99, 235, 0.04)'
                        },
                        '&:disabled': {
                          borderColor: 'rgba(37, 99, 235, 0.1)',
                          color: 'rgba(37, 99, 235, 0.3)'
                        }
                      }}
                      >
                        Next
                    </Button>
                  </Box>
              )}
            </>
          )}
          {!loading && viewMode === 'detail' && selectedSchedule && (
            <div className="modal-overlay">
              <div className="modal-container">
                <button
                  className="modal-close"
                  onClick={handleBackToList}
                  aria-label="Close"
                >
                  &times;
                </button>
                <div className="detail-header">
                  <div className="header-left">
                    <h3 className="vehicle-title">
                      {selectedSchedule.vehicleMake} {selectedSchedule.vehicleModel} ({selectedSchedule.licensePlate})
                    </h3>
                  </div>
                  <div className="header-actions">
                    {selectedSchedule.status !== 'Completed' && (
                        <Button
                          variant="outlined"
                        onClick={() => {
                          setProgressForm({
                            expectedCompletionDate: '',
                            comment: ''
                          });
                          setOpenProgressDialog(true);
                        }}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            borderColor: 'rgba(37, 99, 235, 0.3)',
                            color: '#2563eb',
                            '&:hover': {
                              borderColor: '#2563eb',
                              backgroundColor: 'rgba(37, 99, 235, 0.04)'
                            }
                          }}
                        >
                          Update Progress
                        </Button>
                    )}
                    {selectedSchedule.status !== 'Completed' && (
                        <Button
                          variant="contained"
                        onClick={() => setShowCompleteConfirm(true)}
                        disabled={loading}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                            }
                          }}
                      >
                        {loading ? (
                          <>
                              <Box sx={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', mr: 1 }} />
                            Processing...
                          </>
                        ) : 'Complete Maintenance'}
                        </Button>
                    )}
                  </div>
                </div>
                <p className="detail-subtitle">
                  {selectedSchedule.repairType} · {getStatusBadge(selectedSchedule.status)}
                </p>
                <div className="detail-content">
                  <div className="detail-grid">
                    <div className="detail-section">
                      <h4 className="section-title">
                        <DescriptionIcon className="section-icon" />
                        Assignment Details
                      </h4>
                      <div className="section-content">
                        <div className="detail-field">
                          <label className="field-label">Scheduled Date</label>
                          <p className="field-value">
                            {selectedSchedule.scheduledDate ?
                              format(new Date(selectedSchedule.scheduledDate), 'PPpp') :
                              'Not scheduled'}
                          </p>
                        </div>
                        <div className="detail-field">
                          <label className="field-label">Repair Type</label>
                          <p className="field-value">{selectedSchedule.repairType}</p>
                        </div>
                        <div className="detail-field">
                          <label className="field-label">Reason</label>
                          <p className="field-value">
                            {selectedSchedule.reason || 'No reason provided'}
                          </p>
                        </div>
                        <div className="detail-field">
                          <label className="field-label">Comments</label>
                          <p className="field-value">
                            {selectedSchedule.comments || 'No comments'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="detail-section">
                      <h4 className="section-title">
                        <ScheduleIcon className="section-icon" />
                        Logistics
                      </h4>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        <Button variant="outlined" size="small" onClick={() => loadLogistics(selectedSchedule.id)}>Load Snapshot</Button>
                        {hasRole && hasRole('Admin') && (
                          <Button variant="outlined" size="small" onClick={() => togglePlanForm(selectedSchedule.id)}>
                            {logisticsForms[selectedSchedule.id]?.open ? 'Hide Plan' : 'Plan / Update'}
                          </Button>
                        )}
                        {hasRole && hasRole('Mechanic') && selectedSchedule.assignedMechanicId === userId && (
                          <>
                            <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'received')}>Received</Button>
                            <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'pickup')}>Picked up</Button>
                            <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'work-start')}>Start work</Button>
                            <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'ready-for-return')}>Ready for return</Button>
                            <Button size="small" variant="contained" onClick={() => postEvent(selectedSchedule.id, 'returned')}>Returned</Button>
                          </>
                        )}
                      </div>
                      {logisticsForms[selectedSchedule.id]?.open && hasRole && hasRole('Admin') && (
                        <Box sx={{ p: 2.5, border: '1px solid #e5e7eb', borderRadius: 2, mb: 2, backgroundColor: '#fafbff' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937' }}>Pickup</Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <FormControlLabel control={<Checkbox checked={!!(logisticsForms[selectedSchedule.id]?.pickupRequired)} onChange={(e) => updatePlanField(selectedSchedule.id, 'pickupRequired', e.target.checked)} />} label="Pickup required" />
                              <TextField fullWidth size="small" sx={{ mt: 1 }} placeholder="Pickup address" value={logisticsForms[selectedSchedule.id]?.pickupAddress || ''} onChange={(e) => updatePlanField(selectedSchedule.id, 'pickupAddress', e.target.value)} />
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <StandardDateTimePicker
                                  label="Pickup window start"
                                  value={logisticsForms[selectedSchedule.id]?.pickupWindowStart || null}
                                  onChange={(v) => updatePlanField(selectedSchedule.id, 'pickupWindowStart', v)}
                                  size="small"
                                />
                                <StandardDateTimePicker
                                  label="Pickup window end"
                                  value={logisticsForms[selectedSchedule.id]?.pickupWindowEnd || null}
                                  onChange={(v) => updatePlanField(selectedSchedule.id, 'pickupWindowEnd', v)}
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937' }}>Return</Typography>
                              <FormControlLabel control={<Checkbox checked={!!(logisticsForms[selectedSchedule.id]?.returnRequired)} onChange={(e) => updatePlanField(selectedSchedule.id, 'returnRequired', e.target.checked)} />} label="Return required" />
                              <TextField fullWidth size="small" sx={{ mt: 1 }} placeholder="Return address" value={logisticsForms[selectedSchedule.id]?.returnAddress || ''} onChange={(e) => updatePlanField(selectedSchedule.id, 'returnAddress', e.target.value)} />
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <StandardDateTimePicker
                                  label="Return window start"
                                  value={logisticsForms[selectedSchedule.id]?.returnWindowStart || null}
                                  onChange={(v) => updatePlanField(selectedSchedule.id, 'returnWindowStart', v)}
                                  size="small"
                                />
                                <StandardDateTimePicker
                                  label="Return window end"
                                  value={logisticsForms[selectedSchedule.id]?.returnWindowEnd || null}
                                  onChange={(v) => updatePlanField(selectedSchedule.id, 'returnWindowEnd', v)}
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField fullWidth size="small" placeholder="Contact name" value={logisticsForms[selectedSchedule.id]?.contactName || ''} onChange={(e) => updatePlanField(selectedSchedule.id, 'contactName', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField fullWidth size="small" placeholder="Contact phone" value={logisticsForms[selectedSchedule.id]?.contactPhone || ''} onChange={(e) => updatePlanField(selectedSchedule.id, 'contactPhone', e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField fullWidth size="small" multiline rows={2} placeholder="Notes" value={logisticsForms[selectedSchedule.id]?.notes || ''} onChange={(e) => updatePlanField(selectedSchedule.id, 'notes', e.target.value)} />
                            </Grid>
                          </Grid>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button size="small" variant="contained" onClick={() => submitPlan(selectedSchedule.id)}>Save plan</Button>
                          </Box>
                        </Box>
                      )}
                      {logisticsBySchedule[selectedSchedule.id] && (
                        <Box sx={{ p: 2, border: '1px dashed #e5e7eb', borderRadius: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Snapshot</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption"><strong>Received:</strong> {logisticsBySchedule[selectedSchedule.id].receivedAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].receivedAt), 'PPpp') : '-'}</Typography>
                            <Typography variant="caption"><strong>Picked up:</strong> {logisticsBySchedule[selectedSchedule.id].pickedUpAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].pickedUpAt), 'PPpp') : '-'}</Typography>
                            <Typography variant="caption"><strong>Work started:</strong> {logisticsBySchedule[selectedSchedule.id].workStartedAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].workStartedAt), 'PPpp') : '-'}</Typography>
                            <Typography variant="caption"><strong>Ready:</strong> {logisticsBySchedule[selectedSchedule.id].readyForReturnAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].readyForReturnAt), 'PPpp') : '-'}</Typography>
                            <Typography variant="caption"><strong>Returned:</strong> {logisticsBySchedule[selectedSchedule.id].returnedAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].returnedAt), 'PPpp') : '-'}</Typography>
                          </Box>
                        </Box>
                      )}
                    </div>
                    <div className="detail-section">
                      <h4 className="section-title">
                        <ScheduleIcon className="section-icon" />
                        Progress History
                      </h4>
                      {progressUpdates.length === 0 ? (
                        <div className="empty-section">
                          <p className="empty-text">No progress updates yet</p>
                        </div>
                      ) : (
                        <div className="timeline">
                          <ul className="timeline-list">
                            {progressUpdates.map((update, index) => (
                              <li key={index} className="timeline-item">
                                <div className="timeline-connector"></div>
                                <div className="timeline-content">
                                  <div className="timeline-avatar">
                                    {update.mechanic?.charAt(0).toUpperCase() || 'M'}
                                  </div>
                                  <div className="timeline-details">
                                    <p className="timeline-comment">{update.comment}</p>
                                    <div className="timeline-tags">
                                      {update.expectedCompletionDate && (
                                        <span className="date-tag expected">
                                          <EventIcon className="tag-icon" />
                                          Expected: {format(new Date(update.expectedCompletionDate), 'PP')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="timeline-time">
                                      {format(new Date(update.timestamp), 'PPpp')}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </Box>

      {/* Cost Deliberation Requests Section */}
      <Box sx={{
         flex: { xs: 'unset', md: 3 },
         minWidth: 0,
         width: { xs: '100%', md: '30%' },
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
         borderRadius: '20px',
         boxShadow: '0 12px 40px rgba(37, 99, 235, 0.12), 0 4px 16px rgba(0,0,0,0.06)',
         border: '2px solid rgba(37, 99, 235, 0.15)',
         p: { xs: 4, md: 6 },
         mt: { xs: 3, md: 0 },
        position: 'relative',
         overflow: 'hidden',
         maxHeight: '80vh',
         display: 'flex',
         flexDirection: 'column',
         '&::before': {
           content: '""',
           position: 'absolute',
           top: 0,
           left: 0,
           right: 0,
           height: '4px',
           background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #3b82f6 100%)',
           borderRadius: '20px 20px 0 0'
         }
       }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
          zIndex: 0
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            pb: 2,
            borderBottom: '1px solid rgba(37, 99, 235, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                 width: 56,
                 height: 56,
                 borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                color: 'white',
                 boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(37, 99, 235, 0.2)',
                 border: '3px solid rgba(255, 255, 255, 0.2)',
                 position: 'relative',
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   inset: '-3px',
                   borderRadius: '16px',
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                   zIndex: -1
                 }
               }}>
                 <span style={{ fontSize: '28px', zIndex: 1 }}>💰</span>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  color: '#1e293b',
                  background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Cost Deliberation Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {filteredCostDeliberationRequests.length} request{filteredCostDeliberationRequests.length !== 1 ? 's' : ''} • Page {costDeliberationPage} of {totalCostDeliberationPages}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                  User ID: {userId || 'Not available'}
                </Typography>
              </Box>
            </Box>
              <Button
                variant="outlined"
                onClick={fetchCostDeliberationRequests}
                disabled={loading}
                sx={{ 
                 borderRadius: '16px',
                  borderColor: 'rgba(37, 99, 235, 0.3)',
                  color: '#2563eb',
                 fontWeight: 700,
                  textTransform: 'none',
                 px: 4,
                 py: 1.5,
                 background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                 border: '2px solid rgba(37, 99, 235, 0.2)',
                 boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                  '&:hover': {
                    borderColor: '#2563eb',
                   backgroundColor: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                   color: 'white',
                   boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
                   transform: 'translateY(-1px)'
                 },
                 '&:disabled': {
                   opacity: 0.6,
                   cursor: 'not-allowed'
                 },
                 transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    border: '2px solid rgba(37, 99, 235, 0.3)', 
                    borderTop: '2px solid #2563eb', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite', 
                    mr: 1 
                  }} />
                ) : (
                  <RefreshIcon sx={{ mr: 1, fontSize: 20 }} />
                )}
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              
              {/* Debug Test Button */}
              <Button
                variant="text"
                size="small"
                onClick={async () => {
                  console.log('🧪 Testing API endpoint directly...');
                  try {
                    const testResponse = await fetch(`https://localhost:7092/api/MaintenanceRequest/cost-deliberation-requests/${userId}`, {
                      headers: {
                        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('authData'))?.token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('🧪 Test response status:', testResponse.status);
                    console.log('🧪 Test response headers:', testResponse.headers);
                    const testData = await testResponse.text();
                    console.log('🧪 Test response data:', testData);
                  } catch (error) {
                    console.error('🧪 Test error:', error);
                  }
                }}
                sx={{ 
                  ml: 2,
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  '&:hover': { color: '#2563eb' }
                }}
              >
                Test API
              </Button>
          </Box>

          {/* Search and Filter Section */}
          <Box sx={{
            width: '100%',
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: { xs: 3, md: 4 },
            boxShadow: '0 4px 16px rgba(37,99,235,0.08)',
            border: '1px solid rgba(37, 99, 235, 0.1)',
            p: { xs: 2, md: 3 },
            gap: { xs: 2, sm: 2 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Search fontSize={{ xs: 18, md: 20 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search requests, vehicles, or users..."
                value={costDeliberationSearch}
                onChange={e => setCostDeliberationSearch(e.target.value)}
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { 
                    fontSize: { xs: 14, md: 15 }, 
                    pl: 1, 
                    background: 'transparent' 
                  }
                }}
                sx={{ 
                  flex: 1, 
                  fontWeight: 300, 
                  fontSize: { xs: 14, md: 15 }, 
                  background: 'transparent' 
                }}
              />
            </Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Hourglass/>}
              endIcon={<span style={{ fontSize: 14 }}>{costDeliberationFiltersOpen ? '▲' : '▼'}</span>}
              onClick={() => setCostDeliberationFiltersOpen(f => !f)}
              sx={{ 
                  fontWeight: 600,
                borderRadius: 2, 
                px: { xs: 2, md: 3 }, 
                  py: 1,
                fontSize: { xs: 13, md: 14 },
                minWidth: { xs: 'auto', sm: '100px' },
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                border: '2px solid rgba(37, 99, 235, 0.2)',
                color: '#2563eb',
                  '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                  color: 'white',
                  borderColor: '#2563eb'
                  }
                }}
              >
              Filter
              </Button>
            </Box>

          <Collapse in={costDeliberationFiltersOpen} timeout="auto" unmountOnExit>
            <Box sx={{
              width: '100%',
              background: 'rgba(245,248,255,0.97)',
              borderRadius: { xs: 2, md: 3 },
              boxShadow: '0 2px 16px rgba(37,99,235,0.08)',
              p: { xs: 2, md: 2.5 },
              mb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 1.5, md: 2 },
              alignItems: 'center',
            }}>
              <FormControl sx={{ minWidth: { xs: 120, md: 140 } }} size="small">
                <InputLabel>Status</InputLabel>
                <Select 
                  value={costDeliberationFilter} 
                  onChange={e => setCostDeliberationFilter(e.target.value)} 
                  label="Status"
                >
                  <MenuItem value="all">All Requests</MenuItem>
                  <MenuItem value="active">Active (Need Proposal)</MenuItem>
                  <MenuItem value="proposed">Proposed</MenuItem>
                  <MenuItem value="negotiating">Negotiating</MenuItem>
                  <MenuItem value="agreed">Agreed</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => {
                  setCostDeliberationFilter('all');
                  setCostDeliberationSearch('');
                }}
                sx={{ 
                  minWidth: { xs: 'auto', md: '80px' },
                  fontSize: { xs: 12, md: 14 }
                }}
              >
                Reset
              </Button>
          </Box>
          </Collapse>
        
        {loading ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 4,
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.02)',
            border: '2px dashed rgba(37, 99, 235, 0.2)'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              margin: '0 auto 16px',
              color: '#2563eb'
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                border: '3px solid rgba(37, 99, 235, 0.3)',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              Loading Cost Deliberation Requests...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', margin: '0 auto' }}>
              Please wait while we fetch your cost deliberation requests.
            </Typography>
          </Box>
        ) : costDeliberationRequests.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            px: 4,
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.02)',
            border: '2px dashed rgba(37, 99, 235, 0.2)'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              margin: '0 auto 16px',
              color: '#2563eb'
            }}>
              <span style={{ fontSize: '32px' }}>💰</span>
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              No Cost Deliberation Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', margin: '0 auto' }}>
              You will see cost deliberation requests here when a reviewer selects you to propose costs for maintenance requests.
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchCostDeliberationRequests}
              sx={{ 
                borderRadius: '12px',
                borderColor: 'rgba(37, 99, 235, 0.3)',
                color: '#2563eb',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37, 99, 235, 0.04)'
                }
              }}
            >
              Check Again
            </Button>
          </Box>
        ) : (
           <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             {filteredCostDeliberationRequests.length === 0 ? (
               <Box sx={{ 
                 textAlign: 'center', 
                 py: 6,
                 px: 4,
                 borderRadius: '12px',
                 background: 'rgba(37, 99, 235, 0.02)',
                 border: '2px dashed rgba(37, 99, 235, 0.2)'
               }}>
                 <Box sx={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: 64,
                   height: 64,
                   borderRadius: '50%',
                   background: 'rgba(37, 99, 235, 0.1)',
                   margin: '0 auto 16px',
                   color: '#2563eb'
                 }}>
                   <Search sx={{ fontSize: 32 }} />
                 </Box>
                 <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
                   No matching requests found
                 </Typography>
                 <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '400px', margin: '0 auto' }}>
                   Try adjusting your search terms or filters to find cost deliberation requests.
                 </Typography>
                 <Button
                   variant="outlined"
                   onClick={() => {
                     setCostDeliberationSearch('');
                     setCostDeliberationFilter('all');
                   }}
                   sx={{ 
                     borderRadius: '12px',
                     borderColor: 'rgba(37, 99, 235, 0.3)',
                     color: '#2563eb',
                     fontWeight: 600,
                     textTransform: 'none',
                     px: 3,
                     py: 1.5,
                     '&:hover': {
                       borderColor: '#2563eb',
                       backgroundColor: 'rgba(37, 99, 235, 0.04)'
                     }
                   }}
                 >
                   Clear Filters
                 </Button>
               </Box>
             ) : (
               <>
                 <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontWeight: 500 }}>
                   Showing {paginatedCostDeliberationRequests.length} of {filteredCostDeliberationRequests.length} requests
            </Typography>
          
                 <Box sx={{ 
                   flex: 1, 
                   overflow: 'auto', 
                   pr: 1,
                   display: 'grid',
                   gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(2, 1fr)' },
                   gap: 3,
                   mb: 3
                 }}>
                   {paginatedCostDeliberationRequests.map((request, index) => {
              const getStatusInfo = () => {
                if (request.status === 'MechanicsSelected') {
                  return { label: 'Proposal Required', color: 'warning', action: 'propose' };
                } else if (request.status === 'Proposed') {
                  return { label: 'Proposed', color: 'info', action: 'both' };
                } else if (request.status === 'Negotiating') {
                  return { label: 'Negotiating', color: 'warning', action: 'both' };
                } else if (request.status === 'Agreed') {
                  return { label: 'Agreed', color: 'success', action: 'none' };
                } else {
                  return { label: 'Pending', color: 'default', action: 'none' };
                }
              };
              const statusInfo = getStatusInfo();
              const hasProposedCost = request.proposedCost && request.proposedCost > 0;
              const hasNegotiatedCost = request.negotiatedCost && request.negotiatedCost > 0;
              const currentCost = hasNegotiatedCost ? request.negotiatedCost : (hasProposedCost ? request.proposedCost : null);
              const wasLastNegotiatedByCurrentUser = request.lastNegotiatedByUserId === userId;
              const canNegotiate = statusInfo.action === 'both' && currentCost && !wasLastNegotiatedByCurrentUser;
              const canAccept = statusInfo.action === 'both' && currentCost && !wasLastNegotiatedByCurrentUser;

              return (
                   <Box
                  key={index}
                     onClick={() => {
                       setSelectedCostDeliberationRequest(request);
                       setCostDeliberationDetailOpen(true);
                     }}
                  sx={{
                    borderRadius: '16px',
                       boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(37, 99, 235, 0.06)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                       border: '2px solid rgba(37, 99, 235, 0.12)',
                       p: { xs: 3, md: 4 },
                       position: 'relative',
                       overflow: 'hidden',
                       height: '200px', // Fixed height for standard size
                       display: 'flex',
                       flexDirection: 'column',
                       cursor: 'pointer',
                       '&::before': {
                         content: '""',
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         width: '4px',
                         height: '100%',
                         background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 100%)',
                         borderRadius: '0 4px 4px 0'
                       },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f0f4ff 0%, #e0f2fe 100%)',
                      transform: 'translateY(-2px)',
                         boxShadow: '0 12px 32px rgba(37, 99, 235, 0.15), 0 4px 16px rgba(0,0,0,0.1)',
                         borderColor: 'rgba(37, 99, 235, 0.25)',
                         '&::before': {
                           background: 'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)'
                         }
                       },
                       transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                     }}
                   >
                        {/* Card Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip 
                          label={statusInfo.label} 
                          color={statusInfo.color} 
                          size="small" 
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: '8px',
                            px: 1,
                            py: 0.5,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                        </Box>

                        {/* Card Content - Essential Info Only */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1e293b' }}>
                          {request.requestTitle}
                        </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.9rem' }}>
                          <strong>Vehicle:</strong> {request.vehicleInfo}
                        </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                          <strong>Requested by:</strong> {request.requestedBy}
                        </Typography>
                          </Box>

                        {currentCost && (
                            <Box sx={{ 
                              p: 1.5, 
                              borderRadius: '8px', 
                              background: 'rgba(37, 99, 235, 0.05)',
                              border: '1px solid rgba(37, 99, 235, 0.1)'
                            }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            <strong>Current Cost:</strong> ${currentCost?.toFixed(2)}
                          </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Click to View Details */}
                            <Box sx={{ 
                          mt: 'auto', 
                          textAlign: 'center',
                          pt: 2,
                          borderTop: '1px solid rgba(37, 99, 235, 0.1)'
                        }}>
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            color: '#2563eb'
                          }}>
                            Click to view details
                                </Typography>
                            </Box>
                          </Box>
                    );
                  })}
                      </Box>

                 {/* Pagination Controls */}
                 {totalCostDeliberationPages > 1 && (
                   <Box sx={{ 
                     display: 'flex', 
                     justifyContent: 'center', 
                     mt: 3, 
                     gap: 1,
                     alignItems: 'center'
                   }}>
                      <Button
                       variant="outlined"
                       size="small"
                       onClick={() => setCostDeliberationPage((p) => Math.max(1, p - 1))}
                       disabled={costDeliberationPage === 1}
                        sx={{ 
                         borderRadius: '8px',
                          textTransform: 'none',
                         fontWeight: 600,
                         px: 2,
                         py: 1,
                         borderColor: 'rgba(37, 99, 235, 0.3)',
                         color: '#2563eb',
                          '&:hover': {
                           borderColor: '#2563eb',
                           backgroundColor: 'rgba(37, 99, 235, 0.04)'
                          },
                         '&:disabled': {
                           borderColor: 'rgba(37, 99, 235, 0.1)',
                           color: 'rgba(37, 99, 235, 0.3)'
                         }
                        }}
                      >
                       Previous
                      </Button>
                     {Array.from({ length: totalCostDeliberationPages }, (_, i) => (
                      <Button 
                         key={i + 1}
                         variant={costDeliberationPage === i + 1 ? "contained" : "outlined"}
                        size="small" 
                         onClick={() => setCostDeliberationPage(i + 1)}
                          sx={{ 
                           borderRadius: '8px',
                            textTransform: 'none',
                           fontWeight: 600,
                           minWidth: '40px',
                           height: '40px',
                           ...(costDeliberationPage === i + 1 ? {
                             background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                             color: 'white',
                             boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                           } : {
                             borderColor: 'rgba(37, 99, 235, 0.3)',
                             color: '#2563eb',
                            '&:hover': {
                               borderColor: '#2563eb',
                               backgroundColor: 'rgba(37, 99, 235, 0.04)'
                             }
                           })
                         }}
                       >
                         {i + 1}
                        </Button>
                     ))}
                        <Button
                          variant="outlined"
                       size="small"
                       onClick={() => setCostDeliberationPage((p) => Math.min(totalCostDeliberationPages, p + 1))}
                       disabled={costDeliberationPage === totalCostDeliberationPages}
                          sx={{ 
                         borderRadius: '8px',
                            textTransform: 'none',
                         fontWeight: 600,
                         px: 2,
                         py: 1,
                         borderColor: 'rgba(37, 99, 235, 0.3)',
                         color: '#2563eb',
                            '&:hover': {
                           borderColor: '#2563eb',
                           backgroundColor: 'rgba(37, 99, 235, 0.04)'
                            },
                         '&:disabled': {
                           borderColor: 'rgba(37, 99, 235, 0.1)',
                           color: 'rgba(37, 99, 235, 0.3)'
                         }
                          }}
                        >
                       Next
                        </Button>
                   </Box>
                 )}
                      </>
                    )}
           </Box>
         )}
         </Box>
       </Box>

      {/* Progress Update Modal */}
      {openProgressDialog && (
        <div className="modal-overlay">
          <div className="modal-container modern-progress-modal">
            <div className="modal-content">
              <div className="modal-header modern-modal-header">
                <PendingIcon className="modal-icon warning" />
                <h3 className="modal-title">Estimated Return</h3>
              </div>
              <div className="modal-summary modern-modal-summary">
                <p className="summary-text">
                  <strong>{selectedSchedule?.vehicleMake} {selectedSchedule?.vehicleModel}</strong> ({selectedSchedule?.licensePlate}) - {selectedSchedule?.repairType}
                </p>
              </div>
              <div className="modal-form modern-modal-form">
                <div className="form-grid modern-form-grid">
                  <div className="form-group modern-form-group">
                    <label htmlFor="expectedDate" className="form-label modern-form-label">Expected Completion</label>
                    <input
                      type="date"
                      id="expectedDate"
                      className="form-input modern-form-input"
                      value={progressForm.expectedCompletionDate}
                      onChange={(e) => setProgressForm({ ...progressForm, expectedCompletionDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group full-width modern-form-group">
                    <label htmlFor="comment" className="form-label modern-form-label">Comments</label>
                    <textarea
                      id="comment"
                      rows="3"
                      className="form-textarea modern-form-textarea"
                      value={progressForm.comment}
                      onChange={(e) => setProgressForm({ ...progressForm, comment: e.target.value })}
                      placeholder="Add any comments or notes..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer modern-modal-footer">
                <button
                  type="button"
                  className="secondary-button modern-secondary-button"
                  onClick={() => setOpenProgressDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button modern-primary-button"
                  onClick={handleSubmitProgressUpdate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner small"></div>
                      Processing...
                    </>
                  ) : 'Submit Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Completing Maintenance */}
      {showCompleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(30, 41, 59, 0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.25s',
        }}>
          <div style={{
            minWidth: 340,
            maxWidth: 420,
            width: '90vw',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(37,99,235,0.13)',
            padding: '2.2rem 2.2rem 1.5rem 2.2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1.5px solid #e0eaff',
            position: 'relative',
            animation: 'scaleIn 0.22s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <span style={{ fontSize: 32, color: '#fbbf24', filter: 'drop-shadow(0 2px 8px #fbbf2433)' }}>⚠️</span>
              <span style={{ fontWeight: 900, fontSize: 23, color: '#222', letterSpacing: 0.2 }}>Are you sure?</span>
            </div>
            <div style={{ fontSize: 17, color: '#374151', marginBottom: 28, textAlign: 'center', fontWeight: 500 }}>
              Are you sure you have completed all necessary work on this vehicle?
            </div>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'flex-end', width: '100%' }}>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: '1.5px solid #2563eb',
                  color: '#2563eb',
                  fontWeight: 700,
                  borderRadius: 8,
                  padding: '0.7rem 1.6rem',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                  boxShadow: '0 1px 6px rgba(37,99,235,0.06)',
                }}
                onClick={() => setShowCompleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.7rem 1.8rem',
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(37,99,235,0.13)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:'center',
                  gap: 8,
                  transition: 'background 0.18s, box-shadow 0.18s',
                }}
                onClick={() => {
                  setShowCompleteConfirm(false);
                  handleCompleteWithInvoice();
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={{ fontSize: 18, marginRight: 6 }}>⏳</span> Processing...
                  </>
                ) : (
                  <>
                    Yes, Complete
                  </>
                )}
              </button>
            </div>
            <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes scaleIn { from { transform: scale(0.95); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
              button:active { transform: scale(0.97); }
              button:focus { outline: 2px solid #2563eb33; }
            `}</style>
          </div>
        </div>
      )}

      {/* Cost Proposal Dialog */}
      <Dialog
        open={openCostProposalDialog}
        onClose={() => setOpenCostProposalDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 32px 80px rgba(37, 99, 235, 0.25), 0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            backdropFilter: 'blur(20px)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(147, 197, 253, 0.02) 100%)',
              zIndex: 0
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 25%, #93c5fd 50%, #60a5fa 75%, #3b82f6 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
              zIndex: 1
            }
          }
        }}
        BackdropProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(12px) saturate(180%)',
            animation: 'fadeIn 0.3s ease-out'
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          color: 'white',
          fontWeight: 800,
          fontSize: '1.5rem',
          py: 4,
          px: 5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            zIndex: 0
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)',
            zIndex: 1
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                zIndex: -1
              }
            }}>
              💰
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                mb: 1,
                background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em'
              }}>
                Propose Cost
              </Typography>
              <Typography variant="body1" sx={{ 
                opacity: 0.95, 
                fontSize: '1rem',
                fontWeight: 500,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                letterSpacing: '0.01em'
              }}>
                Submit your cost proposal for this maintenance request
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 5, px: 5, pb: 3, position: 'relative', zIndex: 1 }}>
          {selectedCostRequest && (
            <Box sx={{ 
              mb: 5, 
              p: 4, 
              borderRadius: '20px', 
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
              border: '1px solid rgba(37, 99, 235, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '6px',
                height: '100%',
                background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                borderRadius: '0 6px 6px 0',
                boxShadow: '2px 0 8px rgba(59, 130, 246, 0.3)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)'
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 700, 
                color: '#0f172a',
                mb: 3,
                letterSpacing: '-0.01em',
                textShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {selectedCostRequest.requestTitle}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(37, 99, 235, 0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.8)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  }
                }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                    flexShrink: 0
                  }} />
                  <Typography variant="body1" sx={{ 
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Vehicle:</span> {selectedCostRequest.vehicleInfo}
              </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(37, 99, 235, 0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.8)',
                    transform: 'translateX(4px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  }
                }}>
                  <Box sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                    flexShrink: 0
                  }} />
                  <Typography variant="body1" sx={{ 
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    <span style={{ color: '#64748b', fontWeight: 500 }}>Requested by:</span> {selectedCostRequest.requestedBy}
              </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 700, 
              color: '#0f172a',
              fontSize: '1.1rem'
            }}>
              💵 Proposed Cost
            </Typography>
          <TextField
            fullWidth
              label="Enter your proposed cost"
            type="number"
            value={costProposalForm.proposedCost}
            onChange={(e) => setCostProposalForm({ ...costProposalForm, proposedCost: e.target.value })}
            InputProps={{
                startAdornment: (
                  <Box sx={{ 
                    color: '#3b82f6', 
                    fontWeight: 800, 
                    fontSize: '1.3rem',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    $
                  </Box>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '2px solid rgba(37, 99, 235, 0.1)',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-focused': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 24px rgba(37, 99, 235, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 600,
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#3b82f6',
                    fontWeight: 700
                  }
                }
              }}
            />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ 
              mb: 2, 
              fontWeight: 700, 
              color: '#0f172a',
              fontSize: '1.1rem'
            }}>
              💬 Additional Comments
            </Typography>
          <TextField
            fullWidth
              label="Explain your cost breakdown, parts needed, labor hours, etc..."
            multiline
            rows={4}
            value={costProposalForm.comments}
            onChange={(e) => setCostProposalForm({ ...costProposalForm, comments: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '2px solid rgba(37, 99, 235, 0.1)',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-focused': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 24px rgba(37, 99, 235, 0.2)',
                    transform: 'translateY(-2px)'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 600,
                  color: '#64748b',
                  '&.Mui-focused': {
                    color: '#3b82f6',
                    fontWeight: 700
                  }
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 5, 
          pt: 3, 
          gap: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderTop: '1px solid rgba(37, 99, 235, 0.08)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '4px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
            borderRadius: '0 0 4px 4px',
            opacity: 0.6
          }
        }}>
          <Button
            onClick={() => setOpenCostProposalDialog(false)}
            variant="outlined"
            sx={{ 
              color: '#64748b',
              borderColor: 'rgba(100, 116, 139, 0.2)',
              fontWeight: 700,
              borderRadius: '16px',
              px: 4,
              py: 2,
              textTransform: 'none',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: '0 4px 16px rgba(100, 116, 139, 0.1)',
              border: '2px solid rgba(100, 116, 139, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.02) 0%, rgba(100, 116, 139, 0.05) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'transparent',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(100, 116, 139, 0.2)',
                '&::before': {
                  opacity: 1
                }
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCostProposal}
            variant="contained"
            disabled={loading || !costProposalForm.proposedCost}
            sx={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
              color: 'white',
              fontWeight: 800,
              borderRadius: '16px',
              px: 6,
              py: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4), 0 4px 16px rgba(37, 99, 235, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              border: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.6s ease'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                boxShadow: '0 12px 40px rgba(37, 99, 235, 0.5), 0 6px 20px rgba(37, 99, 235, 0.3)',
                transform: 'translateY(-4px) scale(1.02)',
                '&::before': {
                  left: '100%'
                },
                '&::after': {
                  opacity: 1
                }
              },
              '&:active': {
                transform: 'translateY(-2px) scale(1.01)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
              },
              '&:disabled': {
                background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                color: 'rgba(255, 255, 255, 0.8)',
                boxShadow: '0 4px 16px rgba(148, 163, 184, 0.2)',
                transform: 'none',
                '&::before': {
                  display: 'none'
                },
                '&::after': {
                  display: 'none'
                }
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  Submitting...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                  Submit Proposal
                </Typography>
                <Box sx={{
                  fontSize: '1.2rem',
                  transform: 'translateY(-1px)'
                }}>
                  →
                </Box>
              </Box>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cost Negotiation Dialog */}
      <Dialog
        open={openCostNegotiationDialog}
        onClose={() => setOpenCostNegotiationDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(245, 158, 11, 0.15), 0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
              zIndex: 1
            }
          }
        }}
        BackdropProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.25rem',
          py: 3,
          px: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              💰
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Negotiate Cost
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                Submit your counter-proposal for this maintenance request
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 4, pb: 2 }}>
          {selectedCostRequest && (
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '0 4px 4px 0'
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#92400e' }}>
                {selectedCostRequest.requestTitle}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                <strong>Vehicle:</strong> {selectedCostRequest.vehicleInfo}
              </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                <strong>Current Proposed Cost:</strong> ${selectedCostRequest.proposedCost?.toFixed(2)}
              </Typography>
              {selectedCostRequest.negotiatedCost && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <strong>Current Negotiated Cost:</strong> ${selectedCostRequest.negotiatedCost?.toFixed(2)}
                </Typography>
              )}
              </Box>
            </Box>
          )}
          
          <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
              label="Negotiated Cost"
            type="number"
            value={costNegotiationForm.negotiatedCost}
            onChange={(e) => setCostNegotiationForm({ ...costNegotiationForm, negotiatedCost: e.target.value })}
            InputProps={{
                startAdornment: (
                  <Box sx={{ 
                    color: '#f59e0b', 
                    fontWeight: 700, 
                    fontSize: '1.1rem',
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    $
                  </Box>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f59e0b',
                    borderWidth: 2
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f59e0b',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#f59e0b'
                }
              }}
            />
          </Box>

          <Box>
          <TextField
            fullWidth
            label="Comments (Optional)"
            multiline
            rows={4}
            value={costNegotiationForm.comments}
            onChange={(e) => setCostNegotiationForm({ ...costNegotiationForm, comments: e.target.value })}
            placeholder="Explain your negotiation reasoning..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f59e0b',
                    borderWidth: 2
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#f59e0b',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#f59e0b'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 4, 
          pt: 2, 
          gap: 2,
          background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
          borderTop: '1px solid rgba(245, 158, 11, 0.1)'
        }}>
          <Button
            onClick={() => setOpenCostNegotiationDialog(false)}
            variant="outlined"
            sx={{ 
              color: '#64748b',
              borderColor: 'rgba(100, 116, 139, 0.3)',
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.04)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCostNegotiation}
            variant="contained"
            disabled={loading || !costNegotiationForm.negotiatedCost}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s'
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: '100%'
                }
              },
              '&:disabled': {
                background: 'rgba(100, 116, 139, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
                boxShadow: 'none',
                transform: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Negotiating...
              </Box>
            ) : (
              'Submit Negotiation'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cost Acceptance Dialog */}
      <Dialog
        open={openCostAcceptanceDialog}
        onClose={() => setOpenCostAcceptanceDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(34, 197, 94, 0.15), 0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(34, 197, 94, 0.1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
              zIndex: 1
            }
          }
        }}
        BackdropProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.25rem',
          py: 3,
          px: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              ✅
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Accept Cost
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                Confirm your acceptance of the proposed cost
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 4, px: 4, pb: 2 }}>
          {selectedCostRequest && (
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 3, 
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '0 4px 4px 0'
              }
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#166534' }}>
                {selectedCostRequest.requestTitle}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />
                <strong>Vehicle:</strong> {selectedCostRequest.vehicleInfo}
              </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />
                <strong>Proposed Cost:</strong> ${selectedCostRequest.proposedCost?.toFixed(2)}
              </Typography>
              {selectedCostRequest.negotiatedCost && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e' }} />
                  <strong>Negotiated Cost:</strong> ${selectedCostRequest.negotiatedCost?.toFixed(2)}
                </Typography>
              )}
              </Box>
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                borderRadius: 2, 
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, textAlign: 'center' }}>
                  ✅ You are accepting the {selectedCostRequest.negotiatedCost ? 'negotiated' : 'proposed'} cost.
              </Typography>
              </Box>
            </Box>
          )}
          
          <Box>
          <TextField
            fullWidth
            label="Comments (Optional)"
            multiline
            rows={4}
            value={costAcceptanceForm.comments}
            onChange={(e) => setCostAcceptanceForm({ ...costAcceptanceForm, comments: e.target.value })}
            placeholder="Any additional comments about accepting this cost..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#22c55e',
                    borderWidth: 2
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#22c55e',
                    borderWidth: 2
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#22c55e'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 4, 
          pt: 2, 
          gap: 2,
          background: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)',
          borderTop: '1px solid rgba(34, 197, 94, 0.1)'
        }}>
          <Button
            onClick={() => setOpenCostAcceptanceDialog(false)}
            variant="outlined"
            sx={{ 
              color: '#64748b',
              borderColor: 'rgba(100, 116, 139, 0.3)',
              fontWeight: 600,
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.04)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCostAcceptance}
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s'
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: '100%'
                }
              },
              '&:disabled': {
                background: 'rgba(100, 116, 139, 0.3)',
                color: 'rgba(255, 255, 255, 0.7)',
                boxShadow: 'none',
                transform: 'none'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Accepting...
              </Box>
            ) : (
              'Accept Cost'
            )}
          </Button>
        </DialogActions>
       </Dialog>

       {/* Cost Deliberation Detail Modal */}
       <Dialog
         open={costDeliberationDetailOpen}
         onClose={() => setCostDeliberationDetailOpen(false)}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: {
             borderRadius: '24px',
             boxShadow: '0 32px 80px rgba(37, 99, 235, 0.25), 0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
             border: 'none',
             overflow: 'hidden',
             position: 'relative',
             background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
             backdropFilter: 'blur(20px)',
             '&::before': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(147, 197, 253, 0.02) 100%)',
               zIndex: 0
             },
             '&::after': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: '6px',
               background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 25%, #93c5fd 50%, #60a5fa 75%, #3b82f6 100%)',
               backgroundSize: '200% 100%',
               animation: 'shimmer 3s ease-in-out infinite',
               zIndex: 1
             }
           }
         }}
         BackdropProps={{
           sx: {
             background: 'rgba(15, 23, 42, 0.6)',
             backdropFilter: 'blur(12px) saturate(180%)',
             animation: 'fadeIn 0.3s ease-out'
           }
         }}
         sx={{
           '& .MuiDialog-paper': {
             animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
           }
         }}
       >
         <DialogTitle sx={{
           background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
           color: 'white',
           fontWeight: 800,
           fontSize: '1.5rem',
           py: 4,
           px: 5,
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
             zIndex: 0
           },
           '&::after': {
             content: '""',
             position: 'absolute',
             bottom: 0,
             left: 0,
             right: 0,
             height: '2px',
             background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)',
             zIndex: 1
           }
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
             <Box sx={{
               width: 56,
               height: 56,
               borderRadius: '20px',
               background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '1.8rem',
               boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
               border: '1px solid rgba(255,255,255,0.2)',
               backdropFilter: 'blur(10px)',
               position: 'relative',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 borderRadius: '20px',
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                 zIndex: -1
               }
             }}>
               💰
             </Box>
             <Box sx={{ flex: 1 }}>
               <Typography variant="h4" sx={{ 
                 fontWeight: 800, 
                 mb: 1,
                 background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                 backgroundClip: 'text',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                 letterSpacing: '-0.02em'
               }}>
                 Cost Deliberation Details
               </Typography>
               <Typography variant="body1" sx={{ 
                 opacity: 0.95, 
                 fontSize: '1rem',
                 fontWeight: 500,
                 textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                 letterSpacing: '0.01em'
               }}>
                 View and manage cost deliberation for this request
               </Typography>
             </Box>
           </Box>
         </DialogTitle>
         <DialogContent sx={{ pt: 5, px: 5, pb: 3, position: 'relative', zIndex: 1 }}>
           {selectedCostDeliberationRequest && (
             <>
               <Box sx={{ 
                 mb: 5, 
                 p: 4, 
                 borderRadius: '20px', 
                 background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
                 border: '1px solid rgba(37, 99, 235, 0.08)',
                 position: 'relative',
                 overflow: 'hidden',
                 boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                 '&::before': {
                   content: '""',
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   width: '6px',
                   height: '100%',
                   background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                   borderRadius: '0 6px 6px 0',
                   boxShadow: '2px 0 8px rgba(59, 130, 246, 0.3)'
                 },
                 '&::after': {
                   content: '""',
                   position: 'absolute',
                   top: 0,
                   right: 0,
                   width: '100px',
                   height: '100px',
                   background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                   borderRadius: '50%',
                   transform: 'translate(30px, -30px)'
                 }
               }}>
                 <Typography variant="h5" gutterBottom sx={{ 
                   fontWeight: 700, 
                   color: '#0f172a',
                   mb: 3,
                   letterSpacing: '-0.01em',
                   textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                 }}>
                   {selectedCostDeliberationRequest.requestTitle}
                 </Typography>
                 
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 2,
                     p: 2,
                     borderRadius: '12px',
                     background: 'rgba(255,255,255,0.6)',
                     border: '1px solid rgba(37, 99, 235, 0.05)',
                     transition: 'all 0.2s ease',
                     '&:hover': {
                       background: 'rgba(255,255,255,0.8)',
                       transform: 'translateX(4px)',
                       boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                     }
                   }}>
                     <Box sx={{ 
                       width: 12, 
                       height: 12, 
                       borderRadius: '50%', 
                       background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                       boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                       flexShrink: 0
                     }} />
                     <Typography variant="body1" sx={{ 
                       color: '#334155',
              fontWeight: 600,
                       fontSize: '1rem'
                     }}>
                       <span style={{ color: '#64748b', fontWeight: 500 }}>Vehicle:</span> {selectedCostDeliberationRequest.vehicleInfo}
                     </Typography>
                   </Box>
                   
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 2,
                     p: 2,
                     borderRadius: '12px',
                     background: 'rgba(255,255,255,0.6)',
                     border: '1px solid rgba(37, 99, 235, 0.05)',
                     transition: 'all 0.2s ease',
              '&:hover': {
                       background: 'rgba(255,255,255,0.8)',
                       transform: 'translateX(4px)',
                       boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                     }
                   }}>
                     <Box sx={{ 
                       width: 12, 
                       height: 12, 
                       borderRadius: '50%', 
                       background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                       boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                       flexShrink: 0
                     }} />
                     <Typography variant="body1" sx={{ 
                       color: '#334155',
                       fontWeight: 600,
                       fontSize: '1rem'
                     }}>
                       <span style={{ color: '#64748b', fontWeight: 500 }}>Requested by:</span> {selectedCostDeliberationRequest.requestedBy}
                     </Typography>
                   </Box>
                   
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 2,
                     p: 2,
                     borderRadius: '12px',
                     background: 'rgba(255,255,255,0.6)',
                     border: '1px solid rgba(37, 99, 235, 0.05)',
                     transition: 'all 0.2s ease',
                     '&:hover': {
                       background: 'rgba(255,255,255,0.8)',
                       transform: 'translateX(4px)',
                       boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                     }
                   }}>
                     <Box sx={{ 
                       width: 12, 
                       height: 12, 
                       borderRadius: '50%', 
                       background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                       boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                       flexShrink: 0
                     }} />
                     <Typography variant="body1" sx={{ 
                       color: '#334155',
                       fontWeight: 600,
                       fontSize: '1rem'
                     }}>
                       <span style={{ color: '#64748b', fontWeight: 500 }}>Selected on:</span> {new Date(selectedCostDeliberationRequest.selectedDate).toLocaleDateString()}
                     </Typography>
                   </Box>
                   
                   {selectedCostDeliberationRequest.proposedCost && (
                     <Box sx={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: 2,
                       p: 2,
                       borderRadius: '12px',
                       background: 'rgba(255,255,255,0.6)',
                       border: '1px solid rgba(37, 99, 235, 0.05)',
                       transition: 'all 0.2s ease',
                       '&:hover': {
                         background: 'rgba(255,255,255,0.8)',
                         transform: 'translateX(4px)',
                         boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                       }
                     }}>
                       <Box sx={{ 
                         width: 12, 
                         height: 12, 
                         borderRadius: '50%', 
                         background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                         boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                         flexShrink: 0
                       }} />
                       <Typography variant="body1" sx={{ 
                         color: '#334155',
                         fontWeight: 600,
                         fontSize: '1rem'
                       }}>
                         <span style={{ color: '#64748b', fontWeight: 500 }}>Proposed Cost:</span> ${selectedCostDeliberationRequest.proposedCost?.toFixed(2)}
                       </Typography>
                     </Box>
                   )}
                   
                   {selectedCostDeliberationRequest.negotiatedCost && (
                     <Box sx={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: 2,
                       p: 2,
                       borderRadius: '12px',
                       background: 'rgba(255,255,255,0.6)',
                       border: '1px solid rgba(37, 99, 235, 0.05)',
                       transition: 'all 0.2s ease',
                       '&:hover': {
                         background: 'rgba(255,255,255,0.8)',
                         transform: 'translateX(4px)',
                         boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                       }
                     }}>
                       <Box sx={{ 
                         width: 12, 
                         height: 12, 
                         borderRadius: '50%', 
                         background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                         boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                         flexShrink: 0
                       }} />
                       <Typography variant="body1" sx={{ 
                         color: '#334155',
                         fontWeight: 600,
                         fontSize: '1rem'
                       }}>
                         <span style={{ color: '#64748b', fontWeight: 500 }}>Negotiated Cost:</span> ${selectedCostDeliberationRequest.negotiatedCost?.toFixed(2)}
                       </Typography>
                     </Box>
                   )}
                   
                   {selectedCostDeliberationRequest.currentNegotiationRound > 0 && (
                     <Box sx={{ 
                       p: 3,
                       borderRadius: '12px',
                       background: 'rgba(255,255,255,0.6)',
                       border: '1px solid rgba(37, 99, 235, 0.05)',
                       transition: 'all 0.2s ease',
                       '&:hover': {
                         background: 'rgba(255,255,255,0.8)',
                         transform: 'translateX(4px)',
                         boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                       }
                     }}>
                       <Typography variant="body1" sx={{ 
                         color: '#334155',
                         fontWeight: 600,
                         fontSize: '1rem',
                         mb: 2,
                         display: 'flex',
                         alignItems: 'center',
                         gap: 2
                       }}>
                         <Box sx={{ 
                           width: 12, 
                           height: 12, 
                           borderRadius: '50%', 
                           background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                           boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                           flexShrink: 0
                         }} />
                         <span style={{ color: '#64748b', fontWeight: 500 }}>Negotiation Round:</span> {selectedCostDeliberationRequest.currentNegotiationRound}
                       </Typography>
                       <Box sx={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: 1,
                         flexWrap: 'wrap',
                         ml: 4
                       }}>
                         {Array.from({ length: Math.min(selectedCostDeliberationRequest.currentNegotiationRound, 5) }, (_, i) => (
                           <Box
                             key={i}
                             sx={{
                               width: 12,
                               height: 12,
                               borderRadius: '50%',
                               background: i === selectedCostDeliberationRequest.currentNegotiationRound - 1 
                                 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                                 : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                               border: i === selectedCostDeliberationRequest.currentNegotiationRound - 1 ? '2px solid' : 'none',
                               borderColor: '#d97706',
                               boxShadow: i === selectedCostDeliberationRequest.currentNegotiationRound - 1 
                                 ? '0 2px 8px rgba(245, 158, 11, 0.4)' 
                                 : '0 1px 4px rgba(0,0,0,0.1)',
                               transition: 'all 0.2s ease'
                             }}
                           />
                         ))}
                         {selectedCostDeliberationRequest.currentNegotiationRound > 5 && (
                           <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontWeight: 600 }}>
                             +{selectedCostDeliberationRequest.currentNegotiationRound - 5} more
                           </Typography>
                         )}
                       </Box>
                     </Box>
                   )}
                   
                   {selectedCostDeliberationRequest.comments && (
                     <Box sx={{ 
                       p: 3,
                       borderRadius: '12px',
                       background: 'rgba(255,255,255,0.6)',
                       border: '1px solid rgba(37, 99, 235, 0.05)',
                       borderLeft: '4px solid #3b82f6',
                       transition: 'all 0.2s ease',
                       '&:hover': {
                         background: 'rgba(255,255,255,0.8)',
                         transform: 'translateX(4px)',
                         boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                       }
                     }}>
                       <Typography variant="body1" sx={{ 
                         color: '#334155',
                         fontWeight: 500,
                         fontSize: '1rem',
                         fontStyle: 'italic',
                         lineHeight: 1.6
                       }}>
                         "{selectedCostDeliberationRequest.comments}"
                       </Typography>
                     </Box>
                   )}
                 </Box>
               </Box>

               {/* Action Buttons */}
               <Box sx={{ 
                 display: 'flex', 
                 gap: 3, 
                 flexWrap: 'wrap',
                 p: 4,
                 borderRadius: '20px',
                 background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                 border: '1px solid rgba(37, 99, 235, 0.08)',
                 boxShadow: '0 4px 16px rgba(37, 99, 235, 0.06)'
               }}>
                 {(() => {
                   const getStatusInfo = () => {
                     if (selectedCostDeliberationRequest.status === 'MechanicsSelected') {
                       return { label: 'Proposal Required', color: 'warning', action: 'propose' };
                     } else if (selectedCostDeliberationRequest.status === 'Proposed') {
                       return { label: 'Proposed', color: 'info', action: 'both' };
                     } else if (selectedCostDeliberationRequest.status === 'Negotiating') {
                       return { label: 'Negotiating', color: 'warning', action: 'both' };
                     } else if (selectedCostDeliberationRequest.status === 'Agreed') {
                       return { label: 'Agreed', color: 'success', action: 'none' };
                     } else {
                       return { label: 'Pending', color: 'default', action: 'none' };
                     }
                   };

                   const statusInfo = getStatusInfo();
                   const hasProposedCost = selectedCostDeliberationRequest.proposedCost && selectedCostDeliberationRequest.proposedCost > 0;
                   const hasNegotiatedCost = selectedCostDeliberationRequest.negotiatedCost && selectedCostDeliberationRequest.negotiatedCost > 0;
                   const currentCost = hasNegotiatedCost ? selectedCostDeliberationRequest.negotiatedCost : (hasProposedCost ? selectedCostDeliberationRequest.proposedCost : null);
                   const wasLastNegotiatedByCurrentUser = selectedCostDeliberationRequest.lastNegotiatedByUserId === userId;
                   const canNegotiate = statusInfo.action === 'both' && currentCost && !wasLastNegotiatedByCurrentUser;

                   return (
                     <>
                       {statusInfo.action === 'propose' && (
                         <Button
                           variant="contained"
                           onClick={() => {
                             setSelectedCostRequest(selectedCostDeliberationRequest);
                             setOpenCostProposalDialog(true);
                             setCostDeliberationDetailOpen(false);
                           }}
                           sx={{ 
                             borderRadius: '16px',
                             textTransform: 'none',
                             fontWeight: 800,
                             fontSize: '1rem',
                             px: 4,
                             py: 2,
                             background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                             color: 'white',
                             boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4), 0 4px 16px rgba(37, 99, 235, 0.2)',
                             position: 'relative',
                             overflow: 'hidden',
                             '&::before': {
                               content: '""',
                               position: 'absolute',
                               top: 0,
                               left: '-100%',
                               width: '100%',
                               height: '100%',
                               background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                               transition: 'left 0.6s ease'
                             },
                             '&:hover': {
                               background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                               boxShadow: '0 12px 40px rgba(37, 99, 235, 0.5), 0 6px 20px rgba(37, 99, 235, 0.3)',
                               transform: 'translateY(-3px) scale(1.02)',
                               '&::before': {
                                 left: '100%'
                               }
                             },
                             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                           }}
                         >
                           💰 Propose Cost
                         </Button>
                       )}
                       
                       {canNegotiate && (
                         <>
                           <Button
                             variant="outlined"
                             onClick={() => {
                               setSelectedCostRequest(selectedCostDeliberationRequest);
                               setCostNegotiationForm({ 
                                 negotiatedCost: currentCost.toString(), 
                                 comments: '' 
                               });
                               setOpenCostNegotiationDialog(true);
                               setCostDeliberationDetailOpen(false);
                             }}
                             sx={{ 
                               borderRadius: '16px',
                               textTransform: 'none',
                               fontWeight: 700,
                               fontSize: '1rem',
                               px: 4,
                               py: 2,
                               borderColor: '#f59e0b',
                               color: '#f59e0b',
                               border: '2px solid #f59e0b',
                               background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                               boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)',
                               '&:hover': {
                                 borderColor: '#d97706',
                                 backgroundColor: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                 transform: 'translateY(-2px)',
                                 boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
                               },
                               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                             }}
                           >
                             💬 Negotiate
                           </Button>
                           <Button
                             variant="outlined"
                             onClick={() => {
                               setSelectedCostRequest(selectedCostDeliberationRequest);
                               setCostAcceptanceForm({ comments: '' });
                               setOpenCostAcceptanceDialog(true);
                               setCostDeliberationDetailOpen(false);
                             }}
                             sx={{ 
                               borderRadius: '16px',
                               textTransform: 'none',
                               fontWeight: 700,
                               fontSize: '1rem',
                               px: 4,
                               py: 2,
                               borderColor: '#22c55e',
                               color: '#22c55e',
                               border: '2px solid #22c55e',
                               background: 'linear-gradient(135deg, #ffffff 0%, #dcfce7 100%)',
                               boxShadow: '0 4px 16px rgba(34, 197, 94, 0.2)',
                               '&:hover': {
                                 borderColor: '#16a34a',
                                 backgroundColor: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                 transform: 'translateY(-2px)',
                                 boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                               },
                               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                             }}
                           >
                             ✅ Accept
                           </Button>
                         </>
                       )}

                       <Button
                         variant="outlined"
                         onClick={async () => {
                           try {
                             const response = await api.get(`/api/MaintenanceRequest/${selectedCostDeliberationRequest.maintenanceRequestId}/cost-deliberation/history`);
                             setNegotiationHistory(response.data.history);
                             setHistoryModalOpen(true);
                           } catch (error) {
                             showAlert('Failed to fetch negotiation history', 'danger');
                           }
                         }}
                         sx={{ 
                           borderRadius: '16px',
                           textTransform: 'none',
                           fontWeight: 700,
                           fontSize: '1rem',
                           px: 4,
                           py: 2,
                           borderColor: 'rgba(37, 99, 235, 0.3)',
                           color: '#2563eb',
                           border: '2px solid rgba(37, 99, 235, 0.3)',
                           background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                           boxShadow: '0 4px 16px rgba(37, 99, 235, 0.1)',
                           '&:hover': {
                             borderColor: '#2563eb',
                             backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                             transform: 'translateY(-2px)',
                             boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
                           },
                           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}
                       >
                         📊 View History
                       </Button>
                     </>
                   );
                 })()}
               </Box>
             </>
           )}
         </DialogContent>
         <DialogActions sx={{ 
           p: 5, 
           pt: 3, 
           background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
           borderTop: '1px solid rgba(37, 99, 235, 0.08)',
           position: 'relative',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: '50%',
             transform: 'translateX(-50%)',
             width: '60px',
             height: '4px',
             background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
             borderRadius: '0 0 4px 4px',
             opacity: 0.6
           }
         }}>
           <Button
             onClick={() => setCostDeliberationDetailOpen(false)}
             variant="outlined"
             sx={{ 
               color: '#64748b',
               borderColor: 'rgba(100, 116, 139, 0.2)',
               fontWeight: 700,
               borderRadius: '16px',
               px: 4,
               py: 2,
               textTransform: 'none',
               fontSize: '1rem',
               background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
               boxShadow: '0 4px 16px rgba(100, 116, 139, 0.1)',
               border: '2px solid rgba(100, 116, 139, 0.15)',
               position: 'relative',
               overflow: 'hidden',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.02) 0%, rgba(100, 116, 139, 0.05) 100%)',
                 opacity: 0,
                 transition: 'opacity 0.3s ease'
               },
               '&:hover': {
                 borderColor: '#64748b',
                 backgroundColor: 'transparent',
                 transform: 'translateY(-3px)',
                 boxShadow: '0 8px 24px rgba(100, 116, 139, 0.2)',
                 '&::before': {
                   opacity: 1
                 }
               },
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
             }}
           >
             Close
           </Button>
         </DialogActions>
       </Dialog>

       {/* Negotiation History Modal */}
       <Dialog
         open={historyModalOpen}
         onClose={() => setHistoryModalOpen(false)}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: {
             borderRadius: '24px',
             boxShadow: '0 32px 80px rgba(37, 99, 235, 0.25), 0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
             border: 'none',
             overflow: 'hidden',
             position: 'relative',
             background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
             backdropFilter: 'blur(20px)',
             '&::before': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               bottom: 0,
               background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.03) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(147, 197, 253, 0.02) 100%)',
               zIndex: 0
             },
             '&::after': {
               content: '""',
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: '6px',
               background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 25%, #93c5fd 50%, #60a5fa 75%, #3b82f6 100%)',
               backgroundSize: '200% 100%',
               animation: 'shimmer 3s ease-in-out infinite',
               zIndex: 1
             }
           }
         }}
         BackdropProps={{
           sx: {
             background: 'rgba(15, 23, 42, 0.6)',
             backdropFilter: 'blur(12px) saturate(180%)',
             animation: 'fadeIn 0.3s ease-out'
           }
         }}
         sx={{
           '& .MuiDialog-paper': {
             animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
           }
         }}
       >
         <DialogTitle sx={{
           background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
           color: 'white',
           fontWeight: 800,
           fontSize: '1.5rem',
           py: 4,
           px: 5,
           position: 'relative',
           overflow: 'hidden',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             bottom: 0,
             background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
             zIndex: 0
           },
           '&::after': {
             content: '""',
             position: 'absolute',
             bottom: 0,
             left: 0,
             right: 0,
             height: '2px',
             background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 80%, transparent 100%)',
             zIndex: 1
           }
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
             <Box sx={{
               width: 56,
               height: 56,
               borderRadius: '20px',
               background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '1.8rem',
               boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
               border: '1px solid rgba(255,255,255,0.2)',
               backdropFilter: 'blur(10px)',
               position: 'relative',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 borderRadius: '20px',
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                 zIndex: -1
               }
             }}>
               📊
             </Box>
             <Box sx={{ flex: 1 }}>
               <Typography variant="h4" sx={{ 
                 fontWeight: 800, 
                 mb: 1,
                 background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                 backgroundClip: 'text',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                 letterSpacing: '-0.02em'
               }}>
                 Negotiation History
               </Typography>
               <Typography variant="body1" sx={{ 
                 opacity: 0.95, 
                 fontSize: '1rem',
                 fontWeight: 500,
                 textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                 letterSpacing: '0.01em'
               }}>
                 Complete timeline of cost negotiations
               </Typography>
             </Box>
           </Box>
         </DialogTitle>
         <DialogContent sx={{ pt: 5, px: 5, pb: 3, position: 'relative', zIndex: 1 }}>
           {negotiationHistory.length === 0 ? (
             <Box sx={{
               textAlign: 'center',
               py: 8,
               px: 4,
               borderRadius: '20px',
               background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
               border: '2px dashed rgba(37, 99, 235, 0.2)'
             }}>
               <Box sx={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 width: 80,
                 height: 80,
                 borderRadius: '50%',
                 background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                 margin: '0 auto 24px',
                 color: '#2563eb'
               }}>
                 <Typography sx={{ fontSize: '2.5rem' }}>📊</Typography>
               </Box>
               <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>
                 No Negotiation History
               </Typography>
               <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '400px', margin: '0 auto' }}>
                 This request hasn't had any negotiations yet. History will appear here once negotiations begin.
               </Typography>
             </Box>
           ) : (
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
               {negotiationHistory.map((entry, index) => (
                 <Box
                   key={index}
                   sx={{
                     p: 4,
                     borderRadius: '20px',
                     background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
                     border: '1px solid rgba(37, 99, 235, 0.08)',
                     position: 'relative',
                     overflow: 'hidden',
                     boxShadow: '0 8px 32px rgba(37, 99, 235, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       width: '6px',
                       height: '100%',
                       background: index === 0 
                         ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                         : 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)',
                       borderRadius: '0 6px 6px 0',
                       boxShadow: index === 0 
                         ? '2px 0 8px rgba(245, 158, 11, 0.3)'
                         : '2px 0 8px rgba(59, 130, 246, 0.3)'
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       right: 0,
                       width: '100px',
                       height: '100px',
                       background: index === 0 
                         ? 'radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)'
                         : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                       borderRadius: '50%',
                       transform: 'translate(30px, -30px)'
                     }
                   }}
                 >
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                     <Box sx={{
                       width: 48,
                       height: 48,
                       borderRadius: '16px',
                       background: index === 0 
                         ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                         : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '1.5rem',
                       color: 'white',
                       boxShadow: index === 0 
                         ? '0 8px 24px rgba(245, 158, 11, 0.3)'
                         : '0 8px 24px rgba(59, 130, 246, 0.3)',
                       fontWeight: 800
                     }}>
                       {entry.sequenceNumber}
                     </Box>
                     <Box sx={{ flex: 1 }}>
                       <Typography variant="h6" sx={{ 
                         fontWeight: 700, 
                         color: '#0f172a',
                         mb: 1,
                         letterSpacing: '-0.01em'
                       }}>
                         Round {entry.sequenceNumber} - {entry.negotiationType}
                       </Typography>
                       <Typography variant="body2" sx={{ 
                         color: '#64748b',
                         fontWeight: 500
                       }}>
                         Negotiated by {entry.negotiatedBy}
                       </Typography>
                     </Box>
                   </Box>
                   
                   <Box sx={{ 
                     p: 3,
                     borderRadius: '12px',
                     background: 'rgba(255,255,255,0.6)',
                     border: '1px solid rgba(37, 99, 235, 0.05)',
                     mb: 2
                   }}>
                     <Typography variant="h5" sx={{ 
                       fontWeight: 800,
                       color: index === 0 ? '#d97706' : '#2563eb',
                       textAlign: 'center',
                       mb: 1
                     }}>
                       ${entry.negotiatedAmount?.toFixed(2)}
                     </Typography>
                     <Typography variant="body2" sx={{ 
                       color: '#64748b',
                       textAlign: 'center',
                       fontWeight: 600
                     }}>
                       Negotiated Amount
                     </Typography>
                   </Box>
                   
                   {entry.comments && (
                     <Box sx={{ 
                       p: 3,
                       borderRadius: '12px',
                       background: 'rgba(255,255,255,0.6)',
                       border: '1px solid rgba(37, 99, 235, 0.05)',
                       borderLeft: '4px solid #3b82f6'
                     }}>
                       <Typography variant="body1" sx={{ 
                         color: '#334155',
                         fontWeight: 500,
                         fontSize: '1rem',
                         fontStyle: 'italic',
                         lineHeight: 1.6
                       }}>
                         "{entry.comments}"
                       </Typography>
                     </Box>
                   )}
                 </Box>
               ))}
             </Box>
           )}
         </DialogContent>
         <DialogActions sx={{ 
           p: 5, 
           pt: 3, 
           background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
           borderTop: '1px solid rgba(37, 99, 235, 0.08)',
           position: 'relative',
           '&::before': {
             content: '""',
             position: 'absolute',
             top: 0,
             left: '50%',
             transform: 'translateX(-50%)',
             width: '60px',
             height: '4px',
             background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
             borderRadius: '0 0 4px 4px',
             opacity: 0.6
           }
         }}>
           <Button
             onClick={() => setHistoryModalOpen(false)}
             variant="outlined"
             sx={{ 
               color: '#64748b',
               borderColor: 'rgba(100, 116, 139, 0.2)',
               fontWeight: 700,
               borderRadius: '16px',
               px: 4,
               py: 2,
               textTransform: 'none',
               fontSize: '1rem',
               background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
               boxShadow: '0 4px 16px rgba(100, 116, 139, 0.1)',
               border: '2px solid rgba(100, 116, 139, 0.15)',
               position: 'relative',
               overflow: 'hidden',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.02) 0%, rgba(100, 116, 139, 0.05) 100%)',
                 opacity: 0,
                 transition: 'opacity 0.3s ease'
               },
               '&:hover': {
                 borderColor: '#64748b',
                 backgroundColor: 'transparent',
                 transform: 'translateY(-3px)',
                 boxShadow: '0 8px 24px rgba(100, 116, 139, 0.2)',
                 '&::before': {
                   opacity: 1
                 }
               },
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
             }}
           >
             Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Mechanic;
