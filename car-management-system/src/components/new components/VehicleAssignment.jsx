import React, { useState, useEffect, useCallback } from "react";
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, Typography, CircularProgress, Divider
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import InboxIcon from '@mui/icons-material/Inbox';
import api from "../../services/api";

const accentColor = '#1976d2';

export default function DirectVehicleAssignment() {
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchRecentAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const { data } = await api.get("/api/VehicleAssignment/RecentAssignments");
      setRecentAssignments(data);
    } catch (err) {
      setRecentAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentAssignments();
  }, [fetchRecentAssignments]);

  return (
    <Box sx={{ width: 660, height: 370, mx: 'auto', mt: 4, p: 0, background: '#fff', borderRadius: 4, boxShadow: 6, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 3, pb: 1 }}>
        <AssignmentTurnedInIcon color="black" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="h6" fontWeight={400}  sx={{ flexGrow: 1, fontSize: 22 }}>
          Recent Vehicle Assignments
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {loadingAssignments ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <CircularProgress size={32} />
        </Box>
      ) : recentAssignments.length > 0 ? (
        <List sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1, maxHeight: '320px' }}>
              {recentAssignments.map((assignment) => (
            <ListItem
              key={`${assignment.vehicleId}-${assignment.userId}`}
              alignItems="flex-start"
              sx={{
                mb: 1.5,
                borderRadius: 2,
                boxShadow: '0 1px 4px rgba(150, 150, 150, 0.83)',
                background: '#f9fafd',
                position: 'relative',
                pl: 2.5,

                '&:hover': { background: '#f0f4fa' },
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between' }}>
                    <Typography fontWeight={400} sx={{ fontSize: 18, color: 'black' }}>
                      {assignment.vehicleMake} {assignment.vehicleModel}
                    </Typography>
                    <Chip label={assignment.licensePlate} color="black" size="small" sx={{ fontWeight: 400, mr: 1, fontSize: 15, height: 28 }} />
  
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', gap: 1, mt: 0.5 }}>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: 15}}>
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' ,mr:'10px'}} />
                      {assignment.userName}
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ ml: 2, fontSize: 14 }}>
                      {new Date(assignment.assignmentDate).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 7, color: 'text.secondary', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <InboxIcon sx={{ fontSize: 48, mb: 1, color: 'primary.light' }} />
          <Typography variant="body1" fontWeight={700}>No assignments found</Typography>
        </Box>
      )}
    </Box>
  );
}