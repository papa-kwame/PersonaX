import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, ListGroup, Spinner, Card, Badge } from "react-bootstrap";
import api from "../../services/api";
import "./VehicleAssignment.css"; // You'll create this CSS file

export default function DirectVehicleAssignment() {
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [searchVehicleQuery, setSearchVehicleQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const fetchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/api/Auth/users", {
        params: { query },
      });
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchVehicles = async (query) => {
    if (!query.trim()) {
      setVehicles([]);
      return;
    }
    setLoadingVehicles(true);
    try {
      const { data } = await api.get("/api/Vehicles", {
        params: { query },
      });
      setVehicles(data);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchRecentAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const { data } = await api.get("/api/VehicleAssignment/RecentAssignments");
      setRecentAssignments(data);
    } catch (err) {
      console.error("Failed to fetch recent assignments:", err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleShow = () => setShow(true);

  const handleClose = () => {
    setShow(false);
    setSelectedUser(null);
    setSelectedVehicle(null);
    setSearchUserQuery("");
    setSearchVehicleQuery("");
    setUsers([]);
    setVehicles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedVehicle) {
      alert("Please select both a user and a vehicle.");
      return;
    }

    try {
      await api.post("/api/VehicleAssignment/assign", {
        userId: selectedUser.id,
        vehicleId: selectedVehicle.id,
      });
      alert("Vehicle assigned successfully");
      handleClose();
      fetchRecentAssignments();
    } catch (err) {
      alert("Error assigning vehicle: " + err.message);
    }
  };

  useEffect(() => {
    fetchRecentAssignments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchUserQuery) {
        fetchUsers(searchUserQuery);
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchUserQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchVehicleQuery) {
        fetchVehicles(searchVehicleQuery);
      } else {
        setVehicles([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchVehicleQuery]);

  return (
    <div className="vehicle-assignment-container">
      <div className="assignment-header">
        <h2>Recent Vehicle Assignments</h2>
        <Button variant="primary" onClick={handleShow} className="assign-button">
          <i className="bi bi-plus-circle me-2"></i>
          Assign Vehicle
        </Button>
      </div>

      {loadingAssignments ? (
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <span className="ms-2">Loading assignments...</span>
        </div>
      ) : (
        <div className="cards-view">
          {recentAssignments.length > 0 ? (
            <div className="horizontal-cards-container">
              {recentAssignments.map((assignment) => (
                <Card key={`${assignment.vehicleId}-${assignment.userId}`} className="assignment-card">
                  <div className="license-badge">
                    <Badge bg="dark">{assignment.licensePlate}</Badge>
                    <div className="license-badgediv">
                        <h5 className="license-badgeh5">{assignment.vehicleMake}-{assignment.vehicleModel}</h5>
                       
                    </div>
                  </div>
                  <Card.Body>
                    <div className="vehicle-header">
                    <div className="vehicle-icons">
                      <div className="vehicle-icon">
                        <i className="bi bi-car-front-fill"></i>
                      </div>
                        <span className="detail-value">{assignment.userName}</span>
                      </div>
                      <div className="vehicle-info">

                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <small>
                      Updated: {new Date(assignment.assignmentDate).toLocaleTimeString()}
                    </small>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="bi bi-inbox-fill"></i>
              <p>No assignments found</p>
            </div>
          )}
        </div>
      )}

      <Modal show={show} onHide={handleClose} centered className="assignment-modal">
        <Modal.Header closeButton>
          <Modal.Title>Assign Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Search User</Form.Label>
              <Form.Control
                type="text"
                placeholder="Start typing username..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="search-input"
              />
              {loadingUsers && (
                <div className="search-loading">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
              {searchUserQuery && !loadingUsers && users.length > 0 && (
                <ListGroup className="search-results">
                  {users.map((user) => (
                    <ListGroup.Item
                      key={user.id}
                      action
                      active={selectedUser?.id === user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchUserQuery(user.userName);
                        setUsers([]);
                      }}
                    >
                      {user.userName}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Search Vehicle</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by model or license..."
                value={searchVehicleQuery}
                onChange={(e) => setSearchVehicleQuery(e.target.value)}
                className="search-input"
              />
              {loadingVehicles && (
                <div className="search-loading">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
              {searchVehicleQuery && !loadingVehicles && vehicles.length > 0 && (
                <ListGroup className="search-results">
                  {vehicles.map((vehicle) => (
                    <ListGroup.Item
                      key={vehicle.id}
                      action
                      active={selectedVehicle?.id === vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setSearchVehicleQuery(`${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}`);
                        setVehicles([]);
                      }}
                    >
                      {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Form.Group>

            <div className="modal-footer-buttons">
              <Button variant="outline-secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm Assignment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}