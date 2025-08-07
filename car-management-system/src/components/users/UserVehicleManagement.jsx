import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiTruck as CarFrontIcon,
  FiMail as EnvelopeIcon,
  FiCheckCircle as ClipboardCheckIcon,
  FiPlus as PlusIcon,
  FiArrowRight as ArrowRightCircleIcon
} from 'react-icons/fi';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  styled
} from '@mui/material';
import CreatePersonalRequestModal from './CreatePersonalRequestModal'; // Import the modal component
import VehicleRequestForm from '../new components/VehicleRequestForm';

const API_URL = 'https://localhost:7092/api';

// Styled components with exact pixel measurements from original CSS
const UserVehicleManagementContainer = styled(Container)({
  maxWidth: '100% !important',
  padding: '20px',
  '@media (min-width: 1200px)': {
    maxWidth: '100% !important',
  },
});

const PageHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px' // 2rem
});

const StyledCard = styled(Card)({
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  marginBottom: '32px', // 2rem
  overflow: 'hidden'
});

const CardHeaderStyled = styled(CardHeader)({
  padding: '24px', // 1.5rem
  borderBottom: '1px solid #eee',
  '& .MuiCardHeader-avatar': {
    marginRight: '12px' // 0.75rem
  }
});

const EmptyState = styled(Box)({
  textAlign: 'center',
  padding: '48px 16px', // 3rem 1rem
  '& svg': {
    fontSize: '3rem',
    color: '#999',
    marginBottom: '16px' // 1rem
  }
});

const VehiclesGrid = styled(Grid)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '24px' // 1.5rem
});

const VehicleCard = styled(Paper)({
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)'
  }
});

const VehicleCardContent = styled(Box)({
  display: 'flex',
  padding: '24px' // 1.5rem
});

const VehicleIconContainer = styled(Box)({
  marginRight: '16px' // 1rem
});

const VehicleIcon = styled(Box)({
  width: '48px',
  height: '48px',
  background: '#3f51b5',
  color: 'white',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem'
});

const VehicleFooter = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const StatusChip = styled(Chip)(({ status }) => {
  const statusStyles = {
    assigned: { background: '#e8f5e9', color: '#2e7d32' },
    approved: { background: '#e8f5e9', color: '#2e7d32' },
    pending: { background: '#fff8e1', color: '#ff8f00' },
    rejected: { background: '#ffebee', color: '#c62828' }
  };

  return {
    ...statusStyles[status],
    fontSize: '0.75rem',
    fontWeight: 500,
    height: '24px'
  };
});

const RequestReasonTextarea = styled(TextField)({
  width: '100%',
  padding: '16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  minHeight: '120px',
  fontFamily: 'inherit',
  margin: '24px' // 1.5rem
});

const UserVehicleManagement = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    vehicles: [],
    userRequests: [],
    vehicleRequests: [], // New state for vehicle requests
    showRequestModal: false,
    showRequestsModal: false,
    showCreateRequestModal: false,
    showMyRequestsModal: false,
    showVehicleRequestsModal: false, // New state for vehicle requests modal
    formData: { requestReason: '', department: '' },
    error: null
  });

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const [vehiclesRes, requestsRes, vehicleRequestsRes] = await Promise.all([
        api.get(`/VehicleAssignment/ByUser/${userId}`),
        api.get(`/MaintenanceRequest/my-requests?userId=${userId}`),
        api.get(`/VehicleAssignment/MyVehicleRequests/${userId}`)
      ]);

      setState(prev => ({
        ...prev,
        vehicles: vehiclesRes.data,
        userRequests: requestsRes.data,
        vehicleRequests: vehicleRequestsRes.data, 
        loading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err.response?.data?.message || err.message, loading: false }));
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleRequestVehicle = async () => {
    try {
      const { requestReason, department } = state.formData;
      if (!requestReason || !department) {
        toast.warning('Please provide a reason and select a department');
        return;
      }

      await api.post('/VehicleAssignment/RequestVehicle', {
        userId,
        requestReason,
        department
      });

      toast.success('Vehicle request submitted successfully');
      setState(prev => ({
        ...prev,
        showRequestModal: false,
        formData: { ...prev.formData, requestReason: '', department: '' }
      }));
      fetchData();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.title || 'Failed to submit request');
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, navigate]);

  const renderRequestModal = () => (
    <Dialog
      open={state.showRequestModal}
      onClose={() => setState(prev => ({ ...prev, showRequestModal: false }))}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '400px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <EnvelopeIcon style={{ marginRight: '12px', fontSize: '1.5rem', color: '#3f51b5' }} />
          <Typography variant="h6" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
            Request Vehicle
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <RequestReasonTextarea
          multiline
          rows={4}
          value={state.formData.requestReason}
          onChange={(e) => setState(prev => ({
            ...prev,
            formData: { ...prev.formData, requestReason: e.target.value }
          }))}
          placeholder="Explain why you need a vehicle..."
          variant="outlined"
        />
        <FormControl fullWidth style={{ margin: '24px' }}>
          <InputLabel id="department-label">Department</InputLabel>
          <Select
            labelId="department-label"
            value={state.formData.department}
            onChange={(e) => setState(prev => ({
              ...prev,
              formData: { ...prev.formData, department: e.target.value }
            }))}
            label="Department"
          >
            <MenuItem value="HR">Human Resources</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
            <MenuItem value="Operations">Operations</MenuItem>
            <MenuItem value="IT">Information Technology</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button
          onClick={() => setState(prev => ({ ...prev, showRequestModal: false }))}
          style={{
            background: 'transparent',
            color: '#3f51b5',
            border: '1px solid #3f51b5',
            padding: '8px 16px',
            fontSize: '0.875rem'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRequestVehicle}
          style={{
            background: '#3f51b5',
            color: 'white',
            padding: '8px 16px',
            fontSize: '0.875rem'
          }}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderRequestsModal = () => (
    <Dialog
      open={state.showRequestsModal}
      onClose={() => setState(prev => ({ ...prev, showRequestsModal: false }))}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '600px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ClipboardCheckIcon style={{ marginRight: '12px', fontSize: '1.5rem', color: '#3f51b5' }} />
          <Typography variant="h6" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
            Your Requests
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent style={{ padding: 0 }}>
        {state.userRequests.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead style={{ background: '#f9f9f9' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 600, color: '#333' }}>Request Date</TableCell>
                  <TableCell style={{ fontWeight: 600, color: '#333' }}>Status</TableCell>
                  <TableCell align="right" style={{ fontWeight: 600, color: '#333' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.userRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={request.status}
                        status={String(request.status).toLowerCase()}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        style={{
                          background: 'transparent',
                          color: '#3f51b5',
                          border: '1px solid #3f51b5',
                          padding: '4px 12px',
                          fontSize: '0.75rem'
                        }}
                        onClick={() => navigate(`/requests/${request.id}`)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No requests found
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button
          onClick={() => setState(prev => ({ ...prev, showRequestsModal: false }))}
          style={{
            background: 'transparent',
            color: '#3f51b5',
            border: '1px solid #3f51b5',
            padding: '8px 16px',
            fontSize: '0.875rem'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderMyRequestsModal = () => (
    <Dialog
      open={state.showMyRequestsModal}
      onClose={() => setState(prev => ({ ...prev, showMyRequestsModal: false }))}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '1000px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <ClipboardCheckIcon style={{ marginRight: '12px', fontSize: '1.5rem', color: '#3f51b5' }} />
          <Typography variant="h6" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
            My Requests
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {state.userRequests.length > 0 ? (
          <Grid container spacing={3}>
            {state.userRequests.map((request) => (
              <Grid item xs={12} key={request.id}>
                <Card style={{ marginBottom: '16px', padding: '16px' }}>
                  <CardContent>
                    <Typography variant="h6" style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#333' }}>
                      {request.vehicleMake} {request.vehicleModel}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      License Plate: {request.licensePlate}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Request Type: {request.requestType}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Description: {request.description}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Status: <StatusChip label={request.status} status={String(request.status).toLowerCase()} size="small" />
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Priority: {request.priority}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Estimated Cost: ${request.estimatedCost}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Department: {request.department}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Current Stage: {request.currentStage}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                      Route Name: {request.routeName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No requests found
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button
          onClick={() => setState(prev => ({ ...prev, showMyRequestsModal: false }))}
          style={{
            background: 'transparent',
            color: '#3f51b5',
            border: '1px solid #3f51b5',
            padding: '8px 16px',
            fontSize: '0.875rem'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderVehicleRequestsModal = () => (
    <Dialog
      open={state.showVehicleRequestsModal}
      onClose={() => setState(prev => ({ ...prev, showVehicleRequestsModal: false }))}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          maxWidth: '600px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <CarFrontIcon style={{ marginRight: '12px', fontSize: '1.5rem', color: '#3f51b5' }} />
          <Typography variant="h6" style={{ fontSize: '1.25rem', fontWeight: 600, color: '#333' }}>
            Your Vehicle Requests
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent style={{ padding: 0 }}>
        {state.vehicleRequests.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead style={{ background: '#f9f9f9' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 600, color: '#333' }}>Request Reason</TableCell>
                  <TableCell style={{ fontWeight: 600, color: '#333' }}>Request Date</TableCell>
                  <TableCell style={{ fontWeight: 600, color: '#333' }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 600, color: '#333' }}>Current Stage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {state.vehicleRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.requestReason}</TableCell>
                    <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={request.status}
                        status={String(request.status).toLowerCase()}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{request.currentStage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box py={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No vehicle requests found
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button
          onClick={() => setState(prev => ({ ...prev, showVehicleRequestsModal: false }))}
          style={{
            background: 'transparent',
            color: '#3f51b5',
            border: '1px solid #3f51b5',
            padding: '8px 16px',
            fontSize: '0.875rem'
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderAssignedVehicles = () => (
    <StyledCard>
      <CardHeaderStyled
        avatar={<CarFrontIcon style={{ fontSize: '1.5rem', color: '#3f51b5' }} />}
        title="Your Assigned Vehicles"
        titleTypographyProps={{
          variant: 'h6',
          style: { fontSize: '1.25rem', fontWeight: 600, color: '#333' }
        }}
      />
      <CardContent>
        {state.vehicles.length === 0 ? (
          <EmptyState>
            <CarFrontIcon />
            <Typography variant="h6" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#333' }}>
              No vehicles assigned
            </Typography>
            <Typography variant="body1" style={{ color: '#666', marginBottom: '24px' }}>
              You don't have any vehicles assigned to you currently
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlusIcon />}
              style={{
                background: '#3f51b5',
                color: 'white',
                padding: '8px 16px',
                fontSize: '0.875rem'
              }}
              onClick={() => setState(prev => ({ ...prev, showRequestModal: true }))}
            >
              Request a Vehicle
            </Button>
          </EmptyState>
        ) : (
          <VehiclesGrid container spacing={3}>
            {state.vehicles.map((vehicle) => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                <VehicleCard>
                  <VehicleCardContent>
                    <VehicleIconContainer>
                      <VehicleIcon>
                        <CarFrontIcon />
                      </VehicleIcon>
                    </VehicleIconContainer>
                    <Box flexGrow={1}>
                      <Typography variant="h6" style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#333' }}>
                        {vehicle.make} {vehicle.model}
                      </Typography>
                      <Typography variant="body2" style={{ color: '#666', fontSize: '0.9rem', marginBottom: '12px' }}>
                        {vehicle.licensePlate}
                      </Typography>
                      <VehicleFooter>
                        <StatusChip label="Assigned" status="assigned" />
                        <Button
                          size="small"
                          endIcon={<ArrowRightCircleIcon />}
                          style={{
                            background: 'transparent',
                            color: '#3f51b5',
                            border: '1px solid #3f51b5',
                            padding: '4px 12px',
                            fontSize: '0.75rem'
                          }}
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          Details
                        </Button>
                      </VehicleFooter>
                    </Box>
                  </VehicleCardContent>
                </VehicleCard>
              </Grid>
            ))}
          </VehiclesGrid>
        )}
      </CardContent>
    </StyledCard>
  );

  if (state.loading) return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="200px">
      <CircularProgress style={{ width: '40px', height: '40px', borderWidth: '4px', marginBottom: '16px' }} />
      <Typography variant="body1">Loading your vehicle information...</Typography>
    </Box>
  );

  if (state.error) return (
    <Box p={3}>
      <Paper elevation={0} style={{
        background: '#ffebee',
        color: '#c62828',
        padding: '16px',
        border: '1px solid #ef9a9a',
        borderRadius: '4px'
      }}>
        <Typography variant="h6" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
          Error loading data
        </Typography>
        <Typography variant="body1">
          {state.error}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <UserVehicleManagementContainer maxWidth={false}>
      <PageHeader>
        <Typography variant="h4" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#333' }}>
          Vehicles
        </Typography>
        <Box display="flex" gap="16px">
          <VehicleRequestForm      style={{
              background: '#4caf50',
              color: 'white',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}/>
          <Button
            variant="contained"
            startIcon={<PlusIcon />}
            style={{
              background: '#4caf50',
              color: 'white',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}
            onClick={() => setState(prev => ({ ...prev, showCreateRequestModal: true }))}
          >
            Create Request
          </Button>
          <Button
            variant="outlined"
            style={{
              background: 'transparent',
              color: '#3f51b5',
              border: '1px solid #3f51b5',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}
            onClick={() => setState(prev => ({ ...prev, showMyRequestsModal: true }))}
          >
            My Requests
          </Button>
          <Button
            variant="outlined"
            startIcon={<CarFrontIcon />}
            style={{
              background: 'transparent',
              color: '#3f51b5',
              border: '1px solid #3f51b5',
              padding: '8px 16px',
              fontSize: '0.875rem'
            }}
            onClick={() => setState(prev => ({ ...prev, showVehicleRequestsModal: true }))}
          >
            Vehicle Requests
          </Button>
        </Box>
      </PageHeader>

      {renderAssignedVehicles()}
      {renderRequestModal()}
      {renderRequestsModal()}
      {renderMyRequestsModal()}
      {renderVehicleRequestsModal()}
      <CreatePersonalRequestModal
        open={state.showCreateRequestModal}
        onClose={() => setState(prev => ({ ...prev, showCreateRequestModal: false }))}
      />
    </UserVehicleManagementContainer>
  );
};

export default UserVehicleManagement;
