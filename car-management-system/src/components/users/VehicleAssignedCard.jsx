import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { getAuthData } from '../../services/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Modal,
  Box,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Fade,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Add as AddIcon,
  Build as ToolIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  LocalGasStation as GasIcon,
  Speed as SpeedIcon,
  ConfirmationNumber as VinIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import VehicleRequestForm from '../new components/VehicleRequestForm';
import { styled } from '@mui/system';

const API_URL = 'https://localhost:7092/api';

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  minWidth: 600,
  maxWidth: 600,
  minHeight: 430,
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(145deg, #ffffff, #f5f7fa)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)'
  }
}));

const DetailItem = ({ label, value, icon }) => (
  <Box sx={{
    display: 'flex',
    mb: 2,
    alignItems: 'flex-start',
    p: 1.5,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      transform: 'translateX(3px)'
    }
  }}>
    <Box sx={{
      color: 'primary.main',
      mr: 2,
      mt: 0.5,
      fontSize: '1.2rem',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      borderRadius: '50%',
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500, letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium" sx={{ color: 'text.primary', fontSize: '0.95rem' }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const VehicleCard = ({ vehicle, onClick, upcomingMaintenanceCount, nextMaintenanceDate }) => {
  const theme = useTheme();

  const getVehicleColor = (status) => {
    return status === 'active' ? theme?.palette?.success?.main || '#4caf50' : theme?.palette?.error?.main || '#f44336';
  };

  const getVehicleImage = (type) => {
    switch (type?.toLowerCase()) {
      case 'sedan': return 'https://cdn-icons-png.flaticon.com/512/9851/9851669.png';
      case 'suv': return 'https://cdn-icons-png.flaticon.com/512/5952/5952510.png';
      case 'truck': return 'https://cdn-icons-png.flaticon.com/512/6087/6087342.png';
      case 'van': return 'https://cdn-icons-png.flaticon.com/512/3097/3097218.png';
      default: return 'https://cdn-icons-png.flaticon.com/512/2962/2962303.png';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -7 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 20, damping: 5 }}
    >
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          mb: 2,
          borderRadius: 3,
          backgroundColor: theme?.palette?.background?.paper || '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: `4px solid ${getVehicleColor(vehicle.status)}`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Avatar
            src={getVehicleImage(vehicle.vehicleType)}
            sx={{
              width: 64,
              height: 64,
              bgcolor: theme?.palette?.background?.default || '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: `2px solid ${theme?.palette?.divider || '#ddd'}`,
              '& img': {
                objectFit: 'contain',
                padding: 1
              }
            }}
          />
          <Badge
            badgeContent={upcomingMaintenanceCount}
            color="warning"
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              '& .MuiBadge-badge': {
                fontWeight: 'bold',
                fontSize: '0.7rem',
                border: `2px solid ${theme?.palette?.background?.paper || '#fff'}`,
                minWidth: 24,
                height: 24
              }
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'text.primary'
              }}
            >
              {vehicle.make} {vehicle.model}
            </Typography>
            <Chip
              label={vehicle.vehicleType}
              size="small"
              sx={{
                ml: 1.5,
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                color: 'text.secondary'
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip
              label={vehicle.licensePlate}
              size="small"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                color: 'primary.dark',
                mr: 1.5
              }}
            />
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              color: vehicle.status === 'active' ? 'success.main' : 'error.main'
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: vehicle.status === 'active' ? 'success.main' : 'error.main',
                mr: 0.5,
                boxShadow: `0 0 6px ${vehicle.status === 'active' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}`
              }} />
              <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                {vehicle.status}
              </Typography>
            </Box>
          </Box>

          {nextMaintenanceDate && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 152, 0, 0.08)',
              borderRadius: 2,
              px: 1.5,
              py: 0.8,
              width: 'fit-content'
            }}>
              <EventIcon sx={{
                fontSize: '1rem',
                color: 'warning.main',
                mr: 1
              }} />
              <Typography variant="caption" sx={{
                fontWeight: 600,
                color: 'warning.dark'
              }}>
                Next service: {new Date(nextMaintenanceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Typography>
            </Box>
          )}
        </Box>

        <IconButton sx={{
          ml: 1,
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.2)'
          }
        }}>
          <InfoIcon />
        </IconButton>
      </Box>
    </motion.div>
  );
};

const EmptyVehicleCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: theme?.spacing?.(4) || 24,
  borderRadius: 16,
  backgroundColor: theme?.palette?.background?.paper || '#fff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: `1px dashed ${theme?.palette?.divider || '#ddd'}`,
  '& .MuiSvgIcon-root': {
    fontSize: '3rem',
    color: theme?.palette?.text?.secondary || 'rgba(0, 0, 0, 0.54)',
    marginBottom: theme?.spacing?.(2) || 16
  }
}));

const GhanaianLicensePlate = ({ licensePlate }) => {
  // Parse the license plate for region, number, and suffix
  let region = '', number = '', suffix = '';
  if (licensePlate) {
    const parts = licensePlate.split(' ');
    region = parts[0] || '';
    number = parts[1] || '';
    suffix = parts[2] || '';
  }

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: 330,
      height: 74,
      background: 'linear-gradient(135deg, #fff 70%, #e9e9e9 100%)',
      border: '3px solid #222',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      position: 'relative',
      px: 2.5,
      py: 1.5,
      mb: 2,
      fontFamily: 'Impact, Arial Black, Arial, sans-serif',
      overflow: 'hidden',
      letterSpacing: 2,
      '::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'repeating-linear-gradient(120deg, transparent, transparent 12px, rgba(0,0,0,0.03) 14px, transparent 16px)',
        opacity: 0.7,
        zIndex: 2
      }
    }}>
      {/* Plate Text */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, zIndex: 3 }}>
        <Typography variant="h5" sx={{
          fontWeight: 900,
          color: '#181818',
          fontFamily: 'Impact, Arial Black, Arial, sans-serif',
          fontSize: 34,
          lineHeight: 1,
          mr: 1.5,
          textShadow: '0 1px 0 #fff, 0 2px 2px #bbb',
        }}>{region}</Typography>
        <Typography variant="h5" sx={{
          fontWeight: 900,
          color: '#181818',
          fontSize: 34,
          lineHeight: 1,
          mr: 1.5,
          textShadow: '0 1px 0 #fff, 0 2px 2px #bbb',
        }}>{number}</Typography>
        <Typography variant="h5" sx={{
          fontWeight: 900,
          color: '#181818',
          fontSize: 34,
          lineHeight: 1,
        }}>{suffix}</Typography>
      </Box>
      {/* Ghana flag and GH at top right */}
      <Box sx={{ position: 'absolute', top: 7, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
          alt="Ghana Flag"
          style={{ width: 32, height: 20, border: '1px solid #222', borderRadius: 2, marginBottom: 1 }}
        />
      </Box>
      {/* GH at bottom right */}
      <Typography variant="caption" sx={{
        position: 'absolute',
        bottom: 7,
        right: 20,
        fontWeight: 700,
        color: '#181818',
        fontSize: 13,
        letterSpacing: 1,
        zIndex: 3
      }}>GH</Typography>
      {/* Thin inner border for depth */}
      <Box sx={{
        position: 'absolute',
        inset: 4,
        border: '1.5px solid #bbb',
        borderRadius: '6px',
        pointerEvents: 'none',
        zIndex: 2
      }} />
    </Box>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const VehicleAssignedCard = () => {
  const theme = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({ requestType: '', description: '', priority: '' });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [scheduleToUpdate, setScheduleToUpdate] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', comments: '', expectedCompletionDate: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authData = getAuthData();
        if (!authData || !authData.token) {
          navigate('/login');
          return;
        }

        const userId = authData.userId;
        if (!userId) {
          throw new Error('User ID not available');
        }

        const [vehiclesResponse, schedulesResponse] = await Promise.all([
          axios.get(`${API_URL}/VehicleAssignment/ByUser/${userId}`, {
            headers: { Authorization: `Bearer ${authData.token}` }
          }),
          axios.get(`${API_URL}/MaintenanceRequest/user/${userId}/schedules`, {
            headers: { Authorization: `Bearer ${authData.token}` }
          })
        ]);

        setVehicles(vehiclesResponse.data);
        setSchedules(schedulesResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const getUpcomingSchedules = (vehicleId) => {
    return schedules.filter(schedule => schedule.vehicleId === vehicleId).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  const getNextMaintenanceDate = (vehicleId) => {
    const upcoming = getUpcomingSchedules(vehicleId);
    return upcoming.length > 0 ? upcoming[0].scheduledDate : null;
  };

  const handleViewClick = async (vehicle) => {
    try {
      const response = await axios.get(`${API_URL}/Vehicles/${vehicle.id}`, {
        headers: { Authorization: `Bearer ${getAuthData().token}` }
      });
      setSelectedVehicle(response.data);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authData = getAuthData();
    if (!authData || !authData.userId) return;

    const vehicleId = vehicles.length > 0 ? vehicles[0].id : null;
    if (!vehicleId) {
      setError("No vehicle assigned to the user.");
      return;
    }

    const payload = { ...formData, VehicleId: vehicleId };

    try {
      setProcessing(true);
      await axios.post(`${API_URL}/MaintenanceRequest/personal?userId=${authData.userId}`, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setSubmitSuccess(false);
        setFormData({ requestType: '', description: '', priority: '' });
        setProcessing(false);
      }, 1500);
    } catch (error) {
      setProcessing(false);
      console.error('Error submitting request:', error);
    }
  };

  const handleUpdateClick = (schedule) => {
    setScheduleToUpdate(schedule);
    setUpdateForm({
      status: schedule.status || '',
      comments: schedule.comments || '',
      expectedCompletionDate: schedule.expectedCompletionDate ? schedule.expectedCompletionDate.split('T')[0] : ''
    });
    setUpdateModalOpen(true);
  };
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleToUpdate) return;
    try {
      await axios.put(`${API_URL}/MaintenanceRequest/schedule/${scheduleToUpdate.id}/update`, updateForm);
      setUpdateModalOpen(false);
      setScheduleToUpdate(null);
      // Refresh schedules
      const authData = getAuthData();
      const userId = authData.userId;
      const schedulesResponse = await axios.get(`${API_URL}/MaintenanceRequest/user/${userId}/schedules`, {
        headers: { Authorization: `Bearer ${authData.token}` }
      });
      setSchedules(schedulesResponse.data);
    } catch (err) {
      // handle error (show toast or alert)
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2,
          borderRadius: 2,
          background: 'linear-gradient(90deg, rgba(25,118,210,0.1) 0%, rgba(25,118,210,0.05) 100%)'
        }}>
          <Typography variant="h6" sx={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            color: 'primary.dark',
            letterSpacing: '0.5px'
          }}>
            <CarIcon sx={{
              mr: 1.5,
              fontSize: '2rem',
              backgroundColor: 'primary.main',
              color: '#fff',
              borderRadius: '50%',
              p: 0.8,
              boxShadow: '0 3px 10px rgba(25, 118, 210, 0.3)'
            }} />
            My Assigned Vehicles
          </Typography>
          <Chip
            label={`${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 700,
              borderColor: 'primary.main',
              color: 'primary.dark',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              letterSpacing: '0.5px'
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300,
            background: 'linear-gradient(145deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%)',
            borderRadius: 2
          }}>
            <CircularProgress
              color="primary"
              size={60}
              thickness={4}
              sx={{
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>Loading your vehicles...</Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            icon={<ErrorIcon fontSize="large" />}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: 1,
              borderLeft: '4px solid',
              borderColor: 'error.main',
              backgroundColor: 'rgba(244, 67, 54, 0.05)'
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>Error loading vehicles</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{error}</Typography>
          </Alert>
        ) : vehicles.length === 0 ? (
          <EmptyVehicleCard>
            <CarIcon />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>No vehicles assigned</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '80%' }}>
              You don't have any vehicles assigned to you yet. Request a vehicle assignment if needed.
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <VehicleRequestForm />
            </motion.div>
          </EmptyVehicleCard>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {vehicles.slice(0, 3).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={() => handleViewClick(vehicle)}
                  upcomingMaintenanceCount={getUpcomingSchedules(vehicle.id).length}
                  nextMaintenanceDate={getNextMaintenanceDate(vehicle.id)}
                />
              ))}
            </Box>

            {vehicles.length > 3 && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={() => navigate('/my-vehicles')}
                  endIcon={<AddIcon />}
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.1)'
                    }
                  }}
                >
                  View all {vehicles.length} vehicles
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 'auto' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setShowRequestModal(true)}
                  startIcon={<ToolIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                    letterSpacing: '0.5px',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                    }
                  }}
                >
                  Request Maintenance
                </Button>
              </motion.div>
            </Box>
          </>
        )}
      </CardContent>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Fade in={showModal}>
          <Box sx={{
            width: '98%',
            maxWidth: 1000,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: 'none',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                <CarIcon sx={{ mr: 1.5 }} />
                {selectedVehicle?.make} {selectedVehicle?.model} Details
              </Typography>
              <IconButton onClick={() => setShowModal(false)} sx={{ color: 'text.secondary', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' } }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
              <Tab label="Details" />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Schedules
                    <Chip
                      label={getUpcomingSchedules(selectedVehicle?.id || '').length}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: 13, height: 22 }}
                    />
                  </Box>
                }
              />
            </Tabs>
            {tabIndex === 0 && selectedVehicle && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <GhanaianLicensePlate licensePlate={selectedVehicle.licensePlate} />
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 4,
                  width: '100%',
                  mt: 2
                }}>
                  <Box>
                    <Typography variant="subtitle2"  sx={{
                      mb: 2,
                      fontWeight: 300,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <InfoIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      Vehicle Information
                    </Typography>
                    <DetailItem label="Make" value={selectedVehicle.make} icon={<CarIcon />} />
                    <DetailItem label="Model" value={selectedVehicle.model} icon={<InfoIcon />} />
                    <DetailItem label="Year" value={selectedVehicle.year} icon={<CalendarIcon />} />
                    <DetailItem label="VIN" value={selectedVehicle.vin} icon={<VinIcon />} />
                    <DetailItem label="Color" value={selectedVehicle.color} icon={
                      <Box sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: selectedVehicle.color || 'grey.500',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }} />
                    } />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      mb: 2,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <SpeedIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      Specifications
                    </Typography>
                    <DetailItem label="Type" value={selectedVehicle.vehicleType} icon={<CarIcon />} />
                    <DetailItem label="Fuel Type" value={selectedVehicle.fuelType} icon={<GasIcon />} />
                    <DetailItem label="Transmission" value={selectedVehicle.transmission} icon={<ToolIcon />} />
                    <DetailItem label="Engine Size" value={selectedVehicle.engineSize ? `${selectedVehicle.engineSize} cc` : null} icon={<SpeedIcon />} />
                    <DetailItem label="Seating" value={selectedVehicle.seatingCapacity} icon={<PeopleIcon />} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      mb: 2,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <MoneyIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      Registration
                    </Typography>
                    <DetailItem label="Purchase Date" value={formatDate(selectedVehicle.purchaseDate)} icon={<CalendarIcon />} />
                    <DetailItem label="Purchase Price" value={selectedVehicle.purchasePrice ? `$${selectedVehicle.purchasePrice.toLocaleString()}` : null} icon={<MoneyIcon />} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      mb: 2,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <StarIcon sx={{ mr: 1, fontSize: '1rem' }} />
                      Status
                    </Typography>
                    <DetailItem label="Mileage" value={`${selectedVehicle.currentMileage?.toLocaleString() || '--'} miles`} icon={<SpeedIcon />} />
                    <DetailItem label="Last Service" value={formatDate(selectedVehicle.lastServiceDate)} icon={<ToolIcon />} />
                    <DetailItem label="Next Maintenance" value={getNextMaintenanceDate(selectedVehicle.id) ? formatDate(getNextMaintenanceDate(selectedVehicle.id)) : 'Not scheduled'} icon={<FiClock />} />
                  </Box>
                </Box>
              </Box>
            )}
            {tabIndex === 1 && selectedVehicle && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Upcoming Maintenance</Typography>
                {getUpcomingSchedules(selectedVehicle.id).length === 0 ? (
                  <Typography color="text.secondary">No upcoming maintenance scheduled for this vehicle.</Typography>
                ) : (
                  <Box>
                    {getUpcomingSchedules(selectedVehicle.id).map((schedule) => (
                      <Box key={schedule.id} sx={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e3eefd 100%)',
                        borderRadius: 3,
                        p: 2.5,
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 18px rgba(37,99,235,0.07)',
                        transition: 'box-shadow 0.2s, background 0.2s',
                        '&:hover': {
                          boxShadow: '0 8px 32px rgba(37,99,235,0.13)',
                          background: 'linear-gradient(135deg, #e3eefd 0%, #f8fafc 100%)',
                        },
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 2 }}>
                            {formatDate(schedule.scheduledDate)}
                          </Typography>
                          <Chip
                            label={schedule.status}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              backgroundColor:
                                (schedule.status || '').toLowerCase() === 'completed'
                                  ? 'rgba(76, 175, 80, 0.18)' // green
                                  : (schedule.status || '').toLowerCase() === 'pending'
                                  ? 'rgba(255, 193, 7, 0.18)' // yellow
                                  : 'rgba(25, 118, 210, 0.12)', // blue
                              color:
                                (schedule.status || '').toLowerCase() === 'completed'
                                  ? 'success.main'
                                  : (schedule.status || '').toLowerCase() === 'pending'
                                  ? 'warning.dark'
                                  : 'primary.dark',
                              ml: 1
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, color: 'text.primary' }}>
                          {schedule.repairType}: {schedule.reason}
                        </Typography>
                        {schedule.assignedMechanicName && (
                          <Typography variant="caption" color="text.secondary">
                            Mechanic: {schedule.assignedMechanicName}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={showRequestModal}
        onClose={() => !submitSuccess && setShowRequestModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          outline: 'none',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          {submitSuccess ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              p: 3,
              background: 'linear-gradient(145deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              borderRadius: 2
            }}>
              <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'success.dark' }}>Request Submitted!</Typography>
              <Typography variant="body1" color="text.secondary">Your maintenance request has been successfully submitted.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <ToolIcon sx={{ mr: 1.5 }} />
                  New Maintenance Request
                </Typography>
                <IconButton
                  onClick={() => setShowRequestModal(false)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>This maintenance request will be associated with your assigned vehicle.</Typography>
                <TextField
                  select
                  fullWidth
                  label="Request Type"
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleChange}
                  margin="normal"
                  required
                  size="medium"
                  sx={{ mb: 2 }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">Select request type</MenuItem>
                  <MenuItem value="RoutineMaintenance">Routine Maintenance</MenuItem>
                  <MenuItem value="Repair">Repair</MenuItem>
                  <MenuItem value="Inspection">Inspection</MenuItem>
                  <MenuItem value="TireReplacement">Tire Replacement</MenuItem>
                  <MenuItem value="BrakeService">Brake Service</MenuItem>
                  <MenuItem value="OilChange">Oil Change</MenuItem>
                  <MenuItem value="Upgrade">Upgrade</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  margin="normal"
                  required
                  multiline
                  rows={4}
                  placeholder="Describe the issue or service needed..."
                  size="medium"
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: {
                      '&:hover fieldset': {
                        borderColor: 'primary.main !important'
                      }
                    }
                  }}
                />
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  margin="normal"
                  required
                  size="medium"
                  sx={{ mb: 3 }}
                >
                  <MenuItem value="">Select priority level</MenuItem>
                  <MenuItem value="Low">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                      Low (can wait 1-2 weeks)
                    </Box>
                  </MenuItem>
                  <MenuItem value="Medium">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main', mr: 1 }} />
                      Medium (needs attention in a few days)
                    </Box>
                  </MenuItem>
                  <MenuItem value="High">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }} />
                      High (requires immediate attention)
                    </Box>
                  </MenuItem>
                </TextField>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 1,
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                      letterSpacing: '0.5px',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)'
                      }
                    }}
                    disabled={processing}
                    endIcon={processing ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {processing ? 'Processing...' : 'Submit Request'}
                  </Button>
                </motion.div>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal open={updateModalOpen} onClose={() => setUpdateModalOpen(false)}>
        <Box sx={{
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          outline: 'none',
          mx: 'auto',
          mt: '10vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Update Schedule</Typography>
          <form onSubmit={handleUpdateSubmit}>
            <TextField
              select
              fullWidth
              label="Status"
              name="status"
              value={updateForm.status}
              onChange={handleUpdateChange}
              margin="normal"
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Comments"
              name="comments"
              value={updateForm.comments}
              onChange={handleUpdateChange}
              margin="normal"
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Expected Completion Date"
              name="expectedCompletionDate"
              type="date"
              value={updateForm.expectedCompletionDate}
              onChange={handleUpdateChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>Save Update</Button>
          </form>
        </Box>
      </Modal>
    </StyledCard>
  );
};

export default VehicleAssignedCard;
