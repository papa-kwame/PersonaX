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
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Autocomplete,
  Popper,
  Paper
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { getVehicleById, createVehicle, updateVehicle, getAllVehiclesSimple } from '../../services/vehicles';
import { useAuth } from '../../context/AuthContext';
import StandardDatePicker from '../shared/StandardDatePicker';

// Date formatting utility
const formatDateForInput = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Generate year options (from 1900 to current year + 1)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 1; year >= 1900; year--) {
    years.push(year);
  }
  return years;
};

// Vehicle models database
const VEHICLE_MODELS = {
  'Toyota': [
    'Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', 'Sienna', 'Prius', 'Avalon', '4Runner',
    'Sequoia', 'Land Cruiser', 'FJ Cruiser', 'C-HR', 'Venza', 'Crown', 'bZ4X', 'GR86', 'Supra'
  ],
  'Honda': [
    'Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Passport', 'Ridgeline', 'Insight', 'Clarity',
    'CR-Z', 'Element', 'Fit', 'Prelude', 'S2000', 'NSX', 'Integra', 'e:NP1'
  ],
  'Ford': [
    'F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco',
    'Maverick', 'Transit', 'EcoSport', 'Focus', 'Fusion', 'Taurus', 'Flex', 'GT', 'Lightning'
  ],
  'Chevrolet': [
    'Silverado', 'Camaro', 'Corvette', 'Equinox', 'Tahoe', 'Suburban', 'Colorado', 'Traverse', 'Blazer',
    'Trax', 'Malibu', 'Impala', 'Cruze', 'Sonic', 'Spark', 'Bolt', 'Volt', 'Avalanche'
  ],
  'Nissan': [
    'Altima', 'Sentra', 'Maxima', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan',
    'Kicks', 'Juke', 'Leaf', 'Versa', '370Z', 'GT-R', 'Xterra', 'Quest'
  ],
  'BMW': [
    'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', '1 Series', '2 Series', '3 Series', '4 Series', '5 Series',
    '6 Series', '7 Series', '8 Series', 'Z4', 'i3', 'i4', 'i7', 'iX', 'M2', 'M3', 'M4', 'M5', 'M8'
  ],
  'Mercedes-Benz': [
    'A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE',
    'GLS', 'G-Class', 'AMG GT', 'EQS', 'EQE', 'EQB', 'EQA', 'SL', 'SLS'
  ],
  'Audi': [
    'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7',
    'TT', 'R8', 'e-tron', 'e-tron GT', 'Q4 e-tron'
  ],
  'Volkswagen': [
    'Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'ID.4', 'ID.Buzz', 'Arteon', 'Taos', 'Touareg',
    'Polo', 'Virtus', 'Virtus GT', 'Virtus GT Line', 'Virtus GT Line Sport'
  ],
  'Hyundai': [
    'Accent', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Venue', 'Kona', 'Ioniq', 'Nexo',
    'Veloster', 'Genesis', 'Staria', 'Bayon', 'Casper'
  ],
  'Kia': [
    'Rio', 'Forte', 'K5', 'K8', 'Soul', 'Sportage', 'Sorento', 'Telluride', 'Stinger', 'EV6', 'Niro',
    'Ceed', 'Picanto', 'ProCeed', 'Xceed', 'Venga'
  ],
  'Mazda': [
    'Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-60', 'CX-70', 'CX-8', 'CX-9',
    'MX-30', 'MX-5', 'RX-8', 'RX-7', '929', '626', '323'
  ],
  'Subaru': [
    'Impreza', 'WRX', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'BRZ', 'XV', 'Levorg',
    'Baja', 'SVX', 'Justy', 'Loyale', 'XT'
  ],
  'Lexus': [
    'ES', 'IS', 'LS', 'LC', 'RC', 'GS', 'UX', 'NX', 'RX', 'GX', 'LX', 'LFA', 'CT', 'HS', 'SC'
  ],
  'Acura': [
    'ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX', 'Integra', 'CL', 'RSX', 'TSX', 'TL', 'RL', 'ZDX'
  ],
  'Infiniti': [
    'Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80', 'G37', 'M37', 'EX37', 'FX37', 'JX35'
  ],
  'Volvo': [
    'S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40', 'Polestar 1', 'Polestar 2', 'Polestar 3'
  ],
  'Jaguar': [
    'XE', 'XF', 'XJ', 'F-Type', 'F-Pace', 'E-Pace', 'I-Pace', 'XK', 'X-Type', 'S-Type'
  ],
  'Land Rover': [
    'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery',
    'Discovery Sport', 'Defender', 'Freelander', 'LR2', 'LR3', 'LR4'
  ],
  'Porsche': [
    '911', 'Cayman', 'Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Carrera', 'Turbo', 'GT3'
  ],
  'Tesla': [
    'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi'
  ]
};

// Get all manufacturers
const MANUFACTURERS = Object.keys(VEHICLE_MODELS);

// Get models for a specific manufacturer
const getModelsForMake = (make) => {
  return VEHICLE_MODELS[make] || [];
};

// Generate year options
const YEAR_OPTIONS = generateYearOptions();

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

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
    purchaseDate: null,
    purchasePrice: 0,
    lastServiceDate: null,
    serviceInterval: 10000,
    nextServiceDue: null,
    roadworthyExpiry: null,
    registrationExpiry: null,
    insuranceExpiry: null,
    notes: ''
  });

  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customModel, setCustomModel] = useState('');

  useEffect(() => {
    if (id) {
      const loadVehicle = async () => {
        try {
          const vehicle = await getVehicleById(id);
          setFormData({
            ...vehicle,
            purchaseDate: formatDateForInput(vehicle.purchaseDate),
            lastServiceDate: formatDateForInput(vehicle.lastServiceDate),
            roadworthyExpiry: formatDateForInput(vehicle.roadworthyExpiry),
            registrationExpiry: formatDateForInput(vehicle.registrationExpiry),
            insuranceExpiry: formatDateForInput(vehicle.insuranceExpiry),
            nextServiceDue: formatDateForInput(vehicle.nextServiceDue)
          });
          
          // Check if model is custom (not in predefined list for the make)
          const availableModels = getModelsForMake(vehicle.make);
          if (vehicle.model && !availableModels.includes(vehicle.model)) {
            setCustomModel(vehicle.model);
          }
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
      // Use custom model if "Other" is selected
      const finalModel = formData.model === 'Other' ? customModel : formData.model;
      
      // Convert Date objects to ISO strings for API
      const submitData = {
        ...formData,
        model: finalModel,
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : null,
        lastServiceDate: formData.lastServiceDate ? formData.lastServiceDate.toISOString() : null,
        nextServiceDue: formData.nextServiceDue ? formData.nextServiceDue.toISOString() : null,
        roadworthyExpiry: formData.roadworthyExpiry ? formData.roadworthyExpiry.toISOString() : null,
        registrationExpiry: formData.registrationExpiry ? formData.registrationExpiry.toISOString() : null,
        insuranceExpiry: formData.insuranceExpiry ? formData.insuranceExpiry.toISOString() : null
      };

      // Check for duplicate VIN or license plate
      const allVehicles = await getAllVehiclesSimple();
      const duplicate = allVehicles.find(v =>
        (v.vin === submitData.vin || v.licensePlate === submitData.licensePlate) &&
        (!id || v.id !== id)
      );
      if (duplicate) {
        setError('A vehicle with this VIN or license plate already exists.');
        toast.error('A vehicle with this VIN or license plate already exists.');
        return;
      }
      if (id) {
        await updateVehicle(id, submitData, userId);
        toast.success('Vehicle updated successfully!');
      } else {
        await createVehicle(submitData, userId);
        toast.success('Vehicle added successfully!');
      }
      setTimeout(() => navigate('/vehicles'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for license plate formatting
    if (name === 'licensePlate') {
      const formatted = formatLicensePlate(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: ['currentMileage', 'purchasePrice', 'serviceInterval', 'seatingCapacity', 'engineSize'].includes(name)
        ? parseFloat(value) || 0 : value
    }));
    }

    // Reset model when make changes
    if (name === 'make') {
      setFormData(prev => ({ ...prev, model: '' }));
      setCustomModel('');
    }

    if (isSubmitted) {
      validateField(name, name === 'licensePlate' ? formatLicensePlate(value) : value);
    }
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleModelChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, model: newValue }));
    if (isSubmitted) {
      validateField('model', newValue);
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
        else if (value === 'Other' && !customModel.trim()) error = 'Please specify the custom model';
        break;
      case 'year':
        if (!value || value < 1900 || value > currentYear + 1) {
          error = `Year must be between 1900 and ${currentYear + 1}`;
        }
        break;
      case 'licensePlate':
        error = validateLicensePlate(value);
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
    else if (formData.model === 'Other' && !customModel.trim()) errors.model = 'Please specify the custom model';
    if (!formData.year || formData.year < 1900 || formData.year > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
    
    const licensePlateError = validateLicensePlate(formData.licensePlate);
    if (licensePlateError) errors.licensePlate = licensePlateError;
    
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

  const LICENSE_PLATE_REGEX = /^[A-Z]{2} \d{1,4}-([A-Z]|\d{2})$/i;

  // License plate formatting function
  const formatLicensePlate = (value) => {
    // Remove all non-alphanumeric characters except dashes
    const cleaned = value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.includes('-')) {
      // If user manually added dash, preserve it
      const parts = cleaned.split('-');
      const beforeDash = parts[0];
      const afterDash = parts[1] || '';
      
      if (beforeDash.length <= 2) {
        return cleaned; // Not enough characters before dash
      }
      
      // Format: GC 1-23, GC 12-34, GC 123-4, etc.
      const region = beforeDash.slice(0, 2);
      const numbers = beforeDash.slice(2);
      return `${region} ${numbers}-${afterDash}`;
    } else if (cleaned.length <= 6) {
      // Format: GC 1, GC 12, GC 123, GC 1234
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else {
      // Format: GC 1234-56 or GC 1234-A (when more than 6 characters)
      const prefix = cleaned.slice(0, 2);
      const numbers = cleaned.slice(2, 6);
      const suffix = cleaned.slice(6, 8);
      return `${prefix} ${numbers}-${suffix}`;
    }
  };

  // License plate validation function
  const validateLicensePlate = (value) => {
    if (!value) return 'License plate is required';
    
    const formatted = formatLicensePlate(value);
    
    if (formatted.length < 3) {
      return 'License plate must have at least 1 number after region code';
    }
    
    // Check if it starts with valid region codes
    const validRegions = ['GC', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GJ', 'GK', 'GL', 'GM', 'GN', 'GO', 'GR', 'GS', 'GT', 'GU', 'GV', 'GW', 'GX', 'GY'];
    const region = formatted.slice(0, 2);
    
    if (!validRegions.includes(region)) {
      return 'Invalid region code. Must start with G followed by a letter (e.g., GC, GA, GB)';
    }
    
    // Check if there's a dash in the formatted value
    if (formatted.includes('-')) {
      // Split by dash to check numbers before and after
      const parts = formatted.split('-');
      const beforeDash = parts[0]; // e.g., "GC 1", "GC 12", "GC 123"
      const afterDash = parts[1] || ''; // e.g., "23", "34", "45"
      
      // Extract numbers before dash (after the space)
      const numbersBeforeDash = beforeDash.split(' ')[1] || '';
      if (numbersBeforeDash.length < 1 || numbersBeforeDash.length > 4) {
        return 'Must have 1-4 numbers before the dash';
      }
      
      // Check numbers after dash (exactly 2 numbers)
      if (afterDash.length !== 2) {
        return 'Must have exactly 2 numbers after the dash';
      }
      
      // Ensure after dash contains only numbers
      if (!/^\d{2}$/.test(afterDash)) {
        return 'Must have exactly 2 numbers after the dash';
      }
    } else {
      // No dash - check total numbers after region code (1-4 numbers)
      const numbersAfterRegion = formatted.split(' ')[1] || '';
      if (numbersAfterRegion.length < 1 || numbersAfterRegion.length > 4) {
        return 'License plate must have 1-4 numbers after region code';
      }
      
      // Ensure it contains only numbers
      if (!/^\d+$/.test(numbersAfterRegion)) {
        return 'License plate must contain only numbers after region code';
      }
    }
    
    return null; // Valid
  };

  // Get available models for selected make
  const availableModels = getModelsForMake(formData.make);
  const modelOptions = [...availableModels, 'Other'];

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
        bgcolor: '#f8fafc'
      }}>
        <CircularProgress size={60} sx={{ color: '#1976d2' }} />
        <Typography variant="h6" sx={{ mt: 3, color: '#374151' }}>
          Loading vehicle data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f8fafc',
      
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
                {id ? 'Edit Vehicle' : 'Add New Vehicle'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '14px' }}>
                {id ? 'Update vehicle information and details' : 'Enter vehicle details to add to the fleet'}
              </Typography>
            </Box>
          </Box>
          
          {/* License Plate Display */}
          {formData.licensePlate && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                position: 'relative',
                background: '#fff',
                border: '2.5px solid #222',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                fontFamily: 'inherit, sans-serif',
                fontWeight: 300,
                fontSize: 36,
                color: '#181818',
                letterSpacing: 2,
                width: 290,
                height: 66,
                padding: '0 12px',
                margin: '2px 0',
                userSelect: 'all',
                overflow: 'hidden',
              }}>
                {formData.licensePlate}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 3, 
                  right: 8, 
              display: 'flex',
                  flexDirection: 'column', 
              alignItems: 'center'
            }}>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
                    alt="Ghana Flag"
                    style={{ 
                      width: 22, 
                      height: 14, 
                      border: '1px solid #222', 
                      borderRadius: 2, 
                      marginBottom: 1 
                    }}
                  />
                  <Typography sx={{ 
                    fontWeight: 700, 
                    color: '#181818', 
                    fontSize: 10, 
                    letterSpacing: 1, 
                    marginTop: 0 
                  }}>
                    GH
            </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <IconButton
            onClick={() => navigate('/vehicles')}
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

        {/* Error Alert */}
          {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 24 }
            }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
              {error}
            </Alert>
          )}

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
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                      color: '#111827',
                      mb: 2,
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

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="medium">
                          <InputLabel>Make</InputLabel>
                          <Select
                            name="make"
                            value={formData.make}
                        onChange={handleChange}
                            label="Make"
                            required
                            error={!!validationErrors.make}
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
                        {validationErrors.make && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {validationErrors.make}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          freeSolo
                          options={modelOptions}
                          value={formData.model}
                          onChange={handleModelChange}
                          disabled={!formData.make}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Model"
                              required
                              error={!!validationErrors.model}
                              helperText={validationErrors.model}
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

                      {formData.model === 'Other' && (
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Custom Model"
                            value={customModel}
                            onChange={(e) => setCustomModel(e.target.value)}
                            placeholder="Enter custom model name"
                            variant="outlined"
                            size="medium"
                            required
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
                      )}

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="medium">
                          <InputLabel>Year</InputLabel>
                          <Select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            label="Year"
                            required
                            error={!!validationErrors.year}
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
                        {validationErrors.year && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {validationErrors.year}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="medium">
                          <InputLabel>Color</InputLabel>
                          <Select
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            label="Color"
                            required
                            error={!!validationErrors.color}
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
                        {validationErrors.color && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                            {validationErrors.color}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="License Plate"
                          name="licensePlate"
                          value={formData.licensePlate}
                          onChange={handleChange}
                          error={!!validationErrors.licensePlate}
                          helperText={validationErrors.licensePlate}
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
                          value={formData.vin}
                          onChange={handleChange}
                          error={!!validationErrors.vin}
                          helperText={validationErrors.vin}
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
                        value={formData.vehicleType}
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
                        value={formData.fuelType}
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
                            value={formData.transmission}
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
                          value={formData.seatingCapacity}
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
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                      color: '#111827',
                      mb: 2,
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

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                      <TextField
                          label="Current Mileage"
                          name="currentMileage"
                          type="number"
                          value={formData.currentMileage}
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
                          value={formData.engineSize}
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
                          value={formData.purchasePrice}
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
                          value={formData.serviceInterval}
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
                        <StandardDatePicker
                          value={formData.purchaseDate}
                          onChange={(date) => handleDateChange('purchaseDate', date)}
                          label="Purchase Date"
                          format="dd/MM/yyyy"
                          size="medium"
                          sx={{ width: 212 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StandardDatePicker
                          value={formData.lastServiceDate}
                          onChange={(date) => handleDateChange('lastServiceDate', date)}
                          label="Last Service Date"
                          format="dd/MM/yyyy"
                          size="medium"
                          sx={{ width: 212 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StandardDatePicker
                          value={formData.nextServiceDue}
                          onChange={(date) => handleDateChange('nextServiceDue', date)}
                          label="Next Service Due"
                          format="dd/MM/yyyy"
                          minDate={new Date()}
                          size="medium"
                          sx={{ width: 212 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StandardDatePicker
                          value={formData.roadworthyExpiry}
                          onChange={(date) => handleDateChange('roadworthyExpiry', date)}
                          label="Roadworthy Expiry"
                          format="dd/MM/yyyy"
                          minDate={new Date()}
                          size="medium"
                          sx={{ width: 212 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StandardDatePicker
                          value={formData.registrationExpiry}
                          onChange={(date) => handleDateChange('registrationExpiry', date)}
                          label="Registration Expiry"
                          format="dd/MM/yyyy"
                          minDate={new Date()}
                          size="medium"
                          sx={{ width: 212 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <StandardDatePicker
                          value={formData.insuranceExpiry}
                          onChange={(date) => handleDateChange('insuranceExpiry', date)}
                          label="Insurance Expiry"
                          format="dd/MM/yyyy"
                          minDate={new Date()}
                          size="medium"
                          sx={{ width: 212 }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Divider />
            <Box sx={{
              display: 'flex',
                justifyContent: 'flex-end',
              alignItems: 'center',
                gap: 2,
                p: 3,
                bgcolor: '#f9fafb'
            }}>
              <Button
                onClick={() => navigate('/vehicles')}
                  variant="outlined"
                  size="large"
                sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#d1d5db',
                    color: '#374151',
                    fontWeight: 600,
                  '&:hover': {
                      borderColor: '#9ca3af',
                      bgcolor: '#f3f4f6'
                  }
                }}
                startIcon={<BackIcon />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                  size="large"
                sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: '#1976d2',
                    fontWeight: 600,
                  '&:hover': {
                      bgcolor: '#1565c0'
                  }
                }}
                startIcon={id ? <SaveIcon /> : <AddIcon />}
              >
                {id ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </Box>
        </CardContent>
          </form>
        </Card>
      </Box>
    </Box>
  );
}
