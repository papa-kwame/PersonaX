import React from 'react';
import {
  Box,
  TextField,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import { Search, Hourglass } from 'react-bootstrap-icons';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SearchAndFilters = ({
  searchText,
  setSearchText,
  filtersOpen,
  setFiltersOpen,
  filterStatus,
  setFilterStatus,
  filterVehicle,
  setFilterVehicle,
  filterMechanic,
  setFilterMechanic,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  uniqueVehicles,
  uniqueMechanics
}) => {
  const resetFilters = () => {
    setFilterStatus('all');
    setFilterVehicle('all');
    setFilterMechanic('all');
    setFilterStartDate(null);
    setFilterEndDate(null);
  };

  return (
    <Box sx={{
      width: '100%',
      mb: 3,
      px: { xs: 0, sm: 2, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 4,
        boxShadow: '0 2px 16px rgba(37,99,235,0.07)',
        p: 1.5,
        mb: 1,
        gap: 2
      }}>
        <Search fontSize={24} />
        <TextField
          fullWidth
          variant="standard"
          placeholder="Search by vehicle, mechanic, status, etc."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          InputProps={{ disableUnderline: true, sx: { fontSize: 20, pl: 1, background: 'transparent' } }}
          sx={{ flex: 1, fontWeight: 300, fontSize: 15, background: 'transparent' }}
        />
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Hourglass/>}
          endIcon={<span style={{ fontSize: 18 }}>{filtersOpen ? '▲' : '▼'}</span>}
          onClick={() => setFiltersOpen(f => !f)}
          sx={{ fontWeight: 300, borderRadius: 3, px: 2, py: 1, fontSize: 16 }}
        >
          Filters
        </Button>
      </Box>
      
      <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
        <Box sx={{
          width: '100%',
          maxWidth: 1200,
          background: 'rgba(245,248,255,0.97)',
          borderRadius: 4,
          boxShadow: '0 2px 24px rgba(37,99,235,0.10)',
          p: 2.5,
          mt: 1,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Scheduled">Scheduled</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Vehicle</InputLabel>
            <Select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} label="Vehicle">
              <MenuItem value="all">All</MenuItem>
              {uniqueVehicles.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 160 }} size="small">
            <InputLabel>Mechanic</InputLabel>
            <Select value={filterMechanic} onChange={e => setFilterMechanic(e.target.value)} label="Mechanic">
              <MenuItem value="all">All</MenuItem>
              {uniqueMechanics.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filterStartDate}
              onChange={setFilterStartDate}
              renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 120 }} />}
            />
            <DatePicker
              label="End Date"
              value={filterEndDate}
              onChange={setFilterEndDate}
              renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 120 }} />}
            />
          </LocalizationProvider>
          
          <Button variant="outlined" color="secondary" onClick={resetFilters}>
            Reset
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default SearchAndFilters;





