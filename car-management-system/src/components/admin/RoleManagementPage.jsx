import React, { useState, useEffect } from 'react';
import { 
  Tab, Tabs, Table, Button, Modal, Form, 
  Badge, Alert, Spinner, Card, Container,
  Row, Col, InputGroup, FloatingLabel,
  ListGroup, Dropdown
} from 'react-bootstrap';
import { 
  PlusCircle, Trash, PencilSquare, 
  PersonCheck, PersonX, ShieldCheck, Shield,
  Search, People, Building,
  Check, X, ChevronDown, ChevronUp, ThreeDotsVertical
} from 'react-bootstrap-icons';

import axios from 'axios';
const API_BASE = 'https://localhost:7092/api';
const API_ENDPOINTS = {
  USERS: `${API_BASE}/Auth/users`,
  ROLES: `${API_BASE}/Auth/roles`,
  USER_ROLES: (userId) => `${API_BASE}/Auth/users/${userId}/roles`,
  USER_LOCK: (userId) => `${API_BASE}/Auth/users/${userId}/lock`
};

const RoleManagementPage = () => {
  const [data, setData] = useState({
    roles: [],
    users: [],
    departments: []
  });
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [usersResponse, rolesResponse, deptsResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.USERS),
          axios.get(API_ENDPOINTS.ROLES),
          axios.get(API_ENDPOINTS.DEPARTMENTS)
        ]);

        setData({
          users: usersResponse.data,
          roles: rolesResponse.data.map(role => ({
            id: role,
            name: role,
            description: `${role} role`,
            color: getRandomColor()
          })),
          departments: deptsResponse.data
        });
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRandomColor = () => {
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);

      const createdRole = {
        id: `role-${Date.now()}`,
        name: newRole.name,
        description: newRole.description,
        color: getRandomColor()
      };

      setData(prev => ({
        ...prev,
        roles: [...prev.roles, createdRole]
      }));

      setShowRoleModal(false);
      setNewRole({ name: '', description: '' });
      setSuccess('Role created successfully');
    } catch (err) {
      setError('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      // In a real app, you would call your API to delete the role
      // await axios.delete(`${API_ENDPOINTS.ROLES}/${roleId}`);
      
      setData(prev => ({
        ...prev,
        roles: prev.roles.filter(r => r.id !== roleId)
      }));
      
      setSuccess('Role deleted successfully');
    } catch (err) {
      setError('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRoles = async (userId, newRoles) => {
    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.USER_ROLES(userId), { roles: newRoles });
      
      setData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, roles: newRoles } : user
        )
      }));
      
      setSuccess('User roles updated successfully');
    } catch (err) {
      setError('Failed to update user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.USER_LOCK(userId));
      
      setData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId 
            ? { ...user, isLocked: !user.isLocked } 
            : user
        )
      }));
      
      setSuccess(`User ${user.isLocked ? 'unlocked' : 'locked'} successfully`);
    } catch (err) {
      setError('Failed to toggle user lock status');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = data.users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRoles = data.roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="py-4 px-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
              <ShieldCheck size={28} className="text-primary" />
            </div>
            <div>
              <h2 className="fw-bold mb-0">User & Role Management</h2>
              <p className="text-muted mb-0">Manage system users and their roles</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mb-4">
          <strong>Error:</strong> {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible className="mb-4">
          <strong>Success:</strong> {success}
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
            <Tab 
              eventKey="users" 
              title={
                <span className="d-flex align-items-center">
                  <People className="me-2" /> Users
                </span>
              }
              className="p-3"
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">System Users</h4>
                <InputGroup style={{ width: '300px' }}>
                  <InputGroup.Text className="bg-light border-end-0">
                    <Search size={14} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-start-0"
                  />
                </InputGroup>
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : (
                <div className="table-responsive rounded">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Roles</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                <PersonCheck size={18} className="text-primary" />
                              </div>
                              <div>
                                <div className="fw-medium">{user.name || user.email.split('@')[0]}</div>
                                <div className="text-muted small">
                                  {user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleString()}` : 'Never logged in'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-muted">{user.email}</td>
                          <td>
                            <Badge bg={user.isLocked ? 'danger' : 'success'}>
                              {user.isLocked ? 'Locked' : 'Active'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {user.roles.map(role => (
                                <Badge 
                                  key={role} 
                                  bg="light" 
                                  text="dark" 
                                  className="fw-normal border d-flex align-items-center"
                                >
                                  {role}
                                  <X 
                                    size={12} 
                                    className="ms-1 cursor-pointer" 
                                    onClick={() => handleUpdateUserRoles(
                                      user.id, 
                                      user.roles.filter(r => r !== role)
                                    )}
                                  />
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="text-end">
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-primary" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item 
                                  onClick={() => {
                                    const newRole = prompt('Enter role to add:');
                                    if (newRole) {
                                      handleUpdateUserRoles(
                                        user.id, 
                                        [...new Set([...user.roles, newRole])]
                                      );
                                    }
                                  }}
                                >
                                  <PlusCircle className="me-2" /> Add Role
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleToggleLock(user.id)}>
                                  {user.isLocked ? (
                                    <><Check className="me-2" /> Unlock User</>
                                  ) : (
                                    <><X className="me-2" /> Lock User</>
                                  )}
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted">
                            {searchTerm ? 'No users match your search' : 'No users found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Tab>
            
            <Tab 
              eventKey="roles" 
              title={
                <span className="d-flex align-items-center">
                  <Shield className="me-2" /> Roles
                </span>
              }
              className="p-3"
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">System Roles</h4>
                <div className="d-flex">
                  <InputGroup className="me-3" style={{ width: '300px' }}>
                    <InputGroup.Text className="bg-light border-end-0">
                      <Search size={14} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0"
                    />
                  </InputGroup>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowRoleModal(true)}
                    className="d-flex align-items-center"
                  >
                    <PlusCircle size={18} className="me-2" /> Create Role
                  </Button>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading roles...</p>
                </div>
              ) : (
                <div className="table-responsive rounded">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Role</th>
                        <th>Description</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoles.map(role => (
                        <tr key={role.id}>
                          <td>
                            <Badge pill bg={role.color} className="fs-6 py-2 px-3 text-uppercase">
                              {role.name}
                            </Badge>
                          </td>
                          <td className="text-muted">{role.description}</td>
                          <td className="text-end">
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              disabled={role.name === 'Admin'}
                            >
                              <Trash size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredRoles.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-muted">
                            {searchTerm ? 'No roles match your search' : 'No roles found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Create Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Create New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FloatingLabel controlId="roleName" label="Role Name" className="mb-3">
              <Form.Control 
                type="text" 
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="Enter role name"
                className="border-2 py-3"
              />
            </FloatingLabel>
            
            <FloatingLabel controlId="roleDescription" label="Description">
              <Form.Control 
                as="textarea" 
                style={{ height: '100px' }}
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="Enter role description"
                className="border-2 py-3"
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateRole}
            disabled={!newRole.name || loading}
          >
            {loading ? <Spinner size="sm" /> : 'Create Role'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoleManagementPage;