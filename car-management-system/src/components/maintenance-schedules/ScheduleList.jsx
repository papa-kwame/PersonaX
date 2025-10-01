import React from 'react';
import { format } from 'date-fns';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
  Event as EventIcon
} from '@mui/icons-material';

const ScheduleList = ({
  filteredSchedules,
  selectedSchedule,
  setSelectedSchedule,
  fetchProgressUpdates,
  handleViewDetails
}) => {
  return (
    <Paper elevation={3} sx={{ flex: 1.2, p: 2, borderRadius: 4, minWidth: 400, maxHeight: 700, overflowY: 'auto' }}>
      <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
        Scheduled Maintenance
      </Typography>
      
      {filteredSchedules.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <EventIcon sx={{ fontSize: 48, mb: 1, color: 'primary.light' }} />
          <Typography variant="h6" fontWeight={700}>No scheduled maintenance</Typography>
          <Typography variant="body2">You have no scheduled maintenance at this time.</Typography>
        </Box>
      ) : (
        <List>
          {filteredSchedules.map(schedule => (
            <React.Fragment key={schedule.id}>
              <ListItem
                alignItems="flex-start"
                selected={selectedSchedule && selectedSchedule.id === schedule.id}
                onClick={() => { 
                  setSelectedSchedule(schedule); 
                  fetchProgressUpdates(schedule.maintenanceRequestId); 
                }}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                  background: selectedSchedule && selectedSchedule.id === schedule.id ? '#fff' : '#f9fafd',
                  position: 'relative',
                  pl: 3,
                  pr: 3,
                  py: 2.5,
                  '&:hover': { background: '#f0f4fa', cursor: 'pointer' },
                  minHeight: 90,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.2s',
                }}
              >
                <ListItemAvatar sx={{ mr: 3 }}>
                  <Avatar sx={{ width: 56, height: 56 }}>
                    <DirectionsCarIcon fontSize="large" />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Typography fontWeight={400} sx={{ fontSize: 22 }}>
                        {schedule.vehicleMake} {schedule.vehicleModel} ({schedule.licensePlate})
                      </Typography>
                      <Chip 
                        label={schedule.status} 
                        color={schedule.status === 'Completed' ? 'success' : schedule.status === 'In Progress' ? 'info' : 'warning'} 
                        size="medium" 
                        sx={{ fontWeight: 800, fontSize: 16, height: 32 }} 
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, fontSize: 17 }}>
                        <strong>Date:</strong> {format(new Date(schedule.scheduledDate), 'PPP')}
                      </Typography>
                    </Box>
                  }
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    sx={{ fontWeight: 800, borderRadius: 2, px: 3, py: 1.5, textTransform: 'none', fontSize: 16 }}
                    onClick={e => { e.stopPropagation(); handleViewDetails(schedule); }}
                  >
                    View Details
                  </Button>
                </Box>
              </ListItem>
              <Divider variant="inset" component="li" sx={{ my: 1 }} />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ScheduleList;





