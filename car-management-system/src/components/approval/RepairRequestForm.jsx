import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Typography, 
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const RepairRequestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    issueDescription: '',
    urgency: 'medium',
    department: 'Sales',
    mileage: '',
    attachments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      vehicleId: '',
      issueDescription: '',
      urgency: 'medium',
      department: 'Sales',
      mileage: '',
      attachments: []
    });
  };

  return (
    <StyledPaper elevation={2}>
      <Typography variant="h5" gutterBottom>
        New Repair Request
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vehicle ID"
              variant="outlined"
              value={formData.vehicleId}
              onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              required
              placeholder="e.g., VH-2023-001"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Current Mileage"
              variant="outlined"
              value={formData.mileage}
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              placeholder="e.g., 45,230 miles"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                label="Department"
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Operations">Operations</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Executive">Executive</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Urgency</InputLabel>
              <Select
                value={formData.urgency}
                label="Urgency"
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical (Vehicle Undrivable)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Issue Description"
              variant="outlined"
              value={formData.issueDescription}
              onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
              required
              placeholder="Describe the issue in detail..."
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              sx={{ mr: 2 }}
            >
              Upload Attachments
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => setFormData({...formData, attachments: [...e.target.files]})}
              />
            </Button>
            {formData.attachments.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {formData.attachments.length} file(s) selected
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
              >
                Submit Request
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );
};

export default RepairRequestForm;