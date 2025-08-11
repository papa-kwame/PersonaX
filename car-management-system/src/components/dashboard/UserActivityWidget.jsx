import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box,
  CircularProgress, Alert, Divider, Fade, Skeleton, IconButton, Paper, Slide
} from '@mui/material';
import {
  DirectionsCar as CarIcon, Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon,
  ExpandMore as ExpandMoreIcon, Person as PersonIcon, Close as CloseIcon, ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import api from '../../services/api';

const UserActivityWidget = ({ sidebarExpanded = true }) => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/UserActivity/recent?limit=4');
      setRecentActivities(response.data);
    } catch (err) {
      setError('Failed to fetch activity data');
      console.error('Error fetching activity data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(fetchActivityData, 150000);
    return () => clearInterval(interval);
  }, []);

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    setOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    setSelectedActivity(null);
  };

  const getActivityIcon = (module) => {
    switch (module) {
      case 'Vehicles':
        return <CarIcon />;
      case 'Authentication':
        return <PersonIcon />;
      case 'Maintenance':
        return <WarningIcon />;
      case 'Fuel':
        return <InfoIcon />;
      case 'Users':
        return <PersonIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'Create':
        return 'success';
      case 'Update':
        return 'info';
      case 'Delete':
        return 'error';
      case 'Login':
        return 'success';
      case 'Logout':
        return 'warning';
      case 'View':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatFullTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card sx={{ 
        width: sidebarExpanded ? '650px' : '750px', 
        height: '380px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out'
      }}>
        <CardContent sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        width: sidebarExpanded ? '650px' : '750px', 
        height: '380px', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out'
      }}>
        <CardContent sx={{ flex: 1 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      width: sidebarExpanded ? '650px' : '750px', 
      height: '380px', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative', 
      overflow: 'hidden',
      transition: 'width 0.3s ease-in-out',
      borderRadius:'20px',
    }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {/* Simple Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Recent Activity
          </Typography>
        </Box>

        {/* Activity List */}
        <Box sx={{ flex: 1 }}>
          <List sx={{ p: 0 }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem 
                    sx={{ 
                      px: 0.9, 
                      borderRadius: 1.5,
                      mb: 1.5,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transition: 'background-color 0.2s ease'
                      },
                      borderRadius:'10px',
                      backgroundColor:'rgba(208, 208, 219, 0.21)',
                      color:'white',
                      padding:'5px',

                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${getActivityColor(activity.activityType)}.main`,
                          width: 36,
                          height: 36,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {getActivityIcon(activity.module)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                          <Typography variant="body2" fontWeight={600} color="#1a1a1a">
                            {activity.user?.userName || 'Unknown User'}
                          </Typography>
                          <Chip
                            label={activity.activityType}
                            color={getActivityColor(activity.activityType)}
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {activity.description} • {formatTimestamp(activity.timestamp)}
                        </Typography>
                      }
                    />
                    {activity.details && (
                      <IconButton
                        size="small"
                        onClick={() => handleActivityClick(activity)}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: 'action.hover',
                            transform: 'scale(1.1)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>

                  {index < recentActivities.length - 1 && (
                    <Divider sx={{ my: 1.5, opacity: 0.6 }} />
                  )}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                      No recent activities
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Box>
      </CardContent>

      {/* Full Overlay */}
      <Slide direction="up" in={overlayOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {selectedActivity && (
            <>
              {/* Overlay Header */}
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.50'
              }}>
                <IconButton
                  onClick={handleCloseOverlay}
                  sx={{ color: 'text.secondary' }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar 
                  sx={{ 
                    bgcolor: `${getActivityColor(selectedActivity.activityType)}.main`,
                    width: 32,
                    height: 32
                  }}
                >
                  {getActivityIcon(selectedActivity.module)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {selectedActivity.activityType} - {selectedActivity.module}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFullTimestamp(selectedActivity.timestamp)}
                  </Typography>
                </Box>
              </Box>

              {/* Overlay Content */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* User Info */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      User
                    </Typography>
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedActivity.user?.userName || 'Unknown User'}
                      </Typography>
                      {selectedActivity.user?.userEmail && (
                        <Typography variant="caption" color="text.secondary">
                          {selectedActivity.user.userEmail}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Description
                    </Typography>
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2">
                        {selectedActivity.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Entity Info */}
                  {selectedActivity.entityType && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Entity
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>Type:</strong> {selectedActivity.entityType}
                        </Typography>
                        <Typography variant="body2">
                          <strong>ID:</strong> {selectedActivity.entityId}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Details */}
                  {selectedActivity.details && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Details
                      </Typography>
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        maxHeight: 120
                      }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(selectedActivity.details, null, 2)}
                        </pre>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Slide>
    </Card>
  );
};

export default UserActivityWidget; 