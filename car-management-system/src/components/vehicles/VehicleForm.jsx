import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Info as InfoIcon,
  Engineering as EngineeringIcon,
  Notes as NotesIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { getVehicleById, createVehicle, updateVehicle, getAllVehiclesSimple } from '../../services/vehicles';
import { toast } from 'react-toastify';

// Define color constants to match previous styling
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

// Styled Card to match previous design
const GradientCard = ({ children, sx }) => (
  <Card sx={{
    mb: 4,
    background: `linear-gradient(135deg, ${alpha(COLORS.PRIMARY, 0.1)} 0%, ${alpha(COLORS.BACKGROUND, 0.8)} 100%)`,
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.2)'
    },
    ...sx
  }}>
    {children}
  </Card>
);

export default function kVehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const [formData, setFormData] = useState({
    id: generateGUID(),
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
  });

  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      const loadVehicle = async () => {
        try {
          const vehicle = await getVehicleById(id);
          setFormData({
            ...vehicle,
            purchaseDate: vehicle.purchaseDate?.split('T')[0],
            lastServiceDate: vehicle.lastServiceDate?.split('T')[0],
            roadworthyExpiry: vehicle.roadworthyExpiry?.split('T')[0],
            registrationExpiry: vehicle.registrationExpiry?.split('T')[0],
            insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0],
            nextServiceDue: vehicle.nextServiceDue?.split('T')[0]
          });
        } catch (err) {
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      loadVehicle();
    }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!validateForm()) return;

    try {
      // Check for duplicate VIN or license plate
      const allVehicles = await getAllVehiclesSimple();
      const duplicate = allVehicles.find(v =>
        (v.vin === formData.vin || v.licensePlate === formData.licensePlate) &&
        (!id || v.id !== id)
      );
      if (duplicate) {
        setError('A vehicle with this VIN or license plate already exists.');
        toast.error('A vehicle with this VIN or license plate already exists.');
        return;
      }
      if (id) {
        await updateVehicle(id, formData);
        toast.success('Vehicle updated successfully!');
      } else {
        await createVehicle(formData);
        toast.success('Vehicle added successfully!');
      }
      setTimeout(() => navigate('/vehicles'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['currentMileage', 'purchasePrice', 'serviceInterval', 'seatingCapacity', 'engineSize'].includes(name)
        ? parseFloat(value) || 0 : value
    }));

    if (isSubmitted) {
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
        else if (!LICENSE_PLATE_REGEX.test(value.trim())) error = 'Format: GC 4-23, GC 4444-23, GC 55-Z';
        break;
      case 'vin':
        if (!value || value.length < 17) error = 'VIN must be 17 characters';
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.make) errors.make = 'Make is required';
    if (!formData.model) errors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
    if (!formData.licensePlate) errors.licensePlate = 'License plate is required';
    else if (!LICENSE_PLATE_REGEX.test(formData.licensePlate.trim())) errors.licensePlate = 'Format: GC 4-23, GC 4444-23, GC 55-Z';
    if (!formData.vin || formData.vin.length < 17) errors.vin = 'VIN must be 17 characters';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const vehicleTypes = [
    { value: 'Sedan', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Van', label: 'Van' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Coupe', label: 'Coupe' }
  ];

  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'In Maintenance', label: 'In Maintenance' },
    { value: 'Out of Service', label: 'Out of Service' }
  ];

  const fuelTypes = [
    { value: 'Gasoline', label: 'Gasoline' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'LPG', label: 'LPG' }
  ];

  const LICENSE_PLATE_REGEX = /^[A-Z]{2} \d{1,4}-([A-Z]|\d{2})$/i;

  const fields = [
    { name: 'make', label: 'Make', required: true },
    { name: 'model', label: 'Model', required: true },
    {
      name: 'year',
      label: 'Year',
      type: 'number',
      required: true,
      inputProps: { min: 1900, max: new Date().getFullYear() + 1 }
    },
    { name: 'licensePlate', label: 'License Plate', required: true, inputProps: { pattern: '[A-Za-z]{2} \\d{1,4}-([A-Za-z]|\\d{2})' } },
    { name: 'vin', label: 'VIN', required: true },
    {
      name: 'currentMileage',
      label: 'Current Mileage',
      type: 'number',
      inputProps: { min: 0 },
      InputProps: { endAdornment: 'miles' }
    },
    { name: 'color', label: 'Color' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    {
      name: 'purchasePrice',
      label: 'Purchase Price',
      type: 'number',
      inputProps: { step: 0.01, min: 0 },
      InputProps: { startAdornment: '₵' }
    },
    { name: 'lastServiceDate', label: 'Last Service Date', type: 'date' },
    { name: 'nextServiceDue', label: 'Next Service Due', type: 'date' },
    {
      name: 'serviceInterval',
      label: 'Service Interval',
      type: 'number',
      inputProps: { min: 0 },
      InputProps: { endAdornment: 'miles' }
    },
    {
      name: 'engineSize',
      label: 'Engine Size',
      type: 'number',
      inputProps: { min: 0 },
      InputProps: { endAdornment: 'L' }
    },
    { name: 'roadworthyExpiry', label: 'Roadworthy Expiry', type: 'date' },
    { name: 'registrationExpiry', label: 'Registration Expiry', type: 'date' },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
    {
      name: 'seatingCapacity',
      label: 'Seating Capacity',
      type: 'number',
      inputProps: { min: 1 }
    },
  ];

  if (loading) {
    return (
      <Box maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Loading vehicle data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxwidth: 1400,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(120deg, #f7fafd 0%, #e3e8f0 100%)',
        py: { xs: 4, md: 8 },
        px: 1,
        overflowY:'none'
      }}
    >
      <GradientCard sx={{ width: '100%', maxWidth: 1400, minWidth: 320, p: { xs: 2, md: 4 } }}>
        <CardHeader
          title={
            <Typography variant="h5" sx={{
              fontWeight: 700,
              color: COLORS.PRIMARY,
              display: 'flex',
              alignItems: 'center'
            }}>
              <CarIcon sx={{ mr: 1.5, fontSize: '2rem' }} />
              {id ? 'Edit Vehicle' : 'Add New Vehicle'}
            </Typography>
          }
          sx={{
            backgroundColor: alpha(COLORS.PRIMARY, 0.05),
            borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`,
            py: 3,
            px: 4
          }}
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information Column */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: COLORS.PRIMARY,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <InfoIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Basic Information
                </Typography>

                <Grid container spacing={2}>
                  {fields.slice(0, 8).map((field) => (
                    <Grid item xs={12} key={field.name}>
                      <TextField
                        fullWidth
                        label={field.label}
                        name={field.name}
                        type={field.type || "text"}
                        value={formData[field.name]}
                        onChange={handleChange}
                        error={!!validationErrors[field.name]}
                        helperText={
                          field.name === 'licensePlate'
                            ? (validationErrors.licensePlate || 'Format: GC 4-23, GC 4444-23, GC 55-Z')
                            : validationErrors[field.name]
                        }
                        required={field.required}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        inputProps={field.inputProps}
                        InputProps={field.InputProps}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Vehicle Type</InputLabel>
                      <Select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        label="Vehicle Type"
                      >
                        {vehicleTypes.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Fuel Type</InputLabel>
                      <Select
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleChange}
                        label="Fuel Type"
                      >
                        {fuelTypes.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

 
                </Grid>
              </Grid>

              {/* Technical & Maintenance Column */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: COLORS.PRIMARY,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <EngineeringIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                  Technical & Maintenance
                </Typography>

                <Grid container spacing={2}>
                  {fields.slice(8).map((field) => (
                    <Grid item xs={12} key={field.name}>
                      <TextField
                        fullWidth
                        label={field.label}
                        name={field.name}
                        type={field.type || "text"}
                        value={formData[field.name]}
                        onChange={handleChange}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        inputProps={field.inputProps}
                        InputProps={field.InputProps}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}>

                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${alpha(COLORS.DIVIDER, 0.2)}`
            }}>
              <Button
                onClick={() => navigate('/vehicles')}
                sx={{
                  mr: 2,
                  minWidth: 120,
                  borderRadius: '12px',
                  border: `1px solid ${alpha(COLORS.PRIMARY, 0.5)}`,
                  color: COLORS.PRIMARY,
                  '&:hover': {
                    backgroundColor: alpha(COLORS.PRIMARY, 0.05)
                  }
                }}
                startIcon={<BackIcon />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 150,
                  borderRadius: '12px',
                  backgroundColor: COLORS.PRIMARY,
                  '&:hover': {
                    backgroundColor: alpha(COLORS.PRIMARY, 0.9)
                  }
                }}
                startIcon={id ? <SaveIcon /> : <AddIcon />}
              >
                {id ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </GradientCard>
    </Box>
  );
}
