import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Avatar,
  Stack,
  Button
} from '@mui/material';
import { LocalGasStation, AttachMoney, CalendarToday } from '@mui/icons-material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

// Mapping function to convert enum values to strings
const fuelStationTypeToString = (fuelStationType) => {
  const fuelStationTypes = {
    0: 'GOIL',
    1: 'Total',
    2: 'Shell',
    3: 'PetroSA',
    4: 'Frimps',
    5: 'Puma',
    6: 'StarOil',
    7: 'AlliedOil',
    8: 'ZenPetroleum',
    9: 'Other',
  };

  return fuelStationTypes[fuelStationType] || 'Unknown';
};
const FuelLogCard = ({ log, onEdit, onDelete }) => {
  // Handle undefined log or missing properties
  if (!log) {
    return (
      <Card sx={{ minWidth: 275, mb: 2 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            No log data available.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {fuelStationTypeToString(log.fuelStation)}
          </Typography>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <LocalGasStation />
          </Avatar>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={1}>
          <Box display="flex" alignItems="center">
            <AttachMoney color="action" sx={{ mr: 1 }} />
            <Typography variant="body1">
              ${log.cost?.toFixed(2) || '0.00'} for {log.fuelAmount || '0'}L
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <CalendarToday color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {log.date ? format(new Date(log.date), 'PPpp') : 'Invalid Date'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Vehicle ID: {log.vehicleId || 'Unknown'}
            </Typography>
          </Box>
        </Stack>

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button
            size="small"
            color="primary"
            onClick={() => onEdit(log)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(log.id)}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};


FuelLogCard.propTypes = {
  log: PropTypes.shape({
    fuelStation: PropTypes.number,
    cost: PropTypes.number,
    fuelAmount: PropTypes.number,
    date: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

FuelLogCard.defaultProps = {
  log: {
    fuelStation: 9, // Default to 'Other'
    cost: 0,
    fuelAmount: 0,
    date: new Date().toISOString(),
    id: 'default-id',
  },
  onEdit: () => {},
  onDelete: () => {},
};

export default FuelLogCard;
