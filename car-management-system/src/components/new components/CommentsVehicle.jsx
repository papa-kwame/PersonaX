import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  useTheme,
  IconButton,
  Divider,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { SwapHoriz, Comment, DirectionsCar, Handyman, Schedule, Person } from '@mui/icons-material';
import api from '../../services/api';

// Enhanced stage styles with light blue backgrounds
const stageStyles = {
  'inspection': { 
    bg: 'rgba(225, 245, 254, 0.9)', // Light blue 50
    text: '#0288d1', // Light blue 700
    border: 'rgba(2, 136, 209, 0.2)',
    icon: '🔍'
  },
  'approval': { 
    bg: 'rgba(232, 245, 233, 0.9)', // Light green 50
    text: '#388e3c', // Green 700
    border: 'rgba(56, 142, 60, 0.2)',
    icon: '✅'
  },
  'repair': { 
    bg: 'rgba(255, 243, 224, 0.9)', // Orange 50
    text: '#f57c00', // Orange 700
    border: 'rgba(245, 124, 0, 0.2)',
    icon: '🔧'
  },
  'delivery': { 
    bg: 'rgba(237, 231, 246, 0.9)', // Deep purple 50
    text: '#7b1fa2', // Purple 700
    border: 'rgba(123, 31, 162, 0.2)',
    icon: '🚀'
  },
  'rejection': { 
    bg: 'rgba(255, 235, 238, 0.9)', // Red 50
    text: '#d32f2f', // Red 700
    border: 'rgba(211, 47, 47, 0.2)',
    icon: '❌'
  },
  'default': { 
    bg: 'rgba(236, 239, 241, 0.9)', // Blue grey 50
    text: '#455a64', // Blue grey 700
    border: 'rgba(69, 90, 100, 0.2)',
    icon: '💬'
  }
};

const getStageStyle = (stage) => {
  const lowerStage = stage?.toLowerCase();
  return stageStyles[lowerStage] || stageStyles['default'];
};

const RotatingCommentsCard = () => {
  const { isAuthenticated } = useAuth();
  const [maintenanceComments, setMaintenanceComments] = useState([]);
  const [vehicleComments, setVehicleComments] = useState([]);
  const [showMaintenance, setShowMaintenance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const [maintenanceRes, vehicleRes] = await Promise.all([
          api.get('/api/MaintenanceRequest/latest-comments?limit=4'),
          api.get('/api/VehicleAssignment/latest-comments?limit=4')
        ]);
        setMaintenanceComments(maintenanceRes.data.latestComments || []);
        setVehicleComments(vehicleRes.data.latestComments || []);
      } catch (err) {
        setError(err.message || 'Error fetching comments');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchComments();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMaintenance((prev) => !prev);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setShowMaintenance((prev) => !prev);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress 
          size={60} 
          thickness={4} 
          sx={{ 
            color: theme.palette.primary.light,
          }} 
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="400px" display="flex" alignItems="center" justifyContent="center">
        <Alert 
          severity="error" 
          sx={{ 
            width: '80%', 
            boxShadow: 1,
            background: 'rgba(255, 235, 238, 0.9)',
            borderLeft: '4px solid #d32f2f',
            borderRadius: '8px'
          }}
        >
          <Typography fontWeight="700">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  const commentsToShow = showMaintenance ? maintenanceComments : vehicleComments;
  const sourceIcon = showMaintenance ? 
    <Handyman sx={{ color: '#0288d1' }} /> : 
    <DirectionsCar sx={{ color: '#7b1fa2' }} />;

  return (
    <Paper elevation={0} sx={{
      width: '700px',
      height: '465px',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        background: 'rgba(255, 255, 255, 0.98)',
        color: '#333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <Typography variant="h6" fontWeight="500">
          Activity Dashboard
        </Typography>
        <Box display="flex" alignItems="center">
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 0.5,
            borderRadius: '8px',
            background: 'rgba(225, 245, 254, 0.5)',
            border: '1px solid rgba(2, 136, 209, 0.2)',
            mr: 2
          }}>
            {sourceIcon}
            <Typography variant="caption" sx={{ 
              fontWeight: 500,
              ml: 1,
              color: showMaintenance ? '#0288d1' : '#7b1fa2'
            }}>
              {showMaintenance ? 'Maintenance' : 'Vehicle'}
            </Typography>
          </Box>
          <Tooltip title="Switch view">
            <IconButton 
              onClick={handleToggle} 
              size="medium"
              sx={{ 
                color: showMaintenance ? '#0288d1' : '#7b1fa2',
                backgroundColor: 'rgba(225, 245, 254, 0.3)',
                '&:hover': {
                  backgroundColor: showMaintenance ? 'rgba(2, 136, 209, 0.1)' : 'rgba(123, 31, 162, 0.1)',
                  color: showMaintenance ? '#01579b' : '#4a148c',
                }
              }}
            >
              <SwapHoriz fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{
        height: 'calc(465px - 64px)',
        overflowY: 'auto',
        p: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        '&::-webkit-scrollbar': { 
          width: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(2, 136, 209, 0.3)',
          borderRadius: '2px'
        }
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={showMaintenance ? 'maintenance' : 'vehicle'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {commentsToShow.length > 0 ? (
              <List sx={{ py: 0 }}>
                {commentsToShow.map((comment, index) => {
                  const stageStyle = getStageStyle(comment.stage);
                  const commentDate = new Date(comment.timestamp);
                  const formattedTime = commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = commentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  
                  return (
                    <React.Fragment key={index}>
                      <ListItem
                        alignItems="flex-start"
                        component={motion.div}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        sx={{
                          px: 2.5,
                          py: 2,
                          height: '116px',
                          background: stageStyle.bg,
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            background: `${stageStyle.bg.replace('0.9)', '1)')}`,
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)'
                          },
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            background: stageStyle.text
                          }
                        }}
                      >
                        <Avatar sx={{
                          width: 36,
                          height: 36,
                          mr: 2,
                          bgcolor: 'white',
                          color: stageStyle.text,
                          fontWeight: 500,
                          fontSize: '1rem',
                          border: `1px solid ${stageStyle.border}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {stageStyle.icon}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              mb: 0.5
                            }}>
                              <Box display="flex" alignItems="center">
                                <Person sx={{ 
                                  color: stageStyle.text,
                                  fontSize: '1rem',
                                  mr: 1 
                                }} />
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: '600',
                                  color: stageStyle.text
                                }}>
                                  {comment.commenterUserName}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center">
                                <Schedule sx={{ 
                                  color: 'rgba(0,0,0,0.4)',
                                  fontSize: '0.9rem',
                                  mr: 0.5
                                }} />
                                <Typography variant="caption" sx={{ 
                                  color: 'rgba(0,0,0,0.6)',
                                  mr: 1.5,
                                  fontWeight: 500
                                }}>
                                  {formattedDate} • {formattedTime}
                                </Typography>
                                <Chip
                                  label={comment.stage.toUpperCase()}
                                  size="small"
                                  sx={{
                                    background: 'white',
                                    color: stageStyle.text,
                                    fontSize: '0.6rem',
                                    height: '20px',
                                    fontWeight: 600,
                                    border: `1px solid ${stageStyle.border}`,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" sx={{ 
                                lineHeight: '1.5',
                                color: 'rgba(0,0,0,0.8)',
                                mb: 1,
                                whiteSpace: 'pre-line',
                                fontSize: '0.9rem'
                              }}>
                                {comment.comment}
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <Comment sx={{ 
                                  color: stageStyle.text,
                                  mr: 1,
                                  fontSize: '0.9rem'
                                }} />
                                <Typography variant="caption" sx={{ 
                                  color: 'rgba(0,0,0,0.6)',
                                  fontWeight: 500
                                }}>
                                  On <Box component="span" sx={{ color: stageStyle.text, fontWeight: 600 }}>
                                    {comment.requestOwnerName}'s
                                  </Box> request
                                </Typography>
                              </Box>
                            </>
                          }
                          sx={{ my: 0, ml: 1 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Box 
                display="flex" 
                flexDirection="column" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
                sx={{ 
                  p: 4,
                  background: 'rgba(225, 245, 254, 0.3)'
                }}
              >
                <Comment sx={{ 
                  fontSize: '3rem', 
                  color: 'rgba(2, 136, 209, 0.2)',
                  mb: 2
                }} />
                <Typography variant="h6" sx={{ 
                  color: 'rgba(0,0,0,0.5)',
                  fontWeight: 500,
                  mb: 1
                }}>
                  No recent activity
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(0,0,0,0.4)',
                  textAlign: 'center',
                  maxWidth: '300px'
                }}>
                  {showMaintenance ? 
                    'Maintenance updates will appear here when available' : 
                    'Vehicle assignment updates will appear here when available'}
                </Typography>
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Paper>
  );
};

export default RotatingCommentsCard;