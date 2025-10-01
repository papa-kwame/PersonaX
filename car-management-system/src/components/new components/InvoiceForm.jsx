import React, { useState, useEffect } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Snackbar
} from '@mui/material';

const MaintenanceSchedules = () => {
  const { userId, isAuthenticated } = useAuth();
  const [state, setState] = useState({
    schedules: [],
    selectedSchedule: null,
    loading: true,
    error: null,
    success: null,
    openDialog: false,
    submitting: false
  });
  
  const [invoiceData, setInvoiceData] = useState({
    laborHours: 0,
    totalCost: 0,
    partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
  });

  // Fetch schedules on component mount and when userId changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!isAuthenticated || !userId) return;
      
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const response = await api.get(`/api/MaintenanceRequest/user/${userId}/schedules`);
        
        setState(prev => ({
          ...prev,
          schedules: response.data,
          loading: false
        }));
        
      } catch (error) {
        handleApiError(error, 'Failed to fetch schedules');
      }
    };

    fetchSchedules();
  }, [isAuthenticated, userId]);

  const handleApiError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.title || 
                        error.response?.data?.detail || 
                        error.message || 
                        defaultMessage;
    
    setState(prev => ({
      ...prev,
      loading: false,
      submitting: false,
      error: errorMessage
    }));
  };

  const handleScheduleSelect = (schedule) => {
    setState(prev => ({ ...prev, selectedSchedule: schedule, openDialog: true }));
  };

  const handleCloseDialog = () => {
    setState(prev => ({ ...prev, openDialog: false, selectedSchedule: null }));
    setInvoiceData({
      laborHours: 0,
      totalCost: 0,
      partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...invoiceData.partsUsed];
    updatedParts[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setInvoiceData(prev => ({ ...prev, partsUsed: updatedParts }));
  };

  const addPartRow = () => {
    setInvoiceData(prev => ({
      ...prev,
      partsUsed: [...prev.partsUsed, { partName: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removePartRow = (index) => {
    const updatedParts = invoiceData.partsUsed.filter((_, i) => i !== index);
    setInvoiceData(prev => ({
      ...prev,
      partsUsed: updatedParts.length > 0 ? updatedParts : [{ partName: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleSubmit = async () => {
    if (!state.selectedSchedule) return;
    
    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));
      
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

      // Debug log

      const response = await api.post(
        `/api/MaintenanceRequest/${state.selectedSchedule.id}/complete-with-invoice`,
        payload
      );

      // Debug log

      // Update local state optimistically
      setState(prev => ({
        ...prev,
        schedules: prev.schedules.map(sched => 
          sched.id === state.selectedSchedule.id 
            ? { ...sched, status: 'Completed' } 
            : sched
        ),
        openDialog: false,
        selectedSchedule: null,
        submitting: false,
        success: 'Maintenance completed and invoice submitted successfully!'
      }));

    } catch (error) {
      handleApiError(error, 'Failed to complete maintenance');
    }
  };

  const handleCloseSnackbar = () => {
    setState(prev => ({ ...prev, error: null, success: null }));
  };

  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Alert severity="warning">Please log in to view maintenance schedules</Alert>
      </Box>
    );
  }

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        My Maintenance Schedules
      </Typography>

      {/* Error/Success notifications */}
      <Snackbar
        open={!!state.error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {state.error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!state.success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {state.success}
        </Alert>
      </Snackbar>

      {state.schedules.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          <Typography>No maintenance schedules found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle</TableCell>
                <TableCell>License Plate</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Repair Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.vehicleMake} {schedule.vehicleModel}</TableCell>
                  <TableCell>{schedule.licensePlate}</TableCell>
                  <TableCell>
                    {formatDateDisplay(schedule.scheduledDate)}
                  </TableCell>
                  <TableCell>{schedule.repairType}</TableCell>
                  <TableCell>
                    <Chip 
                      label={schedule.status} 
                      color={
                        schedule.status === 'Completed' ? 'success' : 
                        schedule.status === 'InProgress' ? 'warning' : 'primary'
                      } 
                    />
                  </TableCell>
                  <TableCell>
                    {schedule.status !== 'Completed' && (
                      <Button 
                        variant="outlined" 
                        onClick={() => handleScheduleSelect(schedule)}
                        disabled={schedule.AssignedMechanicId !== userId}
                        sx={{ minWidth: 120 }}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Complete with Invoice Dialog */}
      <Dialog 
        open={state.openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Complete Maintenance for {state.selectedSchedule?.vehicleMake} {state.selectedSchedule?.vehicleModel}
        </DialogTitle>
        <DialogContent>
          {state.selectedSchedule && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                License Plate: {state.selectedSchedule.licensePlate}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Scheduled Date: {formatDateDisplay(state.selectedSchedule.scheduledDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Reason: {state.selectedSchedule.reason}
              </Typography>
              
              <TextField
                margin="normal"
                fullWidth
                label="Labor Hours"
                name="laborHours"
                type="number"
                value={invoiceData.laborHours}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.5 }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                fullWidth
                label="Total Cost"
                name="totalCost"
                type="number"
                value={invoiceData.totalCost}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Parts Used
              </Typography>
              
              {invoiceData.partsUsed.map((part, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TextField
                    label="Part Name"
                    value={part.partName}
                    onChange={(e) => handlePartChange(index, 'partName', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Quantity"
                    type="number"
                    value={part.quantity}
                    onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 100 }}
                  />
                  <TextField
                    label="Unit Price"
                    type="number"
                    value={part.unitPrice}
                    onChange={(e) => handlePartChange(index, 'unitPrice', e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 120 }}
                  />
                  <Button 
                    color="error" 
                    onClick={() => removePartRow(index)}
                    disabled={invoiceData.partsUsed.length === 1}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              
              <Button 
                variant="outlined" 
                onClick={addPartRow}
                sx={{ mt: 1 }}
              >
                Add Another Part
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={state.submitting}
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={state.submitting || !invoiceData.laborHours || !invoiceData.totalCost}
            endIcon={state.submitting ? <CircularProgress size={20} /> : null}
          >
            {state.submitting ? 'Submitting...' : 'Complete with Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceSchedules;