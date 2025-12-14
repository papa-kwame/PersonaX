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
  Chip,
  Alert,
  CircularProgress,
  Stack,
  MenuItem,
  Avatar,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  People,
  Close,
  Person,
  CheckCircle
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
    background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.9)} 0%, ${professionalColors.primary} 100%)`
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

const SelectMechanicsModal = ({ 
  open, 
  onClose, 
  requestId, 
  currentUserId,
  onMechanicsSelected 
}) => {
  const theme = useTheme();
  const [selectedMechanics, setSelectedMechanics] = useState([]);
  const [mechanicSelectionComments, setMechanicSelectionComments] = useState('');
  const [availableMechanics, setAvailableMechanics] = useState([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch mechanics when modal opens
  useEffect(() => {
    if (open) {
      fetchMechanics();
    }
  }, [open]);

  const fetchMechanics = async () => {
    setLoadingMechanics(true);
    setError('');
    try {
      const response = await api.get('/api/Auth/mechanics');
      if (response.data && response.data.users && Array.isArray(response.data.users)) {
        const mechanics = response.data.users.map(user => ({
          id: user.id,
          name: user.userName || user.email || 'Unknown User'
        }));
        setAvailableMechanics(mechanics);
      } else if (response.data && Array.isArray(response.data)) {
        const mechanics = response.data.map(user => ({
          id: user.id,
          name: user.userName || user.email || 'Unknown User'
        }));
        setAvailableMechanics(mechanics);
      } else {
        setAvailableMechanics([]);
      }
    } catch (err) {
      setError(`Failed to load mechanics list: ${err.message}`);
    } finally {
      setLoadingMechanics(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedMechanics.length === 0) {
      setError('Please select at least one mechanic');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        selectedMechanicIds: selectedMechanics,
        comments: mechanicSelectionComments
      };

      await api.post(`/api/MaintenanceRequest/${requestId}/cost-deliberation/select-mechanics?userId=${currentUserId}`, payload);
      
      // Call the callback to refresh parent data
      if (onMechanicsSelected) {
        onMechanicsSelected();
      }
      
      // Close modal and reset form
      handleClose();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select mechanics');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedMechanics([]);
    setMechanicSelectionComments('');
    setError('');
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
            <People />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Select Mechanics
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Choose mechanics to propose costs for this maintenance request
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
          {/* Mechanics Selection */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
              Available Mechanics
            </Typography>
            
            {availableMechanics.length === 0 && !loadingMechanics && (
              <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                No mechanics found. Please ensure there are users with the "Mechanic" role in the system.
              </Alert>
            )}
            
            <TextField
              select
              label="Select Mechanics"
              disabled={loadingMechanics}
              SelectProps={{
                multiple: true,
                value: selectedMechanics,
                onChange: (e) => setSelectedMechanics(e.target.value),
                renderValue: (selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={availableMechanics.find(m => m.id === value)?.name || value}
                        size="small"
                        sx={{ 
                          background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.9)} 0%, ${professionalColors.primary} 100%)`
                          }
                        }}
                      />
                    ))}
                  </Box>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: `2px solid ${alpha(professionalColors.primary, 0.2)}`,
                  transition: 'all 0.2s ease',
                  minHeight: '56px',
                  '&:hover': {
                    borderColor: alpha(professionalColors.primary, 0.4),
                    background: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-focused': {
                    borderColor: professionalColors.primary,
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: `0 0 0 3px ${alpha(professionalColors.primary, 0.1)}`
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha(professionalColors.primary, 0.7),
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: professionalColors.primary,
                    fontWeight: 600
                  }
                }
              }}
              fullWidth
            >
              {loadingMechanics ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading mechanics...
                </MenuItem>
              ) : availableMechanics.length === 0 ? (
                <MenuItem disabled>No mechanics available</MenuItem>
              ) : (
                availableMechanics.map((mechanic) => (
                  <MenuItem key={mechanic.id} value={mechanic.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16 }} />
                      {mechanic.name}
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>
          </Box>

          {/* Comments */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: professionalColors.text }}>
              Selection Comments (Optional)
            </Typography>
            <TextField
              label="Add notes about mechanic selection"
              multiline
              rows={4}
              value={mechanicSelectionComments}
              onChange={(e) => setMechanicSelectionComments(e.target.value)}
              placeholder="Add any notes about why these mechanics were selected, special requirements, or additional context..."
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
                  border: `2px solid ${alpha(professionalColors.primary, 0.2)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(professionalColors.primary, 0.4),
                    background: 'rgba(255, 255, 255, 0.9)'
                  },
                  '&.Mui-focused': {
                    borderColor: professionalColors.primary,
                    background: 'rgba(255, 255, 255, 1)',
                    boxShadow: `0 0 0 3px ${alpha(professionalColors.primary, 0.1)}`
                  }
                },
                '& .MuiInputLabel-root': {
                  color: alpha(professionalColors.primary, 0.7),
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: professionalColors.primary,
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
          disabled={submitting || selectedMechanics.length === 0}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          sx={{
            background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.9)} 0%, ${professionalColors.primary} 100%)`
            }
          }}
        >
          {submitting ? 'Selecting...' : `Select ${selectedMechanics.length} Mechanic${selectedMechanics.length !== 1 ? 's' : ''}`}
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default SelectMechanicsModal;














