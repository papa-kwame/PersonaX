import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Grid,
  Stack,
  Divider
} from '@mui/material';
import ApprovalCard from './ApprovalCard';

const FinanceApprovalDashboard = ({ requests, onApprove, onReject }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 600 }}>
        Finance Approval Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {requests.length === 0
          ? 'No pending requests currently.'
          : `${requests.length} pending ${requests.length === 1 ? 'quote' : 'quotes'} for approval`}
      </Typography>

      {requests.length === 0 ? (
        <Alert severity="info" sx={{ maxWidth: 600 }}>No pending quotes for approval</Alert>
      ) : (
        <Stack spacing={4}>
          {requests.map((request) => (
            <Paper
              key={request.id}
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: 'white',
                boxShadow: '0 3px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Stack spacing={2}>
                <ApprovalCard request={request} showActions={false} />

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                    Quote Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Vendor:</strong> {request.quote?.submittedBy || '—'}</Typography>
                      <Typography><strong>Labor:</strong> ${request.quote?.laborCost?.toFixed(2) || '0.00'}</Typography>
                      <Typography><strong>Parts:</strong> ${request.quote?.partsCost?.toFixed(2) || '0.00'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography><strong>Total:</strong> ${request.quote?.totalCost?.toFixed(2) || '0.00'}</Typography>
                      <Typography><strong>Est. Time:</strong> {request.quote?.estimatedTime || '—'}</Typography>
                      <Typography><strong>Notes:</strong> {request.quote?.notes || '—'}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="large"
                    color="success"
                    onClick={() => onApprove(request.id)}
                  >
                    ✅ Approve
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="error"
                    onClick={() => {
                      const reason = prompt('Please enter rejection reason:');
                      if (reason) onReject(request.id, reason);
                    }}
                  >
                    ❌ Reject
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default FinanceApprovalDashboard;
