import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Badge, Button, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AssignmentHistory = ({ vehicleId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [error, setError] = useState(null);

  // Configure axios instance
  const api = axios.create({
    baseURL: 'https://localhost:7092', // Your API base URL
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [historyRes, vehicleRes] = await Promise.all([
          api.get(`/VehicleAssignment/AssignmentHistory/${vehicleId}`),
          api.get(`/vehicles/${vehicleId}`)
        ]);
        
        setHistory(historyRes.data);
        setVehicleInfo(vehicleRes.data);
      } catch (error) {
        setError(error.response?.data?.title || 'Failed to fetch assignment history');
        toast.error(error.response?.data?.title || 'Failed to fetch assignment history');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchData();
    }
  }, [vehicleId]);

  const formatDuration = (start, end) => {
    if (!start) return 'N/A';
    if (!end) return 'Current assignment';
    
    const diff = new Date(end) - new Date(start);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  if (!vehicleId) {
    return (
      <Card className="mt-4">
        <Card.Body>
          <Alert variant="danger">No vehicle ID provided</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <Card.Header>
        <h4>
          Assignment History for: {vehicleInfo?.make || 'Vehicle'} {vehicleInfo?.model || ''} 
          {vehicleInfo?.licensePlate ? ` (${vehicleInfo.licensePlate})` : ''}
        </h4>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Loading assignment history...</p>
          </div>
        ) : history.length === 0 ? (
          <Alert variant="info">No assignment history found for this vehicle</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>User</th>
                <th>Assigned On</th>
                <th>Unassigned On</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index}>
                  <td>
                    <div>{record.userName || 'Unknown User'}</div>
                    {record.userEmail && (
                      <small className="text-muted">{record.userEmail}</small>
                    )}
                  </td>
                  <td>
                    {record.assignmentDate ? new Date(record.assignmentDate).toLocaleString() : 'N/A'}
                  </td>
                  <td>
                    {record.unassignmentDate 
                      ? new Date(record.unassignmentDate).toLocaleString()
                      : <Badge bg="success">Active</Badge>}
                  </td>
                  <td>
                    {formatDuration(record.assignmentDate, record.unassignmentDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default AssignmentHistory;