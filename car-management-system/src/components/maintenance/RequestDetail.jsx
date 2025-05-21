import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Comment as CommentIcon,
  RateReview as ReviewIcon,
  Commit as CommitIcon,
  HowToReg as ApproveIcon,
  DirectionsCar as VehicleIcon,
  Person as PersonIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const RequestDetail = ({ requestId, onBack, showNotification, setLoading }) => {
  const [request, setRequest] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [comments, setComments] = useState('');
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/MaintenanceRequest/${requestId}`);
      if (!response.ok) throw new Error('Failed to fetch request details');
      const data = await response.json();
      setRequest(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProcessStage = (action) => {
    setCurrentAction(action);
    setProcessDialogOpen(true);
  };

  const submitProcessStage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/MaintenanceRequest/${requestId}/process-stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });
      if (!response.ok) throw new Error('Failed to process stage');
      showNotification('Stage processed successfully');
      fetchRequestDetails();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
      setProcessDialogOpen(false);
      setComments('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'Comment': return <CommentIcon />;
      case 'Review': return <ReviewIcon />;
      case 'Commit': return <CommitIcon />;
      case 'Approve': return <ApproveIcon />;
      default: return <CheckIcon />;
    }
  };

  if (!request) return <CircularProgress />;

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to List
      </Button>

      <Typography variant="h5" gutterBottom>
        Maintenance Request: {request.id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Vehicle Information</Typography>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <VehicleIcon color="action" sx={{ mr: 1 }} />
                  <Typography>
                    {request.vehicleMake} {request.vehicleModel} ({request.licensePlate})
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Request Information</Typography>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <Typography sx={{ mr: 2 }}>
                    <strong>Type:</strong> {request.requestType}
                  </Typography>
                  <Chip label={request.status} color={getStatusColor(request.status)} size="small" />
                </Box>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <Typography sx={{ mr: 2 }}>
                    <strong>Priority:</strong>
                  </Typography>
                  <Chip label={request.priority} color={getPriorityColor(request.priority)} size="small" />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Description</Typography>
                <Typography sx={{ mt: 1 }}>{request.description}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Requested By</Typography>
                <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                  <PersonIcon color="action" sx={{ mr: 1 }} />
                  <Typography>{request.requestedByUserName}</Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Department:</strong> {request.department}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Date:</strong> {new Date(request.requestDate).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1">Financial Information</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Estimated Cost:</strong> ${request.estimatedCost}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Admin Comments</Typography>
                <Typography sx={{ mt: 1 }}>{request.adminComments || 'No comments'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Workflow Status" icon={<HistoryIcon />} iconPosition="start" />
              <Tab label="Transactions" icon={<CheckIcon />} iconPosition="start" />
              <Tab label="Route Users" icon={<PersonIcon />} iconPosition="start" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <WorkflowStatus requestId={requestId} showNotification={showNotification} />
              )}
              {activeTab === 1 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Transaction History</Typography>
                  <List>
                    {request.transactions.map((transaction) => (
                      <ListItem key={transaction.id}>
                        <ListItemAvatar>
                          <Avatar>
                            {getStageIcon(transaction.action)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${transaction.userName} - ${transaction.action}`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {new Date(transaction.timestamp).toLocaleString()}
                              </Typography>
                              {transaction.comments && ` - ${transaction.comments}`}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Approval Route</Typography>
                  <List>
                    {request.routeUsers.map((user) => (
                      <ListItem key={user.userId}>
                        <ListItemText
                          primary={user.userId}
                          secondary={`Role: ${user.role}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Current Stage" />
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                  {getStageIcon(request.currentStage)}
                </Avatar>
                <Typography variant="h6" gutterBottom>{request.currentStage}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {request.routeName}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {request.status === 'Pending' && (
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Process Current Stage</Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                startIcon={getStageIcon(request.currentStage)}
                onClick={() => handleProcessStage(request.currentStage)}
              >
                {request.currentStage}
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={processDialogOpen} onClose={() => setProcessDialogOpen(false)}>
        <DialogTitle>Process {currentAction}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comments"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitProcessStage} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const WorkflowStatus = ({ requestId, showNotification }) => {
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowStatus();
  }, [requestId]);

  const fetchWorkflowStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/MaintenanceRequest/${requestId}/workflow-status`);
      if (!response.ok) throw new Error('Failed to fetch workflow status');
      const data = await response.json();
      setWorkflowStatus(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (!workflowStatus) return <Typography>No workflow data available</Typography>;

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Current Stage: {workflowStatus.currentStage}</Typography>
      
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Completed Actions</Typography>
      {Object.entries(workflowStatus.completedActions).map(([action, transactions]) => (
        <Box key={action} sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{action}</Typography>
          <List dense>
            {transactions.map((transaction, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={transaction.userName}
                  secondary={`${new Date(transaction.timestamp).toLocaleString()} - ${transaction.comments}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}

      <Typography variant="subtitle2" sx={{ mt: 2 }}>Pending Actions</Typography>
      {workflowStatus.pendingActions.map((action, idx) => (
        <Box key={idx} sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2" color={action.isPending ? 'error' : 'text.secondary'}>
            {action.Role} - {action.UserName} {action.isPending ? '(Pending)' : ''}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default RequestDetail;