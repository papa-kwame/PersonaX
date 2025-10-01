import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  TrendingUp,
  CheckCircle,
  Close,
  Send
} from '@mui/icons-material';
import api from '../../services/api';

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
    minWidth: '600px',
    maxWidth: '700px',
    maxHeight: '85vh',
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

const NegotiationModal = ({ 
  open, 
  onClose, 
  requestId, 
  currentUserId,
  proposalId,
  currentAmount,
  action, // 'negotiate', 'accept', 'reject'
  onActionCompleted 
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    negotiatedAmount: currentAmount ? currentAmount.toString() : '',
    comments: '',
    rejectionReason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (action === 'negotiate' && !formData.negotiatedAmount) {
      setError('Please enter a negotiated amount');
      return;
    }

    if (action === 'reject' && !formData.rejectionReason) {
      setError('Please provide a reason for rejection');
      return;
    }

    if (!requestId || !proposalId || !currentUserId) {
      setError('Missing required parameters');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      let endpoint = '';
      let payload = {};

      if (action === 'negotiate') {
        endpoint = `/api/MaintenanceRequest/${requestId}/proposal/${proposalId}/negotiate`;
        payload = {
          negotiatedAmount: parseFloat(formData.negotiatedAmount),
          comments: formData.comments
        };
      } else if (action === 'accept') {
        endpoint = `/api/MaintenanceRequest/${requestId}/proposal/${proposalId}/accept`;
        payload = {
          comments: formData.comments
        };
      } else if (action === 'reject') {
        endpoint = `/api/MaintenanceRequest/${requestId}/proposal/${proposalId}/reject`;
        payload = {
          comments: formData.comments,
          rejectionReason: formData.rejectionReason
        };
      }

      const response = await api.post(`${endpoint}?userId=${currentUserId}`, payload);
      // Call the callback to refresh parent data
      if (onActionCompleted) {
        onActionCompleted();
      }
      
      // Close modal and reset form
      handleClose();
      
    } catch (err) {
      let errorMessage = `Failed to ${action} proposal`;
      
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
            errorMessage = 'Proposal or request not found';
            break;
          case 409:
            errorMessage = 'This proposal has already been processed';
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

  const handleClose = () => {
    setFormData({
      negotiatedAmount: '',
      comments: '',
      rejectionReason: ''
    });
    setError('');
    onClose();
  };

  const getActionInfo = () => {
    switch (action) {
      case 'negotiate':
        return {
          title: 'Negotiate Proposal',
          subtitle: 'Submit your counter offer',
          icon: <TrendingUp />,
          color: professionalColors.warning,
          buttonText: 'Submit Negotiation',
          buttonIcon: <Send />
        };
      case 'accept':
        return {
          title: 'Accept Proposal',
          subtitle: 'Accept this proposal',
          icon: <CheckCircle />,
          color: professionalColors.success,
          buttonText: 'Accept Proposal',
          buttonIcon: <CheckCircle />
        };
      case 'reject':
        return {
          title: 'Reject Proposal',
          subtitle: 'Reject this proposal with reason',
          icon: <Close />,
          color: professionalColors.error,
          buttonText: 'Reject Proposal',
          buttonIcon: <Close />
        };
      default:
        return {
          title: 'Action',
          subtitle: 'Perform action',
          icon: <CheckCircle />,
          color: professionalColors.primary,
          buttonText: 'Submit',
          buttonIcon: <Send />
        };
    }
  };

  const actionInfo = getActionInfo();

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${actionInfo.color} 0%, ${alpha(actionInfo.color, 0.8)} 100%)`,
        color: 'white',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(actionInfo.color, 0.2)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: alpha('#ffffff', 0.2),
            width: 48,
            height: 48
          }}>
            {actionInfo.icon}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {actionInfo.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {actionInfo.subtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ 
            color: 'white',
            '&:hover': { background: alpha('#ffffff', 0.1) }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 4,
        background: professionalColors.background,
        minHeight: '300px'
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Negotiated Amount - Only for negotiate action */}
          {action === 'negotiate' && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
                Negotiated Amount
              </Typography>
              <TextField
                label="Counter Offer Amount"
                type="number"
                value={formData.negotiatedAmount}
                onChange={(e) => setFormData({ ...formData, negotiatedAmount: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      color: actionInfo.color,
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mr: 1
                    }}>
                      $
                    </Box>
                  ),
                  sx: {
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    '& input': {
                      paddingLeft: '8px'
                    }
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: `2px solid ${alpha(actionInfo.color, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(actionInfo.color, 0.4),
                      background: 'rgba(255, 255, 255, 0.9)'
                    },
                    '&.Mui-focused': {
                      borderColor: actionInfo.color,
                      background: 'rgba(255, 255, 255, 1)',
                      boxShadow: `0 0 0 3px ${alpha(actionInfo.color, 0.1)}`
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: alpha(actionInfo.color, 0.7),
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: actionInfo.color,
                      fontWeight: 600
                    }
                  }
                }}
                fullWidth
                required
              />
            </Box>
          )}

          {/* Rejection Reason - Only for reject action */}
          {action === 'reject' && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
                Rejection Reason
              </Typography>
              <TextField
                label="Reason for rejection"
                value={formData.rejectionReason}
                onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                placeholder="Please provide a reason for rejecting this proposal..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: `2px solid ${alpha(actionInfo.color, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: alpha(actionInfo.color, 0.4),
                      background: 'rgba(255, 255, 255, 0.9)'
                    },
                    '&.Mui-focused': {
                      borderColor: actionInfo.color,
                      background: 'rgba(255, 255, 255, 1)',
                      boxShadow: `0 0 0 3px ${alpha(actionInfo.color, 0.1)}`
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: alpha(actionInfo.color, 0.7),
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: actionInfo.color,
                      fontWeight: 600
                    }
                  },
                  '& .MuiInputBase-input': {
                    padding: '16px 20px'
                  }
                }}
                fullWidth
                required
              />
            </Box>
          )}

          {/* Comments */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
              {action === 'negotiate' ? 'Negotiation' : action === 'reject' ? 'Rejection' : 'Acceptance'} Comments (Optional)
            </Typography>
            <TextField
              label={`${action === 'negotiate' ? 'Negotiation' : action === 'reject' ? 'Rejection' : 'Acceptance'} comments`}
              multiline
              rows={4}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder={
                action === 'negotiate' 
                  ? "Add any comments about your counter offer, reasoning, or negotiation points..."
                  : action === 'reject'
                  ? "Add additional comments about the rejection (optional)..."
                  : "Add any comments about accepting this proposal, approval notes, or final remarks..."
              }
              InputProps={{
                sx: {
                  fontSize: '0.95rem',
                  lineHeight: 1.5
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: `2px solid ${alpha(actionInfo.color, 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(actionInfo.color, 0.4),
                    background: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-focused': {
                    borderColor: actionInfo.color,
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: `0 0 0 3px ${alpha(actionInfo.color, 0.1)}`
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha(actionInfo.color, 0.7),
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: actionInfo.color,
                    fontWeight: 600
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '16px 20px'
                }
              }}
              fullWidth
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        borderTop: `1px solid ${professionalColors.border}`,
        background: professionalColors.surface,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <StyledButton
          variant="outlined"
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </StyledButton>
        
        <StyledButton
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || (action === 'negotiate' && !formData.negotiatedAmount) || (action === 'reject' && !formData.rejectionReason)}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : actionInfo.buttonIcon}
          sx={{
            background: `linear-gradient(135deg, ${actionInfo.color} 0%, ${alpha(actionInfo.color, 0.8)} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(actionInfo.color, 0.9)} 0%, ${actionInfo.color} 100%)`
            }
          }}
        >
          {submitting ? 'Processing...' : actionInfo.buttonText}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default NegotiationModal;
