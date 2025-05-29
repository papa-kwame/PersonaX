import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Configure axios with the correct base URL and headers
const api = axios.create({
  baseURL: 'https://localhost:7092/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  withCredentials: true
});

const VehicleRequestForm = () => {
  const { userId } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    requestReason: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/Vehicles'); // Use the same endpoint as in the Dashboard component
        setVehicles(response.data);
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        enqueueSnackbar('Failed to load vehicles', { variant: 'error' });
      }
    };

    fetchVehicles();
  }, [enqueueSnackbar]);

  const availableVehicles = Array.isArray(vehicles)
    ? vehicles.filter(vehicle => {
        return !vehicle?.userId;
      })
    : [];


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setFormData({ vehicleId: '', requestReason: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!userId) throw new Error('User not authenticated');

      const payload = {
        userId,
        vehicleId: formData.vehicleId,
        requestReason: formData.requestReason
      };

      const response = await api.post('VehicleAssignment/RequestVehicle', payload);
      enqueueSnackbar(response.data?.message || 'Vehicle request submitted successfully', {
        variant: 'success'
      });
      handleClose();
    } catch (err) {
      console.error('Request failed:', err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Failed to submit request';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
          style={{
                      background: '#4caf50',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '0.575rem'
                    }}
      >
        Request Vehicle
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth        
      style={{
                      background: 'transparent',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '0.575rem',
                      borderRadius: '122px'
                    }}
      >
        <DialogTitle>Request Vehicle Assignment</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="vehicle-select-label">Vehicle</InputLabel>
              <Select
                labelId="vehicle-select-label"
                id="vehicleId"
                name="vehicleId"
                value={formData.vehicleId}
                label="Vehicle"
                onChange={handleChange}
                disabled={availableVehicles.length === 0}
              >
                <MenuItem value="">
                  <em>{availableVehicles.length === 0 ? 'No vehicles available' : 'Select a vehicle'}</em>
                </MenuItem>
                {availableVehicles.map(vehicle => (
                  <MenuItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              required
              multiline
              rows={4}
              label="Request Reason"
              name="requestReason"
              value={formData.requestReason}
              onChange={handleChange}
              placeholder="Explain why you need this vehicle..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !formData.vehicleId || !formData.requestReason}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default VehicleRequestForm;
