import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Chip, 
  Avatar, 
  Divider, 
  Box,
  Button,
  Paper,Grid
} from '@mui/material';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

const statusColors = {
  pending_hr: 'info',
  pending_mechanic: 'warning',
  pending_finance: 'secondary',
  pending_manager: 'primary',
  approved: 'success',
  rejected: 'error',
  in_progress: 'warning',
  completed: 'success',
  rejected_by_finance: 'error',
  needs_revision: 'info'
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

const ApprovalCard = ({ 
  request, 
  showActions = false, 
  onApprove, 
  onReject,
  showQuoteButton = false,
  onSelectForQuote
}) => {
  const formattedDate = format(new Date(request.createdAt), 'PPpp');

  return (
    <StyledCard>
      <CardHeader
        title={`Repair Request #${request.id}`}
        action={
          <Chip 
            label={request.status.replace(/_/g, ' ')}
            color={statusColors[request.status] || 'default'}
            variant="outlined"
          />
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Vehicle ID:</strong> {request.vehicleId}
            </Typography>
            <Typography variant="body1">
              <strong>Submitted:</strong> {formattedDate}
            </Typography>
            <Typography variant="body1">
              <strong>Urgency:</strong> 
              <Chip 
                label={request.urgency} 
                size="small" 
                sx={{ ml: 1 }}
                color={
                  request.urgency === 'critical' ? 'error' :
                  request.urgency === 'high' ? 'warning' :
                  request.urgency === 'medium' ? 'info' : 'default'
                }
              />
            </Typography>
            <Typography variant="body1">
              <strong>Submitted By:</strong> {request.submittedBy}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>Department:</strong> {request.department}
            </Typography>
            <Typography variant="body1">
              <strong>Mileage:</strong> {request.mileage}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Typography variant="subtitle2">Issue Description</Typography>
              <Typography variant="body2">{request.issueDescription}</Typography>
            </Paper>
          </Grid>

          {request.rejectionReason && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'error.light' }}>
                <Typography variant="subtitle2" color="error">Rejection Reason</Typography>
                <Typography variant="body2">{request.rejectionReason}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {showActions && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              color="success" 
              sx={{ mr: 2 }}
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={onReject}
            >
              Reject
            </Button>
          </Box>
        )}

        {showQuoteButton && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => onSelectForQuote(request)}
            >
              Provide Quote
            </Button>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default ApprovalCard;