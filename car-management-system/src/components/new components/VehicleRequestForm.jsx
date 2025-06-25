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
    borderRadius: 12,
    padding: theme.spacing(2),
    width: '600px', // Fixed width for the request form
    maxWidth: '95vw', // Ensure it doesn't exceed viewport on small screens
  },
}));

const SelectorDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    padding: theme.spacing(2),
    width: '900px', // Fixed width for the selector
    maxWidth: '95vw', // Ensure it doesn't exceed viewport on small screens
    maxHeight: '80vh',
    height:'600px' // Limit height with scroll for content
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
  const vehiclesPerPage = 8;

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = `${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    const matchesFuel = fuelFilter === 'all' || vehicle.fuelType === fuelFilter;
    
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
      <DialogTitle>Select a Vehicle</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ width: '100%', mt: 1 }}>
          {/* Search and Filter Bar */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mb: 2,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <TextField
              placeholder="Search vehicles..."
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1, maxWidth: 400 }}
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
              </Select>
            </FormControl>
          </Box>
          
          {/* Vehicle Grid */}
          <Grid container spacing={2} sx={{ minHeight: 300 }}>
            {paginatedVehicles.length > 0 ? (
              paginatedVehicles.map(vehicle => (
                <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                  <Paper 
                    elevation={selectedVehicle === vehicle.id ? 3 : 1}
                    sx={{
                      p: 1,
                      height: '100%',
                      border: selectedVehicle === vehicle.id ? 
                        '2px solid primary.main' : '1px solid divider',
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)'
                      },
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => {
                      onSelectVehicle(vehicle.id);
                      onClose();
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Avatar sx={{ 
                        bgcolor: 'background.default', 
                        color: 'primary.main',
                        width: 36, 
                        height: 36 
                      }}>
                        {getVehicleIcon(vehicle.type)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="bold" noWrap fontSize="0.85rem">
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize="0.7rem">
                          {vehicle.year}
                        </Typography>
                        <Chip 
                          label={vehicle.licensePlate} 
                          size="small" 
                          sx={{ mt: 0.5, fontSize: '0.65rem', height: 20 }} 
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5, 
                      mt: 'auto',
                      pt: 0.5,
                      flexWrap: 'wrap'
                    }}>
                      <Chip 
                        icon={<FuelIcon fontSize="small" />}
                        label={vehicle.fuelType}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                      <Chip 
                        icon={<SeatsIcon fontSize="small" />}
                        label={`${vehicle.seats} seats`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 22 }}
                      />
                      {vehicle.features?.includes('GPS') && (
                        <Chip 
                          icon={<GpsIcon fontSize="small" />}
                          label="GPS"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 22 }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
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
          
          {/* Pagination */}
          {filteredVehicles.length > vehiclesPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
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

  return (
    <Box>
      <StyledButton
        variant="contained"
        onClick={handleOpen}
      >
        Request Vehicle
      </StyledButton>

      <RequestDialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: '8px 8px 0 0',
          py: 1.5,
          px: 2
        }}>
          <Typography variant="h6" fontWeight="600">
            Request Vehicle Assignment
          </Typography>
        </DialogTitle>
        
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 1.5 }}>
          <DialogContent sx={{ pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
                <Typography variant="body2">{error}</Typography>
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Vehicle
              </Typography>
              {selectedVehicle ? (
                <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    bgcolor: 'background.default', 
                    color: 'primary.main',
                    width: 42, 
                    height: 42 
                  }}>
                    {VehicleIcons[selectedVehicle.type] || VehicleIcons.default}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="bold" fontSize="0.95rem">
                      {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                      License: {selectedVehicle.licensePlate} | {selectedVehicle.fuelType} | {selectedVehicle.seats} seats
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
                sx={{ mt: 1 }}
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
              sx={{ mt: 1 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 2, py: 1.5 }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              color="inherit"
              size="small"
              sx={{ 
                borderRadius: 1.5,
                px: 2,
                textTransform: 'none'
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
                borderRadius: 1.5,
                px: 2,
                textTransform: 'none',
                boxShadow: 'none',
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