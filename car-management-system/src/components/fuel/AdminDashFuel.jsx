import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  CircularProgress,
  useTheme,
  Divider
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const FuelExpensesDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      try {
        const response = await api.get('/api/fuellogs/stats/monthly-summary');
        setData(response.data);
        console.log('Monthly summary:', response.data);
      } catch (error) {
        console.error('Failed to fetch summary:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlySummary();
  }, []);

  const cardSx = {
    width: '100%',
    maxWidth: 700,
    height: 320,
    margin: '32px auto 0 auto',
    borderRadius: '16px',
    boxShadow: '0 2px 16px 0 rgba(34, 74, 190, 0.10)',
    background: '#fff',
    border: '1px solid #e3e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  };

  if (loading) {
    return (
      <Box sx={{
        ...cardSx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CircularProgress size={32} thickness={4} sx={{ color: '#224abe' }} />
      </Box>
    );
  }

  if (!data || data.totalMonthlyFuelCost === 0) {
    return (
      <Card sx={cardSx} elevation={0}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <MonetizationOnIcon sx={{ color: '#b0b8d9', fontSize: 40, mb: 1 }} />
          <Typography variant="body1" sx={{ color: '#b0b8d9', fontWeight: 500 }}>
            No fuel expenses recorded this month.
          </Typography>
        </Box>
      </Card>
    );
  }

  const { totalMonthlyFuelCost, totalTodayFuelCost, topSpender, dailyExpenses } = data;
  const normalizedDailyExpenses = (dailyExpenses || [])
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-15)
    .map(item => ({
      Date: item.date,
      Cost: item.cost,
    }));

  return (
    <Card sx={cardSx} elevation={0}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#224abe',
            letterSpacing: '0.2px',
            mb: 0.5,
          }}
        >
          Fuel Dashboard
        </Typography>
        <Divider sx={{ mb: 1, borderColor: '#e3e8f0' }} />
      </Box>
      <CardContent sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: 3,
        pt: 0,
        pb: 2,
      }}>
        {/* Executive Stats Row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: 2.5,
          mb: 2,
        }}>
          {/* Monthly */}
          <Box sx={{
            flex: 1,
            background: '#fff',
            border: '1px solid #e3e8f0',
            borderRadius: '10px',
            boxShadow: '0 1px 6px 0 rgba(34, 74, 190, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 90,
            px: 0,
            py: 1.5,
          }}>
            <MonetizationOnIcon sx={{ fontSize: 22, color: '#224abe', mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: '#7b8ca6', fontWeight: 600, mb: 0.5 }}>
              Monthly
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#222', letterSpacing: '0.2px', textAlign: 'center' }}>
              ₵{totalMonthlyFuelCost.toFixed(2)}
            </Typography>
          </Box>
          {/* Today */}
          <Box sx={{
            flex: 1,
            background: '#fff',
            border: '1px solid #e3e8f0',
            borderRadius: '10px',
            boxShadow: '0 1px 6px 0 rgba(34, 74, 190, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 90,
            px: 0,
            py: 1.5,
          }}>
            <TodayIcon sx={{ fontSize: 22, color: '#4e73df', mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: '#7b8ca6', fontWeight: 600, mb: 0.5 }}>
              Today
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#222', letterSpacing: '0.2px', textAlign: 'center' }}>
              ₵{totalTodayFuelCost.toFixed(2)}
            </Typography>
          </Box>
          {/* Top Spender */}
          <Box sx={{
            flex: 1.2,
            background: '#fff',
            border: '1px solid #e3e8f0',
            borderRadius: '10px',
            boxShadow: '0 1px 6px 0 rgba(34, 74, 190, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 90,
            px: 1.5,
            py: 1.5,
            gap: 1.5,
          }}>
            <Avatar sx={{
              bgcolor: '#e3e8f0',
              width: 36,
              height: 36,
              color: '#224abe',
              fontWeight: 700,
              fontSize: '1.3rem',
            }}>
              <PersonIcon fontSize="medium" />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: '#7b8ca6', fontWeight: 600 }}>
                Top User
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topSpender.name}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#4e73df', ml: 1, minWidth: 0 }}>
              ₵{(topSpender.totalSpent ?? 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>
        {/* Chart */}
        <Box sx={{
          flex: 1,
          background: '#fff',
          border: '1px solid #e3e8f0',
          borderRadius: '10px',
          p: 1.5,
          minHeight: 90,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
          <Typography variant="caption" sx={{ color: '#7b8ca6', fontWeight: 600, mb: 0.5 }}>
            Daily Trend
          </Typography>
          <Box sx={{ height: 70, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={normalizedDailyExpenses}>
                <XAxis
                  dataKey="Date"
                  tick={{ fontSize: 10, fill: '#7b8ca6' }}
                  tickFormatter={(value) => value.split('-')[2]}
                  tickMargin={6}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`₵${value}`, 'Cost']}
                  labelFormatter={(label) => `Day ${label.split('-')[2]}`}
                  contentStyle={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '6px 10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: 'none',
                    background: '#fff',
                    color: '#224abe',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Cost"
                  stroke="#224abe"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#4e73df', stroke: '#fff', strokeWidth: 1 }}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#4e73df' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FuelExpensesDashboard;