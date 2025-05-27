import React, { useState, useEffect } from 'react';
import {
  Button, Badge, Alert, Card, Container,
  Row, Col, Modal, Table, InputGroup,
  Dropdown, Form, Spinner, ListGroup, Tab, Tabs,
  FloatingLabel, CloseButton
} from 'react-bootstrap';
import {
  PersonCheck, Search, PencilSquare,
  Building, ShieldCheck, X, PersonPlus,
  ChatSquareText, CheckCircle, ArrowRepeat, Plus
} from 'react-bootstrap-icons';
import axios from 'axios';

const RouteManagementPage = () => {
  // State management
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('routes');
  const [currentRoute, setCurrentRoute] = useState({
    id: '',
    name: '',
    department: '',
    description: '',
    users: []
  });
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState('Comment');
  const [isEditing, setIsEditing] = useState(false);

  // Data from API
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const requiredRolesInOrder = ['Comment', 'Review', 'Commit', 'Approve'];

  // API configuration
  const API_BASE = 'https://localhost:7092/api';
  const API_ENDPOINTS = {
    USERS: `${API_BASE}/Auth/users`,
    ROUTES: `${API_BASE}/Routes`,
    DEPARTMENTS: `${API_BASE}/Routes/departments`,
    ROLES: `${API_BASE}/Routes/roles`
  };

  // Safe API fetch function
  const fetchData = async (endpoint, defaultValue = []) => {
    try {
      const response = await axios.get(endpoint);
      return Array.isArray(response?.data) ? response.data : defaultValue;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      return defaultValue;
    }
  };

  // Load all initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');

      try {
        const [usersData, routesData, deptsData] = await Promise.all([
          fetchData(API_ENDPOINTS.USERS),
          fetchData(API_ENDPOINTS.ROUTES),
          fetchData(API_ENDPOINTS.DEPARTMENTS)
        ]);

        setUsers(usersData);
        setRoutes(routesData);
        setDepartmentOptions(deptsData);
      } catch (err) {
        setError('Failed to load application data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Safe user filtering
  const filteredUsers = React.useMemo(() => {
    try {
      if (!Array.isArray(users)) return [];
      if (!userSearch.trim()) return [...users];

      const searchTerm = userSearch.toLowerCase();
      return users.filter(user => {
        const email = user?.email?.toLowerCase() || '';
        const name = user?.name?.toLowerCase() || '';
        return email.includes(searchTerm) || name.includes(searchTerm);
      });
    } catch (err) {
      console.error('Error filtering users:', err);
      return [];
    }
  }, [users, userSearch]);

  // Route operations handler
  const handleRouteOperation = async (operation, routeData, routeId = null) => {
    setLoading(true);
    setError('');

    try {
      let response;
      const endpoint = routeId ? `${API_ENDPOINTS.ROUTES}/${routeId}` : API_ENDPOINTS.ROUTES;

      switch (operation) {
        case 'create':
          response = await axios.post(endpoint, routeData);
          break;
        case 'update':
          response = await axios.put(endpoint, routeData);
          break;
        case 'delete':
          response = await axios.delete(endpoint);
          break;
        default:
          throw new Error('Invalid operation');
      }

      const updatedRoutes = await fetchData(API_ENDPOINTS.ROUTES);
      setRoutes(updatedRoutes);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                     `Failed to ${operation} route. Please try again.`;
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openNewRouteModal = () => {
    setCurrentRoute({
      id: '',
      name: '',
      department: '',
      description: '',
      users: []
    });
    setIsEditing(false);
    setShowRouteModal(true);
  };

  const openEditRouteModal = (route) => {
    if (!route) return;

    setCurrentRoute({
      id: route.id || '',
      name: route.name || '',
      department: route.department || '',
      description: route.description || '',
      users: (route.users || []).map(user => ({
        id: user.userId || '',
        role: user.role || 'Comment',
        email: user.userEmail || '',
        name: user.userName || user.userEmail?.split('@')[0] || 'Unknown'
      }))
    });
    setIsEditing(true);
    setShowRouteModal(true);
  };

  const validateRoute = () => {
    // Check all required roles are assigned
    const assignedRoles = currentRoute.users.map(u => u.role);
    const missingRoles = requiredRolesInOrder.filter(r => !assignedRoles.includes(r));
    
    if (missingRoles.length > 0) {
      setError(`All roles must be assigned. Missing: ${missingRoles.join(', ')}`);
      return false;
    }

    // Check exactly one user per role
    const roleCounts = {};
    currentRoute.users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    const duplicateRoles = Object.entries(roleCounts)
      .filter(([_, count]) => count > 1)
      .map(([role]) => role);

    if (duplicateRoles.length > 0) {
      setError(`Each role must have exactly one user. Duplicates found for: ${duplicateRoles.join(', ')}`);
      return false;
    }

    // Check role order
    const rolePositions = {};
    currentRoute.users.forEach((user, index) => {
      if (!rolePositions[user.role]) {
        rolePositions[user.role] = index;
      }
    });

    for (let i = 0; i < requiredRolesInOrder.length - 1; i++) {
      const currentRole = requiredRolesInOrder[i];
      const nextRole = requiredRolesInOrder[i + 1];
      
      if (rolePositions[currentRole] > rolePositions[nextRole]) {
        setError('Roles must be in order: Comment → Review → Commit → Approve');
        return false;
      }
    }

    return true;
  };

  const saveRoute = async () => {
    if (!currentRoute.name?.trim() || !currentRoute.department) {
      setError('Route name and department are required');
      return;
    }

    if (!validateRoute()) return;

    const usersToSend = currentRoute.users.map(user => ({
      userEmail: user.email,
      userId: user.id,
      role: user.role
    }));

    const routeData = {
      name: currentRoute.name.trim(),
      department: currentRoute.department,
      description: currentRoute.description?.trim() || '',
      users: usersToSend
    };

    try {
      setLoading(true);
      setError('');

      const endpoint = isEditing 
        ? `${API_ENDPOINTS.ROUTES}/${currentRoute.id}`
        : API_ENDPOINTS.ROUTES;

      const method = isEditing ? 'put' : 'post';

      await axios[method](endpoint, routeData);

      const updatedRoutes = await fetchData(API_ENDPOINTS.ROUTES);
      setRoutes(updatedRoutes);

      setSuccess(`Route ${isEditing ? 'updated' : 'created'} successfully`);
      setShowRouteModal(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to save route. Please check the data and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    if (!routeId) return;

    try {
      await handleRouteOperation('delete', null, routeId);
      setSuccess('Route deleted successfully');
    } catch (err) {
      // Error is already handled in handleRouteOperation
    }
  };

  const addUserToRoute = (userId, role = selectedUserRole) => {
    if (!userId) return;

    // Find the user in the users list
    const user = users.find(u => u.id === userId);
    if (!user) {
      setError('User not found');
      return;
    }

    // Check if user is already assigned to any role
    const userAlreadyAssigned = currentRoute.users.find(u => u.id === userId);
    if (userAlreadyAssigned) {
      // Update the existing user's role
      setCurrentRoute(prev => ({
        ...prev,
        users: prev.users.map(u => 
          u.id === userId ? { ...u, role } : u
        )
      }));
    } else {
      // Add new user with selected role
      setCurrentRoute(prev => ({
        ...prev,
        users: [
          ...prev.users,
          {
            id: userId,
            role,
            email: user.email || '',
            name: user.name || user.email?.split('@')[0] || 'User'
          }
        ]
      }));
    }

    setError('');
  };

  const removeUserFromRoute = (userId) => {
    setCurrentRoute(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
  };

  const getAvatarColor = (email) => {
    if (!email) return '#858796';
    const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#f8f9fc', '#5a5c69'];
    const hash = email.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const renderUserCell = (user) => {
    const safeUser = user || {};
    const email = safeUser.email || safeUser.userEmail || '';
    const name = safeUser.name || email.split('@')[0] || 'Unknown';
    const avatarColor = getAvatarColor(email);

    return (
      <div className="d-flex align-items-center">
        <div className="rounded-circle me-2" style={{
          width: '24px', height: '24px',
          backgroundColor: avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: avatarColor === '#f8f9fc' ? '#000' : '#fff'
        }}>
          {email.charAt(0).toUpperCase()}
        </div>
        <div>
          <div>{name}</div>
          <small className="text-muted">{email}</small>
        </div>
      </div>
    );
  };

  const renderRoleDropdown = (user) => {
    return (
      <Form.Select
        size="sm"
        value={user.role}
        onChange={(e) => {
          const newRole = e.target.value;
          addUserToRoute(user.id, newRole);
        }}
        className="shadow-sm"
      >
        {requiredRolesInOrder.map(role => (
          <option 
            key={role} 
            value={role}
            disabled={currentRoute.users.some(u => u.role === role && u.id !== user.id)}
          >
            {role}
          </option>
        ))}
      </Form.Select>
    );
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Comment': return '#36b9cc';
      case 'Review': return '#1cc88a';
      case 'Commit': return '#f6c23e';
      case 'Approve': return '#4e73df';
      default: return '#858796';
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError('');
      if (success) setSuccess('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  return (
    <Container fluid className="py-4 px-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 d-flex align-items-center justify-content-center">
                <ShieldCheck size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Route Management</h2>
                <p className="text-muted mb-0">Create and manage approval routes</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={openNewRouteModal}
              className="d-flex align-items-center shadow-sm"
              disabled={loading}
              style={{ 
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                fontWeight: 500
              }}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" className="me-2" />
              ) : (
                <Plus size={18} className="me-2" />
              )}
              Add Route
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4 shadow-sm">
          <div className="d-flex align-items-center">
            <X size={20} className="me-2" />
            <strong>Error:</strong> {error}
          </div>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible className="mb-4 shadow-sm">
          <div className="d-flex align-items-center">
            <CheckCircle size={20} className="me-2" />
            <strong>Success:</strong> {success}
          </div>
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="px-3 pt-2 border-bottom-0"
            fill
          >
            <Tab eventKey="routes" title={
              <span className="d-flex align-items-center">
                <ShieldCheck size={16} className="me-2" />
                Routes
              </span>
            }>
              <div className="p-3">
                {loading && !routes.length ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading routes...</p>
                  </div>
                ) : routes.length > 0 ? (
                  <div className="row g-4">
                    {routes.map(route => (
                      <div key={route.id || Math.random()} className="col-md-6 col-lg-4">
                        <Card className="h-100 shadow-sm" style={{ borderLeft: '4px solid #4e73df' }}>
                          <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="mb-1" style={{ color: '#2c3e50' }}>{route.name || 'Unnamed Route'}</h5>
                                <Badge bg="light" text="dark" className="mb-2">
                                  <Building size={12} className="me-1" />
                                  {route.department || 'No Department'}
                                </Badge>
                                <p className="text-muted mb-2 small">
                                  {route.description || 'No description provided'}
                                </p>
                              </div>
                              <div>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => openEditRouteModal(route)}
                                  className="me-2"
                                  disabled={loading}
                                >
                                  <PencilSquare size={16} />
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => deleteRoute(route.id)}
                                  disabled={loading}
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mb-3 flex-grow-1">
                              <h6 className="small text-uppercase text-muted mb-2 d-flex align-items-center">
                                <ChatSquareText size={14} className="me-2" />
                                Route Flow ({(route.users || []).length})
                              </h6>
                              <div className="table-responsive">
                                <Table hover className="mb-0">
                                  <thead>
                                    <tr>                                
                                      <th className="small text-uppercase text-muted">Role</th>
                                      <th className="small text-uppercase text-muted">User</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(route.users || [])
                                      .sort((a, b) => requiredRolesInOrder.indexOf(a.role) - requiredRolesInOrder.indexOf(b.role))
                                      .map((user, index) => (
                                        <tr key={`${route.id}-${user.userId}`}>
                                            <td>{renderUserCell(user)}</td>

                                          <td>
                                            <Badge 
                                              bg="info" 
                                              className="text-capitalize"
                                              style={{ 
                                                backgroundColor: getRoleColor(user.role),
                                                color: 'white'
                                              }}
                                            >
                                              {user.role || 'Unknown'}
                                            </Badge>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </Table>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                      <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <h4 style={{ color: '#2c3e50' }}>No routes created yet</h4>
                    <p className="text-muted mb-4">Create your first approval route to get started</p>
                    <Button 
                      variant="primary" 
                      onClick={openNewRouteModal}
                      className="d-inline-flex align-items-center shadow-sm"
                      disabled={loading}
                      style={{ 
                        backgroundColor: '#4e73df',
                        borderColor: '#4e73df',
                        fontWeight: 500
                      }}
                    >
                      {loading ? (
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                      ) : (
                        <Plus size={18} className="me-2" />
                      )}
                      Create Route
                    </Button>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <Modal 
        show={showRouteModal} 
        onHide={() => {
          setShowRouteModal(false);
          setShowUserPanel(false);
        }} 
        centered
        backdrop="static"
        size="lg"
        className="fade"
      >
        <Modal.Header className="border-0 pb-0 position-relative" style={{ backgroundColor: '#f8f9fa' }}>
          <Modal.Title className="fw-bold" style={{ color: '#2c3e50' }}>
            {isEditing ? 'Edit Approval Route' : 'Create New Route'}
          </Modal.Title>
          <CloseButton 
            onClick={() => {
              setShowRouteModal(false);
              setShowUserPanel(false);
            }}
            style={{ position: 'absolute', right: '1rem', top: '1rem' }}
          />
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
          <div className="d-flex" style={{ minHeight: '400px' }}>
            <div className="flex-grow-1 pe-3" style={{ width: showUserPanel ? '60%' : '100%' }}>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <FloatingLabel controlId="routeName" label="Route Name" className="mb-3">
                      <Form.Control 
                        type="text" 
                        value={currentRoute.name}
                        onChange={(e) => setCurrentRoute({...currentRoute, name: e.target.value})}
                        placeholder="e.g. Payroll Approval"
                        isInvalid={!currentRoute.name?.trim()}
                        className="shadow-sm"
                      />
                      <Form.Control.Feedback type="invalid">
                        Workflow name is required
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel controlId="routeDepartment" label="Department">
                      <Form.Select
                        value={currentRoute.department}
                        onChange={(e) => setCurrentRoute({...currentRoute, department: e.target.value})}
                        isInvalid={!currentRoute.department}
                        className="shadow-sm"
                      >
                        <option value="">Select department</option>
                        {departmentOptions.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        Department is required
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>

                <FloatingLabel controlId="routeDescription" label="Description" className="mt-3">
                  <Form.Control 
                    as="textarea" 
                    style={{ height: '100px' }}
                    value={currentRoute.description}
                    onChange={(e) => setCurrentRoute({...currentRoute, description: e.target.value})}
                    placeholder="Describe what this workflow is for"
                    className="shadow-sm"
                  />
                </FloatingLabel>

                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 d-flex align-items-center">
                      <ChatSquareText size={16} className="me-2" />
                      Approval Flow ({currentRoute.users.length}/4)
                    </h6>
                    <Button 
                      variant={showUserPanel ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => setShowUserPanel(!showUserPanel)}
                      className="d-flex align-items-center shadow-sm"
                      disabled={currentRoute.users.length >= 4}
                      style={{ 
                        backgroundColor: showUserPanel ? '#4e73df' : 'transparent',
                        borderColor: '#4e73df',
                        color: showUserPanel ? 'white' : '#4e73df'
                      }}
                    >
                      <PersonPlus size={14} className="me-1" />
                      {showUserPanel ? 'Hide Users' : 'Add Users'}
                    </Button>
                  </div>
                  
                  {currentRoute.users.length > 0 ? (
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead>
                          <tr>
                            <th className="small text-uppercase text-muted">Role</th>
                            <th className="small text-uppercase text-muted">User</th>
                            <th className="small text-uppercase text-muted">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRoute.users
                            .sort((a, b) => requiredRolesInOrder.indexOf(a.role) - requiredRolesInOrder.indexOf(b.role))
                            .map((user, index) => (
                              <tr key={user.id}>
 
                                <td>
                                  {renderRoleDropdown(user)}
                                </td>
                                <td>{renderUserCell(user)}</td>
                                <td className="text-center">
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => removeUserFromRoute(user.id)}
                                    className="shadow-sm"
                                  >
                                    <X size={16} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <div className="border rounded p-4 text-center bg-white shadow-sm">
                      <PersonCheck size={24} className="text-muted mb-2" />
                      <p className="text-muted mb-0">No users assigned to this workflow</p>
                    </div>
                  )}

                  {currentRoute.users.length < 4 && (
                    <Alert variant="warning" className="mt-3 shadow-sm">
                      <div className="d-flex align-items-center">
                        <ArrowRepeat size={16} className="me-2" />
                        <div>
                          <strong>Note:</strong> All 4 roles must be assigned in order: 
                          <ol className="mt-2 mb-0">
                            <li>Comment</li>
                            <li>Review</li>
                            <li>Commit</li>
                            <li>Approve</li>
                          </ol>
                        </div>
                      </div>
                    </Alert>
                  )}
                </div>
              </Form>
            </div>

            {showUserPanel && (
              <div className="border-start ps-3" style={{ width: '40%' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 d-flex align-items-center">
                    <PersonPlus size={16} className="me-2" />
                    Select Employee
                  </h6>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowUserPanel(false)}
                    className="p-0 text-muted"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="mb-3">
                  <Form.Label className="small text-muted">Assign as:</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedUserRole}
                    onChange={(e) => setSelectedUserRole(e.target.value)}
                    disabled={currentRoute.users.some(u => u.role === selectedUserRole)}
                    className="shadow-sm"
                  >
                    {requiredRolesInOrder.map(role => (
                      <option 
                        key={role} 
                        value={role}
                        disabled={currentRoute.users.some(u => u.role === role)}
                      >
                        {role}
                      </option>
                    ))}
                  </Form.Select>
                  {currentRoute.users.some(u => u.role === selectedUserRole) && (
                    <Form.Text className="text-danger small">
                      This role is already assigned
                    </Form.Text>
                  )}
                </div>

                <InputGroup className="mb-3 shadow-sm">
                  <InputGroup.Text className="bg-white">
                    <Search size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>

                <div style={{ height: '300px', overflowY: 'auto' }} className="shadow-sm">
                  {filteredUsers.length > 0 ? (
                    <ListGroup variant="flush">
                      {filteredUsers.map(user => (
                        <ListGroup.Item 
                          key={user.id} 
                          action
                          onClick={() => addUserToRoute(user.id)}
                          className="d-flex align-items-center border-0"
                          disabled={currentRoute.users.some(u => u.id === user.id)}
                          style={{ 
                            cursor: currentRoute.users.some(u => u.id === user.id) ? 'not-allowed' : 'pointer',
                            opacity: currentRoute.users.some(u => u.id === user.id) ? 0.6 : 1
                          }}
                        >
                          {renderUserCell(user)}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-4 bg-white">
                      <Search size={24} className="text-muted mb-2" />
                      <p className="text-muted">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0" style={{ backgroundColor: '#f8f9fa' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowRouteModal(false);
              setShowUserPanel(false);
            }}
            disabled={loading}
            className="shadow-sm"
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={saveRoute} 
            disabled={loading || !currentRoute.name || !currentRoute.department || currentRoute.users.length !== 4}
            className="shadow-sm"
            style={{ 
              backgroundColor: '#4e73df',
              borderColor: '#4e73df',
              fontWeight: 500
            }}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? 'Update Workflow' : 'Create Workflow'
           } </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RouteManagementPage;