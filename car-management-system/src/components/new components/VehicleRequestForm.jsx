import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  styled
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  LocalGasStation as FuelIcon,
  EventSeat as SeatsIcon,
  GpsFixed as GpsIcon,
  DirectionsCar as SedanIcon,
  LocalShipping as SuvIcon,
  FireTruck as TruckIcon,
  AirlineSeatReclineNormal as VanIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Vehicle SVG representations
const VehicleIcons = {
  Sedan: <SedanIcon fontSize="medium" />,
  SUV: <SuvIcon fontSize="medium" />,
  Truck: <TruckIcon fontSize="medium" />,
  Van: <VanIcon fontSize="medium" />,
  default: <SedanIcon fontSize="medium" />
};

// Styled components
const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4caf50 30%, #81c784 90%)',
  color: 'white',
  padding: '8px 10px',
  fontWeight: 300,
  boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
  },
}));

const RequestDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    padding: 0,
    width: '600px',
    maxWidth: '95vw',
    background: '#f4f8fb',
    boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)',
    border: 'none',
  },
}));

const SelectorDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    padding: theme.spacing(0),
    width: '900px',
    maxWidth: '98vw',
    maxHeight: '85vh',
    background: '#f4f8fb',
    boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)',
    border: 'none',
  },
}));

// Configure axios
const api = axios.create({
  baseURL: 'https://localhost:7092/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  withCredentials: true
});

const VehicleGridSelector = ({ 
  open, 
  onClose, 
  vehicles, 
  selectedVehicle, 
  onSelectVehicle 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 4;

  // Only show vehicles that are not assigned
  const filteredVehicles = vehicles.filter(vehicle => {
    // Exclude assigned vehicles
    if (vehicle.isAssigned) return false;
    const matchesSearch = `${vehicle.make || ''} ${vehicle.model || ''} ${vehicle.licensePlate || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || (vehicle.type || vehicle.vehicleType) === typeFilter;
    const matchesFuel = fuelFilter === 'all' || (vehicle.fuelType || '').toLowerCase() === fuelFilter.toLowerCase();
    return matchesSearch && matchesType && matchesFuel;
  });

  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * vehiclesPerPage,
    currentPage * vehiclesPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getVehicleIcon = (type) => {
    return VehicleIcons[type] || VehicleIcons.default;
  };

  return (
    <SelectorDialog open={open} onClose={onClose}>
      <Box sx={{ borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#000000b5', color: 'white', px: 4, py: 2.5, borderRadius: '24px 24px 0 0', boxShadow: '0 2px 8px 0 rgba(25,118,210,0.08)' }}>
          <Typography variant="h5" fontWeight={300} letterSpacing={0.5}>
            Select a Vehicle
          </Typography>
        </Box>
      </Box>
      <DialogContent dividers sx={{ background: '#f4f8fb', minHeight: 350, px: 4, py: 3 }}>
        {/* Search and Filter Bar */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: '#fff',
          borderRadius: 3,
          p: 2,
          boxShadow: '0 2px 8px 0 rgba(25,118,210,0.04)'
        }}>
          <TextField
            placeholder="Search vehicles..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400, bgcolor: '#f7fafc', borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              label="Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Sedan">Sedan</MenuItem>
              <MenuItem value="SUV">SUV</MenuItem>
              <MenuItem value="Truck">Truck</MenuItem>
              <MenuItem value="Van">Van</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Fuel</InputLabel>
            <Select
              value={fuelFilter}
              onChange={(e) => {
                setFuelFilter(e.target.value);
                setCurrentPage(1);
              }}
              label="Fuel"
            >
              <MenuItem value="all">All Fuels</MenuItem>
              <MenuItem value="Gasoline">Gasoline</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Petrol">Petrol</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Vehicle Grid */}
        <Grid container spacing={3} sx={{ minHeight: 300, mt: 0.5, justifyContent: 'center' }}>
          {paginatedVehicles.length > 0 ? (
            paginatedVehicles.map(vehicle => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper 
                  elevation={selectedVehicle === vehicle.id ? 8 : 2}
                  sx={{
                    p: 3,
                    height: 250,
                    width: 270,
                    minWidth: 270,
                    maxWidth: 270,
                    border: selectedVehicle === vehicle.id ? '2.5px solidrgb(0, 0, 0)' : '1.5px solid #e0e0e0',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                      borderColor: '#1976d2',
                      boxShadow: '0 8px 32px 0 rgba(147, 184, 233, 0.6)',
                      transform: 'translateY(-4px) scale(1.03)'
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: selectedVehicle === vehicle.id ? '#e3f2fd' : '#fff',
                  }}
                  onClick={() => {
                    onSelectVehicle(vehicle.id);
                    onClose();
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: selectedVehicle === vehicle.id ? '#1976d2' : '#e3f2fd', 
                    color: selectedVehicle === vehicle.id ? '#fff' : '#1976d2',
                    width: 56, 
                    height: 56, 
                    mb: 1.5,
                    boxShadow: selectedVehicle === vehicle.id ? '0 2px 12px 0 rgba(25,118,210,0.18)' : 'none',
                  }}>
                    {getVehicleIcon(vehicle.type || vehicle.vehicleType)}
                  </Avatar>
                  <Typography fontWeight={700} noWrap fontSize="1.15rem" sx={{ mb: 0.5, textAlign: 'center' }}>
                    {vehicle.make || 'Unknown'} {vehicle.model || ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.95rem" sx={{ mb: 1, textAlign: 'center' }}>
                    {vehicle.year || '-'}
                  </Typography>
                  <Chip 
                    label={vehicle.licensePlate || 'N/A'} 
                    size="medium" 
                    sx={{ mb: 1, fontSize: '1rem', height: 30, borderRadius: 2, bgcolor: '#f5f5f5', fontWeight: 600 }} 
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Chip 
                      icon={<FuelIcon fontSize="small" />} 
                      label={vehicle.fuelType || 'N/A'}
                      size="small"
                      variant="filled"
                      sx={{ fontSize: '0.95rem', height: 28, borderRadius: 2, bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}
                    />
                    <Chip 
                      label={vehicle.color || 'Color N/A'}
                      size="small"
                      variant="filled"
                      sx={{ fontSize: '0.95rem', height: 28, borderRadius: 2, bgcolor: '#fffde7', color: '#fbc02d', fontWeight: 500 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center', background: '#fff', borderRadius: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  No vehicles found matching your criteria
                </Typography>
                <Button 
                  size="small"
                  sx={{ mt: 1 }} 
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setFuelFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>

      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 2, pt: 1, background: '#f4f8fb', borderRadius: '0 0 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {filteredVehicles.length > vehiclesPerPage ? (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
            size="medium"
          />
        ) : <span />}
        <Button onClick={onClose} sx={{ fontWeight: 600, color: '#1976d2', borderRadius: 2, px: 2 }}>Cancel</Button>
      </DialogActions>
    </SelectorDialog>
  );
};

const VehicleRequestForm = () => {
  const { userId } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);
  const [selectVehicleOpen, setSelectVehicleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: '',
    requestReason: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await api.get('/Vehicles');
        setVehicles(response.data);
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load vehicles';
        setError(errorMessage);
        enqueueSnackbar(errorMessage, { 
          variant: 'error',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' }
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchVehicles();
    }
  }, [open, enqueueSnackbar]);

  const availableVehicles = Array.isArray(vehicles)
    ? vehicles.filter(vehicle => !vehicle?.userId)
    : [];

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setFormData({ vehicleId: '', requestReason: '' });
    setSelectedVehicle(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectVehicle = (id) => {
    setFormData({...formData, vehicleId: id});
    const vehicle = availableVehicles.find(v => v.id === id);
    setSelectedVehicle(vehicle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!formData.vehicleId || !formData.requestReason) {
        throw new Error('Please fill all required fields');
      }

      const payload = {
        userId,
        vehicleId: formData.vehicleId,
        requestReason: formData.requestReason
      };

      const response = await api.post('VehicleAssignment/RequestVehicle', payload);
      
      enqueueSnackbar(response.data?.message || 'Vehicle request submitted successfully', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
      
      handleClose();
    } catch (err) {
      console.error('Request failed:', err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data || 
                         err.message || 
                         'Failed to submit request';
      
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 4000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper for safe vehicle property access
  const safeVehicleProp = (vehicle, prop, fallback = '-') => {
    return vehicle && vehicle[prop] !== undefined && vehicle[prop] !== null ? vehicle[prop] : fallback;
  };

  return (
    <Box>
      <StyledButton
        variant="contained"
        onClick={handleOpen}
      >
        Request Vehicle
      </StyledButton>

      <RequestDialog open={open} onClose={handleClose}>
        <Box sx={{ borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 4, py: 2.5, borderRadius: '24px 24px 0 0', boxShadow: '0 2px 8px 0 rgba(25,118,210,0.08)' }}>
            <Typography variant="h5" fontWeight={700} letterSpacing={0.5}>
              Request Vehicle Assignment
            </Typography>
          </Box>
        </Box>
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 0, background: 'transparent', boxShadow: 'none' }}>
          <DialogContent sx={{ pt: 3, px: 4, background: '#f4f8fb' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Selected Vehicle
              </Typography>
              {selectedVehicle ? (
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, background: '#f7fafc', borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(25,118,210,0.04)', mb: 1 }}>
                  <Avatar sx={{ 
                    bgcolor: '#e3f2fd', 
                    color: 'primary.main',
                    width: 48, 
                    height: 48 
                  }}>
                    {VehicleIcons[safeVehicleProp(selectedVehicle, 'type', 'default')] || VehicleIcons.default}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700} fontSize="1.05rem">
                      {safeVehicleProp(selectedVehicle, 'make', 'Unknown')} {safeVehicleProp(selectedVehicle, 'model', '')} ({safeVehicleProp(selectedVehicle, 'year', '-')})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.95rem">
                      License: {safeVehicleProp(selectedVehicle, 'licensePlate', 'N/A')} | {safeVehicleProp(selectedVehicle, 'fuelType', 'N/A')}
                    </Typography>
                  </Box>
                </Paper>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No vehicle selected
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectVehicleOpen(true)}
                sx={{ mt: 1, fontWeight: 600, borderRadius: 2, px: 2 }}
              >
                {selectedVehicle ? 'Change Vehicle' : 'Select Vehicle'}
              </Button>
            </Box>
            <TextField
              margin="normal"
              fullWidth
              required
              multiline
              minRows={3}
              maxRows={5}
              label="Request Reason"
              name="requestReason"
              value={formData.requestReason}
              onChange={(e) => setFormData({...formData, requestReason: e.target.value})}
              disabled={loading}
              placeholder="Please explain why you need this vehicle..."
              sx={{ mt: 1, bgcolor: '#fff', borderRadius: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 2, pt: 1, background: '#f4f8fb', borderRadius: '0 0 24px 24px' }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              color="inherit"
              size="small"
              sx={{ 
                borderRadius: 2,
                px: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: '#1976d2'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={loading || !formData.vehicleId || !formData.requestReason}
              endIcon={loading ? <CircularProgress size={18} /> : null}
              sx={{ 
                borderRadius: 2,
                px: 2,
                textTransform: 'none',
                boxShadow: 'none',
                fontWeight: 600,
                '&:hover': {
                  boxShadow: 'none',
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </Paper>
      </RequestDialog>

      <VehicleGridSelector
        open={selectVehicleOpen}
        onClose={() => setSelectVehicleOpen(false)}
        vehicles={availableVehicles}
        selectedVehicle={formData.vehicleId}
        onSelectVehicle={handleSelectVehicle}
      />
    </Box>
  );
};

export default VehicleRequestForm;