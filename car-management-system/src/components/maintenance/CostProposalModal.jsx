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
  AttachMoney,
  Close,
  Send
} from '@mui/icons-material';
import api from '../../services/api';

// Professional color palette
const professionalColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0'
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    minWidth: '500px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${professionalColors.border}`,
    background: professionalColors.surface
  }
}));

const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${professionalColors.warning} 0%, ${alpha(professionalColors.warning, 0.8)} 100%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(professionalColors.warning, 0.9)} 0%, ${professionalColors.warning} 100%)`
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: professionalColors.border,
    color: professionalColors.text,
    '&:hover': {
      borderColor: professionalColors.primary,
      backgroundColor: alpha(professionalColors.primary, 0.04)
    }
  })
}));

const CostProposalModal = ({ 
  open, 
  onClose, 
  requestId, 
  currentUserId,
  onProposalSubmitted 
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    proposedCost: '',
    comments: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.proposedCost) {
      setError('Please enter a proposed cost');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        proposedCost: parseFloat(formData.proposedCost),
        comments: formData.comments
      };

      await api.post(`/api/MaintenanceRequest/${requestId}/cost-deliberation/propose?userId=${currentUserId}`, payload);
      
      // Call the callback to refresh parent data
      if (onProposalSubmitted) {
        onProposalSubmitted();
      }
      
      // Close modal and reset form
      handleClose();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit cost proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      proposedCost: '',
      comments: ''
    });
    setError('');
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${professionalColors.warning} 0%, ${alpha(professionalColors.warning, 0.8)} 100%)`,
        color: 'white',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(professionalColors.warning, 0.2)}`
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
              Submit Cost Proposal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Provide your cost estimate for this maintenance request
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
          {/* Cost Input */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
              Proposed Cost
            </Typography>
            <TextField
              label="Cost Amount"
              type="number"
              value={formData.proposedCost}
              onChange={(e) => setFormData({ ...formData, proposedCost: e.target.value })}
              InputProps={{
                startAdornment: (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    color: professionalColors.warning,
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
                  border: `2px solid ${alpha(professionalColors.warning, 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(professionalColors.warning, 0.4),
                    background: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-focused': {
                    borderColor: professionalColors.warning,
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: `0 0 0 3px ${alpha(professionalColors.warning, 0.1)}`
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha(professionalColors.warning, 0.7),
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: professionalColors.warning,
                    fontWeight: 600
                  }
                }
              }}
              fullWidth
              required
            />
          </Box>

          {/* Comments */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
              Cost Breakdown & Comments
            </Typography>
            <TextField
              label="Detailed cost breakdown"
              multiline
              rows={4}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Provide a detailed cost breakdown, parts list, labor costs, or any additional context for this proposal..."
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
                  border: `2px solid ${alpha(professionalColors.warning, 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(professionalColors.warning, 0.4),
                    background: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-focused': {
                    borderColor: professionalColors.warning,
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: `0 0 0 3px ${alpha(professionalColors.warning, 0.1)}`
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha(professionalColors.warning, 0.7),
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: professionalColors.warning,
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
          disabled={submitting || !formData.proposedCost}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
          sx={{
            background: `linear-gradient(135deg, ${professionalColors.warning} 0%, ${alpha(professionalColors.warning, 0.8)} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(professionalColors.warning, 0.9)} 0%, ${professionalColors.warning} 100%)`
            }
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Proposal'}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default CostProposalModal;














