import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button,
  IconButton, Tooltip
} from '@mui/material';
import {
  FilterList as FilterIcon, Clear as ClearIcon, Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const activityTypes = [
  'Login', 'Logout', 'Create', 'Update', 'Delete', 'ProcessStage', 
  'Reject', 'Schedule', 'Complete', 'ProgressUpdate', 'Assign', 'Unassign'
];

const modules = [
  'Authentication', 'Maintenance', 'VehicleAssignment', 'Vehicles', 'Fuel', 'Routes'
];

export default function AuditFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    module: '',
    activityType: '',
    userId: '',
    dateFrom: null,
    dateTo: null,
    searchTerm: ''
  });

  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const handleClearFilters = () => {
    setFilters({
      module: '',
      activityType: '',
      userId: '',
      dateFrom: null,
      dateTo: null,
      searchTerm: ''
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterIcon sx={{ mr: 1 }} />
            <Box component="span" variant="h6">Activity Filters</Box>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Module</InputLabel>
                <Select
                  value={filters.module}
                  onChange={(e) => setFilters({...filters, module: e.target.value})}
                  label="Module"
                  disabled={loading}
                >
                  <MenuItem value="">All Modules</MenuItem>
                  {modules.map(module => (
                    <MenuItem key={module} value={module}>{module}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Activity Type</InputLabel>
                <Select
                  value={filters.activityType}
                  onChange={(e) => setFilters({...filters, activityType: e.target.value})}
                  label="Activity Type"
                  disabled={loading}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {activityTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="User ID"
                value={filters.userId}
                onChange={(e) => setFilters({...filters, userId: e.target.value})}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="From Date"
                value={filters.dateFrom}
                onChange={(date) => setFilters({...filters, dateFrom: date})}
                renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={loading} />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="To Date"
                value={filters.dateTo}
                onChange={(date) => setFilters({...filters, dateTo: date})}
                renderInput={(params) => <TextField {...params} size="small" fullWidth disabled={loading} />}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                disabled={loading}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <Tooltip title="Clear Filters">
                <IconButton
                  onClick={handleClearFilters}
                  disabled={loading}
                  color="primary"
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}