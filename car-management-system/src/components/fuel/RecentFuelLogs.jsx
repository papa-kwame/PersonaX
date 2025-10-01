import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  List,
  CircularProgress,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalGasStation, Visibility } from '@mui/icons-material';
import FuelLogCard from './FuelLogCard';

// Import fuel station logos
import goilLogo from '../../assets/fuelstationlogos/goil-logo.webp';
import shellLogo from '../../assets/fuelstationlogos/Shell-Logo.png';
import starOilLogo from '../../assets/fuelstationlogos/star-oil.webp';
import frimpsLogo from '../../assets/fuelstationlogos/frimps-logo.png';
import zenLogo from '../../assets/fuelstationlogos/Zen-logo.png';

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '20px',
  background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
  border: `1px solid ${professionalColors.border}`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden'
}));

const StyledButton = styled(Button)(({ theme, variant = 'outlined' }) => ({
  borderRadius: '12px',
  padding: '8px 16px',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  ...(variant === 'outlined' && {
    borderColor: professionalColors.border,
    color: professionalColors.text,
    '&:hover': {
      borderColor: professionalColors.primary,
      backgroundColor: alpha(professionalColors.primary, 0.04)
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

const RecentFuelLogs = ({ limit = 5 }) => {
  const { userId } = useAuth();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/FuelLogs');
      // Sort by date descending and limit results
      const sortedLogs = response.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
      setFuelLogs(sortedLogs);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch fuel logs');
      setLoading(false);
      }
  };

  const handleEdit = (log) => {
    // Implement edit functionality
    };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/FuelLogs/${id}?userId=${userId}`);
      fetchFuelLogs();
    } catch (err) {
      setError('Failed to delete fuel log');
    }
  };

  if (loading) {
    return (
      <StyledPaper sx={{ p: 3, minHeight: 200 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight={150}
          sx={{
            background: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.5)} 0%, ${alpha(professionalColors.background, 0.2)} 100%)`,
            borderRadius: '16px',
            border: `1px dashed ${alpha(professionalColors.border, 0.5)}`
          }}
        >
          <CircularProgress 
            size={32}
            sx={{ 
              color: professionalColors.primary,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
        </Box>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper sx={{ p: 3 }}>
        <Box 
          sx={{
            background: `linear-gradient(135deg, ${alpha(professionalColors.error, 0.1)} 0%, ${alpha(professionalColors.error, 0.05)} 100%)`,
            borderRadius: '12px',
            border: `1px solid ${alpha(professionalColors.error, 0.2)}`,
            p: 2,
            textAlign: 'center'
          }}
        >
          <Typography color={professionalColors.error} fontWeight={600}>
            {error}
          </Typography>
        </Box>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <LocalGasStation sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color={professionalColors.text}>
              Recent Fuel Logs
            </Typography>
            <Typography variant="body2" color={professionalColors.secondary} sx={{ mt: 0.5 }}>
              Latest {limit} fuel consumption entries
            </Typography>
          </Box>
        </Box>
        <StyledButton
          variant="outlined"
          startIcon={<Visibility sx={{ fontSize: 16 }} />}
        >
          View All
        </StyledButton>
      </Box>

      {/* Content */}
      {fuelLogs.length === 0 ? (
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
            background: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.8)} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
            borderRadius: '16px',
            border: `2px dashed ${alpha(professionalColors.border, 0.5)}`
          }}
        >
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.secondary, 0.05)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2
          }}>
            <LocalGasStation sx={{ color: alpha(professionalColors.secondary, 0.6), fontSize: 32 }} />
          </Box>
          <Typography variant="h6" color={professionalColors.text} fontWeight={600} gutterBottom>
            No Fuel Logs
          </Typography>
          <Typography variant="body2" color={professionalColors.secondary} align="center" maxWidth={300}>
            No fuel consumption logs found. Start tracking your fuel usage to see data here.
          </Typography>
        </Box>
      ) : (
        <Box>
          <List sx={{ p: 0 }}>
            {fuelLogs.map((log, index) => (
              <Box 
                key={log.id} 
                sx={{ 
                  mb: index !== fuelLogs.length - 1 ? 2 : 0,
                  '&:last-child': { mb: 0 }
                }}
              >
                <FuelLogCard
                  log={log}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Box>
            ))}
          </List>
        </Box>
      )}
    </StyledPaper>
  );
};

export default RecentFuelLogs;