import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Modal,
  TextField,
  Badge,
  CircularProgress,
  Card,
  Box,
  InputAdornment,
  Pagination,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Chip
} from '@mui/material';
import {
  AddCircleOutline,
  Delete,
  Edit,
  PersonAdd,
  PersonOff,
  Shield,
  Search,
  Business,
  Check,
  Close,
  MoreVert,
  Lock,
  LockOpen,
} from '@mui/icons-material';
import {
  PersonCheck,
  PlusCircle,
  Trash,
  PencilSquare,
  People,
  Person,
} from 'react-bootstrap-icons';

const API_BASE = 'https://localhost:7092/api';
const API_ENDPOINTS = {
  USERS: `${API_BASE}/Auth/users`,
  ROLES: `${API_BASE}/Auth/roles`,
  USER_ROLES: (userId) => `${API_BASE}/Auth/users/${userId}/roles`,
  USER_LOCK: (userId) => `${API_BASE}/Auth/users/${userId}/lock`,
  DEPARTMENTS: `${API_BASE}/Routes/departments`
};

const getRandomColor = () => {
  const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);

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
      setShowCreateRoleModal(false);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (event, pageNumber) => setCurrentPage(pageNumber);

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Helper: filter out 'default' department from all lists/dropdowns
  const filteredDepartments = Array.isArray(data.departments)
    ? data.departments.filter(
        d =>
          (typeof d === 'string' ? d.toLowerCase() : d?.name?.toLowerCase()) !== 'default'
      )
    : [];

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 4 } }}>
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{  borderRadius: '50%', p: 2, mr: 2 }}>
          <LockOpen color="primary" />
        </Box>
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: '300' }}>
            User & Role Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users and their roles
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowRolesModal(true)}
          sx={{ borderRadius: 2, fontWeight: 700, ml: 2 }}
          startIcon={<Shield />}
        >
          Manage Roles
        </Button>
      </Box>

      <Card sx={{ boxShadow: '0 2px 12px rgba(60,72,100,0.07)', borderRadius: 4, mb: 4 }}>
        <Box sx={{ p: 3 }}>
          {activeTab === 'users' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight={400} color="primary.main" mb={2}>
                  System Users
                </Typography>
                <TextField
                  variant="outlined"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Loading users...</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f5f7fa' }}>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Roles</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentUsers.map(user => (
                          <TableRow key={user.id} hover sx={{ borderRadius: 3, transition: 'background 0.2s' }}>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{  fontWeight: 700 }}>
                                  <Person />
                                </Avatar>
                                <Typography fontWeight={700} sx={{ textTransform: 'capitalize' }}>{user.name || user.email.split('@')[0]}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{user.email}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{user.phoneNumber || '-'}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{user.department || '-'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {user.roles.map(role => (
                                  <Chip
                                    key={role} 
                                    label={role}
                                    color="secondary"
                                    size="small"
                                    sx={{ fontWeight: 500, fontSize: 13, borderRadius: 2 }}
                                    onDelete={() => handleUpdateUserRoles(user.id, user.roles.filter(r => r !== role))}
                                    disabled={user.isLocked}
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenAddRoleModal(user)}
                                  sx={{ borderRadius: 2, minWidth: 0, px: 2, fontWeight: 700 }}
                                  disabled={user.isLocked}
                                >
                                  Edit Roles
                                </Button>

                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                              {searchTerm ? 'No users match your search' : 'No users found'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {filteredUsers.length > itemsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={paginate}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
      </Card>

      <Modal open={showRolesModal} onClose={() => setShowRolesModal(false)}>
        <Box sx={{ ...modalStyle, width: 700, borderRadius: 4, p: 4, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Manage System Roles
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <TextField
              variant="outlined"
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300, mr: 2 }}
            />
                  <Button 
              variant="contained"
              color="primary"
              onClick={() => setShowCreateRoleModal(true)}
              startIcon={<AddCircleOutline />}
            >
              Create Role
                  </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(60,72,100,0.07)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f7fa' }}>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.roles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Chip
                        label={role.name}
                        color="secondary"
                        size="small"
                        sx={{ fontWeight: 500, fontSize: 13, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{role.description}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                                onClick={() => handleDeleteRole(role.id)}
                                disabled={role.name === 'Admin'}
                              >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {data.roles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              {searchTerm ? 'No roles match your search' : 'No roles found'}
                    </TableCell>
                  </TableRow>
                        )}
              </TableBody>
                    </Table>
          </TableContainer>
          {filteredUsers.length > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={paginate}
                color="primary"
              />
            </Box>
          )}
          <Modal open={showCreateRoleModal} onClose={() => setShowCreateRoleModal(false)}>
            <Box sx={{ ...modalStyle, width: 400, borderRadius: 4, p: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                Create New Role
              </Typography>
              <TextField
                fullWidth
                label="Role Name"
                variant="outlined"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => setShowCreateRoleModal(false)} sx={{ mr: 1, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button 
                  variant="contained"
                  color="primary"
            onClick={handleCreateRole}
            disabled={!newRole.name || loading}
                  sx={{ fontWeight: 700 }}
          >
                  {loading ? <CircularProgress size={24} /> : 'Create Role'}
          </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Modal>

      <Modal open={showAddRoleModal} onClose={() => setShowAddRoleModal(false)}>
        <Box sx={{ ...modalStyle, width: 420, borderRadius: 4, p: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Manage Roles for {selectedUser?.name || selectedUser?.email.split('@')[0]}
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Current Roles
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedUser?.roles.map(role => (
              <Chip
                key={role} 
                label={role}
                color="secondary"
                size="small"
                sx={{ fontWeight: 500, fontSize: 13, borderRadius: 2 }}
                onDelete={() => setSelectedRoles(selectedRoles.filter(r => r !== role))}
              />
            ))}
            {selectedUser?.roles.length === 0 && (
              <Typography variant="body2" color="text.secondary">No roles assigned</Typography>
            )}
          </Box>
          {availableRoles.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Available Roles
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {availableRoles.map(role => (
                  <Chip
                    key={role}
                    label={role}
                    color={selectedRoles.includes(role) ? 'primary' : 'default'}
                    size="small"
                    sx={{ fontWeight: 500, fontSize: 13, borderRadius: 2, cursor: 'pointer' }}
                    onClick={() => handleRoleSelection(role)}
                  />
                ))}
              </Box>
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={() => setShowAddRoleModal(false)} sx={{ mr: 1, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button 
              variant="contained"
              color="primary"
            onClick={handleSaveRoles}
            disabled={loading}
              sx={{ fontWeight: 700 }}
          >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default RoleManagementPage;
