import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material';

const CreateRequest = ({ showNotification, setLoading }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    department: '',
    requestType: 'Repair',
    description: '',
    priority: 'Medium',
    estimatedCost: 0,
    adminComments: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const requestTypes = ['Repair', 'Maintenance', 'Inspection', 'Upgrade'];
  const priorities = ['Low', 'Medium', 'High'];

  useEffect(() => {
    fetchVehicles();
    fetchDepartments();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/Vehicles'); // You'll need to implement this endpoint
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/Departments'); // You'll need to implement this endpoint
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/MaintenanceRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create request');
      const data = await response.json();
      showNotification(`Request created successfully. ID: ${data.requestId}`);
      setFormData({
        vehicleId: '',
        department: '',
        requestType: 'Repair',
        description: '',
        priority: 'Medium',
        estimatedCost: 0,
        adminComments: ''
      });
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Create New Maintenance Request</Typography>
      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Vehicle"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Request Type"
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              required
            >
              {requestTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              {priorities.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Estimated Cost"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Admin Comments"
              name="adminComments"
              value={formData.adminComments}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" size="large">
              Submit Request
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateRequest;