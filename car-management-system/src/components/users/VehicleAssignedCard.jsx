// components/VehicleAssignment.js
import React, { useState, useEffect } from 'react';
import { getCurrentUserId, getAuthData } from '../../services/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Spinner, Alert, Button,ListGroup } from 'react-bootstrap';
import { CarFront, Plus } from 'react-bootstrap-icons';

const API_URL = 'https://localhost:7092/api';

const VehicleAssignedCard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedVehicles = async () => {
      try {
        const authData = getAuthData();
        if (!authData || !authData.token) {
          navigate('/login');
          return;
        }

        const userId = authData.userId;
        if (!userId) {
          throw new Error('User ID not available');
        }

        const response = await axios.get(`${API_URL}/VehicleAssignment/ByUser/${userId}`, {
          headers: {
            Authorization: `Bearer ${authData.token}`
          }
        });

        setVehicles(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchAssignedVehicles();
  }, [navigate]);

  const getStatusBadge = (status) => {
    const variants = {
      Assigned: 'primary',
      Maintenance: 'warning',
      Available: 'success',
      Unavailable: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'} className="rounded-pill">{status}</Badge>;
  };

  if (loading) return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 mb-0">Loading your vehicles...</p>
      </Card.Body>
    </Card>
  );

  if (error) return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="text-center py-4">
        <Alert variant="danger">⚠️ {error}</Alert>
      </Card.Body>
    </Card>
  );

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <CarFront className="me-2" /> Your Assigned Vehicles
          </h5>
          <Badge bg="primary" className="rounded-pill">{vehicles.length}</Badge>
        </div>
        
        {vehicles.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-muted">No vehicles currently assigned to you.</p>
            <Button 
              variant="outline-primary"
              onClick={() => navigate('/request-vehicle')}
              size="sm"
            >
              <Plus size={14} className="me-1" /> Request a Vehicle
            </Button>
          </div>
        ) : (
          <ListGroup variant="flush">
            {vehicles.slice(0, 3).map((vehicle) => (
              <ListGroup.Item key={vehicle.id} className="py-3">
                <div className="d-flex justify-content-between align-items-center"  onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                  <div>
                    <h6 className="mb-1">{vehicle.make} {vehicle.model}</h6>
                    <small className="text-muted">{vehicle.licensePlate}</small>
                  </div>
                <Button  onClick={() => navigate(`/vehicles/${vehicle.id}`)} >Return</Button>
                </div>
              </ListGroup.Item>
            ))}
            {vehicles.length > 3 && (
              <ListGroup.Item className="text-center py-2">
                <Button variant="link" size="sm">
                  + {vehicles.length - 3} more vehicles
                </Button>
              </ListGroup.Item>
            )}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default VehicleAssignedCard;