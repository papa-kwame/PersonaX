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
            marginTop:'30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;',
            }}
        >
            <Typography variant="body2" color="text.secondary">
            No fuel expenses recorded this month.
            </Typography>
        </Card>
        );
    }

    const { totalMonthlyFuelCost, totalTodayFuelCost, topSpender, dailyExpenses } = data;

    // Debugging: Log the dailyExpenses data
    console.log('Daily Expenses Data:', dailyExpenses);

    const normalizedDailyExpenses = (dailyExpenses || [])
        .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ensure the data is sorted by date
        .slice(-15) // Get the last 15 entries
        .map(item => ({
        Date: item.date,
        Cost: item.cost,
        }));

    // Debugging: Log the normalizedDailyExpenses data
    console.log('Normalized Daily Expenses:', normalizedDailyExpenses);

    return (
        <Card
        sx={{
            width: '600px',
            height: '300px',
            marginTop:'30px',
            borderRadius: '8px',
            boxShadow:' rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',

        }}
        >       <Typography variant="body2" sx={{ fontWeight: 500, marginLeft:'25px',marginTop:'15px'}}>
                Fuel Expense
                </Typography>
        <CardContent sx={{
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Top Row - Stats */}
            <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
            gap: 2
            }}>
            {/* Monthly Total */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOnIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 300 }}>
                    Monthly
                </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 400 }}>
                ₵{totalMonthlyFuelCost.toFixed(2)}
                </Typography>
            </Box>

            {/* Today's Total */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TodayIcon color="secondary" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 300 }}>
                    Today
                </Typography>
                </Box>
                <Typography variant="h6" color="secondary" sx={{ fontWeight: 400 }}>
                ₵{totalTodayFuelCost.toFixed(2)}
                </Typography>
            </Box>

            {/* Top Spender */}
            <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{
                bgcolor: 'primary.light',
                width: 32,
                height: 32,
                color: 'primary.dark'
                }}>
                <PersonIcon fontSize="small" />
                </Avatar>
                <Box>
                <Typography variant="body2" sx={{ fontWeight: 300 }}>
                    Top User
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 400 }}>
                    {topSpender.name} 
                </Typography>
                </Box>
            </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Chart */}
            <Box sx={{ flex: 1, height: '100px' }}>
            <Typography variant="caption" color="text.secondary">
                Daily Trend
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={normalizedDailyExpenses}>
                <XAxis
                    dataKey="Date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => value.split('-')[2]}
                />
                <Tooltip
                    formatter={(value) => [`₵${value}`, 'Cost']}
                    labelFormatter={(label) => `Day ${label.split('-')[2]}`}
                    contentStyle={{
                    borderRadius: '6px',
                    fontSize: '12px',
                    padding: '4px 8px',
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="Cost"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                />
                </LineChart>
            </ResponsiveContainer>
            </Box>
        </CardContent>
        </Card>
    );
    };

    export default FuelExpensesDashboard;
