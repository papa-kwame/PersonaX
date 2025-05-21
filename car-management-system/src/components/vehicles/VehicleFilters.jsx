import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export default function VehicleFilters({ filters, setFilters, vehicleCount, searchQuery, setSearchQuery }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search vehicles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, minWidth: 200 }}
      />

      <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          label="Status"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Assigned">Assigned</MenuItem>
          <MenuItem value="In Maintenance">In Maintenance</MenuItem>
          <MenuItem value="Out of Service">Out of Service</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
        <InputLabel>Vehicle Type</InputLabel>
        <Select
          value={filters.vehicleType}
          onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
          label="Vehicle Type"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Sedan">Sedan</MenuItem>
          <MenuItem value="SUV">SUV</MenuItem>
          <MenuItem value="Truck">Truck</MenuItem>
          <MenuItem value="Van">Van</MenuItem>
          <MenuItem value="Hatchback">Hatchback</MenuItem>
          <MenuItem value="Coupe">Coupe</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
