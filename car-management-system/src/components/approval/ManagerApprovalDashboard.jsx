import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  Button,
  Grid
} from '@mui/material';
import ApprovalCard from './ApprovalCard';

const ManagerApprovalDashboard = ({ requests, onApprove, onReject }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manager Final Approval
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Pending Approvals: {requests.length}
      </Typography>
      
      {requests.length === 0 ? (
        <Alert severity="info">No pending approvals</Alert>
      ) : (
        <Box>
          {requests.map(request => (
            <Paper key={request.id} sx={{ p: 2, mb: 3 }}>
              <ApprovalCard 
                request={request} 
                showActions={false}
              />
              
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Financial Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Total Cost:</strong> ${request.quote?.totalCost?.toFixed(2)}</Typography>
                    <Typography><strong>Department Budget:</strong> {request.department}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Finance Approval:</strong> {request.financeReview?.reviewedBy}</Typography>
                    <Typography><strong>Finance Notes:</strong> {request.financeReview?.notes}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  sx={{ mr: 2 }}
                  onClick={() => onApprove(request.id)}
                >
                  Final Approval
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => {
                    const reason = prompt('Please enter requested changes:');
                    if (reason) onReject(request.id, reason);
                  }}
                >
                  Request Changes
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ManagerApprovalDashboard;