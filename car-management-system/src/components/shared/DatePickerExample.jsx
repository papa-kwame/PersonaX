import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Alert,
  Chip
} from '@mui/material';
import ModernDatePicker from './ModernDatePicker';

// Example of how to integrate the ModernDatePicker into your existing forms
const DatePickerExample = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [birthDate, setBirthDate] = useState(null);

  const handleSubmit = () => {
    };

  const isFormValid = startDate && endDate && birthDate;

  return (
    <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
        Date Picker Integration Example
      </Typography>

      <Stack spacing={3}>
        <ModernDatePicker
          value={startDate}
          onChange={setStartDate}
          label="Start Date"
          placeholder="Select start date"
          helperText="Choose when the project begins"
        />

        <ModernDatePicker
          value={endDate}
          onChange={setEndDate}
          label="End Date"
          placeholder="Select end date"
          minDate={startDate || new Date()}
          helperText="Must be after start date"
        />

        <ModernDatePicker
          value={birthDate}
          onChange={setBirthDate}
          label="Birth Date"
          placeholder="Select your birth date"
          maxDate={new Date()}
          helperText="Select your date of birth"
        />

        {startDate && endDate && startDate > endDate && (
          <Alert severity="error">
            End date must be after start date
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {startDate && (
            <Chip 
              label={`Start: ${startDate.toLocaleDateString()}`} 
              color="primary" 
              variant="outlined" 
            />
          )}
          {endDate && (
            <Chip 
              label={`End: ${endDate.toLocaleDateString()}`} 
              color="secondary" 
              variant="outlined" 
            />
          )}
          {birthDate && (
            <Chip 
              label={`Birth: ${birthDate.toLocaleDateString()}`} 
              color="success" 
              variant="outlined" 
            />
          )}
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!isFormValid}
          sx={{ 
            borderRadius: 2, 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Submit Form
        </Button>
      </Stack>
    </Paper>
  );
};

export default DatePickerExample;


