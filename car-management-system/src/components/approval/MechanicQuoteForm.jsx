import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const MechanicQuoteForm = ({ request, onSubmit, onCancel }) => {
  const [quoteData, setQuoteData] = useState({
    laborCost: '',
    partsCost: '',
    estimatedTime: '',
    notes: '',
    submittedBy: 'Auto Repair Center'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalCost = parseFloat(quoteData.laborCost || 0) + parseFloat(quoteData.partsCost || 0);
    onSubmit({
      ...quoteData,
      laborCost: parseFloat(quoteData.laborCost),
      partsCost: parseFloat(quoteData.partsCost),
      totalCost,
      submittedAt: new Date().toISOString()
    });
  };

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" gutterBottom>
        Provide Repair Quote
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Request #{request.id}
      </Typography>
      <Divider sx={{ my: 2 }} />
      
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>Vehicle Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography><strong>Vehicle ID:</strong> {request.vehicleId}</Typography>
            <Typography><strong>Issue:</strong> {request.issueDescription}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography><strong>Urgency:</strong> {request.urgency}</Typography>
            <Typography><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Labor Cost ($)"
              variant="outlined"
              type="number"
              value={quoteData.laborCost}
              onChange={(e) => setQuoteData({...quoteData, laborCost: e.target.value})}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Parts Cost ($)"
              variant="outlined"
              type="number"
              value={quoteData.partsCost}
              onChange={(e) => setQuoteData({...quoteData, partsCost: e.target.value})}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Estimated Repair Time"
              variant="outlined"
              value={quoteData.estimatedTime}
              onChange={(e) => setQuoteData({...quoteData, estimatedTime: e.target.value})}
              required
              placeholder="e.g., 2 hours, 1 day"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Your Shop Name"
              variant="outlined"
              value={quoteData.submittedBy}
              onChange={(e) => setQuoteData({...quoteData, submittedBy: e.target.value})}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Notes"
              variant="outlined"
              value={quoteData.notes}
              onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                sx={{ mr: 2 }}
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
              >
                Submit Quote
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );
};

export default MechanicQuoteForm;