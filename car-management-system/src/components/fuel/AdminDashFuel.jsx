import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Divider,
  CircularProgress,
  useTheme,
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
      } catch (error) {
        console.error('Failed to fetch summary:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlySummary();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: '600px',
          height: '240px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!data || data.totalMonthlyFuelCost === 0) {
    return (
      <Card
        sx={{
          width: '600px',
          height: '300px',
          marginTop: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No fuel expenses recorded this month.
        </Typography>
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
    <Card
      sx={{
        width: '600px',
        height: '300px',
        marginTop: '30px',
        borderRadius: '8px',
        boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        padding: '16px 24px 0',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 24,
          right: 24,
          height: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        }
      }}>
        <Typography variant="body2" sx={{ 
          fontWeight: 500,
          color: theme.palette.text.primary,
          letterSpacing: '0.2px'
        }}>
          Fuel Expense
        </Typography>
      </Box>

      <CardContent sx={{
        height: 'calc(100% - 49px)',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Stats Row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '12px',
        }}>
          {/* Monthly */}
          <Box sx={{ 
            flex: 1,
            padding: '8px',
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
            borderRadius: '6px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MonetizationOnIcon 
                color="primary" 
                fontSize="small" 
                sx={{ color: theme.palette.primary.main }}
              />
              <Typography variant="body2" sx={{ 
                fontWeight: 300,
                color: theme.palette.text.secondary
              }}>
                Monthly
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 400,
              marginTop: '4px',
              color: theme.palette.text.primary
            }}>
              ₵{totalMonthlyFuelCost.toFixed(2)}
            </Typography>
          </Box>

          {/* Today */}
          <Box sx={{ 
            flex: 1,
            padding: '8px',
            backgroundColor: 'rgba(236, 64, 122, 0.04)',
            borderRadius: '6px'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TodayIcon 
                color="secondary" 
                fontSize="small" 
                sx={{ color: theme.palette.secondary.main }}
              />
              <Typography variant="body2" sx={{ 
                fontWeight: 300,
                color: theme.palette.text.secondary
              }}>
                Today
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 400,
              marginTop: '4px',
              color: theme.palette.secondary.main
            }}>
              ₵{totalTodayFuelCost.toFixed(2)}
            </Typography>
          </Box>

          {/* Top Spender */}
          <Box sx={{ 
            flex: 2,
            padding: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Avatar sx={{
              bgcolor: 'primary.light',
              width: 32,
              height: 32,
              color: 'primary.dark',
              flexShrink: 0
            }}>
              <PersonIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ 
                fontWeight: 300,
                color: theme.palette.text.secondary
              }}>
                Top User
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 400,
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {topSpender.name} (₵{topSpender.amount?.toFixed(2) || '0.00'})
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Chart */}
        <Box sx={{ 
          flex: 1,
          marginTop: '8px',
          position: 'relative'
        }}>
          <Typography variant="caption" sx={{ 
            color: theme.palette.text.secondary,
            display: 'block',
            marginBottom: '4px'
          }}>
            Daily Trend
          </Typography>
          <Box sx={{ 
            height: 'calc(100% - 20px)',
            backgroundColor: 'rgba(0, 0, 0, 0.01)',
            borderRadius: '6px',
            padding: '4px 0'
          }}>
            <ResponsiveContainer width="100%" height="97.0%">
              <LineChart data={normalizedDailyExpenses}>
                <XAxis
                  dataKey="Date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value.split('-')[2]}
                  tickMargin={6}
                />
                <Tooltip
                  formatter={(value) => [`₵${value}`, 'Cost']}
                  labelFormatter={(label) => `Day ${label.split('-')[2]}`}
                  contentStyle={{
                    borderRadius: '6px',
                    fontSize: '12px',
                    padding: '6px 10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Cost"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ 
                    r: 4,
                    strokeWidth: 0,
                    fill: theme.palette.primary.main
                  }}
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