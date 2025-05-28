import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  List,
  CircularProgress,
  Button
} from '@mui/material';
import FuelLogCard from './FuelLogCard';
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
      console.error(err);
    }
  };

  const handleEdit = (log) => {
    // Implement edit functionality
    console.log('Edit log:', log);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/FuelLogs/${id}`);
      fetchFuelLogs();
    } catch (err) {
      console.error(err);
      setError('Failed to delete fuel log');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Fuel Logs</Typography>
        <Button variant="outlined" size="small">
          View All
        </Button>
      </Box>

      <List>
        {fuelLogs.map((log) => (
          <Box key={log.id} mb={2}>
            <FuelLogCard
              log={log}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
        ))}
      </List>
    </Paper>
  );
};


export default RecentFuelLogs;