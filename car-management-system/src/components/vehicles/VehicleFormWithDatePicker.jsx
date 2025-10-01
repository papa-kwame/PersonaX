import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  DirectionsCar,
  Close,
  ArrowBack,
  Add
} from '@mui/icons-material';
import StandardDatePicker from '../shared/StandardDatePicker';

const VehicleFormWithDatePicker = ({ isEdit = false, onClose }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    vehicleType: 'Sedan',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    seatingCapacity: '5',
    currentMileage: '0',
    engineSize: '',
    purchasePrice: '0',
    serviceInterval: '10000',
    purchaseDate: null,
    lastServiceDate: null,
    nextServiceDue: null,
    roadworthyExpiry: null,
    registrationExpiry: null,
    insuranceExpiry: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Handle form submission here
  };

  const handleCancel = () => {
    onClose && onClose();
  };

  return (
    <Paper sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DirectionsCar sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {isEdit ? 'Update vehicle information and details' : 'Enter vehicle details to add to the fleet'}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleCancel} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ p: 4 }}>
        {/* Basic Information Section */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
          Basic Information
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Make</InputLabel>
              <Select
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                label="Make"
              >
                <MenuItem value="BMW">BMW</MenuItem>
                <MenuItem value="Toyota">Toyota</MenuItem>
                <MenuItem value="Honda">Honda</MenuItem>
                <MenuItem value="Ford">Ford</MenuItem>
                <MenuItem value="Mercedes">Mercedes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Model *"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                label="Year"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                label="Color"
              >
                <MenuItem value="Red">Red</MenuItem>
                <MenuItem value="Blue">Blue</MenuItem>
                <MenuItem value="Black">Black</MenuItem>
                <MenuItem value="White">White</MenuItem>
                <MenuItem value="Yellow">Yellow</MenuItem>
                <MenuItem value="Green">Green</MenuItem>
                <MenuItem value="Silver">Silver</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Plate *"
              value={formData.licensePlate}
              onChange={(e) => handleInputChange('licensePlate', e.target.value)}
        
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="VIN *"
              value={formData.vin}
              onChange={(e) => handleInputChange('vin', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                label="Vehicle Type"
              >
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Truck">Truck</MenuItem>
                <MenuItem value="Van">Van</MenuItem>
                <MenuItem value="Hatchback">Hatchback</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Fuel Type</InputLabel>
              <Select
                value={formData.fuelType}
                onChange={(e) => handleInputChange('fuelType', e.target.value)}
                label="Fuel Type"
              >
                <MenuItem value="Gasoline">Gasoline</MenuItem>
                <MenuItem value="Diesel">Diesel</MenuItem>
                <MenuItem value="Electric">Electric</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Transmission</InputLabel>
              <Select
                value={formData.transmission}
                onChange={(e) => handleInputChange('transmission', e.target.value)}
                label="Transmission"
              >
                <MenuItem value="Automatic">Automatic</MenuItem>
                <MenuItem value="Manual">Manual</MenuItem>
                <MenuItem value="CVT">CVT</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Seating Capacity"
              value={formData.seatingCapacity}
              onChange={(e) => handleInputChange('seatingCapacity', e.target.value)}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Technical & Maintenance Section */}
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
          Technical & Maintenance
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Mileage"
              value={formData.currentMileage}
              onChange={(e) => handleInputChange('currentMileage', e.target.value)}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>miles</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Engine Size"
              value={formData.engineSize}
              onChange={(e) => handleInputChange('engineSize', e.target.value)}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>L</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Purchase Price"
              value={formData.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>C</Typography>
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Service Interval"
              value={formData.serviceInterval}
              onChange={(e) => handleInputChange('serviceInterval', e.target.value)}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>miles</Typography>
              }}
            />
          </Grid>

          {/* Date Fields with Standard Date Picker */}
          <Grid item xs={12} sm={6}>
            <StandardDatePicker
              value={formData.purchaseDate}
              onChange={(date) => handleInputChange('purchaseDate', date)}
              label="Purchase Date"
              format="dd/MM/yyyy"
              helperText="When was the vehicle purchased?"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StandardDatePicker
              value={formData.lastServiceDate}
              onChange={(date) => handleInputChange('lastServiceDate', date)}
              label="Last Service Date"
              format="dd/MM/yyyy"
              helperText="When was the last service performed?"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StandardDatePicker
              value={formData.nextServiceDue}
              onChange={(date) => handleInputChange('nextServiceDue', date)}
              label="Next Service Due"
              format="dd/MM/yyyy"
              minDate={new Date()}
              helperText="When is the next service due?"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StandardDatePicker
              value={formData.roadworthyExpiry}
              onChange={(date) => handleInputChange('roadworthyExpiry', date)}
              label="Roadworthy Expiry"
              format="dd/MM/yyyy"
              minDate={new Date()}
              helperText="When does the roadworthy certificate expire?"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StandardDatePicker
              value={formData.registrationExpiry}
              onChange={(date) => handleInputChange('registrationExpiry', date)}
              label="Registration Expiry"
              format="dd/MM/yyyy"
              minDate={new Date()}
              helperText="When does the registration expire?"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <StandardDatePicker
              value={formData.insuranceExpiry}
              onChange={(date) => handleInputChange('insuranceExpiry', date)}
              label="Insurance Expiry"
              format="dd/MM/yyyy"
              minDate={new Date()}
              helperText="When does the insurance expire?"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          mt: 4,
          pt: 3,
          borderTop: '1px solid #e0e0e0'
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            startIcon={<ArrowBack />}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={isEdit ? <DirectionsCar /> : <Add />}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600,
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default VehicleFormWithDatePicker;


