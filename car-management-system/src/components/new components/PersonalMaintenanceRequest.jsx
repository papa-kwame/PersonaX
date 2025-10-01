import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Paper, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const PersonalMaintenanceRequest = () => {
  const [formData, setFormData] = useState({
    department: '',
    requestType: '',
    description: '',
    priority: '',
    estimatedCost: '',
    adminComments: '',
  });

  const { userId, isAuthenticated } = useAuth();

  const handleChange = (e) => {
    setFormData({   
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !userId) return;

    try {
      const response = await axios.post(`/api/personal?userId=${userId}`, formData);
      } catch (error) {
      }
  };

  return (
    <Container maxWidth={false} sx={{ 
      maxWidth: '100% !important',
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Create Maintenance Request
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="department"
            label="Department"
            value={formData.department}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="requestType"
            label="Request Type"
            value={formData.requestType}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="priority"
            label="Priority"
            value={formData.priority}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="estimatedCost"
            label="Estimated Cost"
            value={formData.estimatedCost}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="adminComments"
            label="Admin Comments"
            value={formData.adminComments}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
            Submit
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PersonalMaintenanceRequest;
