import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Spinner, Button, Badge, ListGroup } from 'react-bootstrap';
import AssignmentHistory from './AssignmentHistory';

const AssignmentDetail = () => {
  const { vehicleId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assignmentRes, vehicleRes, userRes] = await Promise.all([
          axios.get(`/api/VehicleAssignment/ByVehicle/${vehicleId}`),
          axios.get(`/api/vehicles/${vehicleId}`),
          assignmentRes.data?.userId ? axios.get(`/api/users/${assignmentRes.data.userId}`) : Promise.resolve(null)
        ]);
        
        setAssignment(assignmentRes.data);
        setVehicle(vehicleRes.data);
        if (userRes) setUser(userRes.data);
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Card>
        <Card.Header>
          <h4>Assignment Details</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Vehicle Information</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Make/Model:</strong> {vehicle?.make} {vehicle?.model}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Year:</strong> {vehicle?.year}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>License Plate:</strong> {vehicle?.licensePlate}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>VIN:</strong> {vehicle?.vin || 'N/A'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Status:</strong> 
                      <Badge bg={vehicle?.status === 'Available' ? 'success' : 'warning'} className="ms-2">
                        {vehicle?.status}
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              {assignment?.message ? (
                <Card className="mb-4">
                  <Card.Header>Assignment Status</Card.Header>
                  <Card.Body>
                    <div className="text-center text-muted">
                      <h5>{assignment.message}</h5>
                      <Button variant="primary" className="mt-3">
                        Assign Vehicle
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="mb-4">
                  <Card.Header>Assigned User</Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Name:</strong> {user?.userName}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Email:</strong> {user?.email}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Assigned Since:</strong> {new Date(assignment?.assignmentDate).toLocaleDateString()}
                      </ListGroup.Item>
                      <ListGroup.Item className="text-center">
                        <Button variant="danger">
                          Unassign Vehicle
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {vehicleId && <AssignmentHistory vehicleId={vehicleId} />}
    </div>
  );
};

export default AssignmentDetail;