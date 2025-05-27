import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const UserRequests = () => {
  const [requests, setRequests] = useState([]);
  const { userId, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!isAuthenticated || !userId) return;

      try {
        const response = await axios.get(`/api/UserRequests/${userId}`);
        setRequests(response.data);
      } catch (error) {
        console.error('Error fetching user requests:', error);
      }
    };

    fetchUserRequests();
  }, [userId, isAuthenticated]);

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h4" gutterBottom>
        User Requests
      </Typography>
      <List>
        {requests.map((request) => (
          <ListItem key={request.id} divider>
            <ListItemText
              primary={`Status: ${request.status}`}
              secondary={`Request Date: ${new Date(request.requestDate).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default UserRequests;
