import React from 'react';
import { Box, Grid } from '@mui/material';
import VehicleAssignedCard from './VehicleAssignedCard';
import UserMaintenanceRequests from '../new components/UserMaintenanceRequests';
import CompactFuelStats from '../fuel/CompactFuelStats';
import FuelLogList from '../fuel/FuelLogList';
import VehicleRequestsComponent from '../new components/VehicleRequestsComponent';

const UserDashboard = () => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'transparent',
        fontFamily: '"Open Sans", Arial, sans-serif',
      }}
    >
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
