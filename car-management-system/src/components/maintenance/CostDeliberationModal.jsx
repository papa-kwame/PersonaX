import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  MenuItem,
  Avatar,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  AttachMoney, 
  TrendingUp, 
  CheckCircle, 
  Warning, 
  Info, 
  People,
  Close,
  Schedule,
  Person,
  Refresh
} from '@mui/icons-material';
import api from '../../services/api';
import SelectMechanicsModal from './SelectMechanicsModal';
import CostProposalModal from './CostProposalModal';
import NegotiationModal from './NegotiationModal';
import { getToken } from '../../utils/authUtils';

// Professional color palette - Enhanced
const professionalColors = {
  primary: '#1e40af',        // Deep blue
  primaryLight: '#3b82f6',   // Lighter blue
  secondary: '#475569',      // Slate gray
  success: '#047857',        // Forest green
  successLight: '#10b981',   // Emerald
  warning: '#b45309',        // Amber
  warningLight: '#f59e0b',   // Golden
  error: '#b91c1c',          // Crimson
  errorLight: '#ef4444',     // Red
  info: '#0369a1',           // Sky blue
  infoLight: '#0ea5e9',      // Light blue
  background: '#f1f5f9',     // Light slate
  surface: '#ffffff',        // Pure white
  surfaceElevated: '#fefefe', // Slightly elevated white
  text: '#0f172a',           // Dark slate
  textSecondary: '#475569',  // Medium slate
  textMuted: '#64748b',      // Light slate
  border: '#cbd5e1',         // Light border
  borderLight: '#e2e8f0',    // Very light border
  accent: '#7c3aed',         // Purple accent
  accentLight: '#a855f7'     // Light purple
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    minWidth: '800px',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: `
      0 32px 64px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    border: `1px solid ${professionalColors.borderLight}`,
    background: `linear-gradient(145deg, ${professionalColors.surface} 0%, ${professionalColors.surfaceElevated} 100%)`,
    backdropFilter: 'blur(20px)'
  },
  '& .MuiBackdrop-root': {
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)',
    backdropFilter: 'blur(8px)'
  }
}));

const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: '14px',
  padding: '14px 28px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
  },
  '&:active': {
    transform: 'translateY(0px)',
    transition: 'all 0.1s ease'
  },
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${professionalColors.primaryLight} 100%)`,
    color: 'white',
    boxShadow: `0 4px 16px ${alpha(professionalColors.primary, 0.3)}`,
    '&:hover': {
      background: `linear-gradient(135deg, ${professionalColors.primaryLight} 0%, ${professionalColors.primary} 100%)`,
      boxShadow: `0 8px 24px ${alpha(professionalColors.primary, 0.4)}`
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: professionalColors.border,
    color: professionalColors.text,
    backgroundColor: 'transparent',
    '&:hover': {
      borderColor: professionalColors.primary,
      backgroundColor: alpha(professionalColors.primary, 0.04),
      color: professionalColors.primary
    }
  })
}));

const StatusCard = styled(Card)(({ theme, status }) => {
  const getStatusColors = (status) => {
    switch (status) {
      case 'Pending': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.info, 0.1)} 0%, ${alpha(professionalColors.infoLight, 0.05)} 100%)`, 
        border: professionalColors.info,
        text: professionalColors.info
      };
      case 'MechanicsSelected': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.warning, 0.1)} 0%, ${alpha(professionalColors.warningLight, 0.05)} 100%)`, 
        border: professionalColors.warning,
        text: professionalColors.warning
      };
      case 'Proposed': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.1)} 0%, ${alpha(professionalColors.primaryLight, 0.05)} 100%)`, 
        border: professionalColors.primary,
        text: professionalColors.primary
      };
      case 'Negotiating': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.accent, 0.1)} 0%, ${alpha(professionalColors.accentLight, 0.05)} 100%)`, 
        border: professionalColors.accent,
        text: professionalColors.accent
      };
      case 'Agreed': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.success, 0.1)} 0%, ${alpha(professionalColors.successLight, 0.05)} 100%)`, 
        border: professionalColors.success,
        text: professionalColors.success
      };
      default: return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.textMuted, 0.05)} 100%)`, 
        border: professionalColors.secondary,
        text: professionalColors.secondary
      };
    }
  };

  const colors = getStatusColors(status);
  
  return {
    border: `2px solid ${colors.border}`,
    borderRadius: '16px',
    background: colors.bg,
    boxShadow: `
      0 8px 24px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, ${colors.border} 0%, ${alpha(colors.border, 0.5)} 100%)`,
      opacity: 0.6
    },
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: `
        0 16px 40px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `,
      borderColor: colors.border
    }
  };
});

const ActionSection = styled(Box)(({ theme, color = 'primary' }) => {
  const getSectionColors = (color) => {
    switch (color) {
      case 'blue': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.08)} 0%, ${alpha(professionalColors.primaryLight, 0.04)} 100%)`, 
        border: professionalColors.primary 
      };
      case 'orange': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.warning, 0.08)} 0%, ${alpha(professionalColors.warningLight, 0.04)} 100%)`, 
        border: professionalColors.warning 
      };
      case 'green': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.success, 0.08)} 0%, ${alpha(professionalColors.successLight, 0.04)} 100%)`, 
        border: professionalColors.success 
      };
      case 'red': return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.error, 0.08)} 0%, ${alpha(professionalColors.errorLight, 0.04)} 100%)`, 
        border: professionalColors.error 
      };
      default: return { 
        bg: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.08)} 0%, ${alpha(professionalColors.primaryLight, 0.04)} 100%)`, 
        border: professionalColors.primary 
      };
    }
  };

  const colors = getSectionColors(color);
  
  return {
    background: colors.bg,
    border: `2px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: `
      0 4px 16px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1)
    `,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: `linear-gradient(90deg, ${colors.border} 0%, ${alpha(colors.border, 0.3)} 100%)`,
      opacity: 0.8
    },
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `
        0 8px 24px rgba(0, 0, 0, 0.08),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15)
      `
    }
  };
});

const CostDeliberationModal = ({ 
  open, 
  onClose, 
  requestId, 
  currentStage, 
  currentUserId,
  onCostUpdated 
}) => {
  const theme = useTheme();
  const [costData, setCostData] = useState({
    status: null,
    proposedCost: null,
    negotiatedCost: null,
    finalCost: null,
    comments: null,
    proposedDate: null,
    negotiatedDate: null,
    finalizedDate: null,
    selectedMechanicIds: [],
    selectedDate: null,
    canSelectMechanics: false,
    canProposeCost: false,
    canNegotiateCost: false,
    canFinalizeCost: false,
    canAcceptCost: false
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    proposedCost: '',
    negotiatedCost: '',
    finalCost: '',
    comments: ''
  });

  // Modal states
  const [selectMechanicsModalOpen, setSelectMechanicsModalOpen] = useState(false);
  const [costProposalModalOpen, setCostProposalModalOpen] = useState(false);
  const [negotiationModalOpen, setNegotiationModalOpen] = useState(false);
  const [negotiationModalData, setNegotiationModalData] = useState({
    proposalId: null,
    currentAmount: null,
    action: null
  });
  
  // Data states
  const [negotiationHistory, setNegotiationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [loadingAcceptedOffers, setLoadingAcceptedOffers] = useState(false);
  const [mechanicProposals, setMechanicProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  // Fetch cost deliberation data
  useEffect(() => {
    if (open && requestId) {
      fetchCostDeliberationData();
      fetchNegotiationHistory();
      fetchAcceptedOffers();
      fetchMechanicProposals();
    }
  }, [open, requestId]);

  const fetchNegotiationHistory = async () => {
    if (!requestId) return;
    
    setLoadingHistory(true);
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/cost-deliberation/history`);
      setNegotiationHistory(response.data.history || []);
    } catch (error) {
      setNegotiationHistory([]);
      // Don't show error for optional data
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAcceptedOffers = async () => {
    if (!requestId) return;
    
    setLoadingAcceptedOffers(true);
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/accepted-offers`);
      setAcceptedOffers(response.data || []);
    } catch (error) {
      setAcceptedOffers([]);
      // Don't show error for optional data
    } finally {
      setLoadingAcceptedOffers(false);
    }
  };

  const fetchMechanicProposals = async () => {
    if (!requestId) return;
    
    setLoadingProposals(true);
    try {
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/mechanic-proposals`);
      setMechanicProposals(response.data || []);
    } catch (error) {
      setMechanicProposals([]);
      // Don't show error for optional data
    } finally {
      setLoadingProposals(false);
    }
  };

  // Modal handlers
  const handleOpenSelectMechanics = () => {
    setSelectMechanicsModalOpen(true);
  };

  const handleOpenCostProposal = () => {
    setCostProposalModalOpen(true);
  };

  const handleOpenNegotiation = (proposalId, currentAmount, action) => {
    setNegotiationModalData({
      proposalId,
      currentAmount,
      action
    });
    setNegotiationModalOpen(true);
  };

  const handleModalCompleted = async () => {
    // Refresh all data when any modal completes an action
    await fetchCostDeliberationData();
    await fetchNegotiationHistory();
    await fetchAcceptedOffers();
    await fetchMechanicProposals();
    if (onCostUpdated) onCostUpdated();
  };

  const fetchCostDeliberationData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = getToken();
      if (!token) throw new Error('No authentication token found');
      if (!requestId) throw new Error('No request ID provided');
      
      const response = await api.get(`/api/MaintenanceRequest/${requestId}/cost-deliberation?userId=${currentUserId}`);
      
      const data = response.data;
      const mappedData = {
        status: data.status || null,
        proposedCost: data.proposedCost || null,
        negotiatedCost: data.negotiatedCost || null,
        finalCost: data.finalCost || null,
        comments: data.comments || null,
        proposedDate: data.proposedDate || null,
        negotiatedDate: data.negotiatedDate || null,
        finalizedDate: data.finalizedDate || null,
        selectedMechanicIds: data.selectedMechanicIds || [],
        selectedDate: data.selectedDate || null,
        canSelectMechanics: data.canSelectMechanics || false,
        canProposeCost: data.canProposeCost || false,
        canNegotiateCost: data.canNegotiateCost || false,
        canFinalizeCost: data.canFinalizeCost || false,
        canAcceptCost: data.canAcceptCost || false,
        // Proposal status
        selectedMechanicCount: data.selectedMechanicCount || 0,
        proposedMechanicCount: data.proposedMechanicCount || 0,
        allMechanicsProposed: data.allMechanicsProposed || false
      };
      
      setCostData(mappedData);
      } catch (err) {
      let errorMessage = 'Failed to load cost deliberation data';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || data?.title || 'Invalid request data';
            break;
          case 401:
            errorMessage = 'You are not authorized to view this data';
            break;
          case 403:
            errorMessage = 'You do not have permission to view cost deliberation';
            break;
          case 404:
            errorMessage = 'Cost deliberation data not found';
            break;
          default:
            errorMessage = data?.message || data?.title || `Server error (${status})`;
        }
      } else if (err.request) {
        errorMessage = 'Network error - please check your connection';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (action) => {
    setSubmitting(true);
    setError('');
    
    try {
      let endpoint = '';
      let payload = {};

      switch (action) {
        case 'select-mechanics':
          endpoint = `/api/MaintenanceRequest/${requestId}/cost-deliberation/select-mechanics`;
          payload = {
            selectedMechanicIds: selectedMechanics,
            comments: mechanicSelectionComments
          };
          break;
        case 'propose':
          endpoint = `/api/MaintenanceRequest/${requestId}/cost-deliberation/propose`;
          payload = {
            proposedCost: parseFloat(formData.proposedCost),
            comments: formData.comments
          };
          break;
        case 'finalize':
          endpoint = `/api/MaintenanceRequest/${requestId}/cost-deliberation/finalize`;
          payload = {
            finalCost: parseFloat(formData.finalCost),
            comments: formData.comments
          };
          break;
        // Note: Removed 'negotiate' and 'accept' cases since we now use individual proposal endpoints
        // These are handled by handleProposalSubmit instead
      }

      await api.post(`${endpoint}?userId=${currentUserId}`, payload);
      await fetchCostDeliberationData();
      await fetchNegotiationHistory(); // Refresh negotiation history
      await fetchAcceptedOffers(); // Refresh accepted offers
      await fetchMechanicProposals(); // Refresh mechanic proposals
      if (onCostUpdated) onCostUpdated();
      
      // Reset form
      setFormData({
        proposedCost: '',
        negotiatedCost: '',
        finalCost: '',
        comments: ''
      });
      
    } catch (err) {
      let errorMessage = 'Failed to update cost deliberation';
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || data?.title || 'Invalid request data';
            break;
          case 401:
            errorMessage = 'You are not authorized to perform this action';
            break;
          case 403:
            errorMessage = 'You do not have permission for this action';
            break;
          case 404:
            errorMessage = 'Request or cost deliberation not found';
            break;
          case 409:
            errorMessage = 'This action has already been performed';
            break;
          default:
            errorMessage = data?.message || data?.title || `Server error (${status})`;
        }
      } else if (err.request) {
        errorMessage = 'Network error - please check your connection';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Schedule color="info" />;
      case 'MechanicsSelected': return <People color="primary" />;
      case 'Proposed': return <AttachMoney color="warning" />;
      case 'Negotiating': return <TrendingUp color="warning" />;
      case 'Agreed': return <CheckCircle color="success" />;
      default: return <Info color="disabled" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'info';
      case 'MechanicsSelected': return 'primary';
      case 'Proposed': return 'warning';
      case 'Negotiating': return 'warning';
      case 'Agreed': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <StyledDialog open={open} onClose={onClose}>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </StyledDialog>
    );
  }

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
        color: 'white',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(professionalColors.primary, 0.2)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: alpha('#ffffff', 0.2),
            width: 48,
            height: 48
          }}>
            <AttachMoney />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Cost Deliberation
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {costData?.finalCost ? `Final Cost: ${formatCurrency(costData.finalCost)}` : 'Cost negotiation in progress'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {costData?.status && (
            <Chip
              icon={getStatusIcon(costData.status)}
              label={costData.status}
              color={getStatusColor(costData.status)}
              sx={{ 
                color: 'white',
                fontWeight: 600,
                background: alpha('#ffffff', 0.2),
                backdropFilter: 'blur(10px)'
              }}
            />
          )}
          <Button
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': { background: alpha('#ffffff', 0.1) }
            }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 4,
        background: professionalColors.background,
        minHeight: '400px',
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        {/* Simplified Status Overview */}
        {costData && (
          <Box sx={{ mb: 4, mt: 2 }}>
            <Stack spacing={3}>
              {/* Step 1: Select Mechanics */}
              <Box sx={{
                background: !costData.status || costData.status === 'Pending' 
                  ? 'linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)'
                  : 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                borderRadius: '16px',
                border: !costData.status || costData.status === 'Pending' 
                  ? '2px solid #3b82f6'
                  : '1px solid #22c55e',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 3
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: !costData.status || costData.status === 'Pending' 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                    : 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                  {!costData.status || costData.status === 'Pending' ? '1' : '✓'}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color={!costData.status || costData.status === 'Pending' ? 'primary.main' : 'success.main'}>
                    Select Mechanics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {!costData.status || costData.status === 'Pending' 
                      ? 'Choose mechanics to propose costs for this maintenance request'
                      : `${costData.selectedMechanicIds?.length || 0} mechanic(s) selected`}
                  </Typography>
                </Box>
              </Box>

              {/* Step 2: Mechanics Propose */}
              <Box sx={{
                background: costData.status === 'MechanicsSelected' && !costData.allMechanicsProposed
                  ? 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)'
                  : costData.allMechanicsProposed || costData.proposedCost
                  ? 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)'
                  : 'linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%)',
                borderRadius: '16px',
                border: costData.status === 'MechanicsSelected' && !costData.allMechanicsProposed
                  ? '2px solid #f59e0b'
                  : costData.allMechanicsProposed || costData.proposedCost
                  ? '1px solid #22c55e'
                  : '1px solid #e2e8f0',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                opacity: (!costData.status || costData.status === 'Pending') ? 0.6 : 1
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: costData.status === 'MechanicsSelected' && !costData.allMechanicsProposed
                    ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                    : costData.allMechanicsProposed || costData.proposedCost
                    ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                    : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                  {costData.allMechanicsProposed || costData.proposedCost ? '✓' : '2'}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color={
                    costData.status === 'MechanicsSelected' && !costData.allMechanicsProposed ? 'warning.main' :
                    costData.allMechanicsProposed || costData.proposedCost ? 'success.main' : 'text.secondary'
                  }>
                    Mechanics Cost Estimation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {costData.status === 'MechanicsSelected' && !costData.allMechanicsProposed
                      ? `${costData.proposedMechanicCount || 0} of ${costData.selectedMechanicCount || 0} mechanics have proposed`
                      : costData.allMechanicsProposed || costData.proposedCost
                      ? 'All proposals received'
                      : 'Waiting for mechanic selection'}
                  </Typography>
                </Box>
                {costData.status === 'MechanicsSelected' && !costData.allMechanicsProposed && (
                  <Chip 
                    label="IN PROGRESS"
                    color="warning"
                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                )}
              </Box>

              {/* Step 3: Review & Negotiate */}
              <Box sx={{
                background: costData.allMechanicsProposed && costData.status !== 'Agreed'
                  ? 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)'
                  : costData.status === 'Agreed' || costData.finalCost
                  ? 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)'
                  : 'linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%)',
                borderRadius: '16px',
                border: costData.allMechanicsProposed && costData.status !== 'Agreed'
                  ? '2px solid #f59e0b'
                  : costData.status === 'Agreed' || costData.finalCost
                  ? '1px solid #22c55e'
                  : '1px solid #e2e8f0',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                opacity: (!costData.allMechanicsProposed && !costData.proposedCost) ? 0.6 : 1
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: costData.allMechanicsProposed && costData.status !== 'Agreed'
                    ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                    : costData.status === 'Agreed' || costData.finalCost
                    ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                    : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                  {costData.status === 'Agreed' || costData.finalCost ? '✓' : '3'}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color={
                    costData.allMechanicsProposed && costData.status !== 'Agreed' ? 'warning.main' :
                    costData.status === 'Agreed' || costData.finalCost ? 'success.main' : 'text.secondary'
                  }>
                    Review & Negotiation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {costData.finalCost 
                      ? `Final cost agreed: ${formatCurrency(costData.finalCost)}`
                      : costData.allMechanicsProposed 
                      ? 'Review proposals and negotiate if needed'
                      : 'Waiting for all proposals'}
                  </Typography>
                </Box>
              </Box>

              {/* Step 4: Complete */}
              <Box sx={{
                background: costData.status === 'Agreed' || costData.finalCost
                  ? 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)'
                  : 'linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%)',
                borderRadius: '16px',
                border: costData.status === 'Agreed' || costData.finalCost
                  ? '1px solid #22c55e'
                  : '1px solid #e2e8f0',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                opacity: (costData.status !== 'Agreed' && !costData.finalCost) ? 0.6 : 1
              }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: costData.status === 'Agreed' || costData.finalCost
                    ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                    : 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.2rem'
                }}>
                  {costData.status === 'Agreed' || costData.finalCost ? '✓' : '4'}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color={
                    costData.status === 'Agreed' || costData.finalCost ? 'success.main' : 'text.secondary'
                  }>
                     Finalization
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {costData.status === 'Agreed' || costData.finalCost
                      ? 'Cost deliberation completed successfully'
                      : 'Final step - ready to proceed with maintenance'}
                  </Typography>
                </Box>
              </Box>

              {/* Mechanic Proposals Section */}
              {loadingProposals ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '1px solid #fbbf24'
                }}>
                  <CircularProgress size={32} sx={{ mb: 2, color: professionalColors.warning }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Loading mechanic proposals...
                  </Typography>
                </Box>
              ) : mechanicProposals.length > 0 && (
                <Box sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                  borderRadius: '20px',
                  border: '1px solid #fbbf24',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  mb: 3
                }}>
                  {/* Header */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    color: 'white',
                    p: 3,
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
                        <AttachMoney sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Mechanic Proposals
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {mechanicProposals.length} proposal{mechanicProposals.length !== 1 ? 's' : ''} received
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={fetchMechanicProposals}
                      disabled={loadingProposals}
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {loadingProposals ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      {mechanicProposals.map((proposal, index) => (
                        <Box key={proposal.id} sx={{ 
                          background: 'white',
                          borderRadius: '16px',
                          p: 3,
                          border: '1px solid #fbbf24',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                          }
                        }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Chip 
                              label={proposal.status.toUpperCase()}
                              size="small"
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: 
                                  proposal.status === 'Accepted' ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' :
                                  proposal.status === 'Rejected' ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' :
                                  proposal.status === 'Negotiating' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' :
                                  'linear-gradient(135deg, #292826ff 0%, #292724ff 100%)',
                                color: 'white',
                                '& .MuiChip-label': { px: 1.5 }
                              }}
                            />
                            <Typography variant="h5" color="text.primary" fontWeight={700} sx={{ ml: 'auto' }}>
                              {formatCurrency(proposal.negotiatedAmount || proposal.proposedAmount)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                            }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              <strong>Mechanic:</strong> {proposal.mechanicName}
                            </Typography>
                          </Box>
                          
                          {/* Original Comments */}
                          {proposal.comments && (
                            <Box sx={{
                              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                              borderRadius: '12px',
                              p: 2,
                              mb: 2,
                              border: '1px solid #fbbf24'
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontStyle: 'italic', 
                                color: 'text.secondary',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                              }}>
                                <strong>Original:</strong> "{proposal.comments}"
                              </Typography>
                            </Box>
                          )}

                          {/* Negotiation Comments */}
                          {proposal.negotiationComments && (
                            <Box sx={{
                              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                              borderRadius: '12px',
                              p: 2,
                              mb: 2,
                              border: '1px solid #3b82f6'
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontStyle: 'italic', 
                                color: 'text.secondary',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                              }}>
                                <strong>Negotiation:</strong> "{proposal.negotiationComments}"
                              </Typography>
                            </Box>
                          )}

                          {/* Acceptance Comments */}
                          {proposal.acceptanceComments && (
                            <Box sx={{
                              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                              borderRadius: '12px',
                              p: 2,
                              mb: 2,
                              border: '1px solid #22c55e'
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontStyle: 'italic', 
                                color: 'text.secondary',
                                fontSize: '0.9rem',
                                lineHeight: 1.5
                              }}>
                                <strong>Acceptance:</strong> "{proposal.acceptanceComments}"
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Timestamp */}
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            display: 'block',
                            textAlign: 'right',
                            fontWeight: 500,
                            mb: 2
                          }}>
                            {formatDate(proposal.proposedDate)}
                          </Typography>

                          {/* Action Buttons */}
                          {(proposal.status === 'Pending' || proposal.status === 'Proposed') && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenNegotiation(proposal.id, proposal.proposedAmount, 'negotiate')}
                                sx={{
                                  borderColor: professionalColors.warning,
                                  color: professionalColors.warning,
                                  fontSize: '0.75rem',
                                  '&:hover': {
                                    borderColor: professionalColors.warning,
                                    backgroundColor: alpha(professionalColors.warning, 0.04)
                                  }
                                }}
                              >
                                Negotiate
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenNegotiation(proposal.id, null, 'accept')}
                                sx={{
                                  background: `linear-gradient(135deg, ${professionalColors.success} 0%, ${alpha(professionalColors.success, 0.8)} 100%)`,
                                  fontSize: '0.75rem',
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${alpha(professionalColors.success, 0.9)} 0%, ${professionalColors.success} 100%)`
                                  }
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOpenNegotiation(proposal.id, null, 'reject')}
                                sx={{
                                  borderColor: '#ef4444',
                                  color: '#ef4444',
                                  fontSize: '0.75rem',
                                  '&:hover': {
                                    borderColor: '#dc2626',
                                    backgroundColor: alpha('#ef4444', 0.04)
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}

                          {proposal.status === 'Negotiating' && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                              {/* Determine who can act based on who made the last negotiation */}
                              {/* If the current user was the last to negotiate, they must wait for the other party */}
                              {/* If the other party was the last to negotiate, current user can respond */}
                              {proposal.negotiatedByUserId !== currentUserId ? (
                                // Other party made the last negotiation - current user can respond
                                <>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenNegotiation(proposal.id, proposal.negotiatedAmount || proposal.proposedAmount, 'negotiate')}
                                    sx={{
                                      borderColor: professionalColors.warning,
                                      color: professionalColors.warning,
                                      fontSize: '0.75rem',
                                      '&:hover': {
                                        borderColor: professionalColors.warning,
                                        backgroundColor: alpha(professionalColors.warning, 0.04)
                                      }
                                    }}
                                  >
                                    Counter Offer
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleOpenNegotiation(proposal.id, null, 'accept')}
                                    sx={{
                                      background: `linear-gradient(135deg, ${professionalColors.success} 0%, ${alpha(professionalColors.success, 0.8)} 100%)`,
                                      fontSize: '0.75rem',
                                      '&:hover': {
                                        background: `linear-gradient(135deg, ${alpha(professionalColors.success, 0.9)} 0%, ${professionalColors.success} 100%)`
                                      }
                                    }}
                                  >
                                    Accept Negotiated
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenNegotiation(proposal.id, null, 'reject')}
                                    sx={{
                                      borderColor: '#ef4444',
                                      color: '#ef4444',
                                      fontSize: '0.75rem',
                                      '&:hover': {
                                        borderColor: '#dc2626',
                                        backgroundColor: alpha('#ef4444', 0.04)
                                      }
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                // Current user made the last negotiation - must wait
                                <Box sx={{
                                  background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
                                  borderRadius: '8px',
                                  border: '1px solid #f59e0b',
                                  p: 1.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <Schedule sx={{ fontSize: 16, color: 'warning.main' }} />
                                  <Typography variant="caption" color="warning.main" fontWeight={600}>
                                    Waiting for other party to respond...
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* Negotiation History Timeline */}
              {loadingHistory ? (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <CircularProgress size={32} sx={{ mb: 2, color: professionalColors.primary }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Loading negotiation history...
                  </Typography>
                </Box>
              ) : negotiationHistory.length > 0 && (
                <Box sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}>
                  {/* Header */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: 'white',
                    p: 3,
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
                        <TrendingUp sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Negotiation Timeline
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {negotiationHistory.length} offer{negotiationHistory.length !== 1 ? 's' : ''} and counter offer{negotiationHistory.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      onClick={fetchNegotiationHistory}
                      disabled={loadingHistory}
                      sx={{ 
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': { 
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {loadingHistory ? <CircularProgress size={20} color="inherit" /> : <TrendingUp />}
                    </IconButton>
                  </Box>
                  
                  {/* Timeline Content */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      {/* Timeline line */}
                      <Box sx={{
                        position: 'absolute',
                        left: 24,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%)',
                        borderRadius: 2
                      }} />
                      
                      <Stack spacing={3}>
                        {negotiationHistory.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            {/* Timeline dot */}
                            <Box sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                              border: '3px solid white',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              flexShrink: 0,
                              mt: 0.5,
                              position: 'relative',
                              zIndex: 2
                            }} />
                            
                            {/* Content Card */}
                            <Box sx={{ 
                              flex: 1, 
                              minWidth: 0,
                              background: 'white',
                              borderRadius: '16px',
                              p: 3,
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                              }
                            }}>
                              {/* Header */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box sx={{
                                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                                  borderRadius: '8px',
                                  px: 2,
                                  py: 0.5
                                }}>
                                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                                    {item.negotiationType === 'Initial' ? 'OFFER' : item.negotiationType === 'Final' ? 'FINAL OFFER' : 'COUNTER OFFER'} #{item.sequenceNumber}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={item.negotiationType}
                                  size="small"
                                  sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background: 
                                      item.negotiationType === 'Initial' ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' :
                                      item.negotiationType === 'Final' ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' :
                                      'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                                    color: 'white',
                                    '& .MuiChip-label': { px: 1.5 }
                                  }}
                                />
                                <Typography variant="h5" color="text.primary" fontWeight={700} sx={{ ml: 'auto' }}>
                                  {formatCurrency(item.negotiatedAmount)}
                                </Typography>
                              </Box>
                              
                              {/* User Info */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Box sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                                }} />
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  {item.negotiatedBy}
                                </Typography>
                              </Box>
                              
                              {/* Comments */}
                              {item.comments && (
                                <Box sx={{
                                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                  borderRadius: '12px',
                                  p: 2,
                                  mb: 2,
                                  border: '1px solid #e2e8f0'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontStyle: 'italic', 
                                    color: 'text.secondary',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5
                                  }}>
                                    "{item.comments}"
                                  </Typography>
                                </Box>
                              )}
                              
                              {/* Timestamp */}
                              <Typography variant="caption" color="text.secondary" sx={{ 
                                display: 'block',
                                textAlign: 'right',
                                fontWeight: 500
                              }}>
                                {formatDate(item.negotiatedDate)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        {/* No Cost Data Yet */}
        {costData && !costData.status && !costData.proposedCost && !error && !loading && (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            border: `2px dashed ${professionalColors.border}`,
            borderRadius: '12px',
            backgroundColor: alpha(professionalColors.secondary, 0.02)
          }}>

          </Box>
        )} 

        <Divider sx={{ my: 3 }} />

        {currentStage !== 'Review' && (
          <Alert severity="info" sx={{ borderRadius: '8px' }}>
            Cost deliberation is only available during the Review stage.
          </Alert>
        )}

        {/* Accepted Offers Section */}
        {loadingAcceptedOffers ? (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
            borderRadius: '16px',
            border: '1px solid #bbf7d0',
            mx: 3,
            mb: 3
          }}>
            <CircularProgress size={32} sx={{ mb: 2, color: professionalColors.success }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Loading accepted offers...
            </Typography>
          </Box>
        ) : acceptedOffers.length > 0 && (
          <Box sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderRadius: '20px',
            border: '1px solid #bbf7d0',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            mx: 3,
            mb: 3
          }}>
            {/* Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              color: 'white',
              p: 3,
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
                  <CheckCircle sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Accepted Offers
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {acceptedOffers.length} offer{acceptedOffers.length !== 1 ? 's' : ''} accepted
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={fetchAcceptedOffers}
                disabled={loadingAcceptedOffers}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {loadingAcceptedOffers ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
              </IconButton>
            </Box>
            
            {/* Offers Content */}
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {acceptedOffers.map((offer, index) => (
                  <Box key={offer.id} sx={{ 
                    background: 'white',
                    borderRadius: '16px',
                    p: 3,
                    border: offer.isPrimary ? '2px solid #22c55e' : '1px solid #bbf7d0',
                    boxShadow: offer.isPrimary ? '0 4px 12px rgba(34, 197, 94, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }
                  }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {offer.isPrimary && (
                        <Chip 
                          label="PRIMARY"
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                            color: 'white',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      )}
                      <Typography variant="h5" color="text.primary" fontWeight={700} sx={{ ml: 'auto' }}>
                        {formatCurrency(offer.acceptedAmount)}
                      </Typography>
                    </Box>
                    
                    {/* Mechanic Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                      }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        <strong>Mechanic:</strong> {offer.mechanicName}
                      </Typography>
                    </Box>
                    
                    {/* Accepted By Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Box sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                      }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        <strong>Accepted by:</strong> {offer.acceptedByName}
                      </Typography>
                    </Box>
                    
                    {/* Comments */}
                    {offer.comments && (
                      <Box sx={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '12px',
                        p: 2,
                        mb: 2,
                        border: '1px solid #bbf7d0'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontStyle: 'italic', 
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          lineHeight: 1.5
                        }}>
                          "{offer.comments}"
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Timestamp */}
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      display: 'block',
                      textAlign: 'right',
                      fontWeight: 500
                    }}>
                      {formatDate(offer.acceptedDate)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        borderTop: `1px solid ${professionalColors.border}`,
        background: professionalColors.surface,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Step 1: Select Mechanics - Only for authorized reviewers */}
          {currentStage === 'Review' && costData?.canSelectMechanics && (!costData?.status || costData?.status === 'Pending') && (
            <StyledButton
              variant="contained"
              size="large"
              onClick={handleOpenSelectMechanics}
              startIcon={<People />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.4)'
                }
              }}
            >
              Select Mechanics
            </StyledButton>
          )}

          {/* Step 2: Propose Cost - Only for selected mechanics */}
          {currentStage === 'Review' && costData?.canProposeCost && costData?.status === 'MechanicsSelected' && (
            <StyledButton
              variant="contained"
              size="large"
              onClick={handleOpenCostProposal}
              startIcon={<AttachMoney />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(245, 158, 11, 0.4)'
                }
              }}
            >
              Submit Cost Proposal
            </StyledButton>
          )}

          {/* Progress Indicator - When mechanics are selected but not all have proposed */}
          {currentStage === 'Review' && costData?.selectedMechanicCount > 0 && !costData?.allMechanicsProposed && !costData?.canProposeCost && (
            <Box sx={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
              borderRadius: '16px',
              border: '2px solid #f59e0b',
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Schedule sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="warning.main" fontWeight={700}>
                  Waiting for Proposals
                </Typography>
                <Typography variant="caption" color="warning.main">
                  {costData.proposedMechanicCount || 0} of {costData.selectedMechanicCount} mechanics have proposed
                </Typography>
              </Box>
            </Box>
          )}

          {/* Step 3: Review Complete - When all proposals are in */}
          {currentStage === 'Review' && costData?.allMechanicsProposed && costData?.status !== 'Agreed' && (
            <Box sx={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
              borderRadius: '16px',
              border: '2px solid #22c55e',
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CheckCircle sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="body2" color="success.main" fontWeight={700}>
                  All Proposals Received!
                </Typography>
                <Typography variant="caption" color="success.main">
                  Review individual proposals above to accept or negotiate
                </Typography>
              </Box>
            </Box>
          )}

          {/* Step 4: Completed */}
          {costData?.status === 'Agreed' || costData?.finalCost && (
            <Box sx={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
              borderRadius: '16px',
              border: '2px solid #22c55e',
              px: 4,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}>
              <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CheckCircle sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" color="success.main" fontWeight={700}>
                  Cost Deliberation Complete!
                </Typography>
                <Typography variant="body2" color="success.main">
                  Final cost: {formatCurrency(costData.finalCost || costData.negotiatedCost || costData.proposedCost)}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogActions>

      {/* Separate Modals */}
      <SelectMechanicsModal
        open={selectMechanicsModalOpen}
        onClose={() => setSelectMechanicsModalOpen(false)}
        requestId={requestId}
        currentUserId={currentUserId}
        onMechanicsSelected={handleModalCompleted}
      />

      <CostProposalModal
        open={costProposalModalOpen}
        onClose={() => setCostProposalModalOpen(false)}
        requestId={requestId}
        currentUserId={currentUserId}
        onProposalSubmitted={handleModalCompleted}
      />

      <NegotiationModal
        open={negotiationModalOpen}
        onClose={() => setNegotiationModalOpen(false)}
        requestId={requestId}
        currentUserId={currentUserId}
        proposalId={negotiationModalData.proposalId}
        currentAmount={negotiationModalData.currentAmount}
        action={negotiationModalData.action}
        onActionCompleted={handleModalCompleted}
      />
    </StyledDialog>
  );
};

export default CostDeliberationModal;

