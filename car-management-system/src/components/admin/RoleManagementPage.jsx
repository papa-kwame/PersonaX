import React, { useState, useEffect } from 'react';
import {
  Tab, Tabs, Table, Button, Modal, Form,
  Badge, Spinner, Card, Container,
  Row, Col, InputGroup, FloatingLabel,
  Dropdown, Pagination, ListGroup
} from 'react-bootstrap';
import {
  PlusCircle, Trash, PencilSquare,
  PersonCheck, PersonX, ShieldCheck, Shield,
  Search, People, Building,
  Check, X, ThreeDotsVertical
} from 'react-bootstrap-icons';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'https://localhost:7092/api';
const API_ENDPOINTS = {
  USERS: `${API_BASE}/Auth/users`,
  ROLES: `${API_BASE}/Auth/roles`,
  USER_ROLES: (userId) => `${API_BASE}/Auth/users/${userId}/roles`,
  USER_LOCK: (userId) => `${API_BASE}/Auth/users/${userId}/lock`,
  DEPARTMENTS: `${API_BASE}/Routes/departments`
};

const getRandomColor = () => {
  const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const RoleManagementPage = () => {
  const [data, setData] = useState({ roles: [], users: [], departments: [] });
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersResponse, rolesResponse, deptsResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.USERS),
          axios.get(API_ENDPOINTS.ROLES),
          axios.get(API_ENDPOINTS.DEPARTMENTS)
        ]);

        const formattedRoles = rolesResponse.data.map(role => {
          const roleName = typeof role === 'string' ? role : role?.name || 'Unknown';
          return {
            id: roleName,
            name: roleName,
            description: `${roleName} role`,
            color: getRandomColor()
          };
        });

        setData({
          users: usersResponse.data,
          roles: formattedRoles,
          departments: deptsResponse.data
        });
      } catch (err) {
        toast.error('Failed to load data. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast.error('Role name is required');
      return;
    }

    setLoading(true);
    try {
      const createdRole = {
        id: `role-${Date.now()}`,
        name: newRole.name,
        description: newRole.description,
        color: getRandomColor()
      };
      setData(prev => ({ ...prev, roles: [...prev.roles, createdRole] }));
      setShowRoleModal(false);
      setNewRole({ name: '', description: '' });
      toast.success('Role created successfully');
    } catch (err) {
      toast.error('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (roleId === 'Admin') {
      toast.warning('Cannot delete Admin role');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this role?');
    if (!confirmDelete) return;

    setLoading(true);
    try {
      setData(prev => ({ ...prev, roles: prev.roles.filter(r => r.id !== roleId) }));
      toast.success('Role deleted successfully');
    } catch (err) {
      toast.error('Failed to delete role');
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
        users: prev.users.map(user => user.id === userId ? { ...user, roles: newRoles } : user)
      }));
      toast.success('User roles updated successfully');
    } catch (err) {
      toast.error('Failed to update user roles');
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
        users: prev.users.map(user => user.id === userId ? { ...user, isLocked: !user.isLocked } : user)
      }));
      toast.success('User lock status updated');
    } catch (err) {
      toast.error('Failed to toggle user lock status');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = data.users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.roles.some(role => typeof role === 'string' && role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredRoles = data.roles.filter(role =>
    typeof role.name === 'string' &&
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(
    activeTab === 'users' 
      ? filteredUsers.length / itemsPerPage 
      : filteredRoles.length / itemsPerPage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleOpenAddRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoles([...user.roles]);
    setShowAddRoleModal(true);
  };

  const handleRoleSelection = (roleName) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSaveRoles = () => {
    if (selectedUser) {
      handleUpdateUserRoles(selectedUser.id, selectedRoles);
      setShowAddRoleModal(false);
    }
  };

  const availableRoles = data.roles
    .map(role => role.name)
    .filter(roleName => !selectedUser?.roles.includes(roleName));

  return (
    <Container fluid className="py-4 px-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
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

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => {
              setActiveTab(k);
              setCurrentPage(1);
            }} 
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
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
                <>
                  <div className="table-responsive rounded">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Roles</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUsers.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                  <PersonCheck size={18} className="text-primary" />
                                </div>
                                <div className="fw-medium">
                                  {user.name || user.email.split('@')[0]}
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
                                  <Dropdown.Item onClick={() => handleOpenAddRoleModal(user)}>
                                    <PlusCircle className="me-2" /> Add Role
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                        {currentUsers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted">
                              {searchTerm ? 'No users match your search' : 'No users found'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  
                  {filteredUsers.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-3">
                      <Pagination>
                        <Pagination.First 
                          onClick={() => paginate(1)} 
                          disabled={currentPage === 1} 
                        />
                        <Pagination.Prev 
                          onClick={() => paginate(currentPage - 1)} 
                          disabled={currentPage === 1} 
                        />
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                          <Pagination.Item
                            key={number}
                            active={number === currentPage}
                            onClick={() => paginate(number)}
                          >
                            {number}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next 
                          onClick={() => paginate(currentPage + 1)} 
                          disabled={currentPage === totalPages} 
                        />
                        <Pagination.Last 
                          onClick={() => paginate(totalPages)} 
                          disabled={currentPage === totalPages} 
                        />
                      </Pagination>
                    </div>
                  )}
                </>
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
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
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
                <>
                  <div className="table-responsive rounded">
                    <Table hover className="align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Role</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRoles.map(role => (
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
                        {currentRoles.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-center py-4 text-muted">
                              {searchTerm ? 'No roles match your search' : 'No roles found'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  
                  {filteredRoles.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-3">
                      <Pagination>
                        <Pagination.First 
                          onClick={() => paginate(1)} 
                          disabled={currentPage === 1} 
                        />
                        <Pagination.Prev 
                          onClick={() => paginate(currentPage - 1)} 
                          disabled={currentPage === 1} 
                        />
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                          <Pagination.Item
                            key={number}
                            active={number === currentPage}
                            onClick={() => paginate(number)}
                          >
                            {number}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next 
                          onClick={() => paginate(currentPage + 1)} 
                          disabled={currentPage === totalPages} 
                        />
                        <Pagination.Last 
                          onClick={() => paginate(totalPages)} 
                          disabled={currentPage === totalPages} 
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

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

      <Modal show={showAddRoleModal} onHide={() => setShowAddRoleModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            Manage Roles for {selectedUser?.name || selectedUser?.email.split('@')[0]}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5 className="mb-3">Current Roles</h5>
          <div className="d-flex flex-wrap gap-2 mb-4">
            {selectedUser?.roles.map(role => (
              <Badge 
                key={role} 
                pill 
                bg="primary" 
                className="fs-6 py-2 px-3 d-flex align-items-center"
              >
                {role}
              </Badge>
            ))}
            {selectedUser?.roles.length === 0 && (
              <span className="text-muted">No roles assigned</span>
            )}
          </div>

          {availableRoles.length > 0 && (
            <>
              <h5 className="mb-3">Available Roles</h5>
              <ListGroup>
                {availableRoles.map(role => (
                  <ListGroup.Item 
                    key={role}
                    action
                    active={selectedRoles.includes(role)}
                    onClick={() => handleRoleSelection(role)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {role}
                    {selectedRoles.includes(role) ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <PlusCircle size={16} className="text-muted" />
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowAddRoleModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveRoles}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoleManagementPage;