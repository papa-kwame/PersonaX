import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Spinner,
  Badge,
  Tab,
  Tabs,
  ListGroup,
  Alert,
  Pagination,
  InputGroup,
  FormControl
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  Truck, PlusCircle, ClockHistory,
  Gear, FuelPump, Calendar,
  CarFront, Palette, Person, CardChecklist,
  Envelope, ClipboardCheck, ListCheck,
  CheckCircle, XCircle, InfoCircle,
  Search
} from 'react-bootstrap-icons';
import VehicleList from '../components/vehicles/VehicleList';
import { format } from 'date-fns';

const Assignment = () => {
  const { vehicleId, userId, view } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({
    loading: true,
    activeTab: view === 'history' ? 'history' : 'current',
    currentAssignments: [],
    allAssignments: [],
    users: [],
    vehicles: [],
    assignmentHistory: [],
    vehicleDetails: null,
    pendingRequests: [],
    stats: {
      totalVehicles: 0,
      assignedVehicles: 0,
      availableVehicles: 0,
      totalUsers: 0,
      pendingRequests: 0
    },
    formData: {
      userId: '',
      requestReason: ''
    },
    showHistoryModal: false,
    showVehicleModal: false,
    showRequestModal: false,
    showRequestsModal: false,
    selectedVehicleForHistory: null,
    currentAssignmentsPage: 1,
    availableVehiclesPage: 1,
    requestsPage: 1,
    itemsPerPage: 5,
    userSearch: '',
    vehicleSearch: '',
    requestSearch: ''
  });

  const api = axios.create({
    baseURL: 'https://localhost:7092/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const [assignmentsRes, vehiclesRes, usersRes, requestsRes] = await Promise.all([
        api.get('/VehicleAssignment/AllAssignments'),
        api.get('/vehicles'),
        api.get('/Auth/users'),
        api.get('/VehicleAssignment/AllRequests?status=Pending')
      ]);

      const users = usersRes.data.map(user => ({
        id: user.id,
        userName: user.email.split('@')[0],
        email: user.email,
        roles: user.roles
      }));

      const current = assignmentsRes.data;
      const assignedVehicleIds = current.map(a => a.vehicleId);
      const availableVehicles = vehiclesRes.data.filter(v => !assignedVehicleIds.includes(v.id));

      setState(prev => ({
        ...prev,
        currentAssignments: current,
        allAssignments: assignmentsRes.data,
        users: users,
        vehicles: vehiclesRes.data,
        pendingRequests: requestsRes.data,
        stats: {
          totalVehicles: vehiclesRes.data.length,
          assignedVehicles: current.length,
          availableVehicles: availableVehicles.length,
          totalUsers: users.length,
          pendingRequests: requestsRes.data.length
        },
        loading: false
      }));

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.response?.data?.title || 'Failed to fetch data');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchAssignmentHistory = async (vehicleId) => {
    try {
      const response = await api.get(`/VehicleAssignment/AssignmentHistory/${vehicleId}`);
      setState(prev => ({
        ...prev,
        assignmentHistory: response.data,
        showHistoryModal: true,
        selectedVehicleForHistory: state.vehicles.find(v => v.id === vehicleId)?.model
      }));
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      toast.error('Failed to fetch assignment history');
    }
  };

  const fetchVehicleDetails = async (id) => {
    try {
      const response = await api.get(`/Vehicles/${id}`);
      setState(prev => ({
        ...prev,
        vehicleDetails: response.data,
        showVehicleModal: true
      }));
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Failed to fetch vehicle details');
    }
  };

  const handleUnassignVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to unassign this vehicle?')) {
      try {
        await api.post('/VehicleAssignment/Unassign', `"${vehicleId}"`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        toast.success('Vehicle unassigned successfully');
        fetchData();
      } catch (error) {
        console.error('Error unassigning vehicle:', error);
        toast.error(error.response?.data?.title || 'Failed to unassign vehicle');
      }
    }
  };

  const handleRequestVehicle = async () => {
    try {
      const { userId, requestReason } = state.formData;
      if (!userId || !requestReason) {
        toast.warning('Please select user and provide a reason');
        return;
      }

      await api.post('/VehicleAssignment/RequestVehicle', {
        userId,
        requestReason
      });

      toast.success('Vehicle request submitted successfully');
      setState(prev => ({
        ...prev,
        showRequestModal: false,
        formData: { ...prev.formData, requestReason: '' }
      }));
      fetchData();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.title || 'Failed to submit request');
    }
  };

  const formatDuration = (start, end) => {
    if (!start) return 'N/A';
    if (!end) return 'Current assignment';
    const diff = new Date(end) - new Date(start);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const safeFormat = (dateString, formatStr) => {
    if (!dateString) return 'N/A'; // Return a placeholder if the date is null or undefined

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Return a placeholder if the date is invalid

    return format(date, formatStr);
  };

  const handleAssignmentsPageChange = (page) => {
    setState(prev => ({ ...prev, currentAssignmentsPage: page }));
  };

  const handleAvailableVehiclesPageChange = (page) => {
    setState(prev => ({ ...prev, availableVehiclesPage: page }));
  };

  const handleRequestsPageChange = (page) => {
    setState(prev => ({ ...prev, requestsPage: page }));
  };

  const handleUserSearchChange = (e) => {
    setState(prev => ({ ...prev, userSearch: e.target.value }));
  };

  const handleVehicleSearchChange = (e) => {
    setState(prev => ({ ...prev, vehicleSearch: e.target.value }));
  };

  const handleRequestSearchChange = (e) => {
    setState(prev => ({ ...prev, requestSearch: e.target.value }));
  };

  const filteredUsers = state.users.filter(user =>
    user.userName.toLowerCase().includes(state.userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(state.userSearch.toLowerCase())
  ).slice(0, 6);

  const filteredVehicles = state.vehicles
    .filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id))
    .filter(vehicle =>
      vehicle.make.toLowerCase().includes(state.vehicleSearch.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(state.vehicleSearch.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(state.vehicleSearch.toLowerCase())
    ).slice(0, 6);

  const filteredRequests = state.pendingRequests.filter(request =>
    (request.userName && request.userName.toLowerCase().includes(state.requestSearch.toLowerCase())) ||
    (request.email && request.email.toLowerCase().includes(state.requestSearch.toLowerCase())) ||
    (request.requestReason && request.requestReason.toLowerCase().includes(state.requestSearch.toLowerCase()))
  );

  const paginatedCurrentAssignments = state.currentAssignments.slice(
    (state.currentAssignmentsPage - 1) * state.itemsPerPage,
    state.currentAssignmentsPage * state.itemsPerPage
  );

  const paginatedAvailableVehicles = state.vehicles
    .filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id))
    .slice(
      (state.availableVehiclesPage - 1) * state.itemsPerPage,
      state.availableVehiclesPage * state.itemsPerPage
    );

  const paginatedRequests = filteredRequests.slice(
    (state.requestsPage - 1) * state.itemsPerPage,
    state.requestsPage * state.itemsPerPage
  );

  const totalAssignmentPages = Math.ceil(state.currentAssignments.length / state.itemsPerPage);
  const totalAvailableVehiclePages = Math.ceil(
    state.vehicles.filter(v => !state.currentAssignments.some(a => a.vehicleId === v.id)).length / state.itemsPerPage
  );
  const totalRequestPages = Math.ceil(filteredRequests.length / state.itemsPerPage);

  const renderHeader = () => (
    <div className="d-flex align-items-center mb-4">
      <div className="me-3">
        <Truck size={28} />
      </div>
      <div>
        <h2 className="mb-0">Vehicle Assignments</h2>
        <p className="mb-0">Manage vehicle assignments and requests</p>
      </div>
      <div className="ms-auto d-flex">
        <Button
          variant="outline-secondary"
          className="me-2"
          onClick={() => setState(prev => ({ ...prev, showRequestsModal: true }))}
        >
          Requests {state.stats.pendingRequests > 0 && (
            <Badge bg="secondary" className="ms-2">
              {state.stats.pendingRequests}
            </Badge>
          )}
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => setState(prev => ({ ...prev, showRequestModal: true }))}
        >
          Request
        </Button>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <Row className="mb-4 g-4">
      <Col md={3}>
        <Card className="h-100 border-0">
          <Card.Body className="text-center">
            <Card.Title>Total Vehicles</Card.Title>
            <h3 className="fw-bold">{state.stats.totalVehicles}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 border-0">
          <Card.Body className="text-center">
            <Card.Title>Assigned</Card.Title>
            <h3 className="fw-bold">{state.stats.assignedVehicles}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 border-0">
          <Card.Body className="text-center">
            <Card.Title>Available</Card.Title>
            <h3 className="fw-bold">{state.stats.availableVehicles}</h3>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 border-0">
          <Card.Body className="text-center">
            <Card.Title>Pending Requests</Card.Title>
            <h3 className="fw-bold">{state.stats.pendingRequests}</h3>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderCurrentAssignments = () => (
    <div className="table-responsive border">
      <Table hover className="align-middle mb-0">
        <thead className="bg-light">
          <tr>
            <th>Vehicle</th>
            <th>User</th>
            <th>Details</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCurrentAssignments.length > 0 ? (
            paginatedCurrentAssignments.map(assignment => (
              <tr key={assignment.assignmentId}>
                <td>
                  <strong>{assignment.vehicleMake} {assignment.vehicleModel}</strong><br />
                  <small className="text-muted">Plate: {assignment.licensePlate}</small>
                </td>
                <td>
                  <div>{assignment.userName}</div>
                  <small className="text-muted">{assignment.userEmail}</small>
                </td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => fetchVehicleDetails(assignment.vehicleId)}
                  >
                    View Details
                  </Button>
                </td>
                <td className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleUnassignVehicle(assignment.vehicleId)}
                  >
                    Unassign
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => fetchAssignmentHistory(assignment.vehicleId)}
                  >
                    History
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4 text-muted">
                No current vehicle assignments
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalAssignmentPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev
              onClick={() => handleAssignmentsPageChange(Math.max(1, state.currentAssignmentsPage - 1))}
              disabled={state.currentAssignmentsPage === 1}
            />
            {Array.from({ length: totalAssignmentPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item
                key={page}
                active={page === state.currentAssignmentsPage}
                onClick={() => handleAssignmentsPageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handleAssignmentsPageChange(Math.min(totalAssignmentPages, state.currentAssignmentsPage + 1))}
              disabled={state.currentAssignmentsPage === totalAssignmentPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );

  const renderAvailableVehicles = () => (
    <div className="table-responsive border">
      <Table hover className="align-middle mb-0">
        <thead className="bg-light">
          <tr>
            <th>Make/Model</th>
            <th>Year</th>
            <th>Plate</th>
            <th>Type</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedAvailableVehicles.length > 0 ? (
            paginatedAvailableVehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.make} {vehicle.model}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.licensePlate}</td>
                <td>{vehicle.vehicleType}</td>
                <td>
                  <Badge bg={vehicle.status === 'Available' ? 'secondary' : 'secondary'}>
                    {vehicle.status}
                  </Badge>
                </td>
                <td className="text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => fetchAssignmentHistory(vehicle.id)}
                  >
                    History
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-muted">
                No available vehicles
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {totalAvailableVehiclePages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev
              onClick={() => handleAvailableVehiclesPageChange(Math.max(1, state.availableVehiclesPage - 1))}
              disabled={state.availableVehiclesPage === 1}
            />
            {Array.from({ length: totalAvailableVehiclePages }, (_, i) => i + 1).map(page => (
              <Pagination.Item
                key={page}
                active={page === state.availableVehiclesPage}
                onClick={() => handleAvailableVehiclesPageChange(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handleAvailableVehiclesPageChange(Math.min(totalAvailableVehiclePages, state.availableVehiclesPage + 1))}
              disabled={state.availableVehiclesPage === totalAvailableVehiclePages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );

  const renderRequestModal = () => (
    <Modal show={state.showRequestModal} onHide={() => setState(prev => ({ ...prev, showRequestModal: false }))} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          Request Vehicle
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>User</Form.Label>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="Search users..."
                value={state.userSearch}
                onChange={handleUserSearchChange}
              />
            </InputGroup>
            <div className="border rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredUsers.length > 0 ? (
                <ListGroup variant="flush">
                  {filteredUsers.map(user => (
                    <ListGroup.Item
                      key={user.id}
                      action
                      active={state.formData.userId === user.id}
                      onClick={() => setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, userId: user.id }
                      }))}
                    >
                      {user.userName} ({user.email})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="p-3 text-muted text-center">No users found</div>
              )}
            </div>
            {state.userSearch && filteredUsers.length === 0 && (
              <Alert variant="secondary" className="mt-2">
                No users match your search. Try different keywords.
              </Alert>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason for Request</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={state.formData.requestReason}
              onChange={(e) => setState(prev => ({
                ...prev,
                formData: { ...prev.formData, requestReason: e.target.value }
              }))}
              placeholder="Explain why you need a vehicle..."
              required
            />
          </Form.Group>

          {state.formData.userId && (
            <Alert variant="secondary" className="mt-2">
              Requesting for: {state.users.find(u => u.id === state.formData.userId)?.userName}
            </Alert>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={() => setState(prev => ({ ...prev, showRequestModal: false }))}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={handleRequestVehicle}
          disabled={!state.formData.userId || !state.formData.requestReason}
        >
          Submit Request
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderRequestsModal = () => (
    <Modal
      show={state.showRequestsModal}
      onHide={() => setState(prev => ({ ...prev, showRequestsModal: false }))}
      size="lg"
      centered
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          Pending Vehicle Requests
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Search requests..."
            value={state.requestSearch}
            onChange={handleRequestSearchChange}
          />
        </InputGroup>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>User</th>
                <th>Request Date</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((request, index) => (
                  <tr key={index}>
                    <td>
                      <div>{request.userName || 'Unknown User'}</div>
                      <small className="text-muted">{request.email || 'N/A'}</small>
                    </td>
                    <td>{safeFormat(request.requestDate, 'PPpp')}</td>
                    <td>{request.requestReason || 'No reason provided'}</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No pending vehicle requests
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {totalRequestPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev
                onClick={() => handleRequestsPageChange(Math.max(1, state.requestsPage - 1))}
                disabled={state.requestsPage === 1}
              />
              {Array.from({ length: totalRequestPages }, (_, i) => i + 1).map(page => (
                <Pagination.Item
                  key={page}
                  active={page === state.requestsPage}
                  onClick={() => handleRequestsPageChange(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handleRequestsPageChange(Math.min(totalRequestPages, state.requestsPage + 1))}
                disabled={state.requestsPage === totalRequestPages}
              />
            </Pagination>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={() => setState(prev => ({ ...prev, showRequestsModal: false }))}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const renderVehicleModal = () => {
    if (!state.vehicleDetails) return null;

    const vehicle = state.vehicleDetails;
    const currentAssignment = state.currentAssignments.find(a => a.vehicleId === vehicle.id);

    return (
      <Modal
        show={state.showVehicleModal}
        onHide={() => setState(prev => ({ ...prev, showVehicleModal: false }))}
        size="xl"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Card className="mb-3 border-0">
                <Card.Header className="bg-white">Basic Information</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Make/Model</div>
                      <div>{vehicle.make} {vehicle.model}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Year</div>
                      <div>{vehicle.year}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Color</div>
                      <div>{vehicle.color || 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">VIN</div>
                      <div>{vehicle.vin || 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Type</div>
                      <div>{vehicle.vehicleType || 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Status</div>
                      <div>
                        <Badge bg={vehicle.status === 'Available' ? 'secondary' : 'secondary'}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              <Card className="mb-3 border-0">
                <Card.Header className="bg-white">Technical Details</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Mileage</div>
                      <div>{vehicle.currentMileage?.toLocaleString() || 'N/A'} miles</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Fuel Type</div>
                      <div>{vehicle.fuelType || 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Transmission</div>
                      <div>{vehicle.transmission || 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Engine Size</div>
                      <div>{vehicle.engineSize ? `${vehicle.engineSize}L` : 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Seating Capacity</div>
                      <div>{vehicle.seatingCapacity || 'N/A'}</div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              {currentAssignment && (
                <Card className="mb-3 border-0">
                  <Card.Header className="bg-white">Current Assignment</Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex border-0">
                        <div className="text-muted me-3 w-50">Assigned To</div>
                        <div>{currentAssignment.userName}</div>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex border-0">
                        <div className="text-muted me-3 w-50">Email</div>
                        <div>{currentAssignment.userEmail}</div>
                      </ListGroup.Item>
                      <ListGroup.Item className="text-center border-0">
                        <Button
                          variant="outline-secondary"
                          onClick={() => handleUnassignVehicle(vehicle.id)}
                        >
                          Unassign Vehicle
                        </Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              )}

              <Card className="mb-3 border-0">
                <Card.Header className="bg-white">Maintenance & Compliance</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Last Service</div>
                      <div>{safeFormat(vehicle.lastServiceDate, 'PPpp')}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Service Interval</div>
                      <div>{vehicle.serviceInterval ? `${vehicle.serviceInterval} miles` : 'N/A'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Next Service Due</div>
                      <div>{safeFormat(vehicle.nextServiceDue, 'PPpp')}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Registration Expiry</div>
                      <div>{safeFormat(vehicle.registrationExpiry, 'PPpp')}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Insurance Expiry</div>
                      <div>{safeFormat(vehicle.insuranceExpiry, 'PPpp')}</div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              <Card className="border-0">
                <Card.Header className="bg-white">Purchase Information</Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Purchase Date</div>
                      <div>{safeFormat(vehicle.purchaseDate, 'PPpp')}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex border-0">
                      <div className="text-muted me-3 w-50">Purchase Price</div>
                      <div>{vehicle.purchasePrice ? `$${vehicle.purchasePrice.toLocaleString()}` : 'N/A'}</div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {vehicle.notes && (
            <Card className="mt-3 border-0">
              <Card.Header className="bg-white">Notes</Card.Header>
              <Card.Body>
                <p className="mb-0">{vehicle.notes}</p>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setState(prev => ({ ...prev, showVehicleModal: false }))}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const renderHistoryModal = () => (
    <Modal
      show={state.showHistoryModal}
      onHide={() => setState(prev => ({ ...prev, showHistoryModal: false }))}
      size="lg"
      centered
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
          Assignment History for {state.selectedVehicleForHistory || 'Vehicle'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>User</th>
                <th>Assigned Date</th>
                <th>Unassigned Date</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {state.assignmentHistory.length > 0 ? (
                state.assignmentHistory.map((record, index) => (
                  <tr key={index}>
                    <td>
                      <div>{record.userName || 'Unknown User'}</div>
                      <small className="text-muted">{record.userEmail || 'N/A'}</small>
                    </td>
                    <td>{record.assignmentDate ? safeFormat(record.assignmentDate, 'PPpp') : 'N/A'}</td>
                    <td>
                      {record.unassignmentDate
                        ? safeFormat(record.unassignmentDate, 'PPpp')
                        : <Badge bg="secondary">Active</Badge>}
                    </td>
                    <td>
                      {formatDuration(record.assignmentDate, record.unassignmentDate)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    No assignment history found for this vehicle
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button
          variant="outline-secondary"
          onClick={() => setState(prev => ({ ...prev, showHistoryModal: false }))}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  useEffect(() => {
    fetchData();
  }, [vehicleId, view]);

  if (state.loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="secondary" />
        <p className="mt-3">Loading vehicle assignments...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {renderHeader()}
      {renderStatsCards()}

      <Tabs
        activeKey={state.activeTab}
        onSelect={(k) => setState(prev => ({ ...prev, activeTab: k }))}
        className="mb-3"
      >
        <Tab eventKey="current" title="Current Assignments">
          {renderCurrentAssignments()}
        </Tab>
        <Tab eventKey="available" title="Available Vehicles">
          {renderAvailableVehicles()}
        </Tab>
        <Tab eventKey="vehicleList" title="Vehicle List">
          <VehicleList />
        </Tab>
      </Tabs>

      {renderRequestModal()}
      {renderRequestsModal()}
      {renderHistoryModal()}
      {renderVehicleModal()}
    </Container>
  );
};

export default Assignment;
