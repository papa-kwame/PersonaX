import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  DirectionsCar as DirectionsCarIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import ApprovalCard from './ApprovalCard';

const statusIcons = {
  approved: <CheckCircleIcon color="success" />,
  in_progress: <BuildIcon color="warning" />,
  completed: <CheckCircleIcon color="success" />
};

const RepairTrackingDashboard = ({ requests, onStartRepair, onCompleteRepair }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Repair Tracking Dashboard
      </Typography>
      
      {requests.length === 0 ? (
        <Alert severity="info">No repair requests found</Alert>
      ) : (
        <Box>
          {requests.map(request => (
            <Paper key={request.id} sx={{ p: 2, mb: 3 }}>
              <ApprovalCard request={request} showActions={false} />
              
              <Box sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 1, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Approval Progress</Typography>
                
                {request.requiredApprovers && request.requiredApprovers.length > 0 ? (
                  <List>
                    {request.requiredApprovers.map((approver, index) => (
                      <React.Fragment key={approver.name}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={approver.name} 
                            secondary={
                              <Chip 
                                label={approver.approved ? 'Approved' : 'Pending'} 
                                size="small" 
                                color={approver.approved ? 'success' : 'default'}
                              />
                            }
                          />
                        </ListItem>
                        {index < request.requiredApprovers.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No approvers assigned.
                  </Typography>
                )}
              </Box>

              {request.status === 'approved' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="warning"
                    startIcon={<BuildIcon />}
                    onClick={() => onStartRepair(request.id)}
                  >
                    Start Repair
                  </Button>
                </Box>
              )}

              {request.status === 'in_progress' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => {
                      const notes = prompt('Enter completion notes:');
                      if (notes) onCompleteRepair(request.id, notes);
                    }}
                  >
                    Complete Repair
                  </Button>
                </Box>
              )}

              {request.status === 'completed' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Repair Completed</Typography>
                  <Typography variant="body2">{request.completionNotes}</Typography>
                </Alert>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RepairTrackingDashboard;