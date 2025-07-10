import React, { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  Alert,
  Card,
  Chip,
  Container,
  Box,
  Grid,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  CircularProgress,
  Pagination,
  Tabs,
  Tab,
  Snackbar,
  Alert as MuiAlert,
  Typography,
  Divider,
  Avatar,
  FormGroup,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  PersonOff as PersonOffIcon,
  Shield as ShieldIcon,
  Search as SearchIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Repeat as RepeatIcon,
  Add as AddIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import axios from 'axios';

const RouteManagementPage = () => {
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('routes');
  const [currentRoute, setCurrentRoute] = useState({
    id: '',
    name: '',
    department: '',
    description: '',
    users: [],
    isDefault: false
  });
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState('Comment');
  const [isEditing, setIsEditing] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

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

  // Add a new toast
  const addToast = (message, variant = 'success') => {
    const id = Date.now();
    setToasts(toasts => [...toasts, { id, message, variant }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  // Remove a toast
  const removeToast = (id) => {
    setToasts(toasts => toasts.filter(toast => toast.id !== id));
  };

  // Safe API fetch function
  const fetchData = async (endpoint, defaultValue = []) => {
    try {
      const response = await axios.get(endpoint);
      return Array.isArray(response?.data) ? response.data : defaultValue;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      addToast(`Failed to load data from ${endpoint}`, 'error');
      return defaultValue;
    }
  };

  // Load all initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);

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
        addToast('Failed to load application data. Please try again later.', 'error');
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
      addToast(errorMsg, 'error');
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
      users: [],
      isDefault: false
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
      })),
      isDefault: route.isDefault || false
    });
    setIsEditing(true);
    setShowRouteModal(true);
  };

  const validateRoute = () => {
    // Check all required roles are assigned
    const assignedRoles = currentRoute.users.map(u => u.role);
    const missingRoles = requiredRolesInOrder.filter(r => !assignedRoles.includes(r));

    if (missingRoles.length > 0) {
      addToast(`All roles must be assigned. Missing: ${missingRoles.join(', ')}`, 'error');
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
      addToast(`Each role must have exactly one user. Duplicates found for: ${duplicateRoles.join(', ')}`, 'error');
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
        addToast('Roles must be in order: Comment → Review → Commit → Approve', 'error');
        return false;
      }
    }

    return true;
  };

  const saveRoute = async () => {
    if (!currentRoute.name?.trim() || !currentRoute.department) {
      addToast('Route name and department are required', 'error');
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
      users: usersToSend,
      isDefault: currentRoute.isDefault
    };

    try {
      setLoading(true);

      const endpoint = isEditing
        ? `${API_ENDPOINTS.ROUTES}/${currentRoute.id}`
        : API_ENDPOINTS.ROUTES;

      const method = isEditing ? 'put' : 'post';

      await axios[method](endpoint, routeData);

      const updatedRoutes = await fetchData(API_ENDPOINTS.ROUTES);
      setRoutes(updatedRoutes);

      addToast(`Route ${isEditing ? 'updated' : 'created'} successfully`);
      setShowRouteModal(false);
    } catch (err) {
      addToast(
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to save route. Please check the data and try again.',
        'error'
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
      addToast('Route deleted successfully');
    } catch (err) {
      // Error is already handled in handleRouteOperation
    }
  };

  const addUserToRoute = (userId, role = selectedUserRole) => {
    if (!userId) return;

    // Find the user in the users list
    const user = users.find(u => u.id === userId);
    if (!user) {
      addToast('User not found', 'error');
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: avatarColor, width: 24, height: 24, mr: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', color: avatarColor === '#f8f9fc' ? '#000' : '#fff' }}>
            {email.charAt(0).toUpperCase()}
          </Typography>
        </Avatar>
        <Box>
          <Typography>{name}</Typography>
          <Typography variant="body2" color="text.secondary">{email}</Typography>
        </Box>
      </Box>
    );
  };

  const renderRoleDropdown = (user) => {
    return (
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Role</InputLabel>
        <Select
          value={user.role}
          onChange={(e) => {
            const newRole = e.target.value;
            addUserToRoute(user.id, newRole);
          }}
          label="Role"
        >
          {requiredRolesInOrder.map(role => (
            <MenuItem
              key={role}
              value={role}
              disabled={currentRoute.users.some(u => u.role === role && u.id !== user.id)}
            >
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Comment': return '#36b9cc';
      case 'Review': return '#1cc88a';
      case 'Commit': return '#f6c23e';
      case 'Approve': return '#4e73df';
      default: return '#858796';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: 4, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => removeToast(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity={toast.variant === 'success' ? 'success' : 'error'}
            onClose={() => removeToast(toast.id)}
          >
            {toast.message}
          </MuiAlert>
        </Snackbar>
      ))}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56, mr: 2 }}>
            <LockIcon color="primary" />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              Route Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create and manage approval routes
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={openNewRouteModal}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          disabled={loading}
          sx={{
            backgroundColor: '#4e73df',
            '&:hover': { backgroundColor: '#3a5ba0' },
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          Add Route
        </Button>
      </Box>

      <Card sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          sx={{ px: 3, pt: 2 }}
          variant="fullWidth"
        >
          <Tab
            value="routes"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShieldIcon sx={{ mr: 1 }} fontSize="small" />
                <Typography>Routes</Typography>
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading && !routes.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading routes...</Typography>
            </Box>
          ) : routes.length > 0 ? (
            <Grid container spacing={3}>
              {routes.map(route => (
                <Grid item key={route.id || Math.random()} xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', boxShadow: 2, borderLeft: '4px solid #4e73df' }}>
                    <Card sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#2c3e50' }}>
                            {route.name || 'Unnamed Route'}
                          </Typography>
                          <Chip
                            icon={<BusinessIcon fontSize="small" />}
                            label={route.department || 'No Department'}
                            sx={{ mt: 1, mb: 1, backgroundColor: 'background.paper', color: 'text.secondary' }}
                          />
                          {route.isDefault && <Chip label="Default" color="info" sx={{ mb: 1 }} />}
                          <Typography variant="body2" color="text.secondary">
                            {route.description || 'No description provided'}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => openEditRouteModal(route)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => deleteRoute(route.id)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2, flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary', display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ChatBubbleOutlineIcon sx={{ mr: 1, fontSize: '1rem' }} />
                          Route Flow ({route.users?.length || 0})
                        </Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}>Role</TableCell>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}>User</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(route.users || [])
                                .sort((a, b) => requiredRolesInOrder.indexOf(a.role) - requiredRolesInOrder.indexOf(b.role))
                                .map((user, index) => (
                                  <TableRow key={`${route.id}-${user.userId}`}>
                                    <TableCell>{renderUserCell(user)}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={user.role || 'Unknown'}
                                        sx={{
                                          backgroundColor: getRoleColor(user.role),
                                          color: 'white',
                                          textTransform: 'capitalize'
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Card>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 64, height: 64, mb: 2, mx: 'auto' }}>
                <ShieldIcon color="primary" />
              </Avatar>
              <Typography variant="h5" sx={{ color: '#2c3e50', mb: 2 }}>
                No routes created yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Create your first approval route to get started
              </Typography>
              <Button
                variant="contained"
                onClick={openNewRouteModal}
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: '#4e73df',
                  '&:hover': { backgroundColor: '#3a5ba0' },
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                Create Route
              </Button>
            </Box>
          )}
        </Box>
      </Card>

      <Modal
        open={showRouteModal}
        onClose={() => {
          setShowRouteModal(false);
          setShowUserPanel(false);
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box sx={{ width: '80%', maxWidth: 1000, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
              {isEditing ? 'Edit Approval Route' : 'Create New Route'}
            </Typography>
            <IconButton onClick={() => {
              setShowRouteModal(false);
              setShowUserPanel(false);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', minHeight: '400px' }}>
            <Box sx={{ flexGrow: 1, pr: 3, width: showUserPanel ? '60%' : '100%' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Route Name"
                    variant="outlined"
                    value={currentRoute.name}
                    onChange={(e) => setCurrentRoute({ ...currentRoute, name: e.target.value })}
                    placeholder="e.g. Payroll Approval"
                    error={!currentRoute.name?.trim()}
                    helperText={!currentRoute.name?.trim() ? "Route name is required" : ""}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={currentRoute.department}
                      onChange={(e) => {
                        if (!currentRoute.isDefault) {
                          setCurrentRoute({ ...currentRoute, department: e.target.value });
                        }
                      }}
                      disabled={currentRoute.isDefault}
                      error={!currentRoute.department}
                      label="Department"
                    >
                      <MenuItem value="">
                        <em>Select department</em>
                      </MenuItem>
                      {departmentOptions.map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                    </Select>
                    {!currentRoute.department && <Typography variant="caption" color="error">Department is required</Typography>}
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                value={currentRoute.description}
                onChange={(e) => setCurrentRoute({ ...currentRoute, description: e.target.value })}
                placeholder="Describe what this Route is for"
                sx={{ mb: 3 }}
              />

              <FormGroup sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentRoute.isDefault}
                      onChange={(e) => {
                        const isDefault = e.target.checked;
                        setCurrentRoute({
                          ...currentRoute,
                          isDefault,
                          department: isDefault ? 'Default' : currentRoute.department
                        });
                      }}
                    />
                  }
                  label="Set this as the default fallback route"
                />
              </FormGroup>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChatBubbleOutlineIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Approval Flow ({currentRoute.users.length}/4)
                </Typography>
                <Button
                  variant={showUserPanel ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setShowUserPanel(!showUserPanel)}
                  disabled={currentRoute.users.length >= 4}
                  startIcon={<PersonAddIcon />}
                  sx={{
                    backgroundColor: showUserPanel ? '#4e73df' : 'transparent',
                    color: showUserPanel ? 'white' : '#4e73df',
                    borderColor: '#4e73df',
                    '&:hover': {
                      backgroundColor: showUserPanel ? '#3a5ba0' : 'rgba(78, 115, 223, 0.04)',
                      borderColor: '#4e73df'
                    }
                  }}
                >
                  {showUserPanel ? 'Hide Users' : 'Add Users'}
                </Button>
              </Box>

              {currentRoute.users.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}>Role</TableCell>
                        <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}>User</TableCell>
                        <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.75rem' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentRoute.users
                        .sort((a, b) => requiredRolesInOrder.indexOf(a.role) - requiredRolesInOrder.indexOf(b.role))
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{renderRoleDropdown(user)}</TableCell>
                            <TableCell>{renderUserCell(user)}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => removeUserFromRoute(user.id)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 3, textAlign: 'center', bgcolor: 'background.paper', boxShadow: 1 }}>
                  <PersonIcon sx={{ color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No users assigned to this Route</Typography>
                </Box>
              )}

              {currentRoute.users.length < 4 && (
                <Alert severity="warning" sx={{ mt: 3, boxShadow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RepeatIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    <Box>
                      <Typography variant="body2"><strong>Note:</strong> All 4 roles must be assigned in order:</Typography>
                      <ol sx={{ mt: 1, mb: 0, pl: 3 }}>
                        <li><Typography variant="body2">Comment</Typography></li>
                        <li><Typography variant="body2">Review</Typography></li>
                        <li><Typography variant="body2">Commit</Typography></li>
                        <li><Typography variant="body2">Approve</Typography></li>
                      </ol>
                    </Box>
                  </Box>
                </Alert>
              )}
            </Box>

            {showUserPanel && (
              <Box sx={{ borderLeft: 1, borderColor: 'grey.300', pl: 3, width: '40%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonAddIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    Select Employee
                  </Typography>
                  <IconButton onClick={() => setShowUserPanel(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">Assign as:</Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                    <Select
                      value={selectedUserRole}
                      onChange={(e) => setSelectedUserRole(e.target.value)}
                      disabled={currentRoute.users.some(u => u.role === selectedUserRole)}
                    >
                      {requiredRolesInOrder.map(role => (
                        <MenuItem
                          key={role}
                          value={role}
                          disabled={currentRoute.users.some(u => u.role === role)}
                        >
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                    {currentRoute.users.some(u => u.role === selectedUserRole) && (
                      <Typography variant="caption" color="error">This role is already assigned</Typography>
                    )}
                  </FormControl>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ height: '300px', overflowY: 'auto', border: 1, borderColor: 'grey.300', borderRadius: 1, p: 1 }}>
                  {filteredUsers.length > 0 ? (
                    <List>
                      {filteredUsers.map(user => (
                        <ListItem
                          key={user.id}
                          button
                          onClick={() => addUserToRoute(user.id)}
                          disabled={currentRoute.users.some(u => u.id === user.id)}
                          sx={{
                            cursor: currentRoute.users.some(u => u.id === user.id) ? 'not-allowed' : 'pointer',
                            opacity: currentRoute.users.some(u => u.id === user.id) ? 0.6 : 1
                          }}
                        >
                          <ListItemText primary={renderUserCell(user)} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper' }}>
                      <SearchIcon sx={{ color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">No users found</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowRouteModal(false);
                setShowUserPanel(false);
              }}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveRoute}
              disabled={loading || !currentRoute.name || !currentRoute.department || currentRoute.users.length !== 4}
              sx={{
                backgroundColor: '#4e73df',
                '&:hover': { backgroundColor: '#3a5ba0' }
              }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {isEditing ? 'Update Route' : 'Create Route'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default RouteManagementPage;
