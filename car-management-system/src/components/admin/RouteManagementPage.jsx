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
  Tooltip,
  ListItemAvatar
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
import { useAuth } from '../../context/AuthContext';

const RouteManagementPage = () => {
  const { userId } = useAuth();
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
  // Correct order as per backend
  const requiredRolesInOrder = ['Comment', 'Review', 'Approve', 'Commit'];

  // API configuration
  const API_BASE = 'https://localhost:7092/api';
  const API_ENDPOINTS = {
    USERS: `${API_BASE}/Auth/users`,
    ROUTES: `${API_BASE}/Routes`,
    DEPARTMENTS: `${API_BASE}/Routes/departments`,
    ROLES: `${API_BASE}/Routes/roles`
  };

  // Get token from localStorage
  const getToken = () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { token } = JSON.parse(authData);
      return token;
    }
    return null;
  };

  const token = getToken();

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
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return Array.isArray(response?.data) ? response.data : defaultValue;
    } catch (err) {
      addToast(`Failed to load data from ${endpoint}`, 'error');
      return defaultValue;
    }
  };

  // Load all initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId || !token) {
        addToast('Authentication required. Please log in.', 'error');
        return;
      }

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
  }, [userId, token]);

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
          response = await axios.post(endpoint, routeData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          break;
        case 'update':
          response = await axios.put(endpoint, routeData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          break;
        case 'delete':
          response = await axios.delete(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
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
        addToast('Roles must be in order: Comment → Review → Approve → Commit', 'error');
        return false;
      }
    }

    return true;
  };

  const saveRoute = async () => {
    if (!userId || !token) {
      addToast('Authentication required. Please log in.', 'error');
      return;
    }

    if (!currentRoute.name?.trim() || (!currentRoute.department && !currentRoute.isDefault)) {
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
        ? `${API_ENDPOINTS.ROUTES}/${currentRoute.id}?userId=${userId}`
        : `${API_ENDPOINTS.ROUTES}?userId=${userId}`;

      const method = isEditing ? 'put' : 'post';

      await axios[method](endpoint, routeData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

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
      const endpoint = `${API_ENDPOINTS.ROUTES}/${routeId}?userId=${userId}`;
      await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedRoutes = await fetchData(API_ENDPOINTS.ROUTES);
      setRoutes(updatedRoutes);
      addToast('Route deleted successfully');
    } catch (err) {
      addToast('Failed to delete route', 'error');
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
    const name = safeUser.name || safeUser.userName || email.split('@')[0] || 'Unknown';
    const avatarColor = getAvatarColor(email);

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
        <Avatar sx={{ 
          bgcolor: avatarColor, 
          width: { xs: 28, sm: 32 }, 
          height: { xs: 28, sm: 32 },
          fontSize: { xs: '0.7rem', sm: '0.8rem' },
          fontWeight: 600
        }}>
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ 
            fontWeight: 600,
            color: '#1e293b',
            fontSize: { xs: '0.75rem', sm: '0.85rem' },
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{ 
            color: '#64748b',
            fontSize: { xs: '0.65rem', sm: '0.7rem' },
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block'
          }}>
            {email}
          </Typography>
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
      case 'Comment': return '#0ea5e9'; // Sky blue
      case 'Review': return '#10b981'; // Emerald green
      case 'Approve': return '#3b82f6'; // Blue
      case 'Commit': return '#f59e0b'; // Amber
      default: return '#6b7280'; // Gray
    }
  };

  return (
    <Container maxWidth={false} sx={{ 
      py: 4, 
      px: { xs: 2, sm: 3, md: 4 }, 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      maxWidth: '100% !important'
    }}>
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

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 5,
        p: { xs: 2, sm: 3 },
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 3, sm: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <Avatar sx={{ 
            width: { xs: 56, sm: 64 }, 
            height: { xs: 56, sm: 64 }, 
            mr: { xs: 0, sm: 3 },
            mb: { xs: 2, sm: 0 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <LockIcon sx={{ color: 'white', fontSize: { xs: 24, sm: 28 } }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 800, 
              color: '#1e293b',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              mb: 0.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Route Management
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#64748b',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              fontWeight: 500
            }}>
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: { xs: 3, sm: 4 },
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            fontWeight: 600,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { 
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
            },
            '&:disabled': {
              background: '#e2e8f0',
              color: '#9ca3af',
              transform: 'none',
              boxShadow: 'none'
            },
            transition: 'all 0.3s ease'
          }}
        >
          + Add Route
        </Button>
      </Box>

      <Card sx={{ boxShadow: 'none', backgroundColor: 'transparent' }}>

        <Box sx={{ p: 3 }}>
          {loading && !routes.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading routes...</Typography>
            </Box>
          ) : routes.length > 0 ? (
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {routes.map(route => (
                <Grid item key={route.id || Math.random()} xs={12} sm={6} lg={4}>
                  <Card sx={{ 
                    height: '100%', 
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      p: { xs: 2, sm: 3 }, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Header Section */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid #f1f5f9',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 0 }
                      }}>
                        <Box sx={{ flex: 1, pr: { xs: 0, sm: 2 } }}>
                          <Typography variant="h6" sx={{ 
                            color: '#1e293b',
                            fontWeight: 700,
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            mb: 1,
                            lineHeight: 1.3
                          }}>
                            {route.name || 'Unnamed Route'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<BusinessIcon fontSize="small" />}
                            label={route.department || 'No Department'}
                              size="small"
                              sx={{ 
                                backgroundColor: '#f8fafc',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                fontWeight: 500,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                              }}
                            />
                            {route.isDefault && (
                              <Chip 
                                label="Default" 
                                size="small"
                                sx={{ 
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af',
                                  fontWeight: 600,
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }} 
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ 
                            color: '#64748b',
                            fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            lineHeight: 1.4
                          }}>
                            {route.description || 'No description provided'}
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 0.5,
                          alignSelf: { xs: 'flex-end', sm: 'auto' }
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditRouteModal(route)}
                            sx={{ 
                              bgcolor: '#f1f5f9',
                              color: '#475569',
                              '&:hover': {
                                bgcolor: '#e2e8f0',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => deleteRoute(route.id)}
                            sx={{ 
                              bgcolor: '#fef2f2',
                              color: '#dc2626',
                              '&:hover': {
                                bgcolor: '#fee2e2',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Route Flow Section */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ 
                          textTransform: 'uppercase', 
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 2
                        }}>
                          <ChatBubbleOutlineIcon sx={{ mr: 1, fontSize: '1rem', color: '#3b82f6' }} />
                          Route Flow ({route.users?.length || 0})
                        </Typography>
                        
                        <Box sx={{ 
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden'
                        }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                                <TableCell sx={{ 
                                  textTransform: 'uppercase', 
                                  color: '#475569',
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                  fontWeight: 700,
                                  letterSpacing: '0.5px',
                                  py: { xs: 1, sm: 1.5 },
                                  borderBottom: '2px solid #e2e8f0'
                                }}>
                                  Role
                                </TableCell>
                                <TableCell sx={{ 
                                  textTransform: 'uppercase', 
                                  color: '#475569',
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                  fontWeight: 700,
                                  letterSpacing: '0.5px',
                                  py: { xs: 1, sm: 1.5 },
                                  borderBottom: '2px solid #e2e8f0'
                                }}>
                                  User
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(route.users || [])
                                .sort((a, b) => requiredRolesInOrder.indexOf(a.role) - requiredRolesInOrder.indexOf(b.role))
                                .map((user, index) => (
                                  <TableRow 
                                    key={`${route.id}-${user.userId}`}
                                    sx={{
                                      '&:hover': { backgroundColor: '#f8fafc' },
                                      '&:last-child td': { borderBottom: 0 }
                                    }}
                                  >
                                    <TableCell sx={{ py: { xs: 1.5, sm: 2 } }}>
                                      <Chip
                                        label={user.role || 'Unknown'}
                                        size="small"
                                        sx={{
                                          backgroundColor: getRoleColor(user.role),
                                          color: 'white',
                                          textTransform: 'capitalize',
                                          fontWeight: 600,
                                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                          height: { xs: 20, sm: 24 }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ py: { xs: 1.5, sm: 2 } }}>
                                      {renderUserCell(user)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Box>
                      </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 4,
              backgroundColor: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0'
            }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mb: 3, 
                mx: 'auto',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <ShieldIcon sx={{ color: 'white', fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ 
                color: '#1e293b', 
                mb: 2,
                fontWeight: 700,
                fontSize: '1.8rem'
              }}>
                No routes created yet
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                mb: 4,
                fontSize: '1.1rem',
                maxWidth: 400,
                mx: 'auto',
                lineHeight: 1.6
              }}>
                Create your first approval route to get started with managing your workflow processes
              </Typography>
              <Button
                variant="contained"
                onClick={openNewRouteModal}
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: '#e2e8f0',
                    color: '#9ca3af',
                    transform: 'none',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Create Your First Route
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
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <Box sx={{ 
          width: '90%', 
          maxWidth: 1000, 
          maxHeight: '85vh',
          bgcolor: '#ffffff', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 4,
            borderBottom: '1px solid #e3e8f0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ 
                mr: 3, 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 48,
                height: 48
              }}>
                <BusinessIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                  fontSize: '1.5rem',
                  mb: 0.5
              }}>
                {isEditing ? 'Edit Approval Route' : 'Create New Route'}
              </Typography>
                <Typography variant="body2" sx={{ 
                  opacity: 0.9,
                  fontSize: '0.9rem'
                }}>
                  Configure approval workflow for {currentRoute.department || 'department'}
              </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => {
                setShowRouteModal(false);
                setShowUserPanel(false);
              }}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Content */}
          <Box sx={{ 
            display: 'flex', 
            flex: 1,
            overflow: 'hidden'
          }}>
            {/* Main Content */}
            <Box sx={{ 
              flexGrow: 1, 
              pr: showUserPanel ? 3 : 0, 
              width: showUserPanel ? '70%' : '100%',
              p: 4,
              overflow: 'auto'
            }}>
              {/* Route Details Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: '#1e293b',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    bgcolor: '#3f51b5', 
                    borderRadius: 1 
                  }} />
                  Route Information
                </Typography>
                
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Route Name"
                    variant="outlined"
                    value={currentRoute.name}
                    onChange={(e) => setCurrentRoute({ ...currentRoute, name: e.target.value })}
                      placeholder="e.g. Vehicle Approval Workflow"
                    error={!currentRoute.name?.trim()}
                    helperText={!currentRoute.name?.trim() ? "Route name is required" : ""}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        '& fieldset': {
                            borderColor: '#e2e8f0',
                            borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: '#3f51b5'
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3f51b5',
                            borderWidth: '2px'
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={currentRoute.department}
                      onChange={(e) => {
                        if (!currentRoute.isDefault) {
                          setCurrentRoute({ ...currentRoute, department: e.target.value });
                        }
                      }}
                      disabled={currentRoute.isDefault}
                      error={!currentRoute.department && !currentRoute.isDefault}
                      label="Department"
                      sx={{
                          borderRadius: '12px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e2e8f0',
                            borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3f51b5'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#3f51b5',
                            borderWidth: '2px'
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>Select department</em>
                      </MenuItem>
                      {departmentOptions.filter(dept => dept.toLowerCase() !== 'default').map(dept => (
                        <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                      ))}
                      {currentRoute.isDefault && (
                        <MenuItem value="Default">Default</MenuItem>
                      )}
                    </Select>
                      {!currentRoute.department && !currentRoute.isDefault && 
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                          Department is required
                        </Typography>
                      }
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Description"
                variant="outlined"
                multiline
                  rows={3}
                value={currentRoute.description}
                onChange={(e) => setCurrentRoute({ ...currentRoute, description: e.target.value })}
                  placeholder="Describe the purpose and scope of this approval workflow..."
                sx={{ 
                    mt: 3,
                  '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    '& fieldset': {
                        borderColor: '#e2e8f0',
                        borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#3f51b5'
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#3f51b5',
                        borderWidth: '2px'
                    }
                  }
                }}
              />

                <FormGroup sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={currentRoute.isDefault}
                      onChange={(e) => {
                        const isDefault = e.target.checked;
                        setCurrentRoute({
                          ...currentRoute,
                          isDefault,
                          department: isDefault ? 'Default' : ''
                        });
                      }}
                        sx={{
                          '&.Mui-checked': {
                            color: '#3f51b5'
                          }
                      }}
                    />
                  }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Set as default fallback route
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          This route will be used when no specific department route is found
                        </Typography>
                      </Box>
                    }
                />
              </FormGroup>
              </Box>

              {/* Approval Flow Section */}
              <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                  p: 3,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                  <Box>
                    <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 600,
                      color: '#1e293b',
                      mb: 0.5
                }}>
                      <ChatBubbleOutlineIcon sx={{ mr: 1.5, fontSize: '1.3rem', color: '#3f51b5' }} />
                      Approval Workflow
                </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {currentRoute.users.length}/4 roles assigned • {4 - currentRoute.users.length} remaining
                    </Typography>
                  </Box>
                <Button
                  variant={showUserPanel ? 'contained' : 'outlined'}
                    size="medium"
                  onClick={() => setShowUserPanel(!showUserPanel)}
                  disabled={currentRoute.users.length >= 4}
                  startIcon={<PersonAddIcon />}
                  sx={{
                    backgroundColor: showUserPanel ? '#3f51b5' : 'transparent',
                    color: showUserPanel ? 'white' : '#3f51b5',
                    borderColor: '#3f51b5',
                      borderRadius: '12px',
                    textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                    '&:hover': {
                      backgroundColor: showUserPanel ? '#303f9f' : 'rgba(63, 81, 181, 0.04)',
                        borderColor: '#3f51b5',
                        transform: 'translateY(-1px)'
                    },
                    '&:disabled': {
                      backgroundColor: '#f1f5f9',
                      color: '#94a3b8',
                      borderColor: '#e2e8f0'
                      },
                      transition: 'all 0.2s ease'
                  }}
                >
                    {showUserPanel ? 'Hide User Panel' : 'Add Users'}
                </Button>
              </Box>

              {currentRoute.users.length > 0 ? (
                  <Box sx={{ 
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      borderBottom: '1px solid #e2e8f0',
                      background: '#f8fafc'
                }}>
                      <Typography variant="subtitle2" sx={{ 
                        fontWeight: 600, 
                        color: '#374151',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Role Assignments
                      </Typography>
                    </Box>
                    <TableContainer>
                  <Table>
                    <TableHead>
                          <TableRow sx={{ background: '#f8fafc' }}>
                        <TableCell sx={{ 
                          fontWeight: 600,
                              color: '#374151',
                              borderBottom: '2px solid #e2e8f0',
                              py: 2
                        }}>Role</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600,
                              color: '#374151',
                              borderBottom: '2px solid #e2e8f0',
                              py: 2
                            }}>Assigned User</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600,
                              color: '#374151',
                              borderBottom: '2px solid #e2e8f0',
                              py: 2
                            }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                          {requiredRolesInOrder.map((role, index) => {
                            const user = currentRoute.users.find(u => u.role === role);
                            return (
                              <TableRow 
                                key={role} 
                                sx={{ 
                                  '&:hover': { backgroundColor: '#f8fafc' },
                                  '&:nth-of-type(even)': { backgroundColor: '#fafbfc' }
                                }}
                              >
                                <TableCell sx={{ py: 2.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      bgcolor: getRoleColor(role) 
                                    }} />
                                    <Chip
                                      label={role}
                                      size="medium"
                                      sx={{
                                        backgroundColor: getRoleColor(role),
                                        color: 'white',
                                        textTransform: 'capitalize',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        height: 28
                                      }}
                                    />
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                  {user ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Avatar sx={{ 
                                        width: 32, 
                                        height: 32, 
                                        bgcolor: getAvatarColor(user.email),
                                        fontSize: '0.8rem'
                                      }}>
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {user.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {user.email}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  ) : (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 1,
                                      color: '#9ca3af'
                                    }}>
                                      <PersonIcon sx={{ fontSize: 20 }} />
                                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        Not assigned
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 2.5 }}>
                                  {user ? (
                              <IconButton
                                color="error"
                                      size="small"
                                onClick={() => removeUserFromRoute(user.id)}
                                sx={{
                                        bgcolor: '#fef2f2',
                                  '&:hover': {
                                          bgcolor: '#fee2e2',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s ease'
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      -
                                    </Typography>
                                  )}
                            </TableCell>
                          </TableRow>
                            );
                          })}
                    </TableBody>
                  </Table>
                </TableContainer>
                  </Box>
              ) : (
                <Box sx={{ 
                    border: '2px dashed #d1d5db', 
                    borderRadius: '16px', 
                    p: 6, 
                  textAlign: 'center', 
                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
                  }}>
                    <Avatar sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: '#e5e7eb',
                      color: '#6b7280',
                      mb: 2,
                      mx: 'auto'
                }}>
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ 
                      color: '#374151', 
                      fontWeight: 600, 
                      mb: 1 
                    }}>
                      No Users Assigned
                  </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6b7280',
                      maxWidth: 300,
                      mx: 'auto'
                    }}>
                      Add users to create the approval workflow. Each role must have exactly one user assigned.
                  </Typography>
                </Box>
              )}

              {currentRoute.users.length < 4 && (
                  <Alert severity="info" sx={{ 
                  mt: 3, 
                    borderRadius: '12px',
                    border: '1px solid #dbeafe',
                    backgroundColor: '#eff6ff'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <RepeatIcon sx={{ mr: 1.5, fontSize: '1.2rem', color: '#3b82f6', mt: 0.2 }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af', mb: 1 }}>
                          Complete the approval workflow
                      </Typography>
                        <Typography variant="body2" sx={{ color: '#1e40af', mb: 1 }}>
                          All 4 roles must be assigned in the correct order:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {requiredRolesInOrder.map((role, index) => (
                            <Chip
                              key={role}
                              label={`${index + 1}. ${role}`}
                              size="small"
                              sx={{
                                bgcolor: currentRoute.users.some(u => u.role === role) ? '#10b981' : '#f3f4f6',
                                color: currentRoute.users.some(u => u.role === role) ? 'white' : '#6b7280',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                      </Box>
                    </Box>
                  </Box>
                </Alert>
              )}
              </Box>
            </Box>

            {showUserPanel && (
              <Box sx={{ 
                borderLeft: '1px solid #e2e8f0', 
                pl: 3, 
                width: '30%',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                p: 3
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3 
                }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 600,
                    color: '#1e293b'
                  }}>
                    <PersonAddIcon sx={{ mr: 1.5, fontSize: '1.2rem', color: '#3f51b5' }} />
                    Add User
                  </Typography>
                  <IconButton 
                    onClick={() => setShowUserPanel(false)}
                    sx={{
                      color: '#64748b',
                      bgcolor: 'rgba(100, 116, 139, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(100, 116, 139, 0.2)',
                        color: '#1e293b'
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: '#374151',
                    mb: 1
                  }}>
                    Assign to role:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={selectedUserRole}
                      onChange={(e) => setSelectedUserRole(e.target.value)}
                      sx={{
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#d1d5db'
                        }
                      }}
                    >
                      {requiredRolesInOrder.map(role => (
                        <MenuItem
                          key={role}
                          value={role}
                          disabled={currentRoute.users.some(u => u.role === role)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%', 
                              bgcolor: getRoleColor(role) 
                            }} />
                          {role}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {currentRoute.users.some(u => u.role === selectedUserRole) && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        This role is already assigned
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9ca3af' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#d1d5db'
                      }
                    }
                  }}
                />

                <Box sx={{ 
                  height: '400px', 
                  overflowY: 'auto', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '12px', 
                  p: 1,
                  background: 'white'
                }}>
                  {filteredUsers.length > 0 ? (
                    <List dense>
                      {filteredUsers.map(user => (
                        <ListItem
                          key={user.id}
                          button
                          onClick={() => addUserToRoute(user.id)}
                          disabled={currentRoute.users.some(u => u.id === user.id)}
                          sx={{
                            cursor: currentRoute.users.some(u => u.id === user.id) ? 'not-allowed' : 'pointer',
                            opacity: currentRoute.users.some(u => u.id === user.id) ? 0.6 : 1,
                            py: 1,
                            borderRadius: '8px',
                            mb: 0.5,
                            '&:hover': {
                              bgcolor: currentRoute.users.some(u => u.id === user.id) ? 'transparent' : '#f3f4f6'
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: getAvatarColor(user.email),
                              fontSize: '0.8rem'
                            }}>
                              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.name || user.email?.split('@')[0] || 'Unknown User'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 6, 
                      color: '#9ca3af'
                    }}>
                      <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        No users found
                      </Typography>
                      <Typography variant="caption">
                        Try adjusting your search terms
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Footer */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 4,
            borderTop: '1px solid #e3e8f0',
            background: '#f8fafc'
          }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {currentRoute.users.length === 4 ? 
                  '✅ All roles assigned - Ready to save' : 
                  `⚠️ ${4 - currentRoute.users.length} role${4 - currentRoute.users.length !== 1 ? 's' : ''} remaining`
                }
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setShowRouteModal(false);
                setShowUserPanel(false);
              }}
              disabled={loading}
              sx={{ 
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 3,
                  py: 1.5,
                '&:hover': {
                    borderColor: '#9ca3af',
                    backgroundColor: '#f9fafb'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveRoute}
                disabled={loading || !currentRoute.name || (!currentRoute.department && !currentRoute.isDefault) || currentRoute.users.length !== 4}
              sx={{
                  background: 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
                textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': { 
                    background: 'linear-gradient(135deg, #303f9f 0%, #283593 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.15)'
                },
                '&:disabled': {
                    background: '#e5e7eb',
                    color: '#9ca3af',
                    transform: 'none',
                    boxShadow: 'none'
                  },
                  transition: 'all 0.2s ease'
              }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {isEditing ? 'Update Route' : 'Create Route'}
            </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default RouteManagementPage;
