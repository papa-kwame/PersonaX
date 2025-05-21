import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TextField, Button, Container, Typography, Box, Alert, Grid } from '@mui/material';
import { DatePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import api from '../../services/api';

export default function RequestForm() {
  const { isAuthenticated, userId } = useAuth();
  const [formData, setFormData] = useState({
    reason: '',
    startDate: null,
    endDate: null
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('User ID:', userId);
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setMessage({ text: 'You must be logged in to submit a request', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    // Validate dates
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setMessage({ text: 'End date must be after start date', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        reason: formData.reason,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString()
      };

      // Debugging log to check the payload and userId
      console.log('Submitting payload:', payload);
      console.log('User ID in submit:', userId);

      await api.post(`/api/VehicleRequest?userId=${userId}`, payload);
      setMessage({ text: 'Request submitted successfully!', type: 'success' });
      setFormData({ reason: '', startDate: null, endDate: null });

      // Redirect to requests list after 2 seconds
      setTimeout(() => navigate('/requests'), 2000);
    } catch (err) {
      setMessage({ text: `Error: ${err.response?.data?.message || err.message}`, type: 'error' });
      console.error('Submission error:', err.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Vehicle Request Form
        </Typography>
        <Typography variant="body1" gutterBottom align="center">
          Fill out the form to request a vehicle
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Request"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange(date, 'startDate')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange(date, 'endDate')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={formData.startDate || new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
