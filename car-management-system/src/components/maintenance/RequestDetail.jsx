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
  History as HistoryIcon,
  MonetizationOn as MonetizationOnIcon
} from '@mui/icons-material';
import CostDeliberationBadge from './CostDeliberationBadge';
import CostDeliberationModal from './CostDeliberationModal';
import DocumentUpload from '../new components/DocumentUpload';

const RequestDetail = ({ requestId, onBack, showNotification, setLoading }) => {
  const [request, setRequest] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [processStageDialog, setProcessStageDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  // COST DELIBERATION STATE
  const [costDeliberationModalOpen, setCostDeliberationModalOpen] = useState(false);

  // DOCUMENT STATE
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchRequestDetails();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/MaintenanceRequest/${requestId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProcessStage = (action) => {
    setCurrentAction(action);
    setProcessStageDialog(true);
  };

  const submitProcessStage = async () => {
    try {
      setProcessing(true);
      const authData = localStorage.getItem('authData');
      if (!authData) throw new Error('No authentication data found');
      
      const { token, userId: authUserId } = JSON.parse(authData);
      const userId = authUserId || localStorage.getItem('userId');

      // Check if cost deliberation is required for Review stage
      if (request?.currentStage === 'Review') {
        const canProcessResponse = await fetch(`/api/MaintenanceRequest/${requestId}/can-process-review`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!canProcessResponse.ok) {
          const errorData = await canProcessResponse.json();
          showNotification(errorData.reason || 'Cost deliberation must be completed before processing Review stage', 'error');
          setProcessing(false);
          
          // Highlight the cost deliberation section if cost deliberation is required
          if (errorData.reason?.toLowerCase().includes('cost deliberation')) {
            // Close the process stage dialog first
            setProcessStageDialog(false);
            setComments('');
            
            // Then highlight the cost deliberation section
            setTimeout(() => {
              highlightCostDeliberationCard();
            }, 300); // Small delay to allow dialog to close smoothly
          }
          
          return;
        }
      }

      await fetch(`/api/MaintenanceRequest/${requestId}/process-stage?userId=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comments: comments
        })
      });

      showNotification('Stage processed successfully');
      fetchRequestDetails();
    } catch (error) {
      showNotification('Failed to process stage', 'error');
    } finally {
      setLoading(false);
      setProcessStageDialog(false);
      setComments('');
    }
  };

  // COST DELIBERATION HANDLERS
  const handleOpenCostDeliberation = () => {
    setCostDeliberationModalOpen(true);
  };

  const highlightCostDeliberationCard = () => {
    // Find the cost deliberation section in the RequestDetail component
    const costDeliberationSection = document.querySelector('[data-section="cost-deliberation"]');
    if (costDeliberationSection) {
      // Scroll to the section
      costDeliberationSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
      
      // Add highlight effect
      costDeliberationSection.style.animation = 'costDeliberationHighlight 2s ease-in-out';
      
      // Remove animation after it completes
      setTimeout(() => {
        costDeliberationSection.style.animation = '';
      }, 2000);
    }
  };

  const handleCloseCostDeliberation = () => {
    setCostDeliberationModalOpen(false);
  };

  const handleCostUpdated = async () => {
    // Refresh request details to show updated cost information
    await fetchRequestDetails();
    showNotification('Cost deliberation updated successfully', 'success');
  };

  // DOCUMENT HANDLERS
  const handleDocumentUpload = async () => {
    await fetchDocuments();
    showNotification('Document uploaded successfully', 'success');
  };

  const handleDocumentDownload = async (documentId, fileName) => {
    try {
      const response = await fetch(`/api/MaintenanceRequest/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        showNotification('Failed to download document', 'error');
      }
    } catch (error) {
      showNotification('Failed to download document', 'error');
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
                
                {/* COST DELIBERATION SECTION */}
                <Box 
                  data-section="cost-deliberation"
                  sx={{ 
                    mt: 2,
                    '@keyframes costDeliberationHighlight': {
                      '0%': {
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(255, 193, 7, 0.7)',
                        borderColor: '#ffc107'
                      },
                      '50%': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 0 0 10px rgba(255, 193, 7, 0.3)',
                        borderColor: '#ff9800'
                      },
                      '100%': {
                        transform: 'scale(1)',
                        boxShadow: '0 0 0 0 rgba(255, 193, 7, 0)',
                        borderColor: 'divider'
                      }
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Cost Deliberation
                  </Typography>
                  
                  {request.costDeliberationStatus ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CostDeliberationBadge
                        status={request.costDeliberationStatus}
                        proposedCost={request.proposedCost}
                        negotiatedCost={request.negotiatedCost}
                        finalCost={request.finalCost}
                        onClick={request.currentStage === 'Review' ? handleOpenCostDeliberation : undefined}
                        showAmount={true}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No cost deliberation started
                    </Typography>
                  )}
                  
                  {request.currentStage === 'Review' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleOpenCostDeliberation}
                      startIcon={<MonetizationOnIcon />}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        height: 32,
                        px: 2,
                        py: 0.5,
                        borderRadius: '6px',
                        textTransform: 'none',
                        letterSpacing: '0.3px',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                        },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {request.costDeliberationStatus ? 'Manage Cost Deliberation' : 'Start Cost Deliberation'}
                    </Button>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1">Admin Comments</Typography>
                <Typography sx={{ mt: 1 }}>{request.adminComments || 'No comments'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Documents</Typography>
                <DocumentUpload
                  requestId={requestId}
                  userId={userId}
                  token={token}
                  documents={documents}
                  onDocumentUpload={handleDocumentUpload}
                  onDocumentDownload={handleDocumentDownload}
                />
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

      {/* PROCESS STAGE DIALOG */}
      <Dialog open={processStageDialog} onClose={() => setProcessStageDialog(false)}>
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
          <Button onClick={() => setProcessStageDialog(false)}>Cancel</Button>
          <Button onClick={submitProcessStage} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* COST DELIBERATION MODAL */}
      <CostDeliberationModal
        open={costDeliberationModalOpen}
        onClose={handleCloseCostDeliberation}
        requestId={requestId}
        currentStage={request?.currentStage}
        currentUserId={userId}
        onCostUpdated={handleCostUpdated}
      />
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