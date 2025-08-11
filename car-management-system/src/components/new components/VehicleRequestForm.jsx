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
  styled,
  alpha
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
  AirlineSeatReclineNormal as VanIcon,
  Add as AddIcon,
  Close as CloseIcon
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

// Enhanced styled components
const StyledButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
  color: 'white',
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '0.95rem',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(30, 41, 59, 0.3)',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    boxShadow: '0 6px 20px rgba(30, 41, 59, 0.4)',
    transform: 'translateY(-2px)'
  },
  '&:active': {
    transform: 'translateY(0)'
  }
}));

const RequestDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    padding: 0,
    width: '650px',
    maxWidth: '95vw',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    overflow: 'hidden'
  },
}));

const SelectorDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    padding: theme.spacing(0),
    width: '1000px',
    maxWidth: '98vw',
    maxHeight: '90vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    overflow: 'hidden'
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)'
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      border: '2px solid #475569',
      boxShadow: '0 4px 20px rgba(71, 85, 105, 0.15)'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#475569',
    fontWeight: 500
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      border: '1px solid rgba(71, 85, 105, 0.4)',
      boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)'
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      border: '2px solid #475569',
      boxShadow: '0 4px 20px rgba(71, 85, 105, 0.15)'
    }
  },
  '& .MuiInputLabel-root': {
    color: '#475569',
    fontWeight: 500
  }
}));

const VehicleCard = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(3),
  height: 280,
  width: 280,
  minWidth: 280,
  maxWidth: 280,
  border: selected ? '3px solid #475569' : '2px solid rgba(226, 232, 240, 0.8)',
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: selected 
    ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.05) 0%, rgba(100, 116, 139, 0.05) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: '#475569',
    boxShadow: selected 
      ? '0 12px 40px rgba(71, 85, 105, 0.2)'
      : '0 8px 30px rgba(71, 85, 105, 0.15)',
    transform: 'translateY(-6px) scale(1.02)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: selected 
      ? 'linear-gradient(90deg, #475569 0%, #64748b 100%)'
      : 'transparent',
    borderRadius: '16px 16px 0 0'
  }
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
      <Box sx={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          px: 4, 
          py: 3, 
          borderRadius: '20px 20px 0 0', 
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)'
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight={600} letterSpacing={0.5}>
              Select a Vehicle
            </Typography>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <DialogContent dividers sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
        minHeight: 400, 
        px: 4, 
        py: 3 
      }}>
        {/* Enhanced Search and Filter Bar */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          p: 3,
          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <StyledTextField
            placeholder="Search vehicles..."
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#475569' }} />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <StyledFormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Vehicle Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              label="Vehicle Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Sedan">Sedan</MenuItem>
              <MenuItem value="SUV">SUV</MenuItem>
              <MenuItem value="Truck">Truck</MenuItem>
              <MenuItem value="Van">Van</MenuItem>
            </Select>
          </StyledFormControl>
          <StyledFormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Fuel Type</InputLabel>
            <Select
              value={fuelFilter}
              onChange={(e) => {
                setFuelFilter(e.target.value);
                setCurrentPage(1);
              }}
              label="Fuel Type"
            >
              <MenuItem value="all">All Fuels</MenuItem>
              <MenuItem value="Gasoline">Gasoline</MenuItem>
              <MenuItem value="Diesel">Diesel</MenuItem>
              <MenuItem value="Electric">Electric</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
              <MenuItem value="Petrol">Petrol</MenuItem>
            </Select>
          </StyledFormControl>
        </Box>
        
        {/* Enhanced Vehicle Grid */}
        <Grid container spacing={3} sx={{ minHeight: 350, mt: 1, justifyContent: 'center' }}>
          {paginatedVehicles.length > 0 ? (
            paginatedVehicles.map(vehicle => (
              <Grid item xs={12} sm={6} md={4} key={vehicle.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                <VehicleCard 
                  selected={selectedVehicle === vehicle.id}
                  onClick={() => {
                    onSelectVehicle(vehicle.id);
                    onClose();
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: selectedVehicle === vehicle.id 
                      ? 'linear-gradient(135deg, #475569 0%, #64748b 100%)' 
                      : 'rgba(71, 85, 105, 0.1)', 
                    color: selectedVehicle === vehicle.id ? '#fff' : '#475569',
                    width: 64, 
                    height: 64, 
                    mb: 2,
                    boxShadow: selectedVehicle === vehicle.id 
                      ? '0 4px 20px rgba(71, 85, 105, 0.3)' 
                      : '0 2px 10px rgba(71, 85, 105, 0.15)',
                    border: selectedVehicle === vehicle.id 
                      ? '2px solid rgba(255, 255, 255, 0.3)' 
                      : '1px solid rgba(71, 85, 105, 0.2)'
                  }}>
                    {getVehicleIcon(vehicle.type || vehicle.vehicleType)}
                  </Avatar>
                  
                  <Typography 
                    fontWeight={700} 
                    noWrap 
                    fontSize="1.2rem" 
                    sx={{ 
                      mb: 0.5, 
                      textAlign: 'center',
                      color: selectedVehicle === vehicle.id ? '#475569' : '#1e293b'
                    }}
                  >
                    {vehicle.make || 'Unknown'} {vehicle.model || ''}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    fontSize="1rem" 
                    sx={{ 
                      mb: 1.5, 
                      textAlign: 'center',
                      fontWeight: 500
                    }}
                  >
                    {vehicle.year || '-'}
                  </Typography>
                  
                  <Chip 
                    label={vehicle.licensePlate || 'N/A'} 
                    size="medium" 
                    sx={{ 
                      mb: 2, 
                      fontSize: '1rem', 
                      height: 32, 
                      borderRadius: '8px', 
                      bgcolor: selectedVehicle === vehicle.id 
                        ? 'rgba(71, 85, 105, 0.1)' 
                        : 'rgba(255, 255, 255, 0.8)',
                      color: selectedVehicle === vehicle.id ? '#475569' : '#334155',
                      fontWeight: 600,
                      border: selectedVehicle === vehicle.id 
                        ? '1px solid rgba(71, 85, 105, 0.3)' 
                        : '1px solid rgba(226, 232, 240, 0.8)'
                    }} 
                  />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 'auto', 
                    pt: 1, 
                    flexWrap: 'wrap', 
                    justifyContent: 'center' 
                  }}>
                    <Chip 
                      icon={<FuelIcon fontSize="small" />} 
                      label={vehicle.fuelType || 'N/A'}
                      size="small"
                      variant="filled"
                      sx={{ 
                        fontSize: '0.9rem', 
                        height: 26, 
                        borderRadius: '6px', 
                        bgcolor: 'rgba(71, 85, 105, 0.1)', 
                        color: '#475569', 
                        fontWeight: 500,
                        border: '1px solid rgba(71, 85, 105, 0.2)'
                      }}
                    />
                    <Chip 
                      label={vehicle.color || 'N/A'}
                      size="small"
                      variant="filled"
                      sx={{ 
                        fontSize: '0.9rem', 
                        height: 26, 
                        borderRadius: '6px', 
                        bgcolor: 'rgba(100, 116, 139, 0.1)', 
                        color: '#64748b', 
                        fontWeight: 500,
                        border: '1px solid rgba(100, 116, 139, 0.2)'
                      }}
                    />
                  </Box>
                </VehicleCard>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 4, 
                textAlign: 'center', 
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                  No vehicles found matching your criteria
                </Typography>
                <Button 
                  variant="outlined"
                  size="small"
                  sx={{ 
                    mt: 1,
                    borderRadius: '8px',
                    borderColor: '#475569',
                    color: '#475569',
                    '&:hover': {
                      borderColor: '#334155',
                      backgroundColor: 'rgba(71, 85, 105, 0.05)'
                    }
                  }}
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
      
      <DialogActions sx={{ 
        px: 4, 
        pb: 3, 
        pt: 2, 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        borderRadius: '0 0 20px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        {filteredVehicles.length > vehiclesPerPage ? (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
                fontWeight: 500
              }
            }}
          />
        ) : <span />}
        <Button 
          onClick={onClose} 
          sx={{ 
            fontWeight: 600, 
            color: '#475569', 
            borderRadius: '8px', 
            px: 3,
            py: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(71, 85, 105, 0.05)'
            }
          }}
        >
          Cancel
        </Button>
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
        startIcon={<AddIcon />}
      >
        Request Vehicle
      </StyledButton>

      <RequestDialog open={open} onClose={handleClose}>
        <Box sx={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          <Box sx={{ 
            background: 'rgba(34, 34, 37, 0.57)', 
            color: 'white', 
            px: 4, 
            py: 3, 
            borderRadius: '20px 20px 0 0', 
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.72) 50%, transparent 100%)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight={600} letterSpacing={0.5}>
                Request Vehicle Assignment
              </Typography>
              <IconButton 
                onClick={handleClose}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 0, background: 'transparent', boxShadow: 'none' }}>
          <DialogContent sx={{ pt: 4, px: 4, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            {error && (
              <Alert severity="error" sx={{ 
                mb: 3, 
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-icon': {
                  color: '#dc2626'
                }
              }}>
                <Typography variant="body2" fontWeight={500}>{error}</Typography>
              </Alert>
            )}
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2, color: '#1e293b' }}>
                Selected Vehicle
              </Typography>
              {selectedVehicle ? (
                <Paper sx={{ 
                  p: 3, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 3, 
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px', 
                  boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  mb: 2
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'linear-gradient(135deg, #475569 0%, #64748b 100%)', 
                    color: 'white',
                    width: 56, 
                    height: 56,
                    boxShadow: '0 4px 20px rgba(71, 85, 105, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}>
                    {VehicleIcons[safeVehicleProp(selectedVehicle, 'type', 'default')] || VehicleIcons.default}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} fontSize="1.1rem" sx={{ mb: 0.5, color: '#1e293b' }}>
                      {safeVehicleProp(selectedVehicle, 'make', 'Unknown')} {safeVehicleProp(selectedVehicle, 'model', '')} ({safeVehicleProp(selectedVehicle, 'year', '-')})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.95rem" sx={{ mb: 1 }}>
                      License: {safeVehicleProp(selectedVehicle, 'licensePlate', 'N/A')} | {safeVehicleProp(selectedVehicle, 'fuelType', 'N/A')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={safeVehicleProp(selectedVehicle, 'vehicleType', 'N/A')}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(71, 85, 105, 0.1)', 
                          color: '#475569',
                          fontWeight: 500,
                          border: '1px solid rgba(71, 85, 105, 0.2)'
                        }}
                      />
                      <Chip 
                        label={safeVehicleProp(selectedVehicle, 'color', 'N/A')}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(100, 116, 139, 0.1)', 
                          color: '#64748b',
                          fontWeight: 500,
                          border: '1px solid rgba(100, 116, 139, 0.2)'
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  border: '2px dashed rgba(71, 85, 105, 0.3)'
                }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    No vehicle selected
                  </Typography>
                </Paper>
              )}
              
              <Button
                variant="outlined"
                size="medium"
                onClick={() => setSelectVehicleOpen(true)}
                sx={{ 
                  mt: 2, 
                  fontWeight: 600, 
                  borderRadius: '12px', 
                  px: 3,
                  py: 1,
                  borderColor: '#475569',
                  color: '#475569',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#334155',
                    backgroundColor: 'rgba(71, 85, 105, 0.05)',
                    boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)'
                  }
                }}
              >
                {selectedVehicle ? 'Change Vehicle' : 'Select Vehicle'}
              </Button>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2, color: '#1e293b' }}>
                Request Details
              </Typography>
              <StyledTextField
                margin="normal"
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={6}
                label="Request Reason"
                name="requestReason"
                value={formData.requestReason}
                onChange={(e) => setFormData({...formData, requestReason: e.target.value})}
                disabled={loading}
                placeholder="Please explain why you need this vehicle, including the purpose, duration, and any specific requirements..."
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ 
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.95rem'
                  }
                }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            px: 4, 
            pb: 3, 
            pt: 2, 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
            borderRadius: '0 0 20px 20px',
            borderTop: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              color="inherit"
              size="medium"
              sx={{ 
                borderRadius: '12px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                color: '#475569',
                '&:hover': {
                  backgroundColor: 'rgba(71, 85, 105, 0.05)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="medium"
              disabled={loading || !formData.vehicleId || !formData.requestReason}
              endIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ 
                borderRadius: '12px',
                px: 4,
                py: 1,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(30, 41, 59, 0.3)',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  boxShadow: '0 6px 20px rgba(30, 41, 59, 0.4)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  background: 'rgba(156, 163, 175, 0.5)',
                  boxShadow: 'none',
                  transform: 'none'
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