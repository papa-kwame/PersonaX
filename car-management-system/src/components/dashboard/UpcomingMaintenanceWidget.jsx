import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, CircularProgress, Divider, Button
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const statusColors = {
  Scheduled: '#1976d2',
  'In Progress': '#fbc02d',
  Completed: '#388e3c',
  Cancelled: '#d32f2f',
};

const UpcomingMaintenanceWidget = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      try {
        const res = await api.get('api/MaintenanceRequest/schedules');
        const now = new Date();
        const future = res.data
          .filter(sch => new Date(sch.scheduledDate) > now)
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
          .slice(0, 10);
        setUpcoming(future);
      } catch (err) {
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 6, width: '600px', height: '380px', display: 'flex', flexDirection: 'column', p: 0 ,mt:3}}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 3, pb: 1 }}>
        <EventIcon  sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h6" fontWeight={900}  sx={{ flexGrow: 1, fontSize: 22 }}>
          Upcoming Maintenance
        </Typography>
      </Box>
      <Divider sx={{ mb: 0.5 }} />
      <CardContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px' }}>
            <CircularProgress size={32} />
          </Box>
        ) : upcoming.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '320px' }}>
            <Typography color="text.secondary" align="center" sx={{ py: 2, fontSize: 18 }}>
              No upcoming maintenance events
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '320px', overflowY: 'auto', px: 2, py: 1 }}>
            {upcoming.map((item) => (
              <ListItem
                key={item.id}
                alignItems="flex-start"
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
                  background: '#fff',
                  position: 'relative',
                  pl: 2.5,
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 12,
                    bottom: 12,

                    borderRadius: 2,
                    background: statusColors[item.status] || '#bdbdbd',
                  },
                  '&:hover': { background: '#f5f7fa' },
                  minHeight: 72
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 44, height: 44 }}>
                    <DirectionsCarIcon fontSize="medium" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center',justifyContent:'space-between', gap: 1 }}>
                      <Typography fontWeight={900} sx={{ fontSize: 18, mr: 2, color: 'primary.main' }}>
                        {new Date(item.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Typography>
                      <Chip
                        label={item.status}
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          bgcolor: statusColors[item.status] || '#bdbdbd',
                          color: '#fff',
                          ml: 1
                        }}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ fontSize: 16 }}>
                        {item.vehicleMake} {item.vehicleModel} ({item.licensePlate})
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                        Mechanic: {item.assignedMechanicName || 'Unassigned'}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, py: 1.5 }}>
        <Button
          endIcon={<ArrowForwardIosIcon />}
          size="small"
          sx={{ fontWeight: 700, textTransform: 'none' }}
          color="primary"
          component={Link}
          to="/schedule"
        >
          View All
        </Button>
      </Box>
    </Card>
  );
};

export default UpcomingMaintenanceWidget;