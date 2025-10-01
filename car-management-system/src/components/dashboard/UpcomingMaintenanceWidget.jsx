import React, { useEffect, useState } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, CircularProgress, Divider, Button, alpha, IconButton, Tooltip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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

const statusIcons = {
  Scheduled: ScheduleIcon,
  'In Progress': BuildIcon,
  Completed: CheckCircleIcon,
  Cancelled: CancelIcon,
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
          .slice(0, 8);
        setUpcoming(future);
      } catch (err) {
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  const getDaysUntil = (date) => {
    const today = new Date();
    const scheduledDate = new Date(date);
    const diffTime = scheduledDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days) => {
    if (days <= 3) return COLORS.ERROR;
    if (days <= 7) return COLORS.WARNING;
    return COLORS.SUCCESS;
  };

  return (
    <Card sx={{ 
      borderRadius: '20px', 
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      width: sidebarExpanded ? '600px' : '700px', 
      height: '350px', 
      display: 'flex', 
      flexDirection: 'column', 
      p: 0,
      mt: 3,
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
      }
    }}>
      {/* Enhanced Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        px: 3, 
        pt: 1.5, 
        pb: 1,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <Box sx={{
          p: 1.5,
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          mr: 2,
          position: 'relative',
          zIndex: 1
        }}>
          <EventIcon sx={{ fontSize: 19, color: 'white' }} />
        </Box>
        
        <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}
          >
            Upcoming Maintenance
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              mt: 0.5,
              fontSize: '0.475rem'
            }}
          >
            {upcoming.length} scheduled events
          </Typography>
        </Box>

      </Box>

      {/* Enhanced Content */}
      <CardContent sx={{ flex: 1, overflow: 'hidden', p: 0 }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '140px',
            gap: 2
          }}>
            <CircularProgress size={40} sx={{ color: COLORS.INFO }} />
            <Typography sx={{ color: COLORS.TEXT_SECONDARY, fontSize: '0.875rem' }}>
              Loading maintenance schedule...
            </Typography>
          </Box>
        ) : upcoming.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '140px',
            px: 4,
            textAlign: 'center',
            paddingTop:'75px'
          }}>
            <Box sx={{
              p: 3,
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EventIcon sx={{ fontSize: 48, color: COLORS.INFO }} />
            </Box>
            <Typography 
              variant="h6"
              sx={{ 
                color: COLORS.TEXT_PRIMARY, 
                fontSize: '1.125rem',
                fontWeight: 600,
                mb: 1
              }}
            >
              No Upcoming Maintenance
            </Typography>
            <Typography 
              sx={{ 
                color: COLORS.TEXT_SECONDARY, 
                fontSize: '0.875rem',
                maxWidth: 300
              }}
            >
              All maintenance events are up to date. New scheduled maintenance will appear here.
            </Typography>
          </Box>
        ) : (
          <List sx={{ 
            maxHeight: '220px', 
            overflowY: 'auto', 
            px: 2, 
            py: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0,0,0,0.3)',
              },
            },
          }}>
            {upcoming.map((item, index) => {
              const daysUntil = getDaysUntil(item.scheduledDate);
              const StatusIcon = statusIcons[item.status] || ScheduleIcon;
              
              return (
                <ListItem
                  key={item.id}
                  alignItems="flex-start"
                  sx={{
                    mb: 1,
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    position: 'relative',
                    pl: 2,
                    pr: 0.5,
                    py: 0.5,
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top:3,
                      bottom: 3,
                      width: 5,
                      borderRadius: ' 20px 0px  0px 20px',
                      background: `linear-gradient(180deg, ${statusColors[item.status] || COLORS.TEXT_SECONDARY} 0%, ${alpha(statusColors[item.status] || COLORS.TEXT_SECONDARY, 0.7)} 100%)`,
                    },
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      borderColor: alpha(statusColors[item.status] || COLORS.TEXT_SECONDARY, 0.3),
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    },
                    minHeight: 60,
                    cursor: 'pointer'
                  }}
                >
                  <ListItemAvatar>
                                         <Avatar sx={{ 
                       bgcolor: alpha(statusColors[item.status] || COLORS.PRIMARY, 0.1), 
                       color: statusColors[item.status] || COLORS.PRIMARY,
                       width: 40, 
                       height: 40,
                       border: `2px solid ${alpha(statusColors[item.status] || COLORS.PRIMARY, 0.2)}`,
                       boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                     }}>
                       <DirectionsCarIcon fontSize="small" />
                     </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ 
                            fontSize: '1rem', 
                            color: COLORS.TEXT_PRIMARY,
                            fontWeight: 400
                          }}>
                         {item.assignedMechanicName || 'Unassigned'}
                          </Typography>

                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={<StatusIcon sx={{ fontSize: 14 }} />}
                            label={item.status}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              bgcolor: statusColors[item.status] || COLORS.TEXT_SECONDARY,
                              color: 'white',
                              height: 24,
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                            size="small"
                          />
                          <Chip
                            icon={<StatusIcon sx={{ fontSize: 14 }} />}
                            label={`${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              bgcolor: statusColors[item.status] || COLORS.TEXT_SECONDARY,
                              color: 'white',
                              height: 24,
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                            size="small"
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mb: 0.5
                          }}
                        >
                          {item.vehicleMake} {item.vehicleModel}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.875rem',
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500
                          }}
                        >
                          {item.licensePlate} 
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 1, 
        py: 1,
        borderTop: '1px solid rgba(0,0,0,0.06)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: COLORS.TEXT_SECONDARY,
            fontSize: '0.75rem',
            fontWeight: 500
          }}
        >
          Showing {upcoming.length} of {upcoming.length} upcoming events
        </Typography>
        
        <Button
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
          size="small"
          sx={{ 
            fontWeight: 600, 
            textTransform: 'none',
            color: COLORS.INFO,
            borderRadius: '6px',
            px: 2,
            py: 0.5,
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
            },
            transition: 'all 0.2s ease'
          }}
          component={Link}
          to="/schedule"
        >
          View All Schedule
        </Button>
      </Box>
    </Card>
  );
};

export default UpcomingMaintenanceWidget;