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

// Enhanced stage styles with more sophisticated color scheme
const stageStyles = {
  'inspection': { 
    bg: 'linear-gradient(135deg, rgba(225, 245, 254, 0.95) 0%, rgba(179, 229, 252, 0.95) 100%)',
    text: '#0288d1',
    border: '1px solid rgba(2, 136, 209, 0.3)',
    icon: '🔍',
    accent: '#4fc3f7'
  },
  'approval': { 
    bg: 'linear-gradient(135deg, rgba(232, 245, 233, 0.95) 0%, rgba(200, 230, 201, 0.95) 100%)',
    text: '#388e3c',
    border: '1px solid rgba(56, 142, 60, 0.3)',
    icon: '✅',
    accent: '#81c784'
  },
  'repair': { 
    bg: 'linear-gradient(135deg, rgba(255, 243, 224, 0.95) 0%, rgba(255, 224, 178, 0.95) 100%)',
    text: '#ef6c00',
    border: '1px solid rgba(239, 108, 0, 0.3)',
    icon: '🔧',
    accent: '#ffb74d'
  },
  'delivery': { 
    bg: 'linear-gradient(135deg, rgba(237, 231, 246, 0.95) 0%, rgba(209, 196, 233, 0.95) 100%)',
    text: '#7b1fa2',
    border: '1px solid rgba(123, 31, 162, 0.3)',
    icon: '🚀',
    accent: '#ba68c8'
  },
  'rejection': { 
    bg: 'linear-gradient(135deg, rgba(255, 235, 238, 0.95) 0%, rgba(255, 205, 210, 0.95) 100%)',
    text: '#d32f2f',
    border: '1px solid rgba(211, 47, 47, 0.3)',
    icon: '❌',
    accent: '#e57373'
  },
  'default': { 
    bg: 'linear-gradient(135deg, rgba(236, 239, 241, 0.95) 0%, rgba(207, 216, 220, 0.95) 100%)',
    text: '#455a64',
    border: '1px solid rgba(69, 90, 100, 0.3)',
    icon: '💬',
    accent: '#90a4ae'
  }
};

const getStageStyle = (stage) => {
  const lowerStage = stage?.toLowerCase();
  return stageStyles[lowerStage] || stageStyles['default'];
};

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 60%)`;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
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
            '& circle': {
              strokeLinecap: 'round',
            }
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
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: 'rgba(255, 235, 238, 0.95)',
            borderLeft: '4px solid #d32f2f',
            borderRadius: '12px',
            backdropFilter: 'blur(4px)',
            '& .MuiAlert-icon': {
              color: '#d32f2f',
              fontSize: '1.8rem'
            }
          }}
        >
          <Typography fontWeight="700" variant="body1">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  const commentsToShow = showMaintenance ? maintenanceComments : vehicleComments;

  return (
    <Paper elevation={0} sx={{
      width: '100%',
      maxWidth: 720,
      minWidth: 340,
      height: 430,
      borderRadius: '28px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(120deg, rgba(255,255,255,0.85) 60%, rgba(180,210,255,0.45) 100%)',
      boxShadow: '0 12px 40px 0 rgba(60, 80, 180, 0.18)',
      border: '1.5px solid rgba(120,140,200,0.10)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
    }}>
      {/* Header */}
      <Box sx={{
        p: 0,
        background: 'none',
        color: '#1a237e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: 'none',
        position: 'relative',
        minHeight: 90,
        zIndex: 2,
      }}>
        <Typography variant="h5" fontWeight={900} sx={{
          letterSpacing: '0.7px',
          color: 'rgba(30,40,90,0.98)',
          fontSize: '1.45rem',
          px: 4,
          pt: 3.5,
          pb: 1.2,
          textShadow: '0 2px 12px rgba(60,80,180,0.08)',
        }}>
          Requests Comments
        </Typography>
        <Box sx={{
          position: 'absolute',
          top: 18,
          right: 32,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 4px 18px rgba(60,80,180,0.10)',
          borderRadius: '999px',
          px: 2.2,
          py: 0.7,
          border: '1.5px solid rgba(120,140,200,0.10)',
          backdropFilter: 'blur(6px)',
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            background: showMaintenance
              ? 'rgba(0, 0, 0, 0.67)'
              : 'rgba(0,0,0,0.67)',
            borderRadius: '999px',
            px: 1.5,
            py: 0.5,
            minWidth: 90,
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          }}>
            {showMaintenance ? <Handyman sx={{ color: '#fff', fontSize: '1.1rem', mr: 1 }} /> : <DirectionsCar sx={{ color: '#fff', fontSize: '1.1rem', mr: 1 }} />}
            <Typography variant="caption" sx={{
              fontWeight: 300,
              color: '#fff',
              fontSize: '0.93rem',
              letterSpacing: '0.5px',
              textShadow: '0 1px 4px rgba(0,0,0,0.10)'
            }}>
              {showMaintenance ? 'Maintenance' : 'Vehicle'}
            </Typography>
          </Box>
          <Tooltip title="Switch view" arrow>
            <IconButton
              onClick={handleToggle}
              size="medium"
              sx={{
                color: '#fff',
                background: showMaintenance ? 'rgba(0, 0, 0, 0.67)' : 'rgba(0, 0, 0, 0.67)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.13)',
                '&:hover': {
                  background: showMaintenance ? 'linear-gradient(120deg, #0277bd 0%, #00bcd4 100%)' : 'linear-gradient(120deg, #6a1b9a 0%, #ce93d8 100%)',
                  transform: 'rotate(180deg) scale(1.09)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.18)'
                },
                transition: 'all 0.3s',
                borderRadius: '999px',
                ml: 1,
                p: 1.2,
              }}
            >
              <SwapHoriz fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {/* Content */}
      <Box sx={{
        height: 'calc(430px - 90px)',
        p: 0,
        background: 'rgba(255,255,255,0.82)',
        pt: 1.5,
        pb: 1.5,
        px: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: commentsToShow.length > 0 ? 'space-between' : 'center',
        gap: commentsToShow.length > 0 ? 1.2 : 0,
        overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={showMaintenance ? 'maintenance' : 'vehicle'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {commentsToShow.length > 0 ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                gap: 1.2,
              }}>
                {commentsToShow.map((comment, index) => {
                  const stageStyle = getStageStyle(comment.stage);
                  const commentDate = new Date(comment.timestamp);
                  const formattedTime = commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = commentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  // Calculate dynamic padding/margin based on number of comments
                  const cardCount = commentsToShow.length;
                  const basePadding = cardCount > 4 ? 1.2 : 2.5;
                  const baseMargin = cardCount > 4 ? 1.2 : 2.5;
                  const avatarSize = cardCount > 4 ? 44 : 54;
                  return (
                    <Box
                      key={index}
                      component={motion.div}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      sx={{
                        px: basePadding,
                        py: basePadding,
                        mb: index !== cardCount - 1 ? baseMargin : 0,
                        background: 'linear-gradient(120deg, #fafdff 80%, #e9f0fb 100%)',
                        borderRadius: '22px',
                        boxShadow: '0 6px 28px rgba(60, 80, 180, 0.13)',
                        border: '1.5px solid rgba(120,140,200,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        minHeight: 0,
                        transition: 'box-shadow 0.22s, transform 0.22s',
                        '&:hover': {
                          boxShadow: '0 12px 40px rgba(60, 80, 180, 0.18)',
                          transform: 'translateY(-3px) scale(1.015)',
                        },
                        position: 'relative',
                      }}
                    >
                      <Avatar sx={{
                        width: avatarSize,
                        height: avatarSize,
                        fontWeight: 800,
                        fontSize: cardCount > 4 ? '1.1rem' : '1.35rem',
                        bgcolor: getAvatarColor(comment.commenterUserName || 'U'),
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.10)',
                        mr: 3,
                        border: '2.5px solid #fff',
                      }}>
                        {getInitials(comment.commenterUserName)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            gap: 2.5,
                          }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Typography variant="subtitle1" sx={{
                                fontWeight: 800,
                                color: '#1a237e',
                                fontSize: cardCount > 4 ? '1rem' : '1.13rem',
                              }}>
                                {comment.commenterUserName}
                              </Typography>
                              <Chip
                                label={comment.stage.toUpperCase()}
                                size="small"
                                sx={{
                                  background: stageStyle.accent,
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: cardCount > 4 ? '0.7rem' : '0.78rem',
                                  borderRadius: '999px',
                                  px: 1.7,
                                  height: 24,
                                  letterSpacing: '0.6px',
                                  boxShadow: '0 1px 4px rgba(2, 136, 209, 0.10)',
                                  ml: 0.7,
                                }}
                              />
                            </Box>
                            <Box display="flex" alignItems="center" gap={1.2}>
                              <Schedule sx={{ color: '#7b8ca6', fontSize: cardCount > 4 ? '1rem' : '1.13rem' }} />
                              <Typography variant="caption" sx={{
                                color: '#7b8ca6',
                                fontWeight: 600,
                                fontSize: cardCount > 4 ? '0.85rem' : '0.97rem',
                                letterSpacing: '0.35px',
                              }}>
                                {formattedDate} • {formattedTime}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{
                              lineHeight: cardCount > 4 ? '1.4' : '1.7',
                              color: '#2a2a2a',
                              fontSize: cardCount > 4 ? '0.97rem' : '1.07rem',
                              letterSpacing: '0.22px',
                              mb: 0.7,
                              fontWeight: 500,
                            }}>
                              {comment.comment}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1.2}>
                              <Person sx={{ color: '#0288d1', fontSize: cardCount > 4 ? '1rem' : '1.13rem' }} />
                              <Typography variant="caption" sx={{
                                color: '#0288d1',
                                fontWeight: 700,
                                fontSize: cardCount > 4 ? '0.85rem' : '0.97rem',
                                letterSpacing: '0.35px',
                              }}>
                                {comment.requestOwnerName}'s request
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ my: 0, ml: 0 }}
                      />
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="280px"
                sx={{
                  p: 4,
                  background: 'linear-gradient(120deg, #fafdff 80%, #e9f0fb 100%)',
                  borderRadius: '18px',
                  boxShadow: '0 4px 24px rgba(60, 80, 180, 0.10)',
                  border: '1.5px solid rgba(120,140,200,0.10)',
                }}
              >
                <Box sx={{
                  width: 90,
                  height: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(4, 34, 48, 0.22)',
                  borderRadius: '50%',
                  mb: 2,
                  boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                }}>
                  <Comment sx={{
                    fontSize: '2.8rem',
                    color: 'rgb(2, 137, 209)',
                  }} />
                </Box>
                <Typography variant="h6" sx={{
                  color: 'rgba(0,0,0,0.55)',
                  fontWeight: 800,
                  mb: 1,
                  letterSpacing: '0.35px',
                  fontSize: '1.18rem',
                }}>
                  No recent activity
                </Typography>
                <Typography variant="body2" sx={{
                  color: 'rgba(0,0,0,0.38)',
                  textAlign: 'center',
                  maxWidth: '320px',
                  fontSize: '1.01rem',
                  letterSpacing: '0.22px',
                  fontWeight: 500,
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