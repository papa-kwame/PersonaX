import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Avatar,
  Paper,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../services/api';

// Vibrant color mapping for stages
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

const CommentsMaintenance = () => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchLatestComments = async () => {
      try {
        const response = await api.get('/api/MaintenanceRequest/latest-comments');
        setComments(response.data.latestComments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLatestComments();
    }
  }, [isAuthenticated]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="600px">
      <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
    </Box>
  );

  if (error) return (
    <Box height="600px" display="flex" alignItems="center" justifyContent="center">
      <Alert severity="error" sx={{ width: '80%', fontSize: '1rem' }}>{error}</Alert>
    </Box>
  );

  return (
    <Paper elevation={4} sx={{
      width: '600px',
      height: '600px',
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8ed 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{
        p: 3,
        background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h5" fontWeight="700" sx={{ letterSpacing: '0.5px' }}>
          Recent Activity Feed
        </Typography>
        <Typography variant="subtitle2" sx={{ opacity: 0.9, mt: 0.5 }}>
          Latest updates on vehicle requests
        </Typography>
      </Box>

      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 0,
        '&::-webkit-scrollbar': {
          width: '6px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.light,
          borderRadius: '3px'
        }
      }}>
        {comments.length > 0 ? (
          <List disablePadding>
            {comments.map((comment, index) => {
              const stageStyle = getStageStyle(comment.stage);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListItem 
                    alignItems="flex-start"
                    sx={{
                      py: 2.5,
                      px: 3,
                      '&:not(:last-child)': {
                        borderBottom: '1px solid rgba(0,0,0,0.08)'
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.02)'
                      }
                    }}
                  >
                    <Avatar sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 2,
                      fontSize: '1rem',
                      fontWeight: '600',
                      bgcolor: stageStyle.border,
                      color: stageStyle.text
                    }}>
                      {comment.commenterUserName.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1" component="span" sx={{ 
                            fontWeight: '600',
                            mr: 1.5,
                            color: theme.palette.text.primary
                          }}>
                            {comment.commenterUserName}
                          </Typography>
                          <Chip
                            label={comment.stage}
                            size="small"
                            sx={{
                              backgroundColor: stageStyle.bg,
                              color: stageStyle.text,
                              border: `1px solid ${stageStyle.border}`,
                              fontWeight: '600',
                              fontSize: '0.7rem',
                              height: '22px'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body1" sx={{ 
                            mb: 1.5,
                            color: theme.palette.text.secondary,
                            lineHeight: '1.5'
                          }}>
                            {comment.comment}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1
                          }}>
                            <Typography variant="caption" sx={{ 
                              color: theme.palette.text.secondary,
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '0.75rem'
                            }}>
                              <span style={{ opacity: 0.7 }}>Request by:</span> 
                              <span style={{ fontWeight: '600', marginLeft: '4px' }}>
                                {comment.requestOwnerName}
                              </span>
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: theme.palette.text.secondary,
                              fontSize: '0.75rem'
                            }}>
                              • {new Date(comment.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        </>
                      }
                      sx={{ my: 0 }}
                    />
                  </ListItem>
                </motion.div>
              );
            })}
          </List>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography variant="body1" color="textSecondary">
              No activity to display
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default CommentsMaintenance;