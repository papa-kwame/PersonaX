import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import UserVehicleManagement from './UserVehicleManagement';
import MyVehicleRequests from '../new components/MyVehicleRequests';
import PersonalMaintenanceRequest from '../new components/PersonalMaintenanceRequest';
import VehicleRequestForm from '../new components/VehicleRequestForm';
import RequestApp from '../new components/VehicleRequestsComponent';
import VehicleRequestsComponent from '../new components/VehicleRequestsComponent';
import VehicleAssignedCard from './VehicleAssignedCard';
import UserMaintenanceRequests from '../new components/UserMaintenanceRequests';

const UserDashboard = () => {
  return (
    <Box sx={{ p: 4 }}>


      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>

            <VehicleAssignedCard />

        </Grid>

        <Grid item xs={12} md={6}>
      
            <UserMaintenanceRequests />
      
        </Grid>

        <Grid item xs={12}>

            <VehicleRequestsComponent />

        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;
