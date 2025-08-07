import React, { useEffect, useState } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, CircularProgress, Divider, Button, alpha
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const COLORS = {
  PRIMARY: '#1a1a1a',
  SECONDARY: '#6366f1',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  BACKGROUND: '#f8fafc',
  TEXT_PRIMARY: '#1e293b',
  TEXT_SECONDARY: '#64748b',
  DIVIDER: '#e2e8f0',
  WHITE: '#ffffff',
  BLACK: '#000000',
  CARD_BG: '#ffffff',
  CARD_BORDER: '#f1f5f9'
};

const statusColors = {
  Scheduled: COLORS.INFO,
  'In Progress': COLORS.WARNING,
  Completed: COLORS.SUCCESS,
  Cancelled: COLORS.ERROR,
};

const UpcomingMaintenanceWidget = ({ sidebarExpanded = true }) => {
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
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${COLORS.CARD_BORDER}`,
      background: COLORS.CARD_BG,
      width: sidebarExpanded ? '600px' : '700px', 
      height: '380px', 
      display: 'flex', 
      flexDirection: 'column', 
      p: 0,
      mt: 3,
      overflow: 'hidden',
      transition: 'width 0.3s ease-in-out'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        px: 3, 
        pt: 3, 
        pb: 2,
        borderBottom: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`
      }}>
        <Avatar sx={{
          bgcolor: alpha(COLORS.INFO, 0.1),
          color: COLORS.INFO,
          mr: 2,
          width: 44,
          height: 44,
          border: `1px solid ${alpha(COLORS.INFO, 0.2)}`
        }}>
          <EventIcon sx={{ fontSize: 24 }} />
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            fontSize: '1.25rem',
            fontWeight: 600,
            color: COLORS.TEXT_PRIMARY
          }}
        >
          Upcoming Maintenance
        </Typography>
      </Box>

      {/* Content */}
      <CardContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '280px' }}>
            <CircularProgress size={32} />
          </Box>
        ) : upcoming.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px' }}>
            <Typography 
              sx={{ 
                color: COLORS.TEXT_SECONDARY, 
                fontSize: '1rem',
                fontWeight: 400
              }}
            >
              No upcoming maintenance events
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '280px', overflowY: 'auto', px: 2, py: 1 }}>
            {upcoming.map((item) => (
              <ListItem
                key={item.id}
                alignItems="flex-start"
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  background: COLORS.WHITE,
                  border: `1px solid ${alpha(COLORS.DIVIDER, 0.2)}`,
                  position: 'relative',
                  pl: 2.5,
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 12,
                    bottom: 12,
                    width: 4,
                    borderRadius: 2,
                    background: statusColors[item.status] || COLORS.TEXT_SECONDARY,
                  },
                  '&:hover': { 
                    background: alpha(COLORS.BACKGROUND, 0.5),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.2s ease'
                  },
                  minHeight: 72
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: alpha(COLORS.PRIMARY, 0.1), 
                    color: COLORS.PRIMARY,
                    width: 44, 
                    height: 44,
                    border: `1px solid ${alpha(COLORS.PRIMARY, 0.2)}`
                  }}>
                    <DirectionsCarIcon fontSize="medium" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ 
                        fontSize: '1rem', 
                        mr: 2, 
                        color: COLORS.INFO,
                        fontWeight: 600
                      }}>
                        {formatDateDisplay(item.scheduledDate)}
                      </Typography>
                      <Chip
                        label={item.status}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: statusColors[item.status] || COLORS.TEXT_SECONDARY,
                          color: COLORS.WHITE,
                          ml: 1,
                          height: 24
                        }}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: COLORS.TEXT_PRIMARY,
                          mt: 0.5
                        }}
                      >
                        {item.vehicleMake} {item.vehicleModel} ({item.licensePlate})
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.875rem',
                          color: COLORS.TEXT_SECONDARY,
                          mt: 0.25
                        }}
                      >
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

      {/* Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        px: 3, 
        py: 2,
        borderTop: `1px solid ${alpha(COLORS.DIVIDER, 0.1)}`,
        background: alpha(COLORS.BACKGROUND, 0.3)
      }}>
        <Button
          endIcon={<ArrowForwardIosIcon />}
          size="small"
          sx={{ 
            fontWeight: 600, 
            textTransform: 'none',
            color: COLORS.INFO,
            '&:hover': {
              backgroundColor: alpha(COLORS.INFO, 0.1)
            }
          }}
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