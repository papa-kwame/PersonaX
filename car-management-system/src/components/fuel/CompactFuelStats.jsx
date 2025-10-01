import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Divider,
  Fade,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { LocalGasStation, TrendingUp, TrendingDown } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

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

const AnimatedPaper = motion.create(Paper);

const StyledPaper = styled(AnimatedPaper)(({ theme }) => ({
  borderRadius: '24px',
  background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
  border: `1px solid ${professionalColors.border}`,
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)'
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  fontSize: '0.75rem',
  height: '36px',
  borderRadius: '10px',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: professionalColors.border,
    borderRadius: '10px'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: professionalColors.primary
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: professionalColors.primary,
    borderWidth: '2px'
  }
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

const CompactFuelStats = () => {
  const theme = useTheme();
  const { userId, isAuthenticated } = useAuth();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchFuelLogs();
    }
  }, [isAuthenticated, userId, timeRange]);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/FuelLogs/user/${userId}`);
      setFuelLogs(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const processData = () => {
    const now = new Date();
    const groupedData = {};
    const periodCount = 6;

    for (let i = periodCount - 1; i >= 0; i--) {
      let key, label, fullDate;
      if (timeRange === 'month') {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        label = format(date, 'MMM');
        fullDate = format(date, 'MMMM yyyy');
      } else {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        key = date.toISOString().split('T')[0];
        label = format(date, 'd');
        fullDate = format(date, 'PP');
      }
      groupedData[key] = {
        date: key,
        label,
        fullDate,
        totalFuel: 0,
        fill: professionalColors.primary
      };
    }

    fuelLogs.forEach(log => {
      const logDate = new Date(log.date);
      let key;

      if (timeRange === 'month') {
        key = `${logDate.getFullYear()}-${(logDate.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        key = logDate.toISOString().split('T')[0];
      }

      if (groupedData[key]) {
        groupedData[key].totalFuel += log.fuelAmount;
      }
    });

    return Object.values(groupedData);
  };

  if (loading) {
    return (
      <StyledPaper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          width: 400,
          height: 345,
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Fade in timeout={500}>
          <CircularProgress 
            size={32} 
            thickness={4}
            sx={{ 
              color: professionalColors.primary,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
        </Fade>
      </StyledPaper>
    );
  }

  const chartData = processData();
  const totalFuel = chartData.reduce((sum, item) => sum + item.totalFuel, 0);
  const avgFuel = totalFuel / chartData.length;
  const lastPeriodFuel = chartData[chartData.length - 1]?.totalFuel || 0;

  // Calculate percentage change from previous period
  const getPercentageChange = () => {
    if (chartData.length < 2) return 0;
    const current = chartData[chartData.length - 1].totalFuel;
    const previous = chartData[chartData.length - 2].totalFuel;
    return previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const percentageChange = getPercentageChange();

  return (
    <StyledPaper
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: 400,
        height: 345,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component={motion.div}
            whileHover={{ rotate: 15, scale: 1.1 }}
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
            }}
          >
            <LocalGasStation sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: professionalColors.text, lineHeight: 1.2 }}>
              Fuel Consumption
            </Typography>
            <Typography variant="body2" color={professionalColors.secondary} sx={{ fontSize: '0.75rem' }}>
              {timeRange === 'month' ? 'Monthly overview' : 'Daily tracking'}
            </Typography>
          </Box>
        </Box>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ fontSize: '0.75rem', color: professionalColors.secondary }}>
            Time Range
          </InputLabel>
          <StyledSelect
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '12px',
                  mt: 0.5,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  border: `1px solid ${professionalColors.border}`
                }
              }
            }}
          >
            <MenuItem value="day" sx={{ fontSize: '0.75rem' }}>Daily</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.75rem' }}>Monthly</MenuItem>
          </StyledSelect>
        </FormControl>
      </Box>

      {/* Stats Summary */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          backgroundColor: `linear-gradient(135deg, ${alpha(professionalColors.background, 0.8)} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
          borderRadius: '16px',
          p: 2,
          border: `1px solid ${alpha(professionalColors.border, 0.5)}`
        }}
      >
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="caption" color={professionalColors.secondary} sx={{ 
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Total
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ 
            fontSize: '1.25rem',
            lineHeight: 1.3,
            background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {totalFuel.toFixed(1)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>L</span>
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="caption" color={professionalColors.secondary} sx={{ 
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Avg/Period
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ 
            fontSize: '1.25rem',
            lineHeight: 1.3,
            color: professionalColors.text
          }}>
            {avgFuel.toFixed(1)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>L</span>
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="caption" color={professionalColors.secondary} sx={{ 
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Last Period
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h5" fontWeight={700} sx={{ 
              fontSize: '1.25rem',
              lineHeight: 1.3,
              mr: 0.5,
              color: professionalColors.text
            }}>
              {lastPeriodFuel.toFixed(1)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>L</span>
            </Typography>
            {percentageChange !== 0 && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: '8px',
                background: percentageChange > 0 
                  ? `linear-gradient(135deg, ${alpha(professionalColors.success, 0.1)} 0%, ${alpha(professionalColors.success, 0.05)} 100%)`
                  : `linear-gradient(135deg, ${alpha(professionalColors.error, 0.1)} 0%, ${alpha(professionalColors.error, 0.05)} 100%)`,
                border: `1px solid ${percentageChange > 0 ? alpha(professionalColors.success, 0.2) : alpha(professionalColors.error, 0.2)}`
              }}>
                {percentageChange > 0 ? (
                  <TrendingUp sx={{ fontSize: 12, color: professionalColors.success }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 12, color: professionalColors.error }} />
                )}
                <Typography variant="caption" sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: percentageChange > 0 ? professionalColors.success : professionalColors.error
                }}>
                  {Math.abs(percentageChange).toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mini Chart */}
      <Box sx={{ flexGrow: 1, height: '100%', mt: -1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: professionalColors.secondary }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              width={28}
              tick={{ fontSize: 10, fill: professionalColors.secondary }}
              domain={[0, 'dataMax + 10']}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 12,
                padding: '8px 12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: `1px solid ${professionalColors.border}`,
                background: professionalColors.surface
              }}
              formatter={(value) => [`${value} L`, 'Fuel Consumption']}
              labelFormatter={(value, payload) => {
                if (!payload || payload.length === 0) return '';
                return payload[0].payload.fullDate;
              }}
              itemStyle={{
                padding: '2px 0',
                textTransform: 'capitalize'
              }}
            />
            <Bar
              dataKey="totalFuel"
              barSize={18}
              radius={[8, 8, 0, 0]}
              onMouseEnter={(data, index) => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.totalFuel > 0 ? professionalColors.primary : alpha(professionalColors.secondary, 0.3)}
                  opacity={hoveredBar === index ? 1 : entry.totalFuel > 0 ? 0.85 : 0.4}
                  component={motion.rect}
                  animate={{
                    height: entry.totalFuel > 0 ? '100%' : '2px',
                    y: entry.totalFuel > 0 ? 0 : '90%'
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography variant="caption" color={professionalColors.secondary} sx={{
          fontSize: '0.65rem',
          opacity: 0.7
        }}>
          {timeRange === 'month' ? 'Last 6 months' : 'Last 6 days'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{
            width: 12,
            height: 12,
            background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
            borderRadius: '3px',
            mr: 0.5,
            opacity: 0.8
          }} />
          <Typography variant="caption" color={professionalColors.secondary} sx={{
            fontSize: '0.65rem',
            opacity: 0.7
          }}>
            Fuel Volume (L)
          </Typography>
        </Box>
      </Box>
    </StyledPaper>
  );
};

export default CompactFuelStats;