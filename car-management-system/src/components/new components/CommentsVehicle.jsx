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
  IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { SwapHoriz } from '@mui/icons-material';
import api from '../../services/api';

const stageStyles = {
  'inspection': { bg: '#FFEEBA', text: '#8D6E00', border: '#FFD54F' },
  'approval': { bg: '#C8E6C9', text: '#256029', border: '#66BB6A' },
  'repair': { bg: '#FFCCBC', text: '#BF360C', border: '#FF7043' },
  'delivery': { bg: '#B3E5FC', text: '#0064B7', border: '#4FC3F7' },
  'rejection': { bg: '#FFCDD2', text: '#C62828', border: '#EF5350' },
  'default': { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' }
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
          api.get('/api/MaintenanceRequest/latest-comments'),
          api.get('/api/VehicleAssignment/latest-comments')
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
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setShowMaintenance((prev) => !prev);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box height="400px" display="flex" alignItems="center" justifyContent="center">
        <Alert severity="error" sx={{ width: '80%' }}>{error}</Alert>
      </Box>
    );
  }

  const commentsToShow = showMaintenance ? maintenanceComments : vehicleComments;
  const sourceLabel = showMaintenance ? '🛠️ Maintenance Requests' : '🚗 Vehicle Requests';

  return (
    <Paper elevation={3} sx={{
      width: '700px',
      height: '465px',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        background: 'rgba(24,118,210, 0.8)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle1" fontWeight="600">
          Recent Comments
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="caption" sx={{ mr: 1 }}>
            {sourceLabel}
          </Typography>
          <IconButton onClick={handleToggle} size="small" sx={{ color: 'white' }}>
            <SwapHoriz fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 0,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.light,
          borderRadius: '2px'
        }
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={showMaintenance ? 'maintenance' : 'vehicle'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {commentsToShow.length > 0 ? (
              <List     
              sx={{
                        py: 1.5,
                        px: 2,
                        }
                      }>
                {commentsToShow.map((comment, index) => {
                  const stageStyle = getStageStyle(comment.stage);
                  return (
                    <ListItem
                      key={index}
                      alignItems="flex-start"
                      sx={{
                        py: 1.5,
                        px: 2,
                        boxShadow:'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;',
                        marginTop:'10px',
                        borderRadius:'12px'
                        }
                      }
                    >
                      <Avatar sx={{
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        fontSize: '0.8rem',
                        bgcolor: stageStyle.border,
                        color: stageStyle.text
                      }}>
                        {comment.commenterUserName.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: '600', mr: 1 }}>
                              {comment.commenterUserName}
                            </Typography>
                            <Chip
                              label={comment.stage}
                              size="small"
                              sx={{
                                backgroundColor: stageStyle.bg,
                                color: stageStyle.text,
                                border: `1px solid ${stageStyle.border}`,
                                fontSize: '0.6rem',
                                height: '18px'
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: '1' }}>
                              {comment.comment}
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 0.5, justifyContent:'space-between' }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                {comment.requestOwnerName}'s request 
                              </Typography>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                {new Date(comment.timestamp).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </>
                        }
                        sx={{ my: 0 }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body2" color="textSecondary">
                  No activity to display
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