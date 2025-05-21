import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Alert,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon, Edit as EditIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import api from '../../services/api';

const statusColors = {
  Pending: 'warning',
  Approved: 'success',
  Denied: 'error',
  Completed: 'info'
};

export default function AdminRequestList() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/VehicleRequest?userId=${userId}&isAdmin=true`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/VehicleRequest/${id}/status?userId=${userId}`, {
        status,
        updatedBy: userId
      });
      fetchRequests();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleEdit = (request) => {
    setEditingId(request.id);
    setEditData({
      reason: request.reason,
      startDate: request.startDate,
      endDate: request.endDate
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/VehicleRequest/${id}?userId=${userId}&isAdmin=true`, {
        ...editData,
        updatedBy: userId
      });
      setEditingId(null);
      fetchRequests();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vehicle Requests
        </Typography>
        <Typography variant="body1" gutterBottom>
          Manage all vehicle requests from users
        </Typography>

        {requests.length === 0 ? (
          <Alert severity="info" sx={{ mt: 4 }}>No requests found</Alert>
        ) : (
          <List>
            {requests.map((request) => (
              <ListItem key={request.id} divider sx={{ py: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ListItemText
                      primary={`Request ID: ${request.id}`}
                      secondary={
                        <>
                          {editingId === request.id ? (
                            <Box component="form" sx={{ mt: 1 }}>
                              <TextField
                                fullWidth
                                label="Reason"
                                name="reason"
                                value={editData.reason}
                                onChange={handleEditChange}
                                multiline
                                rows={3}
                                variant="outlined"
                                sx={{ mb: 2 }}
                              />
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    name="startDate"
                                    value={editData.startDate}
                                    onChange={handleEditChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    name="endDate"
                                    value={editData.endDate}
                                    onChange={handleEditChange}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                <strong>User:</strong> {request.userId}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Reason:</strong> {request.reason}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Period:</strong> {format(new Date(request.startDate), 'PP')} → {format(new Date(request.endDate), 'PP')}
                              </Typography>
                            </>
                          )}
                        </>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Chip label={request.status} color={statusColors[request.status]} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {editingId === request.id ? (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => saveEdit(request.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          {request.status === 'Pending' && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckIcon />}
                                onClick={() => updateStatus(request.id, 'Approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={() => updateStatus(request.id, 'Denied')}
                              >
                                Deny
                              </Button>
                            </>
                          )}
                          {request.status === 'Approved' && (
                            <Button
                              variant="contained"
                              color="info"
                              startIcon={<ScheduleIcon />}
                              onClick={() => updateStatus(request.id, 'Completed')}
                            >
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(request)}
                          >
                            Edit
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
}
