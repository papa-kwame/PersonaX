import React, { useState, useEffect } from 'react';
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
  IconButton
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
  Error as ErrorIcon
} from '@mui/icons-material';
import { FiTool, FiCalendar, FiFileText, FiUser, FiDollarSign, FiClock } from 'react-icons/fi';
import VehicleRequestForm from '../new components/VehicleRequestForm';

const API_URL = 'https://localhost:7092/api';

const DetailItem = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', mb: 1.5 }}>
    <Box sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium">
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

const GhanaianLicensePlate = ({ licensePlate }) => {
  const [region, numberAndYear] = licensePlate ? licensePlate.split('-') : ['', ''];
  const mainNumber = numberAndYear?.slice(0, numberAndYear.length - 2) || '';
  const year = numberAndYear?.slice(-2) || '';

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      backgroundColor: '#fff',
      border: '3px solid #000',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      width: '240px',
      height: '120px',
      position: 'relative',
      mb: 2,
      mx: 'auto'
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
          fontSize: '1.5rem',
          color: '#000'
        }}>
          {region}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
            alt="Ghana Flag"
            style={{ width: '20px', height: '14px', marginRight: '4px' }}
          />
          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 'bold' }}>
            GH
          </Typography>
        </Box>
      </Box>
      <Typography variant="h4" sx={{
        fontWeight: 'bold',
        letterSpacing: '1px',
        color: '#000'
      }}>
        {mainNumber}-{year}
      </Typography>
    </Box>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const VehicleAssignedCard = () => {
  const [vehicles, setVehicles] = useState([]);
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedVehicles = async () => {
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

        const response = await axios.get(`${API_URL}/VehicleAssignment/ByUser/${userId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`
          }
        });

        console.log('Fetched Vehicles Data:', response.data);
        setVehicles(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchAssignedVehicles();
  }, [navigate]);

  const handleViewClick = async (vehicle) => {
    try {
      const response = await axios.get(`${API_URL}/Vehicles/${vehicle.id}`, {
        headers: {
          Authorization: `Bearer ${getAuthData().token}`
        }
      });

      console.log('Selected Vehicle Details:', response.data);
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

    try {
      const response = await axios.post(`${API_URL}/MaintenanceRequest/personal?userId=${authData.userId}`, formData);
      console.log('Request submitted:', response.data);
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  return (
    <Card
      sx={{
        width: '100%',
        minWidth: 600,
        maxWidth:600,
        minHeight: 460,
        borderRadius: 2,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h9"  sx={{ display: 'flex', alignItems: 'center' }}>
            <CarIcon color="primary" sx={{ mr: 1 }} />
            My Assigned Vehicles
          </Typography>
          <Chip
            label={`${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
            variant="outlined"
            size="small"
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
            <CircularProgress color="primary" size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading your vehicles...
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            icon={<ErrorIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2">Error loading vehicles</Typography>
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
              bgcolor: 'action.hover',
              borderRadius: '50%',
              p: 2,
              mb: 2,
              display: 'inline-flex'
            }}>
              <CarIcon color="disabled" fontSize="medium" />
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              No vehicles assigned
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don't have any vehicles assigned to you yet
            </Typography>
            <Button>
              <VehicleRequestForm/>
            </Button>
          </Box>
        ) : (
          <>
            <List sx={{ mb: 2 }}>
              {vehicles.slice(0, 3).map((vehicle) => (
                <ListItem
                  key={vehicle.id}
                  button
                  onClick={() => handleViewClick(vehicle)}
                  sx={{
                    px: 0,
                    py: 1.5,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="medium">
                        {vehicle.make} {vehicle.model}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.licensePlate}
                      </Typography>
                    }
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.year}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      {vehicle.currentMileage?.toLocaleString() || '--'} miles
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>

            {vehicles.length > 3 && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={() => navigate('/my-vehicles')}
                >
                  View all {vehicles.length} vehicles
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setShowRequestModal(true)}
                startIcon={<ToolIcon />}
                sx={{ borderRadius: 5 }}
              >
                Request Maintenance
              </Button>
            </Box>
          </>
        )}
      </CardContent>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" fontWeight="bold">
              {selectedVehicle?.make} {selectedVehicle?.model} Details
            </Typography>
            <IconButton onClick={() => setShowModal(false)}>
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
                gap: 3,
                width: '100%',
                mt: 2
              }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Vehicle Information
                  </Typography>
                  <DetailItem label="Make" value={selectedVehicle.make} icon={<FiTool />} />
                  <DetailItem label="Model" value={selectedVehicle.model} icon={<FiTool />} />
                  <DetailItem label="Year" value={selectedVehicle.year} icon={<FiCalendar />} />
                  <DetailItem label="VIN" value={selectedVehicle.vin} icon={<FiFileText />} />
                  <DetailItem label="Color" value={selectedVehicle.color} icon={
                    <Box sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: selectedVehicle.color || 'grey.500',
                      mr: 1
                    }} />
                  } />
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Specifications
                  </Typography>
                  <DetailItem label="Type" value={selectedVehicle.vehicleType} icon={<FiTool />} />
                  <DetailItem label="Fuel Type" value={selectedVehicle.fuelType} icon={<FiTool />} />
                  <DetailItem label="Transmission" value={selectedVehicle.transmission} icon={<FiTool />} />
                  <DetailItem label="Engine Size" value={selectedVehicle.engineSize ? `${selectedVehicle.engineSize} cc` : null} icon={<FiTool />} />
                  <DetailItem label="Seating" value={selectedVehicle.seatingCapacity} icon={<FiUser />} />
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Registration
                  </Typography>
                  <DetailItem label="Purchase Date" value={formatDate(selectedVehicle.purchaseDate)} icon={<FiCalendar />} />
                  <DetailItem label="Purchase Price" value={selectedVehicle.purchasePrice ? `$${selectedVehicle.purchasePrice.toLocaleString()}` : null} icon={<FiDollarSign />} />
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Status
                  </Typography>
                  <DetailItem label="Mileage" value={`${selectedVehicle.currentMileage?.toLocaleString() || '--'} miles`} icon={<FiClock />} />
                  <DetailItem label="Last Service" value={formatDate(selectedVehicle.lastServiceDate)} icon={<FiTool />} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      <Modal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" fontWeight="bold">
              New Maintenance Request
            </Typography>
            <IconButton onClick={() => setShowRequestModal(false)}>
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
              size="small"
            >
              <MenuItem value="">Select request type</MenuItem>
              <MenuItem value="Repair">Repair</MenuItem>
              <MenuItem value="Service">Service</MenuItem>
              <MenuItem value="Inspection">Inspection</MenuItem>
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
              size="small"
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
              size="small"
            >
              <MenuItem value="">Select priority level</MenuItem>
              <MenuItem value="Low">Low (can wait 1-2 weeks)</MenuItem>
              <MenuItem value="Medium">Medium (needs attention in a few days)</MenuItem>
              <MenuItem value="High">High (requires immediate attention)</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="medium"
              sx={{ mt: 3, borderRadius: 5, py: 1 }}
            >
              Submit Request
            </Button>
          </Box>
        </Box>
      </Modal>
    </Card>
  );
};

export default VehicleAssignedCard;
