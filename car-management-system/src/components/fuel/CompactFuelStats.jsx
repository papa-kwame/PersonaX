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
  useTheme
} from '@mui/material';
import { 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { LocalGasStation } from '@mui/icons-material';

const CompactFuelStats = () => {
  const theme = useTheme();
  const { userId } = useAuth();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchFuelLogs();
  }, []);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/FuelLogs');
      setFuelLogs(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch fuel logs', err);
      setLoading(false);
    }
  };

  const processData = () => {
    const groupedData = {};

    fuelLogs.forEach(log => {
      const date = new Date(log.date);
      let key;

      if (timeRange === 'month') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          totalFuel: 0
        };
      }

      groupedData[key].totalFuel += log.fuelAmount;
    });

    return Object.values(groupedData)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6); // Show last 6 data points
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress size={20} />
      </Box>
    );
  }

  const chartData = processData();
  const totalFuel = chartData.reduce((sum, item) => sum + item.totalFuel, 0).toFixed(1);

  return (
    <Paper sx={{ 
      width: 400,
      height: 245,
      p: 1.5,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Box display="flex" alignItems="center">
          <LocalGasStation sx={{ 
            color: theme.palette.primary.main, 
            fontSize: '20px',
            mr: 1 
          }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Fuel Consumption
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel sx={{ fontSize: '0.8rem' }}>Range</InputLabel>
          <Select
            value={timeRange}
            label="Range"
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ fontSize: '0.8rem', height: '30px' }}
          >
            <MenuItem value="day" sx={{ fontSize: '0.8rem' }}>Daily</MenuItem>
            <MenuItem value="month" sx={{ fontSize: '0.8rem' }}>Monthly</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Main Content */}
      <Box display="flex" flexGrow={1} gap={1}>
        {/* Total Fuel Display */}
        <Box width="30%" display="flex" flexDirection="column" justifyContent="center">
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {totalFuel}L
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Total
          </Typography>
        </Box>
        
        {/* Mini Chart */}
        <Box width="70%" height="100%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => timeRange === 'month' 
                  ? value.split('-')[1] 
                  : value.split('-')[2].substring(0,2)}
              />
              <YAxis 
                width={25}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{
                  fontSize: 10,
                  borderRadius: 4,
                  padding: '2px 6px'
                }}
                labelFormatter={(value) => timeRange === 'month' 
                  ? `M${value.split('-')[1]}` 
                  : `D${value.split('-')[2]}`}
              />
              <Line 
                type="monotone" 
                dataKey="totalFuel" 
                stroke={theme.palette.primary.main} 
                strokeWidth={1.5}
                dot={{ r: 1.5 }}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
      
      {/* Footer */}
      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ 
        fontSize: '0.6rem',
        mt: 0.5
      }}>
        {timeRange === 'month' ? 'Last 6 months' : 'Last 6 days'}
      </Typography>
    </Paper>
  );
};

export default CompactFuelStats;