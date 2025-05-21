import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  Button
} from '@mui/material';
import ApprovalCard from './ApprovalCard';

const HRApprovalDashboard = ({ requests, onApprove, onReject, onSelectForQuote }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        HR Approval Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Pending Requests: {requests.length}
      </Typography>
      
      {requests.length === 0 ? (
        <Alert severity="info">No pending requests</Alert>
      ) : (
        <Box>
          {requests.map(request => (
            <ApprovalCard
              key={request.id}
              request={request}
              onApprove={() => onApprove(request.id)}
              onReject={() => {
                const reason = prompt('Please enter rejection reason:');
                if (reason) onReject(request.id, reason);
              }}
              showQuoteButton={true}
              onSelectForQuote={onSelectForQuote}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HRApprovalDashboard;