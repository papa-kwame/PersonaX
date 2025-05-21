import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Divider,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Custom theme with refined colors and typography
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      paper: '#ffffff',
      default: '#f5f7fa',
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.25,
    },
    subtitle1: {
      fontSize: '0.875rem',
      color: '#718096',
    },
    body1: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          letterSpacing: '0.025em',
          padding: '8px 20px',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
              borderWidth: '1px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#1976d2',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
              borderWidth: '1px',
            },
          },
        },
      },
    },
  },
});

// Constants
const MAINTENANCE_REQUEST_TYPES = {
  ROUTINE_MAINTENANCE: 0,
  REPAIR: 1,
  INSPECTION: 2,
  TIRE_REPLACEMENT: 3,
  BRAKE_SERVICE: 4,
  OIL_CHANGE: 5,
  UPGRADE: 6,
  EMERGENCY: 7,
  OTHER: 8
};

const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  EMERGENCY: 'Emergency'
};

const steps = ['Request Details', 'Additional Information', 'Review & Submit'];

const CreatePersonalRequestModal = ({ open, onClose }) => {
  const { userId, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    department: '',
    requestType: '',
    description: '',
    priority: '',
    estimatedCost: '',
    adminComments: ''
  });

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [requestTypes, setRequestTypes] = useState(Object.keys(MAINTENANCE_REQUEST_TYPES));
  const [priorities, setPriorities] = useState(Object.values(PRIORITY_LEVELS));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setError('You must be logged in to submit a request.');
    }

    const fetchDepartments = async () => {
      try {
        // Simulate API call
        setDepartments(['IT', 'Facilities', 'Transport', 'HR', 'Finance']);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };

    fetchDepartments();
  }, [isLoading, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.department || !formData.requestType || !formData.priority)) {
      setError('Please fill out all required fields before proceeding.');
      return;
    }
    if (activeStep === 1 && !formData.description) {
      setError('Please provide a description before proceeding.');
      return;
    }
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      if (!userId) {
        throw new Error('User ID not available');
      }

      const requestDto = {
        department: formData.department,
        requestType: MAINTENANCE_REQUEST_TYPES[formData.requestType],
        description: formData.description,
        priority: formData.priority,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0,
        adminComments: formData.adminComments || ''
      };

      const response = await axios.post('https://localhost:7092/api/MaintenanceRequest/personal', requestDto, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          userId: userId
        }
      });

      if (response.data) {
        setMessage('Request submitted successfully!');
        setFormData({
          department: '',
          requestType: '',
          description: '',
          priority: '',
          estimatedCost: '',
          adminComments: ''
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setActiveStep(0);
        }, 2000);
      }
    } catch (err) {
      let errorMsg = 'Failed to submit request. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department"
                  required
                >
                  <MenuItem value=""><em>Select Department</em></MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="requestType-label">Request Type</InputLabel>
                <Select
                  labelId="requestType-label"
                  id="requestType"
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  label="Request Type"
                  required
                >
                  <MenuItem value=""><em>Select Request Type</em></MenuItem>
                  {requestTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  required
                >
                  <MenuItem value=""><em>Select Priority</em></MenuItem>
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="estimatedCost"
                name="estimatedCost"
                label="Estimated Cost (Optional)"
                placeholder="0.00"
                type="number"
                value={formData.estimatedCost}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: {
                    min: 0,
                    step: 0.01
                  }
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                placeholder="Please describe the issue in detail..."
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="adminComments"
                name="adminComments"
                label="Additional Comments (Optional)"
                placeholder="Any additional information or comments..."
                value={formData.adminComments}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Paper variant="outlined" sx={{ p: 3, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Review your request before submitting
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Department:</Typography>
              <Typography variant="body1">{formData.department || 'Not specified'}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Request Type:</Typography>
              <Typography variant="body1">{formData.requestType ? formData.requestType.replace(/_/g, ' ') : 'Not specified'}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Priority:</Typography>
              <Typography variant="body1">{formData.priority || 'Not specified'}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Description:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {formData.description || 'Not provided'}
              </Typography>
            </Box>

            {formData.estimatedCost && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">Estimated Cost:</Typography>
                <Typography variant="body1">${parseFloat(formData.estimatedCost).toFixed(2)}</Typography>
              </Box>
            )}
          </Paper>
        );
      default:
        return 'Unknown step';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Access Denied</Typography>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ my: 2 }}>
              You must be logged in to submit a maintenance request.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '60vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" component="div">
                New Maintenance Request
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {activeStep === 0 ? 'Basic information' : activeStep === 1 ? 'Provide details' : 'Review and submit'}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {getStepContent(activeStep)}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
          <Button
            onClick={activeStep === 0 ? onClose : handleBack}
            disabled={submitting}
            color="inherit"
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Box sx={{ flex: '1 1 auto' }} />

          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
              disabled={submitting}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              onClick={handleSubmit}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default CreatePersonalRequestModal;
