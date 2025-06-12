// src/components/vehicles/VehicleForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVehicleById, createVehicle, updateVehicle } from '../../services/vehicles';
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

export default function VehicleForm() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!validateForm()) return;

    try {
      if (id) {
        await updateVehicle(id, formData);
      } else {
        await createVehicle(formData);
      }
      navigate('/vehicles');
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

    // Validate field on change if form has been submitted
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
    if (!formData.vin || formData.vin.length < 17) errors.vin = 'VIN must be 17 characters';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <LinearProgress />
      <Typography variant="body1" sx={{ mt: 2 }}>Loading vehicle data...</Typography>
    </Container>
  );

  if (error) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="error" sx={{ mb: 3 }}>Error: {error}</Alert>
    </Container>
  );

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

  const fields = [
    { name: 'make', label: 'Make *', required: true, xs: 12, sm: 6, md: 4 },
    { name: 'model', label: 'Model *', required: true, xs: 12, sm: 6, md: 4 },
    { 
      name: 'year', 
      label: 'Year *', 
      type: 'number', 
      required: true,
      inputProps: { min: 1900, max: new Date().getFullYear() + 1 },
      xs: 12, sm: 6, md: 4 
    },
    { name: 'licensePlate', label: 'License Plate *', required: true, xs: 12, sm: 6, md: 4 },
    { name: 'vin', label: 'VIN *', required: true, xs: 12, sm: 6, md: 4 },
    { 
      name: 'currentMileage', 
      label: 'Current Mileage', 
      type: 'number',
      inputProps: { min: 0 },
      xs: 12, sm: 6, md: 4 
    },
    { name: 'color', label: 'Color', xs: 12, sm: 6, md: 4 },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', InputLabelProps: { shrink: true }, xs: 12, sm: 6, md: 4 },
    { 
      name: 'purchasePrice', 
      label: 'Purchase Price ($)', 
      type: 'number',
      inputProps: { step: 0.01, min: 0 },
      xs: 12, sm: 6, md: 4 
    },
    { name: 'lastServiceDate', label: 'Last Service Date', type: 'date', InputLabelProps: { shrink: true }, xs: 12, sm: 6, md: 4 },
    { name: 'nextServiceDue', label: 'Next Service Due', type: 'date', InputLabelProps: { shrink: true }, xs: 12, sm: 6, md: 4 },
    { 
      name: 'serviceInterval', 
      label: 'Service Interval (miles)', 
      type: 'number',
      inputProps: { min: 0 },
      xs: 12, sm: 6, md: 4 
    },
    { 
      name: 'engineSize', 
      label: 'Engine Size (cc)', 
      type: 'number',
      inputProps: { min: 0 },
      xs: 12, sm: 6, md: 4 
    },
    { name: 'roadworthyExpiry', label: 'Roadworthy Expiry', type: 'date', InputLabelProps: { shrink: true }, xs: 12, sm: 6, md: 4 },
    { name: 'registrationExpiry', label: 'Registration Expiry', type: 'date', InputLabelProps: { shrink: true }, xs: 12, sm: 6, md: 4 },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date', InputLabelProps: { shrink: true }, xs: 12, sm: 6, md: 4 },
    { 
      name: 'seatingCapacity', 
      label: 'Seating Capacity', 
      type: 'number',
      inputProps: { min: 1 },
      xs: 12, sm: 6, md: 4 
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardHeader 
          title={<Typography variant="h4">{id ? 'Edit Vehicle' : 'Add New Vehicle'}</Typography>}
          sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
        />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Standard fields */}
              {fields.map((field) => (
                <Grid item key={field.name} xs={field.xs} sm={field.sm} md={field.md}>
                  <TextField
                    fullWidth
                    label={field.label}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    type={field.type || 'text'}
                    error={!!validationErrors[field.name]}
                    helperText={validationErrors[field.name]}
                    required={field.required}
                    InputLabelProps={field.InputLabelProps}
                    inputProps={field.inputProps}
                  />
                </Grid>
              ))}

              {/* Status dropdown */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Status *"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  error={!!validationErrors.status}
                  helperText={validationErrors.status}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Vehicle Type dropdown */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  error={!!validationErrors.vehicleType}
                  helperText={validationErrors.vehicleType}
                >
                  {vehicleTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Fuel Type dropdown */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Fuel Type"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  error={!!validationErrors.fuelType}
                  helperText={validationErrors.fuelType}
                >
                  {fuelTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Notes textarea */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  error={!!validationErrors.notes}
                  helperText={validationErrors.notes}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={id ? <SaveIcon /> : <AddIcon />}
              >
                {id ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}