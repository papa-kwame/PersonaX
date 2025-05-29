import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  CircularProgress,
  Pagination,
  Alert,
  Stack,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme
} from '@mui/material';
import {
  DirectionsCarFilledOutlined as CarIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AddCircle as AddIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  PendingActions as PendingActionsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  DirectionsCar as DirectionsCarIcon,
  Email as EmailIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  LocalGasStation as LocalGasStationIcon,
  ColorLens as ColorLensIcon,
  CalendarToday as CalendarTodayIcon,
  Engineering as EngineeringIcon,
  Receipt as ReceiptIcon,
  Money as MoneyIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';

const Assignment = () => {
  const theme = useTheme();
  const { vehicleId, userId, view } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: true,
    activeTab: view === 'history' ? 'history' : 'current',
    currentAssignments: [],
    allAssignments: [],
    users: [],
    vehicles: [],
    assignmentHistory: [],
    vehicleDetails: null,
    pendingRequests: [],
    stats: {
      totalVehicles: 0,
      assignedVehicles: 0,
      availableVehicles: 0,
      totalUsers: 0,
      pendingRequests: 0
    },
    formData: {
      userId: '',
      requestReason: ''
    },
    showHistoryModal: false,
    showVehicleModal: false,
    showRequestModal: false,
    showRequestsModal: false,
    selectedVehicleForHistory: null,
    currentAssignmentsPage: 1,
    availableVehiclesPage: 1,
    requestsPage: 1,
    itemsPerPage: 5,
    userSearch: '',
    vehicleSearch: '',
    requestSearch: '',
    showDeleteModal: false,
    vehicleToDelete: null,
    filters: {
      status: '',
      vehicleType: ''
    },
    sortConfig: { key: 'make', direction: 'asc' },
    searchQuery: '',
    showForm: false,
    validationErrors: {},
    isSubmitted: false,
    formLoading: false
  });

  const api = axios.create({
    baseURL: 'https://localhost:7092/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const [assignmentsRes, vehiclesRes, usersRes, requestsRes] = await Promise.all([
        api.get('/VehicleAssignment/AllAssignments'),
        api.get('/vehicles'),
        api.get('/Auth/users'),
        api.get('/VehicleAssignment/AllRequests?status=Pending')
      ]);

      const users = usersRes.data.map(user => ({
        id: user.id,
        userName: user.email.split('@')[0],
        email: user.email,
        roles: user.roles
      }));

      const current = assignmentsRes.data;
      const assignedVehicleIds = current.map(a => a.vehicleId);
      const availableVehicles = vehiclesRes.data.filter(v => !assignedVehicleIds.includes(v.id));

      setState(prev => ({
        ...prev,
        currentAssignments: current,
        allAssignments: assignmentsRes.data,
        users: users,
        vehicles: vehiclesRes.data,
        pendingRequests: requestsRes.data,
        stats: {
          totalVehicles: vehiclesRes.data.length,
          assignedVehicles: current.length,
          availableVehicles: availableVehicles.length,
          totalUsers: users.length,
          pendingRequests: requestsRes.data.length
        },
        loading: false
      }));

    } catch (error) {
      console.error('Error fetching data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchAssignmentHistory = async (vehicleId) => {
    try {
      const response = await api.get(`/VehicleAssignment/AssignmentHistory/${vehicleId}`);
      setState(prev => ({
        ...prev,
        assignmentHistory: response.data,
        showHistoryModal: true,
        selectedVehicleForHistory: state.vehicles.find(v => v.id === vehicleId)?.model
      }));
    } catch (error) {
      console.error('Error fetching assignment history:', error);
    }
  };

  const fetchVehicleDetails = async (id) => {
    try {
      const response = await api.get(`/Vehicles/${id}`);
      setState(prev => ({
        ...prev,
        vehicleDetails: response.data,
        showVehicleModal: true
      }));
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
    }
  };

  const handleUnassignVehicle = async (vehicleId) => {
    try {
      await api.post('/VehicleAssignment/Unassign', `"${vehicleId}"`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      fetchData();
    } catch (error) {
      console.error('Error unassigning vehicle:', error);
    }
  };

  const handleRequestVehicle = async () => {
    try {
      const { userId, requestReason } = state.formData;
      if (!userId || !requestReason) return;

      await api.post('/VehicleAssignment/RequestVehicle', {
        userId,
        requestReason
      });

      setState(prev => ({
        ...prev,
        showRequestModal: false,
        formData: { ...prev.formData, requestReason: '' }
      }));
      fetchData();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const formatDuration = (start, end) => {
    if (!start) return 'N/A';
    if (!end) return 'Current assignment';
    const diff = new Date(end) - new Date(start);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const safeFormat = (dateString, formatStr) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatStr);
  };

  const handlePageChange = (type, page) => {
    setState(prev => ({ ...prev, [`${type}Page`]: page }));
  };

  const handleSearchChange = (type, value) => {
    setState(prev => ({ ...prev, [`${type}Search`]: value }));
  };

  const filteredUsers = state.users.filter(user =>
    user.userName.toLowerCase().includes(state.userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(state.userSearch.toLowerCase())
  ).slice(0, 6);

  const filteredVehicles = state.vehicles
    .filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id))
    .filter(vehicle =>
      vehicle.make.toLowerCase().includes(state.vehicleSearch.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(state.vehicleSearch.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(state.vehicleSearch.toLowerCase())
    ).slice(0, 6);

  const filteredRequests = state.pendingRequests.filter(request =>
    (request.userName && request.userName.toLowerCase().includes(state.requestSearch.toLowerCase())) ||
    (request.email && request.email.toLowerCase().includes(state.requestSearch.toLowerCase())) ||
    (request.requestReason && request.requestReason.toLowerCase().includes(state.requestSearch.toLowerCase()))
  );

  const paginatedCurrentAssignments = state.currentAssignments.slice(
    (state.currentAssignmentsPage - 1) * state.itemsPerPage,
    state.currentAssignmentsPage * state.itemsPerPage
  );

  const paginatedAvailableVehicles = state.vehicles
    .filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id))
    .slice(
      (state.availableVehiclesPage - 1) * state.itemsPerPage,
      state.availableVehiclesPage * state.itemsPerPage
    );

  const paginatedRequests = filteredRequests.slice(
    (state.requestsPage - 1) * state.itemsPerPage,
    state.requestsPage * state.itemsPerPage
  );

  const totalAssignmentPages = Math.ceil(state.currentAssignments.length / state.itemsPerPage);
  const totalAvailableVehiclePages = Math.ceil(
    state.vehicles.filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id)).length / state.itemsPerPage
  );
  const totalRequestPages = Math.ceil(filteredRequests.length / state.itemsPerPage);

  const isDocumentExpired = (dateString) => {
    if (!dateString) return false;
    return isBefore(parseISO(dateString), new Date());
  };

  const handleDeleteClick = (vehicle) => {
    setState(prev => ({ ...prev, vehicleToDelete: vehicle, showDeleteModal: true }));
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/vehicles/${state.vehicleToDelete.id}`);
      setState(prev => ({
        ...prev,
        vehicles: prev.vehicles.filter(v => v.id !== prev.vehicleToDelete.id),
        showDeleteModal: false
      }));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setState(prev => ({ ...prev, sortConfig: { key, direction } }));
  };

  const handleAddVehicle = () => {
    setState(prev => ({
      ...prev,
      formData: {
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        vin: '',
        vehicleType: 'Sedan',
        color: '',
        status: 'Available',
        currentMileage: 0,
        fuelType: 'Gasoline',
        transmission: 'Automatic',
        engineSize: '',
        seatingCapacity: 5,
        purchaseDate: '',
        purchasePrice: 0,
        lastServiceDate: '',
        serviceInterval: 10000,
        nextServiceDue: '',
        roadworthyExpiry: '',
        registrationExpiry: '',
        insuranceExpiry: '',
        notes: ''
      },
      validationErrors: {},
      isSubmitted: false,
      showForm: true
    }));
  };

  const handleEditVehicle = (vehicle) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...vehicle,
        purchaseDate: vehicle.purchaseDate?.split('T')[0],
        lastServiceDate: vehicle.lastServiceDate?.split('T')[0],
        roadworthyExpiry: vehicle.roadworthyExpiry?.split('T')[0],
        registrationExpiry: vehicle.registrationExpiry?.split('T')[0],
        insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0],
        nextServiceDue: vehicle.nextServiceDue?.split('T')[0]
      },
      validationErrors: {},
      isSubmitted: false,
      showForm: true
    }));
  };

  const handleCancel = () => {
    setState(prev => ({ ...prev, showForm: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isSubmitted: true }));
    if (!validateForm()) return;

    setState(prev => ({ ...prev, formLoading: true }));
    try {
      if (state.formData.id) {
        await api.put(`/vehicles/${state.formData.id}`, state.formData);
      } else {
        await api.post('/vehicles', state.formData);
      }
      fetchData();
      setState(prev => ({ ...prev, showForm: false }));
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setState(prev => ({ ...prev, formLoading: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: ['currentMileage', 'purchasePrice', 'serviceInterval', 'seatingCapacity', 'engineSize'].includes(name)
          ? parseFloat(value) || 0 : value
      }
    }));

    if (state.isSubmitted) {
      validateField(name, value);
    }
  };

  const validateField = (name, value) => {
    const currentYear = new Date().getFullYear();
    let error = '';

    switch (name) {
      case 'make':
        if (!value) error = 'Make is required';
        break;
      case 'model':
        if (!value) error = 'Model is required';
        break;
      case 'year':
        if (!value || value < 1900 || value > currentYear + 1) {
          error = `Year must be between 1900 and ${currentYear + 1}`;
        }
        break;
      case 'licensePlate':
        if (!value) error = 'License plate is required';
        break;
      case 'vin':
        if (!value || value.length < 17) error = 'VIN must be 17 characters';
        break;
      default:
        break;
    }

    setState(prev => ({
      ...prev,
      validationErrors: {
        ...prev.validationErrors,
        [name]: error
      }
    }));
  };

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!state.formData.make) errors.make = 'Make is required';
    if (!state.formData.model) errors.model = 'Model is required';
    if (!state.formData.year || state.formData.year < 1900 || state.formData.year > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
    if (!state.formData.licensePlate) errors.licensePlate = 'License plate is required';
    if (!state.formData.vin || state.formData.vin.length < 17) errors.vin = 'VIN must be 17 characters';

    setState(prev => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  const renderHeader = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
        <CarIcon />
      </Avatar>
      <Box>
        <Typography variant="h6" component="h1" fontWeight='300'>
          Vehicle Assignments
        </Typography>
      </Box>
      <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setState(prev => ({ ...prev, showRequestModal: true }))}
        >
          New Request
        </Button>
      </Box>
    </Box>
  );

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[
        {
          title: 'Total Vehicles',
          value: state.stats.totalVehicles,
          icon: <CarIcon fontSize="medium" />,
          color: theme.palette.primary.main,
          bgColor: theme.palette.primary.light
        },
        {
          title: 'Assigned',
          value: state.stats.assignedVehicles,
          icon: <AssignmentTurnedInIcon fontSize="medium" />,
          color: theme.palette.success.main,
          bgColor: theme.palette.success.light
        },
        {
          title: 'Available',
          value: state.stats.availableVehicles,
          icon: <DirectionsCarIcon fontSize="medium" />,
          color: theme.palette.info.main,
          bgColor: theme.palette.info.light
        },
        {
          title: 'Pending Requests',
          value: state.stats.pendingRequests,
          icon: <PendingActionsIcon fontSize="medium" />,
          color: theme.palette.warning.main,
          bgColor: theme.palette.warning.light
        }
      ].map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: '100%',
              width : '270px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  {stat.title}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    backgroundColor: stat.bgColor,
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  fontSize: '2rem',
                  color: stat.color,
                  lineHeight: 1.2
                }}
              >
                {stat.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{
                  height: '4px',
                  borderRadius: '2px',
                  background: stat.color,
                  flexGrow: 1,
                  mr: 1,
                  opacity: 0.5
                }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {index === 0 ? 'All vehicles' :
                   index === 1 ? 'In use' :
                   index === 2 ? 'Ready to assign' : 'Awaiting approval'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCurrentAssignments = () => (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vehicle</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Assignment Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCurrentAssignments.length > 0 ? (
              paginatedCurrentAssignments.map(assignment => (
                <TableRow key={assignment.assignmentId} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                        <CarIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          {assignment.vehicleMake} {assignment.vehicleModel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.licensePlate}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">{assignment.userName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {safeFormat(assignment.assignmentDate, 'PP')}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View vehicle details">
                      <IconButton
                        color="info"
                        onClick={() => fetchVehicleDetails(assignment.vehicleId)}
                        sx={{ mr: 1 }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View assignment history">
                      <IconButton
                        color="secondary"
                        onClick={() => fetchAssignmentHistory(assignment.vehicleId)}
                        sx={{ mr: 1 }}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Unassign vehicle">
                      <IconButton
                        color="error"
                        onClick={() => handleUnassignVehicle(assignment.vehicleId)}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No current vehicle assignments
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalAssignmentPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalAssignmentPages}
            page={state.currentAssignmentsPage}
            onChange={(e, page) => handlePageChange('currentAssignments', page)}
            color="primary"
          />
        </Box>
      )}
    </Card>
  );

  const renderAvailableVehicles = () => (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Make/Model</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Plate</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAvailableVehicles.length > 0 ? (
              paginatedAvailableVehicles.map(vehicle => (
                <TableRow key={vehicle.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                        <CarIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.vehicleType}</TableCell>
                  <TableCell>
                    <Chip
                      label={vehicle.status}
                      color={vehicle.status === 'Available' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View assignment history">
                      <IconButton
                        color="secondary"
                        onClick={() => fetchAssignmentHistory(vehicle.id)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No available vehicles
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalAvailableVehiclePages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Pagination
            count={totalAvailableVehiclePages}
            page={state.availableVehiclesPage}
            onChange={(e, page) => handlePageChange('availableVehicles', page)}
            color="primary"
          />
        </Box>
      )}
    </Card>
  );

  const renderRequestModal = () => (
    <Dialog
      open={state.showRequestModal}
      onClose={() => setState(prev => ({ ...prev, showRequestModal: false }))}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <AssignmentIcon sx={{ mr: 1 }} />
        Request Vehicle
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Search users"
          variant="outlined"
          value={state.userSearch}
          onChange={(e) => handleSearchChange('user', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <ListItem
                key={user.id}
                button
                selected={state.formData.userId === user.id}
                onClick={() => setState(prev => ({
                  ...prev,
                  formData: { ...prev.formData, userId: user.id }
                }))}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={user.userName}
                  secondary={user.email}
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No users found" />
            </ListItem>
          )}
        </List>

        <TextField
          fullWidth
          label="Reason for Request"
          variant="outlined"
          multiline
          rows={3}
          value={state.formData.requestReason}
          onChange={(e) => setState(prev => ({
            ...prev,
            formData: { ...prev.formData, requestReason: e.target.value }
          }))}
          placeholder="Explain why you need a vehicle..."
          sx={{ mt: 2 }}
        />

        {state.formData.userId && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Requesting for: {state.users.find(u => u.id === state.formData.userId)?.userName}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<BackIcon />}
          onClick={() => setState(prev => ({ ...prev, showRequestModal: false }))}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<CheckIcon />}
          onClick={handleRequestVehicle}
          disabled={!state.formData.userId || !state.formData.requestReason}
        >
          Submit Request
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderVehicleModal = () => {
    if (!state.vehicleDetails) return null;

    const vehicle = state.vehicleDetails;
    const currentAssignment = state.currentAssignments.find(a => a.vehicleId === vehicle.id);

    return (
      <Dialog
        open={state.showVehicleModal}
        onClose={() => setState(prev => ({ ...prev, showVehicleModal: false }))}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <CarIcon sx={{ mr: 1 }} />
          {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1 }} />
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Make/Model
                      </Typography>
                      <Typography>
                        {vehicle.make} {vehicle.model}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Year
                      </Typography>
                      <Typography>{vehicle.year}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Color
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                        <ColorLensIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {vehicle.color || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        VIN
                      </Typography>
                      <Typography>{vehicle.vin || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography>{vehicle.vehicleType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={vehicle.status}
                        color={vehicle.status === 'Available' ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <EngineeringIcon sx={{ mr: 1 }} />
                    Technical Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mileage
                      </Typography>
                      <Typography>
                        {vehicle.currentMileage?.toLocaleString() || 'N/A'} miles
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fuel Type
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalGasStationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {vehicle.fuelType || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Transmission
                      </Typography>
                      <Typography>{vehicle.transmission || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Engine Size
                      </Typography>
                      <Typography>
                        {vehicle.engineSize ? `${vehicle.engineSize}L` : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Seating Capacity
                      </Typography>
                      <Typography>{vehicle.seatingCapacity || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {currentAssignment && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentTurnedInIcon sx={{ mr: 1 }} />
                      Current Assignment
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          {currentAssignment.userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentAssignment.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      Assigned on {safeFormat(currentAssignment.assignmentDate, 'PP')}
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleUnassignVehicle(vehicle.id)}
                    >
                      Unassign Vehicle
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptIcon sx={{ mr: 1 }} />
                    Maintenance & Compliance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Service
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {safeFormat(vehicle.lastServiceDate, 'PPpp')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Service Interval
                      </Typography>
                      <Typography>
                        {vehicle.serviceInterval ? `${vehicle.serviceInterval} miles` : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Next Service Due
                      </Typography>
                      <Typography color={isDocumentExpired(vehicle.nextServiceDue) ? 'error' : 'inherit'}>
                        {safeFormat(vehicle.nextServiceDue, 'PPpp')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Registration Expiry
                      </Typography>
                      <Typography color={isDocumentExpired(vehicle.registrationExpiry) ? 'error' : 'inherit'}>
                        {safeFormat(vehicle.registrationExpiry, 'PPpp')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Insurance Expiry
                      </Typography>
                      <Typography color={isDocumentExpired(vehicle.insuranceExpiry) ? 'error' : 'inherit'}>
                        {safeFormat(vehicle.insuranceExpiry, 'PPpp')}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 1 }} />
                    Purchase Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Purchase Date
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {safeFormat(vehicle.purchaseDate, 'PPpp')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Purchase Price
                      </Typography>
                      <Typography>
                        {vehicle.purchasePrice ? `$${vehicle.purchasePrice.toLocaleString()}` : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {vehicle.notes && (
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotesIcon sx={{ mr: 1 }} />
                  Notes
                </Typography>
                <Typography>{vehicle.notes}</Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setState(prev => ({ ...prev, showVehicleModal: false }))}
            startIcon={<BackIcon />}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderHistoryModal = () => (
    <Dialog
      open={state.showHistoryModal}
      onClose={() => setState(prev => ({ ...prev, showHistoryModal: false }))}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1 }} />
        Assignment History for {state.selectedVehicleForHistory || 'Vehicle'}
      </DialogTitle>
      <DialogContent dividers>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Assigned Date</TableCell>
                <TableCell>Unassigned Date</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.assignmentHistory.length > 0 ? (
                state.assignmentHistory.map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 2 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">
                            {record.userName || 'Unknown User'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.userEmail || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {record.assignmentDate ? safeFormat(record.assignmentDate, 'PPpp') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {record.unassignmentDate
                        ? safeFormat(record.unassignmentDate, 'PPpp')
                        : <Chip label="Active" color="success" size="small" />}
                    </TableCell>
                    <TableCell>
                      {formatDuration(record.assignmentDate, record.unassignmentDate)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No assignment history found for this vehicle
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setState(prev => ({ ...prev, showHistoryModal: false }))}
          startIcon={<BackIcon />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog
      open={state.showDeleteModal}
      onClose={() => setState(prev => ({ ...prev, showDeleteModal: false }))}
    >
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {state.vehicleToDelete?.make} {state.vehicleToDelete?.model}?
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(prev => ({ ...prev, showDeleteModal: false }))}>Cancel</Button>
        <Button onClick={confirmDelete} color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );

  const renderVehicleForm = () => (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {state.formData.id ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Make"
                name="make"
                value={state.formData.make}
                onChange={handleChange}
                error={!!state.validationErrors.make}
                helperText={state.validationErrors.make}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                value={state.formData.model}
                onChange={handleChange}
                error={!!state.validationErrors.model}
                helperText={state.validationErrors.model}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={state.formData.year}
                onChange={handleChange}
                error={!!state.validationErrors.year}
                helperText={state.validationErrors.year}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Plate"
                name="licensePlate"
                value={state.formData.licensePlate}
                onChange={handleChange}
                error={!!state.validationErrors.licensePlate}
                helperText={state.validationErrors.licensePlate}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="VIN"
                name="vin"
                value={state.formData.vin}
                onChange={handleChange}
                error={!!state.validationErrors.vin}
                helperText={state.validationErrors.vin}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={state.formData.color}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Mileage"
                name="currentMileage"
                type="number"
                value={state.formData.currentMileage}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={state.formData.purchaseDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Purchase Price"
                name="purchasePrice"
                type="number"
                value={state.formData.purchasePrice}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Service Date"
                name="lastServiceDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={state.formData.lastServiceDate}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Next Service Due"
                name="nextServiceDue"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={state.formData.nextServiceDue}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Interval (miles)"
                name="serviceInterval"
                type="number"
                value={state.formData.serviceInterval}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Engine Size (cc)"
                name="engineSize"
                type="number"
                value={state.formData.engineSize}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roadworthy Expiry"
                name="roadworthyExpiry"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={state.formData.roadworthyExpiry}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Expiry"
                name="registrationExpiry"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={state.formData.registrationExpiry}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Expiry"
                name="insuranceExpiry"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={state.formData.insuranceExpiry}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seating Capacity"
                name="seatingCapacity"
                type="number"
                value={state.formData.seatingCapacity}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={state.formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="In Maintenance">In Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  name="vehicleType"
                  value={state.formData.vehicleType}
                  onChange={handleChange}
                >
                  <MenuItem value="Sedan">Sedan</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Truck">Truck</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Hatchback">Hatchback</MenuItem>
                  <MenuItem value="Coupe">Coupe</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="fuelType"
                  value={state.formData.fuelType}
                  onChange={handleChange}
                >
                  <MenuItem value="Gasoline">Gasoline</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Electric">Electric</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                  <MenuItem value="LPG">LPG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={state.formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleCancel} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {state.formData.id ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );

  const renderVehicleList = () => {
    const filteredVehicles = state.vehicles
      .filter(vehicle => {
        const matchesStatus = state.filters.status ? vehicle.status === state.filters.status : true;
        const matchesType = state.filters.vehicleType ? vehicle.vehicleType === state.filters.vehicleType : true;
        const matchesSearch = state.searchQuery
          ? Object.values(vehicle).some(
              val => String(val).toLowerCase().includes(state.searchQuery.toLowerCase())
            )
          : true;
        return matchesStatus && matchesType && matchesSearch;
      })
      .sort((a, b) => {
        if (a[state.sortConfig.key] < b[state.sortConfig.key]) {
          return state.sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[state.sortConfig.key] > b[state.sortConfig.key]) {
          return state.sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

    const indexOfLastVehicle = state.currentPage * state.itemsPerPage;
    const indexOfFirstVehicle = indexOfLastVehicle - state.itemsPerPage;
    const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
    const totalPages = Math.ceil(filteredVehicles.length / state.itemsPerPage);

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Vehicle List</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddVehicle}>
              Add Vehicle
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <TextField
              label="Search"
              variant="outlined"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              sx={{ width: '300px' }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={state.filters.status}
                  onChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, status: e.target.value } }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="In Maintenance">In Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={state.filters.vehicleType}
                  onChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, vehicleType: e.target.value } }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Sedan">Sedan</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Truck">Truck</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Hatchback">Hatchback</MenuItem>
                  <MenuItem value="Coupe">Coupe</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('licensePlate')}>
                    License Plate {state.sortConfig.key === 'licensePlate' && (state.sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('make')}>
                    Make {state.sortConfig.key === 'make' && (state.sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('model')}>
                    Model {state.sortConfig.key === 'model' && (state.sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('year')}>
                    Year {state.sortConfig.key === 'year' && (state.sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell onClick={() => handleSort('currentMileage')}>
                    Mileage {state.sortConfig.key === 'currentMileage' && (state.sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentVehicles.map(vehicle => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>{vehicle.currentMileage}</TableCell>
                    <TableCell>
                      <Chip
                        label={vehicle.status}
                        color={
                          vehicle.status === 'Available' ? 'success' :
                          vehicle.status === 'Assigned' ? 'primary' :
                          vehicle.status === 'In Maintenance' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditVehicle(vehicle)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(vehicle)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={state.currentPage}
              onChange={(e, page) => setState(prev => ({ ...prev, currentPage: page }))}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  useEffect(() => {
    fetchData();
  }, [vehicleId, view]);

  if (state.loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading vehicle assignments...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {state.showForm ? (
        renderVehicleForm()
      ) : (
        <>
          {renderHeader()}
          {renderStatsCards()}

          <Box sx={{ mb: 3 }}>
            <Button
              variant={state.activeTab === 'current' ? 'contained' : 'outlined'}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'current' }))}
              startIcon={<AssignmentIcon />}
              sx={{ mr: 1 }}
            >
              Current Assignments
            </Button>
            <Button
              variant={state.activeTab === 'available' ? 'contained' : 'outlined'}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'available' }))}
              startIcon={<DirectionsCarIcon />}
              sx={{ mr: 1 ,borderRadius : '7px'}}
            >
              Available Vehicles
            </Button>
            <Button
              variant={state.activeTab === 'vehicleList' ? 'contained' : 'outlined'}
              onClick={() => setState(prev => ({ ...prev, activeTab: 'vehicleList' }))}
              startIcon={<CarIcon />}
            >
              Vehicle List
            </Button>
          </Box>

          {state.activeTab === 'current' && renderCurrentAssignments()}
          {state.activeTab === 'available' && renderAvailableVehicles()}
          {state.activeTab === 'vehicleList' && renderVehicleList()}

          {renderRequestModal()}
          {renderHistoryModal()}
          {renderVehicleModal()}
          {renderDeleteModal()}
        </>
      )}
    </Container>
  );
};

export default Assignment;
