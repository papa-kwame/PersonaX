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
  List,
  ListItem,
  ListItemText,
  Modal,
  Box,
  TextField,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Avatar,
  Fade,
  Zoom,
  Slide,
  Grow,
  Badge
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
  Warning as WarningIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { FiTool, FiCalendar, FiFileText, FiUser, FiDollarSign, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import VehicleRequestForm from '../new components/VehicleRequestForm';
import { styled } from '@mui/system';

const API_URL = 'https://localhost:7092/api';

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  minWidth: 600,
  maxWidth: 600,
  minHeight: 460,
  borderRadius: 16,
  boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)',
}));

const StatusIndicator = styled('span')(({ status, theme }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: status === 'active' ? theme.palette.success?.main || '#4caf50' : theme.palette.error?.main || '#f44336',
  marginRight: theme.spacing ? theme.spacing(1) : 8,
  boxShadow: `0 0 8px ${status === 'active' ? theme.palette.success?.light || '#81c784' : theme.palette.error?.light || '#e57373'}`,
}));

const DetailItem = ({ label, value, icon }) => (
  <Box sx={{
    display: 'flex',
    mb: 2,
    alignItems: 'flex-start',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateX(5px)'
    }
  }}>
    <Box sx={{
      color: 'primary.main',
      mr: 2,
      mt: 0.5,
      fontSize: '1.2rem'
    }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium" sx={{ color: 'text.primary' }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const GhanaianLicensePlate = ({ licensePlate }) => {
  const [region, numberAndYear] = licensePlate ? licensePlate.split(' ') : ['', ''];
  const mainNumber = numberAndYear?.slice(0, numberAndYear.length - 2) || '';
  const year = numberAndYear?.slice(-2) || '';

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backgroundImage: 'url(https://www.transparenttextures.com/patterns/45-degree-fabric-light.png)',
        backgroundSize: 'cover',
        border: '3px solid #000',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
        width: '260px',
        height: '140px',
        position: 'relative',
        mb: 3,
        mx: 'auto',
        transform: 'perspective(500px) rotateX(5deg)',
        '&:hover': {
          transform: 'perspective(500px) rotateX(0deg)'
        },
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          mb: 1
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 'bold',
            fontSize: '2.3rem',
            color: '#000',
            letterSpacing: '1px',
            marginLeft: '80px'
          }}>
            {region}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
              alt="Ghana Flag"
              style={{ width: '24px', height: '16px', marginRight: '6px' }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              GH
            </Typography>
          </Box>
        </Box>
        <Typography variant="h4" sx={{
          fontWeight: 'bold',
          letterSpacing: '2px',
          color: '#000',
          fontSize: '2.4rem'
        }}>
          {mainNumber}{year}
        </Typography>
      </Box>
    </motion.div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
  const [formData, setFormData] = useState({
    requestType: '',
    description: '',
    priority: '',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

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
            headers: {
              Authorization: `Bearer ${authData.token}`
            }
          }),
          axios.get(`${API_URL}/MaintenanceRequest/user/${userId}/schedules`, {
            headers: {
              Authorization: `Bearer ${authData.token}`
            }
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
    return schedules
      .filter(schedule => schedule.vehicleId === vehicleId)
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  };

  const getNextMaintenanceDate = (vehicleId) => {
    const upcoming = getUpcomingSchedules(vehicleId);
    if (upcoming.length > 0) {
      return upcoming[0].scheduledDate;
    }
    return null;
  };

  const handleViewClick = async (vehicle) => {
    try {
      const response = await axios.get(`${API_URL}/Vehicles/${vehicle.id}`, {
        headers: {
          Authorization: `Bearer ${getAuthData().token}`
        }
      });

      setSelectedVehicle(response.data);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authData = getAuthData();
    if (!authData || !authData.userId) return;

    const payload = {
      ...formData,
      VehicleId: selectedVehicle.id
    };

    try {
      await axios.post(`${API_URL}/MaintenanceRequest/personal?userId=${authData.userId}`, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setSubmitSuccess(false);
        setFormData({
          requestType: '',
          description: '',
          priority: '',
        });
      }, 1500);
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const getVehicleImage = (type) => {
    switch(type?.toLowerCase()) {
      case 'sedan':
        return 'https://cdn-icons-png.flaticon.com/128/9851/9851669.png';
      case 'suv':
        return 'https://cdn-icons-png.flaticon.com/128/5952/5952510.png';
      case 'truck':
        return 'https://cdn-icons-png.flaticon.com/128/6087/6087342.png';
      case 'van':
        return 'https://cdn-icons-png.flaticon.com/128/3097/3097218.png';
      default:
        return 'https://cdn-icons-png.flaticon.com/128/2962/2962303.png';
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h6" sx={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            color: 'primary.main'
          }}>
            <CarIcon color="primary" sx={{
              mr: 1.5,
              fontSize: '2rem',
              backgroundColor: 'primary.light',
              borderRadius: '50%',
              p: 0.5
            }} />
            My Assigned Vehicles
          </Typography>
          <Chip
            label={`${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
            variant="outlined"
            size="small"
            sx={{
              fontWeight: 600,
              borderColor: 'primary.main',
              color: 'primary.dark'
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 300
          }}>
            <CircularProgress color="primary" size={60} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Loading your vehicles...
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            icon={<ErrorIcon fontSize="large" />}
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>Error loading vehicles</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        ) : vehicles.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{
              bgcolor: 'primary.light',
              borderRadius: '50%',
              p: 3,
              mb: 2,
              display: 'inline-flex',
              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;'
            }}>
              <CarIcon color="primary" fontSize="large" />
            </Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              No vehicles assigned
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '80%' }}>
              You don't have any vehicles assigned to you yet. Request a vehicle assignment if needed.
            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <VehicleRequestForm />
            </motion.div>
          </Box>
        ) : (
          <>
            <List sx={{ mb: 2 }}>
              {vehicles.slice(0, 3).map((vehicle, index) => (
                <Grow in={true} timeout={index * 200} key={vehicle.id}>
                  <ListItem
                    button="true"
                    onClick={() => handleViewClick(vehicle)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      mb: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.lighter',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                        borderColor: 'primary.light'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                  >

                      <Avatar
                        src={getVehicleImage(vehicle.vehicleType)}
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                          bgcolor: 'background.default'
                        }}
                      />
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <StatusIndicator status={vehicle.status} />
                          {vehicle.make} {vehicle.model}
                        </Typography>
                      }
                      secondary={
                        <Box component="span" sx={{
                          display: 'flex',
                          gap: 2,
                          mt: 0.5,
                          flexWrap: 'wrap'
                        }}>
                          <Chip
                            label={vehicle.licensePlate}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              letterSpacing: 0.5,
                              bgcolor: 'background.paper',
                              boxShadow: 1
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {vehicle.vehicleType}
                          </Typography>
                          {getNextMaintenanceDate(vehicle.id) && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'warning.main'
                              }}
                            >
                              <EventIcon fontSize="small" sx={{ mr: 0.5 }} />
                              {formatDate(getNextMaintenanceDate(vehicle.id))}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ my: 0 }}
                    />

                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems:'center',
                      justifyContent:'center',
                      minWidth: 80
                    }}>
                    <Badge
                      badgeContent={getUpcomingSchedules(vehicle.id).length}
                      color="warning"
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                      sx={{
                        '& .MuiBadge-badge': {
                          right: 8,
                          top: 8,
                          border: `2px solid ${theme.palette.background.paper}`,
                          padding: '0 4px',
                          fontWeight: 'bold'
                        }
                      }}
                    >
                      </Badge>
                    </Box>
                  </ListItem>
                </Grow>
              ))}
            </List>

            {vehicles.length > 3 && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={() => navigate('/my-vehicles')}
                  endIcon={<AddIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  View all {vehicles.length} vehicles
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 'auto' }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setShowRequestModal(true)}
                  startIcon={<ToolIcon />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
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
            width: '90%',
            maxWidth: 700,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: 'none',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main' }}>
                {selectedVehicle?.make} {selectedVehicle?.model} Details
              </Typography>
              <IconButton
                onClick={() => setShowModal(false)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {selectedVehicle && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <GhanaianLicensePlate licensePlate={selectedVehicle.licensePlate} />

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 4,
                  width: '100%',
                  mt: 2
                }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      mb: 2,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase'
                    }}>
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
                        borderColor: 'divider'
                      }} />
                    } />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      mb: 2,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase'
                    }}>
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
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase'
                    }}>
                      Registration
                    </Typography>
                    <DetailItem label="Purchase Date" value={formatDate(selectedVehicle.purchaseDate)} icon={<CalendarIcon />} />
                    <DetailItem label="Purchase Price" value={selectedVehicle.purchasePrice ? `$${selectedVehicle.purchasePrice.toLocaleString()}` : null} icon={<MoneyIcon />} />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{
                      mb: 2,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase'
                    }}>
                      Status
                    </Typography>
                    <DetailItem label="Mileage" value={`${selectedVehicle.currentMileage?.toLocaleString() || '--'} miles`} icon={<SpeedIcon />} />
                    <DetailItem label="Last Service" value={formatDate(selectedVehicle.lastServiceDate)} icon={<ToolIcon />} />
                    <DetailItem
                      label="Next Maintenance"
                      value={getNextMaintenanceDate(selectedVehicle.id) ? formatDate(getNextMaintenanceDate(selectedVehicle.id)) : 'Not scheduled'}
                      icon={<FiClock />}
                    />
                  </Box>
                </Box>

                <Box sx={{ width: '100%', mt: 4 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase'
                  }}>
                    Upcoming Maintenance
                  </Typography>

                  {getUpcomingSchedules(selectedVehicle.id).length > 0 ? (
                    <List sx={{
                      maxHeight: 300,
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}>
                      {getUpcomingSchedules(selectedVehicle.id).map((schedule) => (
                        <ListItem key={schedule.id} sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' }
                        }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {formatDate(schedule.scheduledDate)}
                                </Typography>
                                <Chip
                                  label={schedule.status}
                                  size="small"
                                  sx={{
                                    ml: 2,
                                    fontWeight: 500,
                                    backgroundColor:
                                      schedule.status === 'Completed' ? 'success.light' :
                                      schedule.status === 'Pending' ? 'warning.light' :
                                      'primary.light'
                                  }}
                                />
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2">
                                  {schedule.repairType}: {schedule.reason}
                                </Typography>
                                {schedule.assignedMechanicName && (
                                  <Typography variant="caption" color="text.secondary">
                                    Mechanic: {schedule.assignedMechanicName}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{
                      textAlign: 'center',
                      py: 3,
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No upcoming maintenance scheduled
                      </Typography>
                    </Box>
                  )}
                </Box>
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
        <Slide direction="up" in={showRequestModal}>
          <Box sx={{
            width: '90%',
            maxWidth: 500,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            outline: 'none'
          }}>
            {submitSuccess ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 3
              }}>
                <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Request Submitted!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your maintenance request has been successfully submitted.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: 'primary.main' }}>
                    New Maintenance Request
                  </Typography>
                  <IconButton
                    onClick={() => setShowRequestModal(false)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Box component="form" onSubmit={handleSubmit}>
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
                        <Box sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          mr: 1
                        }} />
                        Low (can wait 1-2 weeks)
                      </Box>
                    </MenuItem>
                    <MenuItem value="Medium">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          mr: 1
                        }} />
                        Medium (needs attention in a few days)
                      </Box>
                    </MenuItem>
                    <MenuItem value="High">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                          mr: 1
                        }} />
                        High (requires immediate attention)
                      </Box>
                    </MenuItem>
                  </TextField>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        mt: 1,
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
                      }}
                    >
                      Submit Request
                    </Button>
                  </motion.div>
                </Box>
              </>
            )}
          </Box>
        </Slide>
      </Modal>
    </StyledCard>
  );
};

export default VehicleAssignedCard;
