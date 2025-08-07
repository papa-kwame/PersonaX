import React, { useEffect, useState } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import {
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Avatar,
  Chip,
  ButtonGroup,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { Comment, DirectionsCar, Handyman, Person, Schedule } from '@mui/icons-material';
import api from '../../services/api';

const stageColors = {
  approve: { bg: '#e8f5e9', color: '#388e3c' },
  comment: { bg: '#e3f2fd', color: '#1976d2' },
  commit: { bg: '#ede7f6', color: '#7b1fa2' },
  review: { bg: '#fff3e0', color: '#f57c00' },
  reject: { bg: '#ffebee', color: '#d32f2f' },
  inspection: { bg: '#e1f5fe', color: '#0288d1' },
  approval: { bg: '#e8f5e9', color: '#388e3c' },
  repair: { bg: '#fff3e0', color: '#ef6c00' },
  delivery: { bg: '#ede7f6', color: '#7b1fa2' },
  rejection: { bg: '#ffebee', color: '#d32f2f' },
  default: { bg: '#eceff1', color: '#455a64' },
};

const getStageColor = (stage) => {
  const lower = stage?.toLowerCase();
  return stageColors[lower] || stageColors.default;
};

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 60%)`;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const CommentsVehicle = () => {
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
          api.get('/api/VehicleAssignment/latest-comments?limit=4'),
        ]);
        setMaintenanceComments(maintenanceRes.data.latestComments || []);
        setVehicleComments(vehicleRes.data.latestComments || []);
      } catch (err) {
        setError(err.message || 'Error fetching comments');
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchComments();
  }, [isAuthenticated]);

  const commentsToShow = showMaintenance ? maintenanceComments : vehicleComments;

  return (
    <Paper elevation={2} sx={{
      width: 670,
      height: 435,
      borderRadius: 4,
      background: '#fff',
      boxShadow: '0 4px 24px rgba(60,80,180,0.10)',
      border: '1.5px solid #e3e8f0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        px: 4,
        pt: 3,
        pb: 2,
        borderBottom: '1px solid #f0f1f3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fafbfc',
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#1a237e', letterSpacing: 0.5 }}>
          Requests Comments
        </Typography>
        <ButtonGroup variant="contained" sx={{ borderRadius: 999, boxShadow: 'none', bgcolor: '#e3e8f0' }}>
          <Button
            onClick={() => setShowMaintenance(true)}
            startIcon={<Handyman />}
            sx={{
              borderRadius: 999,
              bgcolor: showMaintenance ? theme.palette.primary.main : '#e3e8f0',
              color: showMaintenance ? '#fff' : '#1a237e',
              fontWeight: 700,
              px: 2.5,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: theme.palette.primary.dark, color: '#fff' },
            }}
          >
            Maintenance
          </Button>
          <Button
            onClick={() => setShowMaintenance(false)}
            startIcon={<DirectionsCar />}
            sx={{
              borderRadius: 999,
              bgcolor: !showMaintenance ? theme.palette.primary.main : '#e3e8f0',
              color: !showMaintenance ? '#fff' : '#1a237e',
              fontWeight: 700,
              px: 2.5,
              boxShadow: 'none',
              textTransform: 'none',
              '&:hover': { bgcolor: theme.palette.primary.dark, color: '#fff' },
            }}
          >
            Vehicle
          </Button>
        </ButtonGroup>
      </Box>
      {/* Content */}
      <Box sx={{
        flex: 1,
        px: 3.5,
        py: 2.5,
        overflowY: 'auto',
        background: '#f7fafd',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: commentsToShow.length === 0 ? 'center' : 'stretch',
        justifyContent: commentsToShow.length === 0 ? 'center' : 'flex-start',
      }}>
        {loading ? (
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            <CircularProgress size={48} thickness={4} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
        ) : commentsToShow.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
            <Comment sx={{ fontSize: 60, color: theme.palette.primary.light, mb: 1 }} />
            <Typography variant="h6" fontWeight={700} color="#7b8ca6" mb={0.5}>
              No recent activity
            </Typography>
            <Typography variant="body2" color="#b0b8c1" textAlign="center">
              {showMaintenance ? 'Maintenance updates will appear here when available.' : 'Vehicle assignment updates will appear here when available.'}
            </Typography>
          </Box>
        ) : (
          commentsToShow.map((comment, idx) => {
            const stage = getStageColor(comment.stage);
            const commentDate = new Date(comment.timestamp);
            const formattedTime = commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedDate = formatDateDisplay(commentDate);
            return (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2.5,
                  bgcolor: '#fff',
                  borderRadius: 4, // slightly increased
                  boxShadow: '0 2px 8px rgba(60,80,180,0.07)',
                  border: '1px solid #e3e8f0',
                  px: 2.5,
                  py: 1.1, // slightly reduced
                  mb: 0.5,
                  minHeight: 92,
                  transition: 'box-shadow 0.18s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(60,80,180,0.16)' },
                  position: 'relative',
                }}
              >
                <Avatar sx={{
                  width: 44,
                  height: 44,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  bgcolor: getAvatarColor(comment.commenterUserName || 'U'),
                  color: '#fff',
                  boxShadow: '0 1px 4px rgba(60,80,180,0.10)',
                  border: '2px solid #fff', // subtle border
                }}>
                  {getInitials(comment.commenterUserName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.2 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1a237e" sx={{ fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {comment.commenterUserName}
                    </Typography>
                    <Chip
                      label={comment.stage.toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: stage.bg,
                        color: stage.color,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        borderRadius: 1.5,
                        px: 1.1,
                        height: 20,
                        ml: 0.5,
                        letterSpacing: '0.5px',
                        boxShadow: 'none',
                        border: `1.5px solid ${stage.color}22`, // subtle border for visibility
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="#2a2a2a" sx={{ fontWeight: 500, mb: 0.2, fontSize: '0.98rem', lineHeight: 1.5 }}>
                    {comment.comment}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ color: '#c0c7d1', fontSize: '1.05rem' }} />
                      <Typography variant="caption" color="#b0b8c1" sx={{ fontWeight: 400, fontSize: '0.89rem' }}>
                        {formattedDate} • {formattedTime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Person sx={{ color: theme.palette.primary.main, fontSize: '1.05rem' }} />
                      <Typography variant="caption" color={theme.palette.primary.main} sx={{ fontWeight: 500, fontSize: '0.89rem' }}>
                        {comment.requestOwnerName}'s request
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {/* Divider between cards, except last */}
                {idx < commentsToShow.length - 1 && (
                  <Divider sx={{ position: 'absolute', left: 0, right: 0, bottom: -2, borderColor: '#f0f1f3' }} />
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

export default CommentsVehicle;