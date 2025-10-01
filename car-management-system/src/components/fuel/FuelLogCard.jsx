import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Box,
  Avatar,
  Stack,
  Button,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalGasStation, AttachMoney, CalendarToday, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

// Import fuel station logos
import goilLogo from '../../assets/fuelstationlogos/goil-logo.webp';
import shellLogo from '../../assets/fuelstationlogos/Shell-Logo.png';
import starOilLogo from '../../assets/fuelstationlogos/star-oil.webp';
import frimpsLogo from '../../assets/fuelstationlogos/frimps-logo.png';
import zenLogo from '../../assets/fuelstationlogos/Zen-logo.png';
import totalLogo from '../../assets/fuelstationlogos/total-logo.jpg';
import pumaLogo from '../../assets/fuelstationlogos/puma-logo.png';
import alliedLogo from '../../assets/fuelstationlogos/allied-logo.png';

// Professional color palette
const professionalColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0'
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
  border: `1px solid ${professionalColors.border}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    borderColor: professionalColors.primary
  }
}));

const StyledButton = styled(Button)(({ theme, variant = 'outlined', color = 'primary' }) => ({
  borderRadius: '10px',
  padding: '6px 12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  ...(variant === 'outlined' && color === 'primary' && {
    borderColor: professionalColors.border,
    color: professionalColors.text,
    '&:hover': {
      borderColor: professionalColors.primary,
      backgroundColor: alpha(professionalColors.primary, 0.04)
    }
  }),
  ...(variant === 'outlined' && color === 'error' && {
    borderColor: alpha(professionalColors.error, 0.3),
    color: professionalColors.error,
    '&:hover': {
      borderColor: professionalColors.error,
      backgroundColor: alpha(professionalColors.error, 0.04)
    }
  })
}));

// Function to get fuel station logo
const getFuelStationLogo = (fuelStationType) => {
  const logoMap = {
    0: goilLogo,      // GOIL
    1: null,          // Total (no logo available)
    2: shellLogo,     // Shell
    3: null,          // PetroSA (no logo available)
    4: frimpsLogo,    // Frimps
    5: null,          // Puma (no logo available)
    6: starOilLogo,   // StarOil
    7: null,          // AlliedOil (no logo available)
    8: zenLogo,       // ZenPetroleum
    9: null,          // Other (no logo available)
  };
  return logoMap[fuelStationType] || null;
};

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
      <StyledCard>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            background: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.8)} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
            borderRadius: '12px',
            border: `2px dashed ${alpha(professionalColors.border, 0.5)}`
          }}>
            <Typography variant="body1" color={professionalColors.secondary} fontWeight={500}>
              No log data available.
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              overflow: 'hidden'
            }}>
              {getFuelStationLogo(log.fuelStation) ? (
                <img 
                  src={getFuelStationLogo(log.fuelStation)} 
                  alt={fuelStationTypeToString(log.fuelStation)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '4px'
                  }}
                />
              ) : (
                <LocalGasStation sx={{ fontSize: 24 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color={professionalColors.text}>
                {fuelStationTypeToString(log.fuelStation)}
              </Typography>
              <Typography variant="body2" color={professionalColors.secondary} sx={{ mt: 0.5 }}>
                Fuel Station
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ 
          my: 2, 
          borderColor: alpha(professionalColors.border, 0.5),
          opacity: 0.6
        }} />

        {/* Content */}
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${alpha(professionalColors.success, 0.1)} 0%, ${alpha(professionalColors.success, 0.05)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(professionalColors.success, 0.2)}`
            }}>
              <AttachMoney sx={{ color: professionalColors.success, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                ${log.cost?.toFixed(2) || '0.00'} for {log.fuelAmount || '0'}L
              </Typography>
              <Typography variant="caption" color={professionalColors.secondary}>
                Cost per liter: ${log.cost && log.fuelAmount ? (log.cost / log.fuelAmount).toFixed(2) : '0.00'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${alpha(professionalColors.info, 0.1)} 0%, ${alpha(professionalColors.info, 0.05)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(professionalColors.info, 0.2)}`
            }}>
              <CalendarToday sx={{ color: professionalColors.info, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color={professionalColors.text}>
                {log.date ? format(new Date(log.date), 'PPpp') : 'Invalid Date'}
              </Typography>
              <Typography variant="caption" color={professionalColors.secondary}>
                {log.date ? format(new Date(log.date), 'EEEE') : 'Unknown day'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            background: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.8)} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
            borderRadius: '12px',
            p: 2,
            border: `1px solid ${alpha(professionalColors.border, 0.5)}`
          }}>
            <Typography variant="body2" color={professionalColors.secondary} fontWeight={600} gutterBottom>
              Vehicle Information
            </Typography>
            <Typography variant="body2" color={professionalColors.text} fontWeight={500}>
              Vehicle ID: {log.vehicleId || 'Unknown'}
            </Typography>
          </Box>
        </Stack>

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 1, 
          mt: 3,
          pt: 2,
          borderTop: `1px solid ${alpha(professionalColors.border, 0.5)}`
        }}>
          <StyledButton
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onEdit(log)}
            startIcon={<Edit sx={{ fontSize: 16 }} />}
          >
            Edit
          </StyledButton>
          <StyledButton
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onDelete(log.id)}
            startIcon={<Delete sx={{ fontSize: 16 }} />}
          >
            Delete
          </StyledButton>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

FuelLogCard.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fuelStation: PropTypes.number,
    cost: PropTypes.number,
    fuelAmount: PropTypes.number,
    date: PropTypes.string,
    vehicleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default FuelLogCard;
