import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getVehicles,
  deleteVehicle,
  createVehicle,
  updateVehicle,
  getVehicleById
} from '../../services/vehicles';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  styled,
  Grid,
  TextField,
  MenuItem,
  Divider,
  LinearProgress,
  Alert,
  Stack,
  Card,
  CardHeader,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import DeleteModal from '../common/DeleteModal';
import VehicleFilters from './VehicleFilters';

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '100%',
  [theme.breakpoints.up('lg')]: {
    maxWidth: '1200px'
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(3),
  overflow: 'hidden'
}));

const StyledTableRow = styled(TableRow)(({ theme, warning }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 123, 255, 0.03)'
  },
  ...(warning && {
    backgroundColor: '#fff3e0'
  })
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #e9ecef'
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  fontWeight: 600,
  color: '#495057',
  borderTop: 'none'
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  padding: '8px 16px'
}));

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    vehicleType: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'make', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const vehiclesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        let data = await getVehicles();

        if (filters.status) {
          data = data.filter(v => v.status === filters.status);
        }

        if (filters.vehicleType) {
          data = data.filter(v => v.vehicleType === filters.vehicleType);
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          data = data.filter(v =>
            v.make.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.licensePlate.toLowerCase().includes(query) ||
            v.vin.toLowerCase().includes(query)
          );
        }

        data.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });

        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [filters, sortConfig, searchQuery]);

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVehicle(vehicleToDelete.id);
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const handleAddVehicle = () => {
    setFormData({
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
    setValidationErrors({});
    setIsSubmitted(false);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setFormData({
      ...vehicle,
      purchaseDate: vehicle.purchaseDate?.split('T')[0],
      lastServiceDate: vehicle.lastServiceDate?.split('T')[0],
      roadworthyExpiry: vehicle.roadworthyExpiry?.split('T')[0],
      registrationExpiry: vehicle.registrationExpiry?.split('T')[0],
      insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0],
      nextServiceDue: vehicle.nextServiceDue?.split('T')[0]
    });
    setValidationErrors({});
    setIsSubmitted(false);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (formData.id) {
        await updateVehicle(formData.id, formData);
      } else {
        await createVehicle(formData);
      }
      const data = await getVehicles();
      setVehicles(data);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setFormLoading(false);
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

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

  const paginate = (event, value) => setCurrentPage(value);

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
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
          Vehicle Inventory
        </Typography>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </StyledButton>
      </Box>

      {showForm ? (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardHeader 
            title={<Typography variant="h5">{formData.id ? 'Edit Vehicle' : 'Add New Vehicle'}</Typography>}
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
          />
          <Divider />
          <CardContent>
            {formLoading && <LinearProgress />}
            {error && <Alert severity="error" sx={{ mb: 3 }}>Error: {error}</Alert>}
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
                      disabled={formLoading}
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
                    disabled={formLoading}
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
                    disabled={formLoading}
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
                    disabled={formLoading}
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
                    disabled={formLoading}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={formData.id ? <SaveIcon /> : <AddIcon />}
                  disabled={formLoading}
                >
                  {formData.id ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <VehicleFilters
            filters={filters}
            setFilters={setFilters}
            vehicleCount={vehicles.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {loading && <LinearProgress />}
          {error && <Alert severity="error" sx={{ mb: 3 }}>Error: {error}</Alert>}
          {!loading && vehicles.length === 0 && (
            <Typography>No vehicles found matching your criteria</Typography>
          )}

          <StyledPaper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>License Plate</StyledTableHeadCell>
                    <StyledTableHeadCell onClick={() => handleSort('model')}>
                      Model {sortConfig.key === 'model' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </StyledTableHeadCell>
                    <StyledTableHeadCell onClick={() => handleSort('year')}>
                      Year {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </StyledTableHeadCell>
                    <StyledTableHeadCell onClick={() => handleSort('make')}>
                      Make {sortConfig.key === 'make' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </StyledTableHeadCell>
                    <StyledTableHeadCell onClick={() => handleSort('currentMileage')}>
                      Mileage {sortConfig.key === 'currentMileage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </StyledTableHeadCell>
                    <StyledTableHeadCell>Roadworthy</StyledTableHeadCell>
                    <StyledTableHeadCell>Registration</StyledTableHeadCell>
                    <StyledTableHeadCell>Next Service</StyledTableHeadCell>
                    <StyledTableHeadCell>Actions</StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentVehicles.map((vehicle) => (
                    <StyledTableRow
                      key={vehicle.id}
                      warning={isExpired(vehicle.roadworthyExpiry) || isExpired(vehicle.registrationExpiry)}
                    >
                      <StyledTableCell>
                        <Link to={`/vehicles/${vehicle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {vehicle.licensePlate}
                        </Link>
                      </StyledTableCell>
                      <StyledTableCell>{vehicle.make}</StyledTableCell>
                      <StyledTableCell>{vehicle.model}</StyledTableCell>
                      <StyledTableCell>{vehicle.year}</StyledTableCell>
                      <StyledTableCell>{vehicle.currentMileage.toLocaleString()}</StyledTableCell>
                      <StyledTableCell sx={{ color: isExpired(vehicle.roadworthyExpiry) ? 'error.main' : 'inherit' }}>
                        {vehicle.roadworthyExpiry ? new Date(vehicle.roadworthyExpiry).toLocaleDateString() : 'N/A'}
                      </StyledTableCell>
                      <StyledTableCell sx={{ color: isExpired(vehicle.registrationExpiry) ? 'error.main' : 'inherit' }}>
                        {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString() : 'N/A'}
                      </StyledTableCell>
                      <StyledTableCell sx={{ color: isExpired(vehicle.nextServiceDue) ? 'error.main' : 'inherit' }}>
                        {vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue).toLocaleDateString() : 'N/A'}
                      </StyledTableCell>
                      <StyledTableCell>
                        <IconButton onClick={() => handleEditVehicle(vehicle)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteClick(vehicle)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination count={totalPages} page={currentPage} onChange={paginate} color="primary" />
          </Box>
        </>
      )}

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={`${vehicleToDelete?.make} ${vehicleToDelete?.model} (${vehicleToDelete?.licensePlate})`}
      />
    </StyledContainer>
  );
}