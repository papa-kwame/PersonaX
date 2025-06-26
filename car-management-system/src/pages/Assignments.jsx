import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from "react-router-dom";
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
  Tabs,
  Tab,
  Divider,
  Badge,
  styled,
  alpha
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  PendingActions as PendingActionsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Event as EventIcon,
  LocalGasStation as LocalGasStationIcon,
  ColorLens as ColorLensIcon,
  CalendarToday as CalendarTodayIcon,
  Engineering as EngineeringIcon,
  Receipt as ReceiptIcon,
  MonetizationOn as MoneyIcon,
  Notes as NotesIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';

// Define color constants
const COLORS = {
  PRIMARY: '#000000',
  SECONDARY: '#9c27b0',
  SUCCESS: '#4caf50',
  ERROR: '#f44336',
  WARNING: '#ff9800',
  INFO: '#2196f3',
  BACKGROUND: '#f5f5f5',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  DIVIDER: '#bdbdbd',
  WHITE: '#ffffff',
  BLACK: '#000000',
};

// Styled components for modern look
const GradientCard = styled(Card)({
  background: `linear-gradient(135deg, ${alpha(COLORS.PRIMARY, 0.1)} 0%, ${alpha(COLORS.BACKGROUND, 0.8)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.2)'
  }
});

const StatusBadge = styled(Badge)(({ status }) => ({
  '& .MuiBadge-badge': {
    backgroundColor:
      status === 'Available' ? COLORS.SUCCESS :
      status === 'Assigned' ? COLORS.PRIMARY :
      status === 'In Maintenance' ? COLORS.WARNING : COLORS.ERROR,
    color: COLORS.WHITE,
    boxShadow: `0 0 0 2px ${COLORS.BACKGROUND}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    }
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  }
}));

const Assignment = () => {
  const { vehicleId, userId, view } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    activeTab: view === 'history' ? 'history' : 'vehicleList',
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
    formLoading: false,
    currentPage: 1
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
        showDeleteModal: false,
        vehicleToDelete: null
      }));
      fetchData();
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

  const handleTabChange = (event, newValue) => {
    setState(prev => ({ ...prev, activeTab: newValue }));
  };

  const renderHeader = () => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{
          bgcolor: 'transparent',
          mr: 2,
          width: 48,
          height: 48,
          '& svg': {
            color: COLORS.PRIMARY,
            fontSize: '2rem'
          }
        }}>
          <CarIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={300} sx={{
            background: `black`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Vehicle Fleet Management
          </Typography>
        </Box>
      </Box>
      <Divider sx={{
        borderColor: alpha(COLORS.DIVIDER, 0.1),
        borderBottomWidth: '2px',
        background: `linear-gradient(to right, transparent, ${alpha(COLORS.PRIMARY, 0.3)}, transparent)`,
        height: '2px'
      }} />
    </Box>
  );

  const renderStatsCards = () => (
    <Grid container spacing={7} sx={{ mb: 4 }}>
      {[
        {
          title: 'Total Vehicles',
          value: state.stats.totalVehicles,
          icon: <CarIcon fontSize="medium" />,
          color: COLORS.PRIMARY,
        },
        {
          title: 'Assigned',
          value: state.stats.assignedVehicles,
          icon: <AssignmentTurnedInIcon fontSize="medium" />,
          color: COLORS.SUCCESS,
        },
        {
          title: 'Available',
          value: state.stats.availableVehicles,
          icon: <CarIcon fontSize="medium" />,
          color: COLORS.INFO,
        }
      ].map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <GradientCard>
            <CardContent sx={{ p: 3, width: '450px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem'
                }}>
                  {stat.title}
                </Typography>
                <Box sx={{
                  p: 1,
                  borderRadius: '12px',
                  backgroundColor: alpha(stat.color, 0.1),
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40
                }}>
                  {stat.icon}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1 }}>
                <Typography variant="h3" fontWeight={400} sx={{
                  fontSize: '2.5rem',
                  color: COLORS.TEXT_PRIMARY,
                  lineHeight: 1
                }}>
                  {stat.value}
                </Typography>

              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  height: '4px',
                  borderRadius: '2px',
                  background: `linear-gradient(to right, ${stat.color}, ${alpha(stat.color, 0.5)})`,
                  flexGrow: 1,
                  mr: 1
                }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {index === 0 ? 'All fleet vehicles' :
                   index === 1 ? 'Currently assigned' :
                   index === 2 ? 'Ready for assignment' : 'Awaiting approval'}
                </Typography>
              </Box>
            </CardContent>
          </GradientCard>
        </Grid>
      ))}
    </Grid>
  );

  const renderCurrentAssignments = () => (
    <GradientCard>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Current Assignments
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search assignments..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              sx={{ borderRadius: '12px' }}
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
            >
              Filters
            </Button>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{
                backgroundColor: alpha(COLORS.PRIMARY, 0.03),
                '& th': {
                  fontWeight: 700,
                  color: COLORS.TEXT_SECONDARY,
                  borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
                }
              }}>
                <TableCell>Vehicle</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Assignment Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCurrentAssignments.length > 0 ? (
                paginatedCurrentAssignments.map(assignment => (
                  <TableRow
                    key={assignment.assignmentId}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.02) }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{
                          bgcolor: alpha(COLORS.PRIMARY, 0.1),
                          mr: 2,
                          color: COLORS.PRIMARY
                        }}>
                          <CarIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
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
                        <Avatar sx={{
                          bgcolor: alpha(COLORS.SECONDARY, 0.1),
                          mr: 2,
                          color: COLORS.SECONDARY
                        }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{assignment.userName}</Typography>
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
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Vehicle details">
                          <IconButton
                            onClick={() => fetchVehicleDetails(assignment.vehicleId)}
                            sx={{
                              mr: 1,
                              '&:hover': {
                                backgroundColor: alpha(COLORS.INFO, 0.1),
                                color: COLORS.INFO
                              }
                            }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assignment history">
                          <IconButton
                            onClick={() => fetchAssignmentHistory(assignment.vehicleId)}
                            sx={{
                              mr: 1,
                              '&:hover': {
                                backgroundColor: alpha(COLORS.SECONDARY, 0.1),
                                color: COLORS.SECONDARY
                              }
                            }}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Unassign vehicle">
                          <IconButton
                            onClick={() => handleUnassignVehicle(assignment.vehicleId)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(COLORS.ERROR, 0.1),
                                color: COLORS.ERROR
                              }
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: COLORS.TEXT_SECONDARY
                    }}>
                      <AssignmentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography>No current vehicle assignments</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalAssignmentPages > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
          }}>
            <Typography variant="body2" color="text.secondary">
              Showing {(state.currentAssignmentsPage - 1) * state.itemsPerPage + 1}-
              {Math.min(state.currentAssignmentsPage * state.itemsPerPage, state.currentAssignments.length)} of {state.currentAssignments.length} assignments
            </Typography>
            <Pagination
              count={totalAssignmentPages}
              page={state.currentAssignmentsPage}
              onChange={(e, page) => handlePageChange('currentAssignments', page)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </CardContent>
    </GradientCard>
  );

  const renderAvailableVehicles = () => (
    <GradientCard>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Available Vehicles
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: '12px' }}
            onClick={() => navigate('/vehicles/new')}
          >
            Add Vehicle
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{
                backgroundColor: alpha(COLORS.PRIMARY, 0.03),
                '& th': {
                  fontWeight: 700,
                  color: COLORS.TEXT_SECONDARY,
                  borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
                }
              }}>
                <TableCell>Make/Model</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>License Plate</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAvailableVehicles.length > 0 ? (
                paginatedAvailableVehicles.map(vehicle => (
                  <TableRow
                    key={vehicle.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.02) }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StatusBadge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          status={vehicle.status}
                        >
                          <Avatar sx={{
                            bgcolor: alpha(COLORS.PRIMARY, 0.1),
                            mr: 2,
                            color: COLORS.PRIMARY
                          }}>
                            <CarIcon />
                          </Avatar>
                        </StatusBadge>
                        <Box>
                          <Typography fontWeight={600}>
                            {vehicle.make} {vehicle.model}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell>
                      <Chip
                        label={vehicle.licensePlate}
                        size="small"
                        sx={{
                          backgroundColor: alpha(COLORS.PRIMARY, 0.1),
                          color: COLORS.PRIMARY,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vehicle.vehicleType}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vehicle.status}
                        color={
                          vehicle.status === 'Available' ? 'success' :
                          vehicle.status === 'Assigned' ? 'primary' :
                          vehicle.status === 'In Maintenance' ? 'warning' : 'error'
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Assignment history">
                          <IconButton
                            onClick={() => fetchAssignmentHistory(vehicle.id)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(COLORS.SECONDARY, 0.1),
                                color: COLORS.SECONDARY
                              }
                            }}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      color: COLORS.TEXT_SECONDARY
                    }}>
                      <CarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography>No available vehicles in the fleet</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totalAvailableVehiclePages > 1 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
          }}>
            <Typography variant="body2" color="text.secondary">
              Showing {(state.availableVehiclesPage - 1) * state.itemsPerPage + 1}-
              {Math.min(state.availableVehiclesPage * state.itemsPerPage,
                state.vehicles.filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id)).length)} of{' '}
              {state.vehicles.filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id)).length} vehicles
            </Typography>
            <Pagination
              count={totalAvailableVehiclePages}
              page={state.availableVehiclesPage}
              onChange={(e, page) => handlePageChange('availableVehicles', page)}
              color="primary"
              shape="rounded"
            />
          </Box>
        )}
      </CardContent>
    </GradientCard>
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
                      <Avatar sx={{ bgcolor: COLORS.SECONDARY, mr: 2 }}>
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
                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assigned Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Unassigned Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.assignmentHistory.length > 0 ? (
                state.assignmentHistory.map((record, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: COLORS.SECONDARY, mr: 2 }}>
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
      onClose={() => setState(prev => ({ ...prev, showDeleteModal: false, vehicleToDelete: null }))}
    >
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete {state.vehicleToDelete?.make} {state.vehicleToDelete?.model}?
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setState(prev => ({ ...prev, showDeleteModal: false, vehicleToDelete: null }))}>
          Cancel
        </Button>
        <Button onClick={confirmDelete} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderVehicleForm = () => (
    <Card sx={{ mb: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
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
      <GradientCard>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Fleet Vehicle List
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search vehicles..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '12px' }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{ borderRadius: '12px' }}
                onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              >
                Filters
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: '12px' }}
                onClick={() => navigate('/vehicles/new')}
              >
                Add Vehicle
              </Button>
            </Box>
          </Box>

          {state.showFilters && (
            <Box sx={{
              p: 2,
              display: 'flex',
              gap: 2,
              borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`,
              backgroundColor: alpha(COLORS.PRIMARY, 0.03)
            }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={state.filters.status}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: e.target.value },
                    currentPage: 1
                  }))}
                  label="Status"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="In Maintenance">In Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={state.filters.vehicleType}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filters: { ...prev.filters, vehicleType: e.target.value },
                    currentPage: 1
                  }))}
                  label="Vehicle Type"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Sedan">Sedan</MenuItem>
                  <MenuItem value="SUV">SUV</MenuItem>
                  <MenuItem value="Truck">Truck</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                  <MenuItem value="Hatchback">Hatchback</MenuItem>
                  <MenuItem value="Coupe">Coupe</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{
                  backgroundColor: alpha(COLORS.PRIMARY, 0.03),
                  '& th': {
                    fontWeight: 700,
                    color: COLORS.TEXT_SECONDARY,
                    borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
                  }
                }}>
                  <TableCell
                    onClick={() => handleSort('licensePlate')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.05) } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      License Plate
                      {state.sortConfig.key === 'licensePlate' && (
                        <Box component="span" sx={{
                          ml: 0.5,
                          color: COLORS.PRIMARY,
                          transform: state.sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none'
                        }}>
                          ↓
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('make')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.05) } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Make
                      {state.sortConfig.key === 'make' && (
                        <Box component="span" sx={{
                          ml: 0.5,
                          color: COLORS.PRIMARY,
                          transform: state.sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none'
                        }}>
                          ↓
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('model')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.05) } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Model
                      {state.sortConfig.key === 'model' && (
                        <Box component="span" sx={{
                          ml: 0.5,
                          color: COLORS.PRIMARY,
                          transform: state.sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none'
                        }}>
                          ↓
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    onClick={() => handleSort('year')}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.05) } }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      Year
                      {state.sortConfig.key === 'year' && (
                        <Box component="span" sx={{
                          ml: 0.5,
                          color: COLORS.PRIMARY,
                          transform: state.sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'none'
                        }}>
                          ↓
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentVehicles.length > 0 ? (
                  currentVehicles.map(vehicle => (
                    <TableRow
                      key={vehicle.id}
                      hover
                      sx={{
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.02) }
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={vehicle.licensePlate}
                          size="small"
                          sx={{
                            backgroundColor: alpha(COLORS.PRIMARY, 0.1),
                            color: COLORS.PRIMARY,
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>{vehicle.make}</TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>
                        <StatusBadge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          status={vehicle.status}
                        >
                          <Chip
                            label={vehicle.status}
                            color={
                              vehicle.status === 'Available' ? 'success' :
                              vehicle.status === 'Assigned' ? 'primary' :
                              vehicle.status === 'In Maintenance' ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </StatusBadge>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Edit vehicle">
                            <IconButton
                              onClick={() => handleEditVehicle(vehicle)}
                              sx={{
                                mr: 1,
                                '&:hover': {
                                  backgroundColor: alpha(COLORS.PRIMARY, 0.1),
                                  color: COLORS.PRIMARY
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete vehicle">
                            <IconButton
                              onClick={() => handleDeleteClick(vehicle)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha(COLORS.ERROR, 0.1),
                                  color: COLORS.ERROR
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: COLORS.TEXT_SECONDARY
                      }}>
                        <CarIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                        <Typography>No vehicles match your criteria</Typography>
                        <Button
                          variant="text"
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => setState(prev => ({
                            ...prev,
                            searchQuery: '',
                            filters: { status: '', vehicleType: '' }
                          }))}
                        >
                          Clear filters
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderTop: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {(state.currentPage - 1) * state.itemsPerPage + 1}-
                {Math.min(state.currentPage * state.itemsPerPage, filteredVehicles.length)} of {filteredVehicles.length} vehicles
              </Typography>
              <Pagination
                count={totalPages}
                page={state.currentPage}
                onChange={(e, page) => setState(prev => ({ ...prev, currentPage: page }))}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </CardContent>
      </GradientCard>
    );
  };

  useEffect(() => {
    fetchData();
  }, [vehicleId, view]);

  if (state.loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {state.showForm ? (
        renderVehicleForm()
      ) : (
        <>
          {renderHeader()}
          {renderStatsCards()}
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={state.activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: '4px 4px 0 0'
                }
              }}
            >
              <Tab
                value="vehicleList"
                label="Vehicle List"
                icon={<CarIcon />}
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                value="current"
                label="Current Assignments"
                icon={<AssignmentIcon />}
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
              <Tab
                value="available"
                label="Available Vehicles"
                icon={<CarIcon />}
                iconPosition="start"
                sx={{ textTransform: 'none' }}
              />
            </Tabs>
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
