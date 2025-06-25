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
  Fade
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { LocalGasStation } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const AnimatedPaper = motion(Paper);

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
      console.error('Failed to fetch fuel logs', err);
      setLoading(false);
    }
  };

  const processData = () => {
    const now = new Date();
    const groupedData = {};
    const periodCount = 6;

    // Initialize data structure with empty values
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
        fill: theme.palette.primary.main
      };
    }

    // Fill with actual data
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
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Fade in timeout={500}>
          <CircularProgress size={24} thickness={4} />
        </Fade>
      </Box>
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
    <AnimatedPaper
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: 400,
        height: 245,
        p: 2.5,
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper
      }}
    >
      {/* Header Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box display="flex" alignItems="center">
          <Box
            component={motion.div}
            whileHover={{ rotate: 15 }}
            sx={{
              background: theme.palette.primary.light,
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5
            }}
          >
            <LocalGasStation sx={{
              color: theme.palette.primary.main,
              fontSize: '20px'
            }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Fuel Consumption
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {timeRange === 'month' ? 'Monthly overview' : 'Daily tracking'}
            </Typography>
          </Box>
        </Box>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ 
              fontSize: '0.75rem', 
              height: '34px',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.divider
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '8px',
                  mt: 0.5,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }
            }}
          >
            <MenuItem value="day" sx={{ fontSize: '0.75rem' }}>Daily</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.75rem' }}>Monthly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Summary */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        display="flex" 
        justifyContent="space-between" 
        mb={2.5}
        gap={1.5}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.grey[900] 
            : theme.palette.grey[50],
          borderRadius: '12px',
          p: 1.5,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box textAlign="center" flex={1}>
          <Typography variant="caption" color="text.secondary" sx={{ 
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
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {totalFuel.toFixed(1)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>L</span>
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

        <Box textAlign="center" flex={1}>
          <Typography variant="caption" color="text.secondary" sx={{ 
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Avg/Period
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ 
            fontSize: '1.25rem',
            lineHeight: 1.3
          }}>
            {avgFuel.toFixed(1)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>L</span>
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />

        <Box textAlign="center" flex={1}>
          <Typography variant="caption" color="text.secondary" sx={{ 
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            Last Period
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h5" fontWeight={700} sx={{ 
              fontSize: '1.25rem',
              lineHeight: 1.3,
              mr: 0.5
            }}>
              {lastPeriodFuel.toFixed(1)}<span style={{ fontSize: '0.8rem', opacity: 0.8 }}>L</span>
            </Typography>
            {percentageChange !== 0 && (
              <Typography variant="caption" sx={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: percentageChange > 0 ? theme.palette.success.main : theme.palette.error.main,
                bgcolor: percentageChange > 0 
                  ? theme.palette.success.light 
                  : theme.palette.error.light,
                px: 0.5,
                borderRadius: '4px',
                lineHeight: 1.5
              }}>
                {percentageChange > 0 ? '↑' : '↓'} {Math.abs(percentageChange).toFixed(1)}%
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Mini Chart */}
      <Box flexGrow={1} height="100%" sx={{ mt: -1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis
              width={28}
              tick={{ fontSize: 10 }}
              domain={[0, 'dataMax + 10']}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                padding: '6px 10px',
                boxShadow: theme.shadows[3],
                border: 'none',
                background: theme.palette.background.paper
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
              barSize={16}
              radius={[6, 6, 0, 0]}
              onMouseEnter={(data, index) => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.totalFuel > 0 ? theme.palette.primary.main : theme.palette.action.disabled}
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
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{
          fontSize: '0.65rem',
          opacity: 0.7
        }}>
          {timeRange === 'month' ? 'Last 6 months' : 'Last 6 days'}
        </Typography>
        <Box display="flex" alignItems="center">
          <Box sx={{
            width: 10,
            height: 10,
            bgcolor: theme.palette.primary.main,
            borderRadius: '2px',
            mr: 0.5,
            opacity: 0.8
          }} />
          <Typography variant="caption" color="text.secondary" sx={{
            fontSize: '0.65rem',
            opacity: 0.7
          }}>
            Fuel Volume (L)
          </Typography>
        </Box>
      </Box>
    </AnimatedPaper>
  );
};

export default CompactFuelStats;