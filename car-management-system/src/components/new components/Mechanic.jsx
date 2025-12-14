import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import './MaintenanceDashboard.css';
import { useOptimizedState, useApiState, useDebounce } from '../../hooks/useOptimizedState';
import { usePerformanceMonitor, useMemoryLeakDetector } from '../../hooks/usePerformanceMonitor';
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, Button, Typography, Paper, TextField, Select, MenuItem, InputLabel, FormControl, Grid, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, alpha, useTheme, styled
} from '@mui/material';
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Pending as PendingIcon,
  DirectionsCar as DirectionsCarIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  MonetizationOn as MonetizationOnIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  LocalOffer as LocalOfferIcon,
  Chat as ChatIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Search, Hourglass } from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StandardDatePicker from '../shared/StandardDatePicker';
import StandardDateTimePicker from '../shared/StandardDateTimePicker';
import { px } from 'framer-motion';

// Styled Paper component for cards
const StyledPaper = styled(Paper)(({ theme }) => ({
  transition: 'all 0.2s ease',
  cursor: 'default',
  borderRadius: 12,
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#ffffff',
  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 24px rgba(0,0,0,0.08)'
  }
}));

const Mechanic = ({ sidebarExpanded = true }) => {
  const { userId, hasRole, isAuthenticated } = useAuth();
  const theme = useTheme();
  
  // Debug logging
  console.log('🔑 Mechanic Component - Auth State:', { userId, isAuthenticated });
  
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
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [costDeliberationLoading, setCostDeliberationLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
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
  const [openInvoiceDialog, setOpenInvoiceDialog] = useOptimizedState(false);
  const [invoiceData, setInvoiceData] = useOptimizedState({
    laborHours: 0,
    totalCost: 0,
    partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
  }, { deepCompare: true });

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
const GhanaianLicensePlate = ({ licensePlate, plate }) => {
  // Parse the license plate for region, number, and suffix
  let region = '', number = '', suffix = '';
  const plateData = licensePlate || plate;
  
  if (plateData) {
    // Extract license plate from vehicleInfo format: "Vehicle Name (License Plate)"
    let plateText = plateData;
    const match = plateData.match(/\(([^)]+)\)/);
    if (match) {
      plateText = match[1]; // Extract just the license plate from parentheses
    }
    
    const parts = plateText.split(' ');
    region = parts[0] || '';
    number = parts[1] || '';
    suffix = parts[2] || '';
  }

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 350,
      height: 74,
      background: 'linear-gradient(135deg, #ddd7d74d 70%, #e9e9e93a 100%)',
      border: '3px solid #222',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      position: 'relative',
      px: 2.5,
      py: 1.5,
      mb: 2,
      fontFamily: 'Impact, Arial Black, Arial, sans-serif',
      overflow: 'hidden',
      letterSpacing: 2,
    }}>
      {/* Plate Text */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, zIndex: 3 }}>
        <Typography variant="h5" sx={{
          fontWeight: 600,
          color: '#181818',
          fontSize: 34,
          lineHeight: 1,
          mr: 1.5,
          textShadow: '0 1px 0 #fff, 0 2px 2px #bbb',
        }}>{region}</Typography>
        <Typography variant="h5" sx={{
          fontWeight: 600,
          color: '#181818',
          fontSize: 34,
          lineHeight: 1,
          mr: 1.5,
          textShadow: '0 1px 0 #fff, 0 2px 2px #bbb',
        }}>{number}</Typography>
        <Typography variant="h5" sx={{
          fontWeight: 900,
          color: '#181818',
          fontSize: 34,
          lineHeight: 1,
        }}>{suffix}</Typography>
      </Box>
      {/* Ghana flag and GH at top right */}
      <Box sx={{ position: 'absolute', top: 7, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
          alt="Ghana Flag"
          style={{ width: 32, height: 20, border: '1px solid #222', borderRadius: 2, marginBottom: 1 }}
        />
      </Box>
      {/* GH at bottom right */}
      <Typography variant="caption" sx={{
        position: 'absolute',
        bottom: 7,
        right: 20,
        fontWeight: 700,
        color: '#181818',
        fontSize: 13,
        letterSpacing: 1,
        zIndex: 3
      }}>GH</Typography>

    </Box>
  );
};
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
    if (!userId) {
      console.error('❌ No userId available for fetching schedules');
      setSchedulesLoading(false);
      setSchedules([]);
      return;
    }
    
    setSchedulesLoading(true);
    
    try {
      console.log('📋 Fetching schedules for user:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000)
      );
      
      const apiPromise = api.get(`/api/MaintenanceRequest/user/${userId}/schedules`);
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      console.log('✅ Schedules fetched:', response.data?.length, 'schedules');
      setSchedules(response.data || []);
    } catch (error) {
      console.error('❌ Error fetching schedules:', error);
      console.error('❌ Full error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      showAlert('Failed to fetch your schedules. ' + (error.response?.data || error.message), 'danger');
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  }, [userId]);

  const fetchCostDeliberationRequests = useCallback(async () => {
    if (!userId) {
      console.error('❌ No userId available for cost deliberation requests');
      return;
    }

    try {
      console.log('🔧 Fetching cost deliberation requests for user:', userId);
      setCostDeliberationLoading(true);
      
      // Add timeout to prevent hanging - reduced to 10 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );
      
      const apiPromise = api.get(`/api/MaintenanceRequest/cost-deliberation-requests/${userId}`);
      
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      console.log('✅ Cost deliberation requests response:', response);
      console.log('📊 Cost deliberation requests data:', response.data);
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
      
      // Don't show alert for timeout/404 - just log it
      if (error.message.includes('timeout')) {
        console.warn('⚠️ Cost deliberation request timed out - continuing without it');
      } else if (error.response?.status === 404) {
        console.log('ℹ️ No cost deliberation endpoint available');
      } else if (error.response?.status === 401) {
        showAlert('Authentication failed. Please log in again.', 'error');
      } else if (error.response?.status !== 404) {
        console.warn('⚠️ Cost deliberation fetch failed:', error.message);
      }
      
      // Set empty array on error to show "no requests" state
      setCostDeliberationRequests([]);
    } finally {
      setCostDeliberationLoading(false);
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
    
    // SAFETY MECHANISM: Force loading to stop after 5 seconds no matter what
    const safetyTimeout = setTimeout(() => {
      console.error('🚨 SAFETY TIMEOUT: Forcing loading states to false after 5 seconds');
      setSchedulesLoading(prev => {
        console.log('📍 Setting schedulesLoading from', prev, 'to false');
        return false;
      });
      setCostDeliberationLoading(prev => {
        console.log('📍 Setting costDeliberationLoading from', prev, 'to false');
        return false;
      });
    }, 5000);
    
    const loadData = async () => {
      if (!isMounted) {
        console.warn('⚠️ Component not mounted, skipping data load');
        clearTimeout(safetyTimeout);
        return;
      }
      
      if (!isAuthenticated) {
        console.warn('⚠️ User not authenticated, skipping data load');
        setSchedulesLoading(false);
        setCostDeliberationLoading(false);
        clearTimeout(safetyTimeout);
        return;
      }
      
      if (!userId) {
        console.warn('⚠️ userId missing, waiting for auth to complete...');
        setSchedulesLoading(false);
        setCostDeliberationLoading(false);
        clearTimeout(safetyTimeout);
        return;
      }
      
      console.log('🚀 Starting data load for userId:', userId);
      
      // Load schedules first (critical data)
      fetchUserSchedules();
      
      // Load cost deliberation in background (non-critical)
      // Don't wait for it to finish
      fetchCostDeliberationRequests().catch(err => {
        console.warn('Cost deliberation load failed silently:', err);
      });
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [isAuthenticated, userId, fetchUserSchedules, fetchCostDeliberationRequests]);

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
      // Prepare payload with proper property names to match backend DTO
      const payload = {
        Invoice: {
          LaborHours: parseFloat(invoiceData.laborHours),
          TotalCost: parseFloat(invoiceData.totalCost),
          PartsUsed: invoiceData.partsUsed
            .filter(part => part.partName.trim() !== '')
            .map(part => ({
              PartName: part.partName,
              Quantity: part.quantity,
              UnitPrice: parseFloat(part.unitPrice)
            }))
        }
      };

      await api.post(
        `/api/MaintenanceRequest/${selectedSchedule.id}/complete-with-invoice`,
        payload,
        { params: { user: userId } }
      );
      
      showAlert('Maintenance completed successfully', 'success');
      setOpenInvoiceDialog(false);
      setInvoiceData({
        laborHours: 0,
        totalCost: 0,
        partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
      });
      fetchUserSchedules();
      setViewMode('list');
    } catch (error) {
      console.error('Complete maintenance error:', error);
      showAlert(error.response?.data || 'Failed to complete maintenance', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePartChange = (index, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  const addPart = () => {
    setInvoiceData(prev => ({
      ...prev,
      partsUsed: [...prev.partsUsed, { partName: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removePart = (index) => {
    setInvoiceData(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter((_, i) => i !== index)
    }));
  };

  const openCompleteDialog = (schedule) => {
    setSelectedSchedule(schedule);
    setOpenInvoiceDialog(true);
  };

  const closeInvoiceDialog = () => {
    setOpenInvoiceDialog(false);
    setInvoiceData({
      laborHours: 0,
      totalCost: 0,
      partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
    });
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

  // DEBUG: Log state before render
  console.log('🎨 RENDER STATE:', { 
    schedulesLoading, 
    viewMode, 
    schedulesCount: schedules.length,
    isAuthenticated 
  });

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
        flex: { xs: 'unset', lg: 3 },
        maxHeight: "80vh",
        minWidth: 0,
        width: { xs: '90%', lg: '70%' },
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
          {!isAuthenticated && !schedulesLoading && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 3,
              mb: 3,
              gap: 2,
              p: 4
            }}>
              <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 600 }}>
                Please log in to view your schedules
              </Typography>
            </Box>
          )}
          {schedulesLoading && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                mb: 3,
                gap: 2
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  border: '4px solid rgba(37, 99, 235, 0.1)',
                  borderTop: '4px solid #2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} />
                <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Loading your schedules...
                </Typography>
              </Box>
            )}
            {!schedulesLoading && viewMode === 'list' && (
            <>
                <Box sx={{
                  width: '100%',
                   mb: 2,
                   px: { xs: 0, sm: 1 },
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
                     background: '#ffffff',
                     borderRadius: 2,
                     boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                     border: '1px solid #e2e8f0',
                     p: { xs: 2, md: 2.5 },
                    mb: 1,
                     gap: { xs: 1, sm: 1.5 },
                     position: 'relative',
                     overflow: 'hidden'
                   }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <Search fontSize={18} />
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Search by vehicle, mechanic, status..."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                        InputProps={{
                          disableUnderline: true,
                          sx: {
                            fontSize: 14,
                            pl: 0.5,
                            background: 'transparent'
                          }
                        }}
                        sx={{
                          flex: 1,
                          fontWeight: 400,
                          fontSize: 14,
                          background: 'transparent'
                        }}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Hourglass/>}
                       endIcon={<span style={{ fontSize: 12 }}>{filtersOpen ? '▲' : '▼'}</span>}
                      onClick={() => setFiltersOpen(f => !f)}
                       sx={{ 
                         fontWeight: 500, 
                         borderRadius: 2, 
                         px: 2, 
                         py: 1, 
                         fontSize: 13,
                         minWidth: 'auto',
                         background: '#ffffff',
                         border: '1px solid #d1d5db',
                         color: '#374151',
                         '&:hover': {
                           background: '#f3f4f6',
                           borderColor: '#9ca3af'
                         },
                         transition: 'all 0.2s ease'
                       }}
                    >
                      Filters
                    </Button>
                  </Box>
                  <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
                    <Box sx={{
                      width: '100%',
                      maxWidth: 1200,
                      background: '#f8fafc',
                      borderRadius: 2,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      p: 2,
                      mt: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1.5,
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
                     overflow: 'hidden'
                   }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, mb: { xs: 2, md: 3 } }}>
                   
                      <Typography variant="h5" fontWeight={600} sx={{
                        color: '#1e293b',
                        background: 'black',
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
                              alignItems="center"
                              selected={selectedSchedule && selectedSchedule.id === schedule.id}
                              onClick={() => { setSelectedSchedule(schedule); fetchProgressUpdates(schedule.maintenanceRequestId); }}
                              sx={{
                              mb: 1.5,
                              borderRadius: 2,
                              boxShadow: selectedSchedule && selectedSchedule.id === schedule.id
                                ? '0 4px 12px rgba(37, 99, 235, 0.15)'
                                : '0 2px 8px rgba(0, 0, 0, 0.06)',
                              background: selectedSchedule && selectedSchedule.id === schedule.id
                                ? '#f8faff'
                                : '#ffffff',
                              border: selectedSchedule && selectedSchedule.id === schedule.id
                                ? '1px solid #3b82f6'
                                : '1px solid #e2e8f0',
                              '&:hover': {
                                background: '#f8faff',
                                cursor: 'pointer',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.12)',
                                borderColor: '#3b82f6'
                              },
                              minHeight: 80,
                                display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                                justifyContent: 'space-between',
                              transition: 'all 0.2s ease',
                              overflow: 'hidden',
                              p:2.5
                            }}
                          >
                            <ListItemAvatar sx={{ ml: 3,mr:2, minWidth: 'auto' }}>
                              <Avatar sx={{ 
                                width: 48, 
                                height: 48,
                                background: '#000000ff',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
                              }}>
                                <DirectionsCarIcon sx={{ fontSize: 24, color: 'white' }} />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                                  <Typography fontWeight={600} sx={{ fontSize: 16, color: '#1e293b' }}>
                                    {schedule.vehicleMake} {schedule.vehicleModel}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: 14, color: '#64748b' }}>
                                    {schedule.licensePlate}
                                  </Typography>
                                  <Chip
                                    label={schedule.status}
                                    color={schedule.status === 'Completed' ? 'success' : schedule.status === 'In Progress' ? 'info' : 'warning'}
                                    size="small"
                                    sx={{
                                      fontWeight: 500,
                                      fontSize: 11,
                                      height: 22,
                                      borderRadius: '4px'
                                    }}
                                  />
                                </Box>
                                }
                                secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                                    {format(new Date(schedule.scheduledDate), 'MMM dd, yyyy')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                                    {schedule.repairType}
                                  </Typography>
                                </Box>
                                }
                              />
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ 
                                fontWeight: 500, 
                                borderRadius: 1.5, 
                                px: 2.5, 
                                py: 1, 
                                textTransform: 'none', 
                                fontSize: 13,
                                mr:3,
                                borderColor: '#3b82f6',
                                color: '#3b82f6',
                                '&:hover': {
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  borderColor: '#3b82f6'
                                }
                              }}
                              onClick={e => { e.stopPropagation(); handleViewDetails(schedule); }}
                            >
                              View Details
                            </Button>
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

              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ 
                  color: '#1e293b',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text'
                }}>
                  Cost Deliberation Requests
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {filteredCostDeliberationRequests.length} request{filteredCostDeliberationRequests.length !== 1 ? 's' : ''} • Page {costDeliberationPage} of {totalCostDeliberationPages}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '300px' }}>
              <Search fontSize={16} sx={{ color: '#64748b' }} />
              <TextField
                variant="standard"
                placeholder="Search requests..."
                value={costDeliberationSearch}
                onChange={e => setCostDeliberationSearch(e.target.value)}
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { 
                    fontSize: 14, 
                    pl: 1, 
                    background: 'transparent' 
                  }
                }}
                sx={{ 
                  fontWeight: 400, 
                  fontSize: 14, 
                  background: 'transparent' 
                }}
              />
            </Box>
            </Box>
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
                   gap: 2,
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
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    p: 2.5,
                    position: 'relative',
                    overflow: 'hidden',
                    height: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      background: '#f8faff',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
                      borderColor: '#3b82f6'
                    },
                    transition: 'all 0.2s ease'
                  }}
                   >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Chip 
                            label={statusInfo.label} 
                            color={statusInfo.color} 
                            size="small" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: 11,
                              height: 20,
                              borderRadius: 1
                            }}
                          />
                        </Box>

                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: '#1e293b', fontSize: 15 }}>
                              {request.requestTitle}
                            </Typography>
                
                            <GhanaianLicensePlate plate={request.vehicleInfo} sx={{ mb:1,px:3 }} />
                          </Box>

                          {currentCost && (
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 1, 
                              background: '#f8faff',
                              border: '1px solid #e2e8f0'
                            }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, fontWeight: 500 }}>
                                Cost: ${currentCost?.toFixed(2)}
                              </Typography>
                            </Box>
                          )}
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
            backdropFilter: 'blur(20px)'
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
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 40%, #1f2937 100%)',
          color: 'white',
          fontWeight: 800,
          fontSize: '1.5rem',
          py: 1,
          px: 5,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
        
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                Propose Cost
              </Typography>

            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 5, px: 5, pb: 3, position: 'relative', zIndex: 1 }}>
          {selectedCostRequest && (
            <>
              {/* Request Title and License Plate */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#1e293b',
                  mb: 2,
                  fontSize: '1.1rem'
                }}>
                  {selectedCostRequest.requestTitle}
                </Typography>
                
                <GhanaianLicensePlate licensePlate={selectedCostRequest.vehicleInfo} />
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <StyledPaper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      width: '520px',
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
                      Request Overview
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2 ,gap: 9}}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DirectionsCarIcon sx={{ color: '#3b82f6', fontSize: '1.4rem' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Vehicle
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.primary' }}>
                            {selectedCostRequest.vehicleInfo}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PersonIcon sx={{ color: '#8b5cf6', fontSize: '1.4rem' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Requested By
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.primary' }}>
                            {selectedCostRequest.requestedBy}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>

                {/* Card 2: Proposed Cost */}
                <Grid item xs={12} md={6}>
                  <StyledPaper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      width: '520px',
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
                      Proposed Cost
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                      <MonetizationOnIcon sx={{ color: '#f59e0b', fontSize: '1.4rem' }} />
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="Enter your proposed cost"
                          type="number"
                          value={costProposalForm.proposedCost}
                          onChange={(e) => setCostProposalForm({ ...costProposalForm, proposedCost: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <Box sx={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.1rem', mr: 1 }}>
                                $
                              </Box>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(245, 158, 11, 0.05)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              '&:hover': {
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.08)'
                              },
                              '&.Mui-focused': {
                                borderColor: '#f59e0b',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)'
                              }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <StyledPaper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      width: '520px',
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
                      Additional Comments
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 2 }}>
                      <ChatIcon sx={{ color: '#6366f1', fontSize: '1.4rem', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="Explain your cost breakdown, parts needed, labor hours, etc..."
                          multiline
                          rows={4}
                          value={costProposalForm.comments}
                          onChange={(e) => setCostProposalForm({ ...costProposalForm, comments: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(99, 102, 241, 0.05)',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                              '&:hover': {
                                borderColor: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.08)'
                              },
                              '&.Mui-focused': {
                                borderColor: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)'
                              }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          pt: 1, 
          pb: 1,
          gap: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderTop: '1px solid rgba(37, 99, 235, 0.08)',
          position: 'relative',

        }}>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button
              onClick={() => setOpenCostProposalDialog(false)}
              variant="outlined"
              sx={{ 
                color: '#64748b',
                borderColor: 'rgba(100, 116, 139, 0.2)',
                fontWeight: 700,
                borderRadius: '12px',
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '2px solid rgba(100, 116, 139, 0.15)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#64748b',
                  backgroundColor: 'rgba(100, 116, 139, 0.05)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCostProposal}
              variant="contained"
              disabled={loading || !costProposalForm.proposedCost}
              sx={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #60a5fa 100%)',
                color: 'white',
                fontWeight: 800,
                borderRadius: '12px',
                px: 3.5,
                py: 1.35,
                textTransform: 'none',
                fontSize: '0.9rem',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
                border: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  transform: 'none',
                  boxShadow: '0 2px 8px rgba(148, 163, 184, 0.2)'
                }
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
                  Submitting...
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonetizationOnIcon sx={{ fontSize: '1rem' }} />
                  Submit Proposal
                </Box>
              )}
            </Button>
          </Box>
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
             backdropFilter: 'blur(20px)'
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
          background: 'linear-gradient(135deg, #0f172a 0%, #111827 40%, #1f2937 100%)',
           color: 'white',
           fontWeight: 800,
           fontSize: '1.5rem',
          py: 3,
           px: 5,
           position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                 Cost Deliberation Details
               </Typography>
            {selectedCostDeliberationRequest && (
              <Chip
                label={
                  selectedCostDeliberationRequest.status === 'MechanicsSelected' ? 'Awaiting Proposal' :
                  selectedCostDeliberationRequest.status === 'Proposed' ? 'Proposed' :
                  selectedCostDeliberationRequest.status === 'Negotiating' ? 'Negotiating' :
                  selectedCostDeliberationRequest.status === 'Agreed' ? 'Agreed' : 'Pending'
                }
                color={
                  selectedCostDeliberationRequest.status === 'Agreed' ? 'success' :
                  selectedCostDeliberationRequest.status === 'Negotiating' ? 'warning' :
                  selectedCostDeliberationRequest.status === 'Proposed' ? 'info' : 'default'
                }
                sx={{
                  fontWeight: 700,
                  px: 1.5,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
              />
            )}
           </Box>
         </DialogTitle>
         <DialogContent sx={{ pt: 5, px: 5, pb: 3, position: 'relative', zIndex: 1 }}>
           {selectedCostDeliberationRequest && (
             <>
              {/* Request Title Header */}
                 <Typography variant="h5" gutterBottom sx={{ 
                   fontWeight: 700, 
                   color: '#0f172a',
                   mb: 4,
                   letterSpacing: '-0.01em',
                   textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                 }}>
                   {selectedCostDeliberationRequest.requestTitle}
                 </Typography>
                 
              {/* Information Cards Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card 1: Request Overview */}
                <Grid item xs={12} md={6}>
                  <StyledPaper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      width: '390px',
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
                      Request Overview
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DirectionsCarIcon sx={{ color: '#3b82f6', fontSize: '1.4rem' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Vehicle
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.primary' }}>
                            {selectedCostDeliberationRequest.vehicleInfo}
                     </Typography>
                   </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PersonIcon sx={{ color: '#8b5cf6', fontSize: '1.4rem' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Requested By
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.primary' }}>
                            {selectedCostDeliberationRequest.requestedBy}
                     </Typography>
                   </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CalendarTodayIcon sx={{ color: '#10b981', fontSize: '1.4rem' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                            Selected On
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.primary' }}>
                            {new Date(selectedCostDeliberationRequest.selectedDate).toLocaleDateString()}
                     </Typography>
                   </Box>
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>



                {/* Card 4: Comments */}
                <Grid item xs={12} md={6}>
                  <StyledPaper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                       width: '400px',
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
                      Comments
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mt: 2 }}>
                      <ChatIcon sx={{ color: '#6366f1', fontSize: '1.4rem', mt: 0.5 }} />
                      <Box sx={{ flex: 1 }}>
                        {selectedCostDeliberationRequest.comments ? (
                          <Typography variant="body2" sx={{ 
                         fontWeight: 500,
                            color: 'text.primary',
                         fontStyle: 'italic',
                         lineHeight: 1.6
                       }}>
                         "{selectedCostDeliberationRequest.comments}"
                       </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            fontStyle: 'italic'
                          }}>
                            No comments available
                          </Typography>
                   )}
                 </Box>
               </Box>
                  </StyledPaper>
                </Grid>

                {/* Card 5: History (Clickable) */}
                <Grid item xs={12}>
                  <StyledPaper
                    elevation={0}
                    onClick={async () => {
                      try {
                        const response = await api.get(`/api/MaintenanceRequest/${selectedCostDeliberationRequest.maintenanceRequestId}/cost-deliberation/history`);
                        setNegotiationHistory(response.data.history);
                        setHistoryModalOpen(true);
                      } catch (error) {
                        toast.error('Failed to fetch negotiation history');
                      }
                    }}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[2],
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        '& .clickable-icon': {
                          opacity: 1,
                          transform: 'scale(1.1)'
                        }
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
                      Negotiation History
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <HistoryIcon sx={{ color: '#2563eb', fontSize: '1.4rem' }} />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#2563eb' }}>
                            View Full History
                          </Typography>
                          <Chip size="small" label="Timeline" color="primary" variant="outlined" sx={{ height: 22 }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                          See all negotiation steps, offers and agreements
                        </Typography>
                      </Box>
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
                        <HistoryIcon sx={{ 
                          fontSize: '0.9rem',
                          color: 'primary.main'
                        }} />
                      </Box>
                    </Box>
                  </StyledPaper>
                </Grid>
              </Grid>

             </>
           )}
         </DialogContent>
        <DialogActions sx={{ 
           p: 5, 
           pt: 1,
           pb: 1, 
           background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
           borderTop: '1px solid rgba(37, 99, 235, 0.08)',
           position: 'relative'
         }}>
          {selectedCostDeliberationRequest && (() => {
            const getStatusInfo = () => {
              if (selectedCostDeliberationRequest.status === 'MechanicsSelected') return { action: 'propose' };
              if (selectedCostDeliberationRequest.status === 'Proposed') return { action: 'both' };
              if (selectedCostDeliberationRequest.status === 'Negotiating') return { action: 'both' };
              return { action: 'none' };
            };
            const statusInfo = getStatusInfo();
            const hasProposedCost = selectedCostDeliberationRequest.proposedCost && selectedCostDeliberationRequest.proposedCost > 0;
            const hasNegotiatedCost = selectedCostDeliberationRequest.negotiatedCost && selectedCostDeliberationRequest.negotiatedCost > 0;
            const currentCost = hasNegotiatedCost ? selectedCostDeliberationRequest.negotiatedCost : (hasProposedCost ? selectedCostDeliberationRequest.proposedCost : null);
            const wasLastNegotiatedByCurrentUser = selectedCostDeliberationRequest.lastNegotiatedByUserId === userId;
            const canNegotiate = statusInfo.action === 'both' && currentCost && !wasLastNegotiatedByCurrentUser;

            return (
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5, alignItems: 'center' }}>


                {canNegotiate && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedCostRequest(selectedCostDeliberationRequest);
                        setCostNegotiationForm({ negotiatedCost: currentCost.toString(), comments: '' });
                        setOpenCostNegotiationDialog(true);
                        setCostDeliberationDetailOpen(false);
                      }}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, py: 1.25, borderColor: '#f59e0b', color: '#f59e0b', border: '2px solid #f59e0b' }}
                    >
                      Negotiate
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedCostRequest(selectedCostDeliberationRequest);
                        setCostAcceptanceForm({ comments: '' });
                        setOpenCostAcceptanceDialog(true);
                        setCostDeliberationDetailOpen(false);
                      }}
                      sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, px: 3, py: 1.25, borderColor: '#22c55e', color: '#22c55e', border: '2px solid #22c55e' }}
                    >
                       Accept
                    </Button>
                  </>
                )}

                {statusInfo.action === 'propose' && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      setSelectedCostRequest(selectedCostDeliberationRequest);
                      setOpenCostProposalDialog(true);
                      setCostDeliberationDetailOpen(false);
                    }}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, px: 3.5, py: 1.35, background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 60%, #60a5fa 100%)' }}
                  >
                     Propose Cost
                  </Button>
                )}

                <Button onClick={() => setCostDeliberationDetailOpen(false)} variant="outlined" sx={{ color: '#64748b', borderColor: 'rgba(100, 116, 139, 0.2)', fontWeight: 700, borderRadius: '12px', px: 3, py: 1.25, textTransform: 'none' }}>
                  Close
                </Button>
              </Box>
            );
          })()}
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
             borderRadius: '14px',
             boxShadow: '0 32px 80px rgba(37, 99, 235, 0.25), 0 16px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
             border: 'none',
             overflow: 'hidden',
             position: 'relative',
             background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
             backdropFilter: 'blur(20px)'
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
           background: 'black',
           color: 'white',
           fontWeight: 500,
           fontSize: '1.5rem',
           py: 1,
           px: 5,
           mb:3,
           position: 'relative',
           overflow: 'hidden'
         }}>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>

             <Box sx={{ flex: 1 }}>
               <Typography variant="h7" sx={{ 
                 fontWeight: 600, 
                 mb: 1,
                 background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                 backgroundClip: 'text',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                 letterSpacing: '-0.02em'
               }}>
                 Negotiations
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
               border: '2px dashed rgba(0, 0, 0)'
             }}>

               <Typography variant="h5" fontWeight={400} color="text.primary" sx={{ mb: 2 }}>
                 No Negotiation History
               </Typography>
               <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '400px', margin: '0 auto' }}>
                 This request hasn't had any negotiations yet. History will appear here once negotiations begin.
               </Typography>
             </Box>
           ) : (
             <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
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
                     width: '400px',
                    
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
           pt: 1,
           pb: 1, 
           background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
           borderTop: '1px solid rgba(37, 99, 235, 0.08)',
           position: 'relative'
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
               py: 1,
               textTransform: 'none',
               fontSize: '1rem',
               background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
               boxShadow: '0 4px 16px rgba(100, 116, 139, 0.1)',
               border: '2px solid rgba(100, 116, 139, 0.15)',
               position: 'relative',
               overflow: 'hidden',
               transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
             }}
           >
             Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Dialog for Completing Maintenance */}
      <Dialog 
        open={openInvoiceDialog} 
        onClose={closeInvoiceDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color: 'white',
          fontWeight: 800,
          fontSize: '1.5rem',
          p: 4,
          borderRadius: '24px 24px 0 0'
        }}>
          Complete Maintenance - Invoice Details
        </DialogTitle>
        <DialogContent sx={{ p: 4, mt: 2 }}>
          {selectedSchedule && (
            <Box>
              <Box sx={{ 
                mb: 3, 
                p: 3, 
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                border: '1px solid rgba(37, 99, 235, 0.1)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Vehicle Information
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#475569' }}>
                  <strong>Vehicle:</strong> {selectedSchedule.vehicleMake} {selectedSchedule.vehicleModel}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1, color: '#475569' }}>
                  <strong>License Plate:</strong> {selectedSchedule.licensePlate}
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569' }}>
                  <strong>Repair Type:</strong> {selectedSchedule.repairType}
                </Typography>
              </Box>

              <TextField
                margin="normal"
                fullWidth
                label="Labor Hours"
                name="laborHours"
                type="number"
                value={invoiceData.laborHours}
                onChange={handleInvoiceInputChange}
                inputProps={{ min: 0, step: 0.5 }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="Total Cost ($)"
                name="totalCost"
                type="number"
                value={invoiceData.totalCost}
                onChange={handleInvoiceInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Parts Used
                </Typography>
                <Button
                  variant="outlined"
                  onClick={addPart}
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  + Add Part
                </Button>
              </Box>
              
              {invoiceData.partsUsed.map((part, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <TextField
                    label="Part Name"
                    value={part.partName}
                    onChange={(e) => handlePartChange(index, 'partName', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    value={part.quantity}
                    onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Unit Price ($)"
                    type="number"
                    value={part.unitPrice}
                    onChange={(e) => handlePartChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                    size="small"
                    fullWidth
                  />
                  <Button
                    onClick={() => removePart(index)}
                    disabled={invoiceData.partsUsed.length === 1}
                    color="error"
                    sx={{ 
                      minWidth: 'auto',
                      px: 2,
                      borderRadius: '8px'
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}

              <Box sx={{ 
                mt: 3, 
                p: 3, 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '16px',
                border: '2px solid #3b82f6'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                  Total Invoice Amount: ${invoiceData.totalCost}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, gap: 2, background: '#f8fafc' }}>
          <Button
            onClick={closeInvoiceDialog}
            variant="outlined"
            sx={{ 
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteWithInvoice}
            variant="contained"
            disabled={loading || !invoiceData.laborHours || !invoiceData.totalCost}
            sx={{ 
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              }
            }}
          >
            {loading ? 'Submitting...' : 'Complete & Submit Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Mechanic;
