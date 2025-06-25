import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const MyVehicleRequests = () => {
  const [requests, setRequests] = useState([]);
  const { userId, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchMyVehicleRequests = async () => {
      if (!isAuthenticated || !userId) return;

      try {
        const response = await axios.get(`/api/MyVehicleRequests/${userId}`);
        // Ensure response.data is an array
        const requestsArray = Array.isArray(response.data) ? response.data : [];
        setRequests(requestsArray);
      } catch (error) {
        console.error('Error fetching vehicle requests:', error);
        setRequests([]); // Set requests to an empty array in case of error
      }
    };

    fetchMyVehicleRequests();
  }, [userId, isAuthenticated]);

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h4" gutterBottom>
        My Vehicle Requests
      </Typography>
      <List>
        {requests.map((request) => (
          <ListItem key={request.id} divider>
            <ListItemText
              primary={`Request Reason: ${request.requestReason}`}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="textPrimary">   
                    Status: {request.status}
                  </Typography>
                  <br />
                  Request Date: {new Date(request.requestDate).toLocaleDateString()}
                  <br />
                  Current Stage: {request.currentStage}
                  {request.vehicle && (
                    <>
                      <br />
                      Vehicle Make: {request.vehicle.make}
                      <br />
                      Vehicle Model: {request.vehicle.model}
                      <br />
                      License Plate: {request.vehicle.licensePlate}
                    </>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default MyVehicleRequests;
