import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  TablePagination
} from '@mui/material';

const PendingActions = ({ showNotification, setLoading }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPendingActions();
  }, []);

  const fetchPendingActions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/MaintenanceRequest/my-pending-actions');
      if (!response.ok) throw new Error('Failed to fetch pending actions');
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessAction = async (requestId, currentStage) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/MaintenanceRequest/${requestId}/process-stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: `Processed ${currentStage} stage` }),
      });
      if (!response.ok) throw new Error('Failed to process action');
      showNotification('Action processed successfully');
      fetchPendingActions();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>My Pending Actions</Typography>

      {pendingRequests.length === 0 ? (
        <Typography sx={{ p: 2 }}>You have no pending actions at this time.</Typography>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Current Stage</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>
                        {request.vehicleMake} {request.vehicleModel} ({request.licensePlate})
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {request.description}
                      </TableCell>
                      <TableCell>{request.currentStage}</TableCell>
                      <TableCell>
                        <Chip label={request.priority} color={getPriorityColor(request.priority)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleProcessAction(request.id, request.currentStage)}
                        >
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pendingRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default PendingActions;