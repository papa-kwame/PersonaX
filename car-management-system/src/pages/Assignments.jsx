import React, { useState, useEffect, useCallback } from 'react';
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
  alpha,
  Autocomplete,
  Popper
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
  FilterList as FilterIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import VehicleShowModal from '../components/vehicles/VehicleShowModal';
import { ToastContainer } from 'react-toastify';

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

const Assignment = ({ sidebarExpanded = true }) => {
  const { vehicleId, userId, view } = useParams();
  const navigate = useNavigate();
  const { userId: authUserId } = useAuth();
  const [state, setState] = useState({
    loading: true,
    vehicles: [],
    assignments: [],
    currentAssignments: [],
    allAssignments: [],
    users: [],
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
    currentPage: 1,
    itemsPerPage: 4,
    searchQuery: '',
    userSearch: '',
    vehicleSearch: '',
    requestSearch: '',
    activeTab: 'vehicleList',
    showForm: false,
    showRequestModal: false,
    showViewModal: false,
    showHistoryModal: false,
    showDeleteModal: false,
    showVehicleShowModal: false,
    selectedVehicle: null,
    selectedAssignment: null,
    vehicleToDelete: null,
    currentAssignmentsPage: 1,
    availableVehiclesPage: 1,
    requestsPage: 1,
    formData: {
      id: '',
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
    formLoading: false,
    isSubmitted: false,
    filters: {
      status: '',
      vehicleType: ''
    },
    sortConfig: {
      key: 'make',
      direction: 'asc'
    }
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
    setState(prev => ({ ...prev, [type]: value }));
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
    setState(prev => ({ ...prev, isSubmitted: true, formLoading: true }));

    if (!validateForm()) {
      setState(prev => ({ ...prev, formLoading: false }));
      return;
    }

    try {
      if (state.formData.id) {
        await api.put(`/vehicles/${state.formData.id}?userId=${authUserId}`, state.formData);
      } else {
        await api.post(`/vehicles?userId=${authUserId}`, state.formData);
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
          bgcolor: 'black',
          mr: 2,
          width: 52,
          height: 52,
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
          border: '2px solid #e3e8f0',
          '& svg': {
            color: '#fff',
            fontSize: '2.2rem'
          }
        }}>
          <CarIcon />
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={400} sx={{
            color: 'black',
            letterSpacing: '0.5px',
          }}>
            Vehicle Management
          </Typography>
        </Box>
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
          color: 'black',
          
        },
        {
          title: 'Assigned',
          value: state.stats.assignedVehicles,
          icon: <AssignmentTurnedInIcon fontSize="medium" />,
          color: 'black',
        },
        {
          title: 'Available',
          value: state.stats.availableVehicles,
          icon: <CarIcon fontSize="medium" />,
          color: 'black',
        }
      ].map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
            p: 0,
            borderColor: stat.color,
            background: '#fff',
            boxShadow: '0 12px 40px 0 rgba(60, 80, 180, 0.18)',
            border: '1.5px solid rgba(10, 11, 14, 0.17)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            minWidth: 0
          }}>
            <CardContent sx={{ 
              p: 3,
              width: sidebarExpanded ? '474px' : '554px',
              transition: 'width 0.3s ease-in-out'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{
                  p: 1.2,
                  borderRadius: '50%',
                  backgroundColor: stat.color,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  mr: 2
                }}>
                  {stat.icon}
                </Box>
                <Typography variant="subtitle2" sx={{
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  fontSize: '0.9rem'
                }}>
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} sx={{
                fontSize: '2.3rem',
                lineHeight: 1.1,
                mb: 1
              }}>
                {stat.value}
              </Typography>
              <Box sx={{ height: '4px', borderRadius: '2px', background: stat.color, opacity: 0.18, width: '100%' }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderCurrentAssignments = () => (
    <Card sx={{ borderRadius: 4, boxShadow: 3, background: '#fff', mb: 4 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'primary.light', background: 'rgba(25, 118, 210, 0.03)' }}>
          <Typography variant="h6" sx={{ fontWeight: 400 }}>
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
                sx: { borderRadius: '12px', background: '#f4f8fd', border: '1px solid #e3e8f0' }
              }}
            />

          </Box>
        </Box>
        <TableContainer component={Paper} sx={{ boxShadow: 'none', background: '#f9fafb', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}>
                <TableCell sx={{ fontWeight: 800,  borderBottom: '2px solid #e3e8f0', fontSize: '1rem', letterSpacing: 0.2, textTransform: 'uppercase' }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 800,  borderBottom: '2px solid #e3e8f0', fontSize: '1rem', letterSpacing: 0.2, textTransform: 'uppercase' }}>Assigned To</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800,  borderBottom: '2px solid #e3e8f0', fontSize: '1rem', letterSpacing: 0.2, textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCurrentAssignments.length > 0 ? (
                paginatedCurrentAssignments.map(assignment => (
                  <TableRow
                    key={assignment.assignmentId}
                    hover
                    onClick={() => handleAssignmentClick(assignment)}
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.06)' },
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{
                          mr: 2,
                      
                          width: 40,
                          height: 40
                        }}>
                          <CarIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} >
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
                          mr: 2,
                          width: 40,
                          height: 40
                        }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700}>{assignment.userName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {assignment.userEmail}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Vehicle details">
                          <IconButton
                            onClick={() => fetchVehicleDetails(assignment.vehicleId)}
                            sx={{
                              mr: 1,
                              '&:hover': {
                             
                                color: '#fff'
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
                              color: 'info.main',
                              '&:hover': {
                                backgroundColor: 'info.light',
                                color: '#fff'
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
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: '#fff'
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
                      color: 'text.secondary'
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
        {totalAssignmentPages > 0 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: '1px solid #e3e8f0',
            background: '#f8fafc'
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
    </Card>
  );

  const renderAvailableVehicles = () => (
    <GradientCard sx={{ borderRadius: 4, boxShadow: 3,  background: '#fff', mb: 4 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 400, }}>
          
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
        <TableContainer component={Paper} sx={{ boxShadow: 'none', background: '#f9fafb', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(COLORS.PRIMARY, 0.03) }}>
                <TableCell sx={{ fontWeight: 700, color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`, textTransform: 'uppercase' }}>Make/Model</TableCell>
                <TableCell sx={{ fontWeight: 700, color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`, textTransform: 'uppercase' }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 700, color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`, textTransform: 'uppercase' }}>License Plate</TableCell>
                <TableCell sx={{ fontWeight: 700, color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`, textTransform: 'uppercase' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`, textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: COLORS.TEXT_SECONDARY, borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`, textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAvailableVehicles.length > 0 ? (
                paginatedAvailableVehicles.map(vehicle => (
                  <TableRow
                    key={vehicle.id}
                    hover
                    onClick={() => handleVehicleClick(vehicle)}
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.02) },
                      cursor: 'pointer'
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
                        label={vehicle.isAssigned ? 'Assigned' : 'Available'}
                        color={vehicle.isAssigned ? 'primary' : 'success'}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}
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
        {totalAvailableVehiclePages > 0 && (
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            marginTop:'30px',
            borderRadius: '22px',
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.18)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            p: 0,
            position: 'relative',
            fontFamily: 'Open Sans, sans-serif',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 400,
          fontSize: '1.5rem',
          pl: 4,
          pr: 6,
          py: 3,
          borderBottom: '2px solid #e3e8f0',
          background: 'rgba(25, 118, 210, 0.03)',
          position: 'relative',
        }}>
          <CarIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '2rem' }} />
          {vehicle.make} {vehicle.model} ({vehicle.licensePlate}) 
          <IconButton
            onClick={() => setState(prev => ({ ...prev, showVehicleModal: false }))}
            sx={{
              position: 'absolute',
              right: 16,
              top: 18,
              background: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                color: '#fff'
              }
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers={false} sx={{ py: 4, px: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{
                p: 3,
                mb: 3,
                borderRadius: '14px',
                background: '#f7fafd',
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
                minHeight: 180
              }}>
                <Typography variant="h6" sx={{
                  mb: 2,
                  fontWeight: 300,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.1rem'
                }}>
                  <InfoIcon sx={{ mr: 1 }} />
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      Make/Model
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>
                      {vehicle.make} {vehicle.model}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Year
                    </Typography>
                    <Typography sx={{ fontWeight: 400}}>{vehicle.year}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Color
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 400 }}>
                      <ColorLensIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {vehicle.color || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      VIN
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>{vehicle.vin || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Type
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>{vehicle.vehicleType || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Status
                    </Typography>
                    <Chip
                      label={vehicle.status}
                      color={vehicle.status === 'Available' ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 400, borderRadius: 2, px: 1.5, fontSize: '0.95em' }}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{
                p: 3,
                mb: 3,
                borderRadius: '14px',
                background: '#f7fafd',
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.06)',
                minHeight: 180
              }}>
                <Typography variant="h6" sx={{
                  mb: 2,
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.1rem'
                }}>
                  <EngineeringIcon sx={{ mr: 1 }} />
                  Technical Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Mileage
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>
                      {vehicle.currentMileage?.toLocaleString() || 'N/A'} miles
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      Fuel Type
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 400 }}>
                      <LocalGasStationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {vehicle.fuelType || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Transmission
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>{vehicle.transmission || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Engine Size
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>
                      {vehicle.engineSize ? `${vehicle.engineSize}L` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Seating Capacity
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>{vehicle.seatingCapacity || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {currentAssignment && (
                <Box sx={{
                  p: 3.5,
                  mb: 4,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e3eefd 100%)',
                  boxShadow: '0 4px 18px rgba(37,99,235,0.07)',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    fontWeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.18rem',
                    letterSpacing: 0.5
                  }}>
                    <AssignmentTurnedInIcon sx={{ mr: 1 }} />
                    Current Assignment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56, mr: 2, fontSize: 32 }}>
                      <PersonIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography fontWeight={500} c sx={{ fontSize: 18 }}>
                        {currentAssignment.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 15 }}>
                        {currentAssignment.userEmail}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontSize: 15 }}>
                    <EventIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    Assigned on {safeFormat(currentAssignment.assignmentDate, 'PP')}
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    sx={{ mt: 2, borderRadius: 2, fontWeight: 800, fontSize: 16, py: 1.2 }}
                    onClick={() => handleUnassignVehicle(vehicle.id)}
                  >
                    Unassign Vehicle
                  </Button>
                </Box>
              )}
              <Box sx={{
                p: 3.5,
                mb: 4,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e3eefd 100%)',
                boxShadow: '0 4px 18px rgba(37,99,235,0.07)',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h6" sx={{
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.18rem',
                  letterSpacing: 0.5
                }}>
                  <ReceiptIcon sx={{ mr: 1 }} />
                  Maintenance & Compliance
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" c sx={{ fontSize: '0.8rem' }}>
                      Last Service
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 400 }}>
                      <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {safeFormat(vehicle.lastServiceDate, 'PPpp')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Service Interval
                    </Typography>
                    <Typography sx={{ fontWeight: 400}}>
                      {vehicle.serviceInterval ? `${vehicle.serviceInterval} miles` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      Next Service Due
                    </Typography>
                    <Typography color={isDocumentExpired(vehicle.nextServiceDue) ? 'error' : '' } sx={{ fontWeight: 400 }}>
                      {safeFormat(vehicle.nextServiceDue, 'PPpp')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" c sx={{ fontSize: '0.8rem' }}>
                      Registration Expiry
                    </Typography>
                    <Typography color={isDocumentExpired(vehicle.registrationExpiry) ? 'error' : ''} sx={{ fontWeight: 400 }}>
                      {safeFormat(vehicle.registrationExpiry, 'PPpp')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      Insurance Expiry
                    </Typography>
                    <Typography color={isDocumentExpired(vehicle.insuranceExpiry) ? 'error' : ''} sx={{ fontWeight: 400 }}>
                      {safeFormat(vehicle.insuranceExpiry, 'PPpp')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{
                p: 3.5,
                mb: 4,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e3eefd 100%)',
                boxShadow: '0 4px 18px rgba(37,99,235,0.07)',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h6" sx={{
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.18rem',
                  letterSpacing: 0.5
                }}>
                  <MoneyIcon sx={{ mr: 1 }} />
                  Purchase Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Purchase Date
                    </Typography>
                    <Typography sx={{ display: 'flex', alignItems: 'center', fontWeight: 400,  }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {safeFormat(vehicle.purchaseDate, 'PPpp')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2"  sx={{ fontSize: '0.8rem' }}>
                      Purchase Price
                    </Typography>
                    <Typography sx={{ fontWeight: 400 }}>
                      {vehicle.purchasePrice ? `GH₵${vehicle.purchasePrice.toLocaleString()}` : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              {vehicle.notes && (
                <Box sx={{
                  p: 3.5,
                  mb: 4,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e3eefd 100%)',
                  boxShadow: '0 4px 18px rgba(37,99,235,0.07)',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Typography variant="h6" sx={{
                    mb: 2,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.18rem',
                    letterSpacing: 0.5
                  }}>
                    <NotesIcon sx={{ mr: 1 }} />
                    Notes
                  </Typography>
                  <Typography sx={{
                    whiteSpace: 'pre-line',
                    p: 2,
                    background: '#f4f8fd',
                    borderRadius: '8px',
                    fontWeight: 500
                  }}>
                    {vehicle.notes}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{
          px: 4,
          py: 2.5,
          borderTop: '2px solid #e3e8f0',
          background: '#f8fafc',
          borderBottomLeftRadius: '18px',
          borderBottomRightRadius: '18px'
        }}>
          <Button
            onClick={() => setState(prev => ({ ...prev, showVehicleModal: false }))}
            startIcon={<BackIcon />}
            sx={{
              borderRadius: '12px',
              minWidth: 100,
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: '#fff'
              }
            }}
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

  const renderVehicleForm = () => {
    // Data arrays from VehicleForm.jsx
    const MANUFACTURERS = [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Hyundai', 
      'Kia', 'Mazda', 'Subaru', 'Lexus', 'Acura', 'Infiniti', 'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Tesla'
    ];

    const VEHICLE_MODELS = {
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', 'Sienna', 'Prius', 'Avalon', '4Runner'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline', 'Insight', 'Clarity'],
      'Ford': ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco'],
      'Chevrolet': ['Silverado', 'Camaro', 'Corvette', 'Equinox', 'Tahoe', 'Suburban', 'Colorado', 'Traverse', 'Blazer'],
      'Nissan': ['Altima', 'Sentra', 'Maxima', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan'],
      'BMW': ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', '1 Series', '2 Series', '3 Series', '4 Series', '5 Series'],
      'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC'],
      'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7'],
      'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'ID.4', 'ID.Buzz', 'Arteon', 'Taos', 'Touareg'],
      'Hyundai': ['Accent', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Venue', 'Kona', 'Ioniq', 'Nexo'],
      'Kia': ['Rio', 'Forte', 'K5', 'K8', 'Soul', 'Sportage', 'Sorento', 'Telluride', 'Stinger', 'EV6', 'Niro'],
      'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-70', 'CX-8', 'CX-9'],
      'Subaru': ['Impreza', 'WRX', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'BRZ', 'XV', 'Levorg'],
      'Lexus': ['ES', 'IS', 'LS', 'LC', 'RC', 'GS', 'UX', 'NX', 'RX', 'GX', 'LX', 'LFA', 'CT', 'HS', 'SC'],
      'Acura': ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX', 'Integra', 'CL', 'RSX', 'TSX', 'TL', 'RL', 'ZDX'],
      'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80', 'G37', 'M37', 'EX37', 'FX37', 'JX35'],
      'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40', 'Polestar 1', 'Polestar 2', 'Polestar 3'],
      'Jaguar': ['XE', 'XF', 'XJ', 'F-Type', 'F-Pace', 'E-Pace', 'I-Pace', 'XK', 'X-Type', 'S-Type'],
      'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery'],
      'Porsche': ['911', 'Cayman', 'Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Carrera', 'Turbo', 'GT3'],
      'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi']
    };

    const generateYearOptions = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = currentYear + 1; year >= 1900; year--) {
        years.push(year);
      }
      return years;
    };

    const YEAR_OPTIONS = generateYearOptions();

    const getModelsForMake = (make) => {
      return VEHICLE_MODELS[make] || [];
    };

    const vehicleTypes = [
      { value: 'Sedan', label: 'Sedan' },
      { value: 'SUV', label: 'SUV' },
      { value: 'Truck', label: 'Truck' },
      { value: 'Van', label: 'Van' },
      { value: 'Hatchback', label: 'Hatchback' },
      { value: 'Coupe', label: 'Coupe' }
    ];

    const fuelTypes = [
      { value: 'Gasoline', label: 'Gasoline' },
      { value: 'Diesel', label: 'Diesel' },
      { value: 'Electric', label: 'Electric' },
      { value: 'Hybrid', label: 'Hybrid' },
      { value: 'LPG', label: 'LPG' }
    ];

    const transmissionTypes = [
      { value: 'Automatic', label: 'Automatic' },
      { value: 'Manual', label: 'Manual' },
      { value: 'CVT', label: 'CVT' }
    ];

    const vehicleColors = [
      { value: 'White', label: 'White', color: '#FFFFFF' },
      { value: 'Black', label: 'Black', color: '#000000' },
      { value: 'Silver', label: 'Silver', color: '#C0C0C0' },
      { value: 'Gray', label: 'Gray', color: '#808080' },
      { value: 'Red', label: 'Red', color: '#FF0000' },
      { value: 'Blue', label: 'Blue', color: '#0000FF' },
      { value: 'Green', label: 'Green', color: '#008000' },
      { value: 'Yellow', label: 'Yellow', color: '#FFFF00' },
      { value: 'Orange', label: 'Orange', color: '#FFA500' },
      { value: 'Purple', label: 'Purple', color: '#800080' },
      { value: 'Brown', label: 'Brown', color: '#A52A2A' },
      { value: 'Beige', label: 'Beige', color: '#F5F5DC' },
      { value: 'Gold', label: 'Gold', color: '#FFD700' },
      { value: 'Bronze', label: 'Bronze', color: '#CD7F32' },
      { value: 'Pink', label: 'Pink', color: '#FFC0CB' },
      { value: 'Other', label: 'Other', color: '#E0E0E0' }
    ];

    const modelOptions = state.formData.make ? [...getModelsForMake(state.formData.make), 'Other'] : [];

    return (
      <Box sx={{
        bgcolor: '#f8fafc',
        py: 4,
        px: 2
      }}>
        <Box sx={{ maxWidth: 1600, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
            justifyContent: 'space-between',
          mb: 3,
            pb: 2,
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px'
              }}>
                🚗
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 0.5 }}>
          {state.formData.id ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
                  {state.formData.id ? 'Update vehicle information and details' : 'Enter vehicle details to add to the fleet'}
                </Typography>
              </Box>
            </Box>
            
            <IconButton
              onClick={handleCancel}
              sx={{
                color: '#666',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  color: '#333'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form */}
          <Card sx={{
            borderRadius: 3,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
        <form onSubmit={handleSubmit}>
              <CardContent sx={{ p: 0 }}>
                <Grid container>
                  {/* Left Column - Basic Information */}
                  <Grid item xs={12} md={6} sx={{ p: 4, borderRight: { md: '1px solid #e5e7eb' } }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ 
                fontWeight: 600,
                        color: '#111827',
                        mb: 3,
                display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Box sx={{
                          width: 4,
                          height: 20,
                          bgcolor: '#1976d2',
                          borderRadius: 1
                        }} />
                Basic Information
              </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="medium">
                            <InputLabel>Make</InputLabel>
                            <Select
                              name="make"
                              value={state.formData.make}
                              onChange={handleChange}
                              label="Make"
                              required
                              error={!!state.validationErrors.make}
                              sx={{
                                width: 212,
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              {MANUFACTURERS.map(manufacturer => (
                                <MenuItem key={manufacturer} value={manufacturer}>
                                  {manufacturer}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {state.validationErrors.make && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                              {state.validationErrors.make}
                            </Typography>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Autocomplete
                            freeSolo
                            options={modelOptions}
                            value={state.formData.model}
                            onChange={(event, newValue) => {
                              setState(prev => ({
                                ...prev,
                                formData: { ...prev.formData, model: newValue || '' }
                              }));
                            }}
                            disabled={!state.formData.make}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Model"
                                required
                                error={!!state.validationErrors.model}
                                helperText={state.validationErrors.model}
                                variant="outlined"
                                size="medium"
                                sx={{
                                  width: 212,
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#1976d2'
                                    }
                                  }
                                }}
                              />
                            )}
                            PopperComponent={(props) => (
                              <Popper
                                {...props}
                                placement="bottom-start"
                                modifiers={[
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [0, 8],
                                    },
                                  },
                                ]}
                              />
                            )}
                            PaperComponent={(props) => (
                              <Paper
                                {...props}
                                sx={{
                                  borderRadius: 2,
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  maxHeight: 300
                                }}
                              />
                            )}
                            ListboxProps={{
                              style: { maxHeight: 300 }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="medium">
                            <InputLabel>Year</InputLabel>
                            <Select
                              name="year"
                              value={state.formData.year}
                              onChange={handleChange}
                              label="Year"
                              required
                              error={!!state.validationErrors.year}
                              sx={{
                                width: 212,
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              {YEAR_OPTIONS.map(year => (
                                <MenuItem key={year} value={year}>
                                  {year}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {state.validationErrors.year && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                              {state.validationErrors.year}
                            </Typography>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="medium">
                            <InputLabel>Color</InputLabel>
                            <Select
                              name="color"
                              value={state.formData.color}
                              onChange={handleChange}
                              label="Color"
                              required
                              error={!!state.validationErrors.color}
                              sx={{
                                width: 212,
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              {vehicleColors.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '4px',
                                        backgroundColor: option.color,
                                        border: option.color === '#FFFFFF' ? '1px solid #ddd' : 'none',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        flexShrink: 0
                                      }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#374151' }}>
                                      {option.label}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {state.validationErrors.color && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                              {state.validationErrors.color}
                            </Typography>
                          )}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                    <TextField
                            label="License Plate"
                            name="licensePlate"
                            value={state.formData.licensePlate}
                      onChange={handleChange}
                            error={!!state.validationErrors.licensePlate}
                            helperText={state.validationErrors.licensePlate || 'Format: GC 1, GC 12, GC 1-23, GC 12-34, or GC 1234 (2 numbers after dash)'}
                            required
                      variant="outlined"
                            size="medium"
                            placeholder="GC 1234"
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                    />
                  </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="VIN"
                            name="vin"
                            value={state.formData.vin}
                            onChange={handleChange}
                            error={!!state.validationErrors.vin}
                            helperText={state.validationErrors.vin}
                            required
                            variant="outlined"
                            size="medium"
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl size="medium">
                            <InputLabel>Vehicle Type</InputLabel>
                            <Select
                              name="vehicleType"
                              value={state.formData.vehicleType}
                              onChange={handleChange}
                              label="Vehicle Type"
                              sx={{
                                width: 212,
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              {vehicleTypes.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl size="medium">
                            <InputLabel>Fuel Type</InputLabel>
                      <Select
                              name="fuelType"
                              value={state.formData.fuelType}
                        onChange={handleChange}
                              label="Fuel Type"
                              sx={{
                                width: 212,
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              {fuelTypes.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl size="medium">
                            <InputLabel>Transmission</InputLabel>
                            <Select
                              name="transmission"
                              value={state.formData.transmission}
                              onChange={handleChange}
                              label="Transmission"
                              sx={{
                                width: 212,
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }}
                            >
                              {transmissionTypes.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
              </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Seating Capacity"
                            name="seatingCapacity"
                            type="number"
                            value={state.formData.seatingCapacity}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            inputProps={{ min: 1 }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
            </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Right Column - Technical & Maintenance */}
                  <Grid item xs={12} md={6} sx={{ p: 4 }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ 
                fontWeight: 600,
                        color: '#111827',
                        mb: 3,
                display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Box sx={{
                          width: 4,
                          height: 20,
                          bgcolor: '#10b981',
                          borderRadius: 1
                        }} />
                Technical & Maintenance
              </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                    <TextField
                            label="Current Mileage"
                            name="currentMileage"
                            type="number"
                            value={state.formData.currentMileage}
                      onChange={handleChange}
                      variant="outlined"
                            size="medium"
                            inputProps={{ min: 0 }}
                            InputProps={{ endAdornment: 'miles' }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Engine Size"
                            name="engineSize"
                            type="number"
                            value={state.formData.engineSize}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            inputProps={{ min: 0, step: 0.1 }}
                            InputProps={{ endAdornment: 'L' }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Purchase Price"
                            name="purchasePrice"
                            type="number"
                            value={state.formData.purchasePrice}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            inputProps={{ step: 0.01, min: 0 }}
                            InputProps={{ startAdornment: '₵' }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Service Interval"
                            name="serviceInterval"
                            type="number"
                            value={state.formData.serviceInterval}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            inputProps={{ min: 0 }}
                            InputProps={{ endAdornment: 'miles' }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Purchase Date"
                            name="purchaseDate"
                            type="date"
                            value={state.formData.purchaseDate}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                      InputLabelProps={{ shrink: true }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                    />
                  </Grid>

                        <Grid item xs={12} sm={6}>
                  <TextField
                            label="Last Service Date"
                            name="lastServiceDate"
                            type="date"
                            value={state.formData.lastServiceDate}
                    onChange={handleChange}
                    variant="outlined"
                            size="medium"
                    InputLabelProps={{ shrink: true }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                  />
                </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Next Service Due"
                            name="nextServiceDue"
                            type="date"
                            value={state.formData.nextServiceDue}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
              </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Roadworthy Expiry"
                            name="roadworthyExpiry"
                            type="date"
                            value={state.formData.roadworthyExpiry}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
            </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Registration Expiry"
                            name="registrationExpiry"
                            type="date"
                            value={state.formData.registrationExpiry}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
          </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Insurance Expiry"
                            name="insuranceExpiry"
                            type="date"
                            value={state.formData.insuranceExpiry}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              width: 212,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#1976d2'
                                }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>


                  </Grid>
                </Grid>
              </CardContent>
            </form>
          </Card>

          {/* Action Buttons */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 4,
            gap: 2
          }}>
            <Button
              onClick={handleCancel}
              variant="outlined"
              sx={{
                minWidth: 120,
                borderRadius: 2,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  borderColor: '#1976d2'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={state.formLoading}
              sx={{
                minWidth: 190,
                borderRadius: 2,
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
            >
              {state.formLoading ? <CircularProgress size={24} /> : (state.formData.id ? 'Update Vehicle' : 'Add Vehicle')}
            </Button>
          </Box>
        </Box>
      </Box>
  );
  };

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
            <Box sx={{ display: 'flex', gap: 2 }}>
         
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
                      onClick={() => handleVehicleClick(vehicle)}
                      sx={{
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { backgroundColor: alpha(COLORS.PRIMARY, 0.02) },
                        cursor: 'pointer'
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
                        <Chip
                          label={vehicle.isAssigned ? 'Assigned' : 'Available'}
                          color={vehicle.isAssigned ? 'primary' : 'success'}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>

                          <Tooltip title="Edit vehicle">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditVehicle(vehicle);
                              }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(vehicle);
                              }}
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
          {totalPages > 0 && (
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

  const handleVehicleClick = (vehicle) => {
    setState(prev => ({
      ...prev,
      selectedVehicle: vehicle,
      showVehicleShowModal: true
    }));
  };

  const handleCloseVehicleShowModal = () => {
    setState(prev => ({
      ...prev,
      showVehicleShowModal: false,
      selectedVehicle: null
    }));
  };

  const handleAssignmentClick = (assignment) => {
    // Find the full vehicle data from the vehicles array
    const fullVehicle = state.vehicles.find(v => v.id === assignment.vehicleId);
    
    if (fullVehicle) {
      // Use the complete vehicle data
      setState(prev => ({
        ...prev,
        selectedVehicle: fullVehicle,
        showVehicleShowModal: true
      }));
    } else {
      // Fallback: Create a vehicle object from the assignment data
      const vehicle = {
        id: assignment.vehicleId,
        make: assignment.vehicleMake || 'N/A',
        model: assignment.vehicleModel || 'N/A',
        licensePlate: assignment.licensePlate || 'N/A',
        year: assignment.vehicleYear || assignment.year || 'N/A',
        vin: assignment.vehicleVin || assignment.vin || 'N/A',
        vehicleType: assignment.vehicleType || assignment.type || 'Sedan',
        color: assignment.vehicleColor || assignment.color || 'N/A',
        status: 'Assigned',
        currentMileage: assignment.vehicleMileage || assignment.currentMileage || assignment.mileage || 0,
        fuelType: assignment.vehicleFuelType || assignment.fuelType || 'Gasoline',
        transmission: assignment.vehicleTransmission || assignment.transmission || 'Automatic',
        engineSize: assignment.vehicleEngineSize || assignment.engineSize || 'N/A',
        seatingCapacity: assignment.vehicleSeatingCapacity || assignment.seatingCapacity || 5,
        purchaseDate: assignment.vehiclePurchaseDate || assignment.purchaseDate || null,
        purchasePrice: assignment.vehiclePurchasePrice || assignment.purchasePrice || 0,
        lastServiceDate: assignment.vehicleLastServiceDate || assignment.lastServiceDate || null,
        serviceInterval: assignment.vehicleServiceInterval || assignment.serviceInterval || 10000,
        nextServiceDue: assignment.vehicleNextServiceDue || assignment.nextServiceDue || null,
        roadworthyExpiry: assignment.vehicleRoadworthyExpiry || assignment.roadworthyExpiry || null,
        registrationExpiry: assignment.vehicleRegistrationExpiry || assignment.registrationExpiry || null,
        insuranceExpiry: assignment.vehicleInsuranceExpiry || assignment.insuranceExpiry || null,
        notes: assignment.vehicleNotes || assignment.notes || ''
      };
      
      setState(prev => ({
        ...prev,
        selectedVehicle: vehicle,
        showVehicleShowModal: true
      }));
    }
  };

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
    <Container maxWidth={false} sx={{ 
      mt: 4, 
      maxWidth: '100% !important',
      width: sidebarExpanded ? '100%' : 'calc(100% + 100px)',
      transition: 'width 0.3s ease-in-out'
    }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Container maxWidth={false} sx={{ py: 4, maxWidth: '100% !important' }}>
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
            
            {/* Vehicle Show Modal */}
            <VehicleShowModal
              vehicle={state.selectedVehicle}
              open={state.showVehicleShowModal}
              onClose={handleCloseVehicleShowModal}
            />
          </>
        )}
      </Container>
    </Container>
  );
};

export default Assignment;
