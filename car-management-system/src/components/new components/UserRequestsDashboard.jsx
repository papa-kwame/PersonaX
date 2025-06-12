import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Modal,
  TextField
} from '@mui/material';
import api from '../../services/api';

const UserRequestsDashboard = () => {
  const { isAuthenticated, userRoles, userId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/api/VehicleAssignment/AllRequests');
        setRequests(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && userRoles.includes('Admin')) {
      fetchRequests();
    }
  }, [isAuthenticated, userRoles]);

  const handleOpen = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleApprove = async () => {
    try {
      await api.post(`/api/VehicleAssignment/vehicle-requests/${selectedRequest.id}/process-stage`, {
        comments: comment,
      }, {
        params: { userId }
      });
      setRequests(requests.filter(request => request.id !== selectedRequest.id));
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Requests Dashboard
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.userName}</TableCell>
                <TableCell>{request.vehicle.make} {request.vehicle.model}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleOpen(request)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Request Details
          </Typography>
          {selectedRequest && (
            <>
              <Typography>User: {selectedRequest.userName}</Typography>
              <Typography>Vehicle: {selectedRequest.vehicle.make} {selectedRequest.vehicle.model}</Typography>
              <Typography>Status: {selectedRequest.status}</Typography>
              <TextField
                label="Comment"
                multiline
                rows={4}
                fullWidth
                margin="normal"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button variant="contained" color="primary" onClick={handleApprove}>
                Approve
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default UserRequestsDashboard;
