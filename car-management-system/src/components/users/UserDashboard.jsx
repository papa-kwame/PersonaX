import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import VehicleAssignedCard from './VehicleAssignedCard';
import UserMaintenanceRequests from '../new components/UserMaintenanceRequests';
import CompactFuelStats from '../fuel/CompactFuelStats';
import FuelLogList from '../fuel/FuelLogList';
import VehicleRequestsComponent from '../new components/VehicleRequestsComponent';

const UserDashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      <Grid container spacing={3}>
        {/* First Column Stack */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <VehicleAssignedCard />
            </Grid>
            <Grid item xs={12}>
              <VehicleRequestsComponent />
            </Grid>
          </Grid>
        </Grid>

        {/* Second Column Stack */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction="column">
            <Grid item xs={12}>
              <UserMaintenanceRequests />
            </Grid>
            <Grid container item xs={12} spacing={3}>
              <Grid item xs={12} md={6}>
                <CompactFuelStats />
              </Grid>
              <Grid item xs={12} md={6}>
                <FuelLogList />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;