import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Avatar, IconButton, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid,
  CircularProgress, Alert, Badge, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemAvatar, ListItemText, Divider, LinearProgress, Skeleton, Fade, Slide,
  AppBar, Toolbar, Breadcrumbs, Link as MuiLink, Stack, CardHeader, CardActions,
  TablePagination
} from '@mui/material';
import {
  Timeline as TimelineIcon, Person as PersonIcon, Assessment as AssessmentIcon, 
  TrendingUp as TrendingUpIcon, FilterList as FilterIcon, Download as DownloadIcon,
  Refresh as RefreshIcon, Visibility as ViewIcon, Search as SearchIcon,
  DirectionsCar as CarIcon, Build as BuildIcon, LocalGasStation as FuelIcon,
  Route as RouteIcon, Login as LoginIcon, Logout as LogoutIcon,
  Home as HomeIcon, Analytics as AnalyticsIcon, Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../services/api';

export default function AdminAudit({ sidebarExpanded = true }) {
  const [activeTab, setActiveTab] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [mostActiveUsers, setMostActiveUsers] = useState([]);
  const [popularPages, setPopularPages] = useState([]);
  const [activityTrends, setActivityTrends] = useState([]);
  const [filters, setFilters] = useState({
    module: '',
    activityType: '',
    userId: '',
    dateFrom: null,
    dateTo: null,
    searchTerm: ''
  });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const refreshTimeoutRef = useRef(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      fetchActivityData(true);
    }, 300);
  }, []);

  // Fetch all activity data with subtle loading
  const fetchActivityData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);

      const [
        activitiesRes,
        statsRes,
        usersRes,
        pagesRes,
        trendsRes
      ] = await Promise.all([
        api.get('/api/UserActivity/recent?limit=100'),
        api.get('/api/UserActivity/stats'),
        api.get('/api/UserActivity/most-active-users?limit=10'),
        api.get('/api/UserActivity/popular-pages?limit=10'),
        api.get('/api/UserActivity/trends?days=30')
      ]);

      // Smooth data updates with fade transitions
      setActivities(activitiesRes.data);
      setStats(statsRes.data);
      setMostActiveUsers(usersRes.data);
      setPopularPages(pagesRes.data);
      setActivityTrends(trendsRes.data);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to fetch activity data');
      console.error('Error fetching activity data:', err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(() => {
      fetchActivityData(true);
    }, 120000);
    return () => {
      clearInterval(interval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  // Handle manual refresh with subtle animation
  const handleManualRefresh = () => {
    fetchActivityData(true);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredActivities.slice(startIndex, endIndex);
  };

  const getActivityIcon = (module) => {
    const iconMap = {
      'Authentication': <LoginIcon />,
      'Maintenance': <BuildIcon />,
      'VehicleAssignment': <CarIcon />,
      'Vehicles': <CarIcon />,
      'Fuel': <FuelIcon />,
      'Routes': <RouteIcon />
    };
    return iconMap[module] || <TimelineIcon />;
  };

  const getActivityColor = (activityType) => {
    const colorMap = {
      'Login': 'success',
      'Logout': 'default',
      'Create': 'primary',
      'Update': 'info',
      'Delete': 'error',
      'ProcessStage': 'warning',
      'Reject': 'error',
      'Schedule': 'secondary',
      'Complete': 'success',
      'Assign': 'primary',
      'Unassign': 'default'
    };
    return colorMap[activityType] || 'default';
  };

  const getModuleColor = (module) => {
    const colorMap = {
      'Authentication': '#4caf50',
      'Maintenance': '#ff9800',
      'VehicleAssignment': '#2196f3',
      'Vehicles': '#9c27b0',
      'Fuel': '#f44336',
      'Routes': '#00bcd4'
    };
    return colorMap[module] || '#757575';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relative = '';
    if (diffMins < 1) relative = 'Just now';
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else relative = `${diffDays}d ago`;

    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setDetailDialogOpen(true);
  };

  const handleExport = () => {
    const csv = generateCSV(filteredActivities);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data) => {
    const headers = ['Timestamp', 'User', 'Activity Type', 'Module', 'Description', 'Entity Type', 'Entity ID'];
    const rows = data.map(activity => [
      new Date(activity.timestamp).toLocaleString(),
      activity.user?.userName || activity.userId,
      activity.activityType,
      activity.module,
      activity.description,
      activity.entityType,
      activity.entityId
    ]);
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  // Filter activities based on current filters
  const filteredActivities = activities.filter(activity => {
    if (filters.module && activity.module !== filters.module) return false;
    if (filters.activityType && activity.activityType !== filters.activityType) return false;
    if (filters.userId && !activity.userId.includes(filters.userId)) return false;
    if (filters.searchTerm && !activity.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
    if (filters.dateFrom && new Date(activity.timestamp) < filters.dateFrom) return false;
    if (filters.dateTo && new Date(activity.timestamp) > filters.dateTo) return false;
    return true;
  });

  if (initialLoading) {
    return (
      <Box sx={{ maxHeight: '80vh', bgcolor: 'grey.50' }}>
        <Fade in={initialLoading} timeout={500}>
          <Box sx={{ p: 3 }}>
            {/* Header skeleton */}
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" height={48} width="40%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="60%" />
            </Box>
            
            {/* Stats cards skeleton */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" height={24} width="60%" sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={32} width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Filters skeleton */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Skeleton variant="text" height={32} width="25%" sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={12} sm={6} md={2} key={i}>
                      <Skeleton variant="rectangular" height={56} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Main content skeleton */}
            <Card>
              <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={48} width="100%" sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={400} width="100%" />
              </Box>
            </Card>
          </Box>
        </Fade>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        maxHeight: '80vh', 
        bgcolor: 'grey.50',
        padding: '0px',
        width: sidebarExpanded ? '100%' : 'calc(95% + 100px)',
        transition: 'width 0.3s ease-in-out'
      }}>
        {/* Professional Header */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'grey.200' }}>
          <Toolbar sx={{ px: 3 }}>
            <Box sx={{ flexGrow: 1 }}>

              
              <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl size="small" sx={{ 
                    width: '215px',
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}>
                    <InputLabel>Module</InputLabel>
                    <Select
                      value={filters.module}
                      onChange={(e) => setFilters({...filters, module: e.target.value})}
                      label="Module"
                    >
                      <MenuItem value="">All Modules</MenuItem>
                      <MenuItem value="Authentication">Authentication</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="VehicleAssignment">Vehicle Assignment</MenuItem>
                      <MenuItem value="Vehicles">Vehicles</MenuItem>
                      <MenuItem value="Fuel">Fuel</MenuItem>
                      <MenuItem value="Routes">Routes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl size="small" sx={{ 
                    width: '215px',
                    '& .MuiInputBase-root': {
                      height: '40px'
                    }
                  }}>
                    <InputLabel>Activity Type</InputLabel>
                    <Select
                      value={filters.activityType}
                      onChange={(e) => setFilters({...filters, activityType: e.target.value})}
                      label="Activity Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="Login">Login</MenuItem>
                      <MenuItem value="Logout">Logout</MenuItem>
                      <MenuItem value="Create">Create</MenuItem>
                      <MenuItem value="Update">Update</MenuItem>
                      <MenuItem value="Delete">Delete</MenuItem>
                      <MenuItem value="ProcessStage">Process Stage</MenuItem>
                      <MenuItem value="Reject">Reject</MenuItem>
                      <MenuItem value="Schedule">Schedule</MenuItem>
                      <MenuItem value="Complete">Complete</MenuItem>
                      <MenuItem value="Assign">Assign</MenuItem>
                      <MenuItem value="Unassign">Unassign</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    size="small"
                    label="User ID"
                    value={filters.userId}
                    onChange={(e) => setFilters({...filters, userId: e.target.value})}
                    sx={{ 
                      width: '215px',
                      '& .MuiInputBase-root': {
                        height: '40px'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="From Date"
                    value={filters.dateFrom}
                    onChange={(date) => setFilters({...filters, dateFrom: date})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        size="small" 
                        sx={{ 
                          width: '215px',
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <DatePicker
                    label="To Date"
                    value={filters.dateTo}
                    onChange={(date) => setFilters({...filters, dateTo: date})}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        size="small" 
                        sx={{ 
                          width: '215px',
                          '& .MuiInputBase-root': {
                            height: '40px'
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    size="small"
                    label="Search"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    sx={{ 
                      width: '215px',
                      '& .MuiInputBase-root': {
                        height: '40px'
                      }
                    }}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            

          </Toolbar>
        </AppBar>

        <Box sx={{ p: 4 }}>
         
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    width: sidebarExpanded ? '350px' : '400px',
                    transition: 'width 0.3s ease-in-out'
                  }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {stats.totalActivities || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Activities
                      </Typography>
                    </Box>
                    <AnalyticsIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    width: sidebarExpanded ? '350px' : '405px',
                    transition: 'width 0.3s ease-in-out'
                  }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {stats.uniqueUsers || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Users
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                width: sidebarExpanded ? '350px' : '410px',
                transition: 'width 0.3s ease-in-out'
              }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {filteredActivities.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Filtered Results
                      </Typography>
                    </Box>
                    <TimelineIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                width: sidebarExpanded ? '350px' : '410px',
                transition: 'width 0.3s ease-in-out'
              }}>
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {stats.moduleStats?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Modules
                      </Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Error Display */}
          {error && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleManualRefresh}>
                  Retry
                </Button>
              }
              sx={{ mb: 4 }}
            >
              {error}
            </Alert>
          )}

          {/* Main Content Area */}
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 3,
              borderBottom: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    minHeight: 48
                  }
                }}
              >
                <Tab label="Activity Timeline" icon={<TimelineIcon />} />
                <Tab label="User Analytics" icon={<PersonIcon />} />
                <Tab label="Module Analytics" icon={<AssessmentIcon />} />
                <Tab label="Trends" icon={<TrendingUpIcon />} />
              </Tabs>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={activities.length === 0}
                sx={{ 
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                Export Data
              </Button>
            </Box>

            
            <CardContent sx={{ p: 0 }}>
              {/* Activity Timeline Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 3 }}>
                  {filteredActivities.length === 0 ? (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 8,
                      color: 'grey.500'
                    }}>
                      <TimelineIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        No activities found
                      </Typography>
                      <Typography variant="body2">
                        Try adjusting your filters or refresh the data
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
                      <TableContainer 
                        component={Paper} 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 2,
                          flex: 1,
                          overflow: 'auto',
                          '& .MuiTable-root': {
                            minWidth: 650
                          }
                        }}
                      >
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Timestamp</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>User</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Activity</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Module</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Description</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getPaginatedData().map((activity, index) => {
                              const timeInfo = formatTimestamp(activity.timestamp);
                              return (
                                <Fade in={true} timeout={300 + (index * 50)} key={activity.id}>
                                  <TableRow 
                                    sx={{ 
                                      transition: 'all 0.2s ease-in-out'
                                    }}
                                  >
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {timeInfo.date}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                          {timeInfo.time} ({timeInfo.relative})
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box display="flex" alignItems="center">
                                        <Avatar 
                                          sx={{ 
                                            width: 36, 
                                            height: 36, 
                                            mr: 2,
                                            bgcolor: `${getActivityColor(activity.activityType)}.main`,
                                            fontSize: '0.875rem',
                                            fontWeight: 600
                                          }}
                                        >
                                          {activity.user?.userName?.charAt(0) || 'U'}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {activity.user?.userName || `User ${activity.userId.substring(0, 8)}...`}
                                          </Typography>
                                          <Typography variant="caption" color="textSecondary">
                                            {activity.user?.email || activity.userId}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={activity.activityType}
                                        color={getActivityColor(activity.activityType)}
                                        size="small"
                                        icon={getActivityIcon(activity.module)}
                                        sx={{ 
                                          fontWeight: 600,
                                          '& .MuiChip-icon': {
                                            color: 'inherit'
                                          }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box display="flex" alignItems="center">
                                        <Box sx={{ mr: 1, color: 'grey.600' }}>
                                          {getActivityIcon(activity.module)}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                          {activity.module}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography 
                                        variant="body2" 
                                        noWrap 
                                        sx={{ 
                                          maxWidth: 250,
                                          color: 'grey.700'
                                        }}
                                      >
                                        {activity.description}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Tooltip title="View details">
                                        <IconButton
                                          size="small"
                                          onClick={() => handleViewDetails(activity)}
                                          sx={{ 
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                              backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                              transform: 'scale(1.1)'
                                            }
                                          }}
                                        >
                                          <ViewIcon fontSize="small" color="primary" />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                </Fade>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      {/* Fixed Pagination */}
                      <Box sx={{ 
                        mt: 2,
                        p: 2,
                        bgcolor: 'white',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" color="grey.600">
                            Rows per page:
                          </Typography>
                          <FormControl size="small" sx={{ minWidth: 80 }}>
                            <Select
                              value={rowsPerPage}
                              onChange={handleChangeRowsPerPage}
                              sx={{ 
                                height: 32,
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'grey.300'
                                }
                              }}
                            >
                              <MenuItem value={5}>5</MenuItem>
                              <MenuItem value={10}>10</MenuItem>
                              <MenuItem value={25}>25</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="grey.600">
                            {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredActivities.length)} of ${filteredActivities.length}`}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            onClick={(e) => handleChangePage(e, page - 1)}
                            disabled={page === 0}
                            size="small"
                            sx={{ 
                              color: page === 0 ? 'grey.400' : 'grey.700',
                              '&:hover': {
                                bgcolor: page === 0 ? 'transparent' : 'rgba(25, 118, 210, 0.08)'
                              }
                            }}
                          >
                            <Box component="span" sx={{ fontSize: '1.2rem' }}>‹</Box>
                          </IconButton>
                          <IconButton
                            onClick={(e) => handleChangePage(e, page + 1)}
                            disabled={page >= Math.ceil(filteredActivities.length / rowsPerPage) - 1}
                            size="small"
                            sx={{ 
                              color: page >= Math.ceil(filteredActivities.length / rowsPerPage) - 1 ? 'grey.400' : 'grey.700',
                              '&:hover': {
                                bgcolor: page >= Math.ceil(filteredActivities.length / rowsPerPage) - 1 ? 'transparent' : 'rgba(25, 118, 210, 0.08)'
                              }
                            }}
                          >
                            <Box component="span" sx={{ fontSize: '1.2rem' }}>›</Box>
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* User Analytics Tab */}
              {activeTab === 1 && (
                <Box sx={{ p: 3 }}>


                  {/* Enhanced User Analytics Content */}
                  <Grid container spacing={3}>
                    {/* Most Active Users */}
                    <Grid item xs={12} lg={8}>
                      <Card sx={{ 
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                      }}>
                        <CardHeader
                          title="Most Active Users"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 700,
                            color: '#1e293b'
                          }}
                          avatar={
                            <Box sx={{
                              p: 1.5,
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                              color: 'white'
                            }}>
                              <PersonIcon sx={{ fontSize: 24 }} />
                            </Box>
                          }
                          sx={{
                            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                            background: 'rgba(248, 250, 252, 0.5)'
                          }}
                        />
                        <CardContent sx={{ p: 3 }}>
                          {mostActiveUsers && mostActiveUsers.length > 0 ? (
                            <Box>
                              {mostActiveUsers.map((user, index) => (
                                <Box key={user.userId} sx={{ mb: 3 }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    p: 2.5,
                                    borderRadius: '12px',
                                    background: index < 3 
                                      ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.05) 0%, rgba(100, 116, 139, 0.05) 100%)'
                                      : 'rgba(255, 255, 255, 0.8)',
                                    border: index < 3 
                                      ? '2px solid #475569'
                                      : '1px solid rgba(226, 232, 240, 0.6)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                      boxShadow: '0 8px 32px rgba(71, 85, 105, 0.15)',
                                      transform: 'translateY(-2px) scale(1.01)',
                                      background: index < 3 
                                        ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.1) 0%, rgba(100, 116, 139, 0.1) 100%)'
                                        : 'rgba(255, 255, 255, 1)'
                                    },
                                    position: 'relative',
                                    overflow: 'hidden'
                                  }}>
                                    {index < 3 && (
                                      <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: '#475569',
                                        color: 'white',
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        borderRadius: '0 0 0 8px'
                                      }}>
                                        #{index + 1}
                                      </Box>
                                    )}
                                    
                                    <Avatar sx={{ 
                                      width: 56, 
                                      height: 56, 
                                      mr: 3,
                                      bgcolor: index < 3 ? '#475569' : 'rgba(71, 85, 105, 0.1)',
                                      color: index < 3 ? 'white' : '#475569',
                                      fontSize: '1.25rem',
                                      fontWeight: 600,
                                      border: index < 3 ? '2px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(71, 85, 105, 0.2)'
                                    }}>
                                      {user.userName?.charAt(0) || 'U'}
                                    </Avatar>
                                    
                                    <Box sx={{ flex: 1, mr: 2 }}>
                                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                                        {user.userName || `User ${user.userId.substring(0, 8)}...`}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                                        {user.userEmail || user.userId.substring(0, 8)}...
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Chip 
                                          label={`${user.activityCount} activities`}
                                          size="small"
                                          sx={{ 
                                            bgcolor: 'rgba(71, 85, 105, 0.1)',
                                            color: '#475569',
                                            fontWeight: 600,
                                            borderRadius: '8px'
                                          }}
                                        />
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                          Last active: {new Date(user.lastActivity).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>
                                        {user.activityCount}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        activities
                                      </Typography>
                                    </Box>
                                  </Box>
                                  
                                  {/* Activity Progress Bar */}
                                  <Box sx={{ 
                                    position: 'relative',
                                    height: '6px',
                                    background: 'rgba(226, 232, 240, 0.6)',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                    mt: 1
                                  }}>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${(user.activityCount / (mostActiveUsers[0]?.activityCount || 1)) * 100}%`,
                                        background: index < 3 
                                          ? 'linear-gradient(90deg, #475569 0%, #64748b 100%)'
                                          : 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 100%)',
                                        borderRadius: '3px',
                                        transition: 'width 0.8s ease-in-out'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 6, 
                              color: '#64748b',
                              background: 'rgba(248, 250, 252, 0.5)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(226, 232, 240, 0.8)'
                            }}>
                              <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5, color: '#94a3b8' }} />
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#475569' }}>
                                No user data available
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 300, mx: 'auto' }}>
                                User activity statistics will appear here once users start interacting with the system
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    {/* Popular Pages and User Engagement */}
                    <Grid item xs={12} lg={4}>
                      <Stack spacing={3}>
                        {/* Popular Pages Card */}
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                        }}>
                          <CardHeader
                            title="Popular Pages"
                            titleTypographyProps={{ 
                              variant: 'h6', 
                              fontWeight: 700,
                              color: '#1e293b'
                            }}
                            avatar={
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                color: 'white'
                              }}>
                                <RouteIcon sx={{ fontSize: 24 }} />
                              </Box>
                            }
                            sx={{
                              borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                              background: 'rgba(248, 250, 252, 0.5)'
                            }}
                          />
                          <CardContent sx={{ p: 3 }}>
                            {popularPages && popularPages.length > 0 ? (
                              <List sx={{ p: 0 }}>
                                {popularPages.slice(0, 8).map((page, index) => (
                                  <ListItem key={page.pageUrl} sx={{ 
                                    px: 0, 
                                    py: 1.5,
                                    borderRadius: '8px',
                                    mb: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      background: 'rgba(71, 85, 105, 0.05)'
                                    }
                                  }}>
                                    <ListItemAvatar>
                                      <Avatar sx={{ 
                                        bgcolor: index < 3 ? '#059669' : '#94a3b8', 
                                        width: 36, 
                                        height: 36, 
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                      }}>
                                        {index + 1}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                          {page.pageUrl}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                          {page.visitCount} visits
                                        </Typography>
                                      }
                                    />
                                    <Chip 
                                      label={`#${index + 1}`} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: index < 3 ? '#059669' : '#e2e8f0',
                                        color: index < 3 ? 'white' : '#64748b',
                                        fontWeight: 600,
                                        borderRadius: '6px'
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Box sx={{ 
                                textAlign: 'center', 
                                py: 4, 
                                color: '#64748b',
                                background: 'rgba(248, 250, 252, 0.5)',
                                borderRadius: '12px',
                                border: '2px dashed rgba(226, 232, 240, 0.8)'
                              }}>
                                <RouteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: '#94a3b8' }} />
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#475569' }}>
                                  No page data available
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  Popular pages will appear here once page views are tracked
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>

                        {/* User Engagement Metrics */}
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                        }}>
                          <CardHeader
                            title="Engagement Metrics"
                            titleTypographyProps={{ 
                              variant: 'h6', 
                              fontWeight: 700,
                              color: '#1e293b'
                            }}
                            avatar={
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                color: 'white'
                              }}>
                                <AnalyticsIcon sx={{ fontSize: 24 }} />
                              </Box>
                            }
                            sx={{
                              borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                              background: 'rgba(248, 250, 252, 0.5)'
                            }}
                          />
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                                Average Activities per User
                              </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                                {mostActiveUsers.length > 0 
                                  ? Math.round(mostActiveUsers.reduce((sum, user) => sum + user.activityCount, 0) / mostActiveUsers.length)
                                  : 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Based on active users
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                                Most Active User
                              </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                                {mostActiveUsers.length > 0 ? mostActiveUsers[0].activityCount : 0}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Activities by top user
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
                                User Distribution
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ 
                                  flex: 1, 
                                  height: '8px', 
                                  background: 'rgba(226, 232, 240, 0.6)',
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <Box sx={{
                                    height: '100%',
                                    width: '60%',
                                    background: 'linear-gradient(90deg, #475569 0%, #64748b 100%)',
                                    borderRadius: '4px'
                                  }} />
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                  60% active
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Module Analytics Tab */}
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  {/* Enhanced Header Stats */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AssessmentIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Total Activities
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.totalActivities || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Across all modules
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '80px',
                          height: '80px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(25px, -25px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Active Users
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.uniqueUsers || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            In the last 30 days
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '90px',
                          height: '90px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingUpIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Avg Daily
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {Math.round((stats.totalActivities || 0) / 30) || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Activities per day
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '70px',
                          height: '70px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(20px, -20px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SettingsIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Active Modules
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.moduleStats?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            With recent activity
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Enhanced Module Analytics */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                      <Card sx={{ 
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                      }}>
                        <CardHeader
                          title="Module Activity Distribution"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 700,
                            color: '#1e293b'
                          }}
                          avatar={
                            <Box sx={{
                              p: 1.5,
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                              color: 'white'
                            }}>
                              <AssessmentIcon sx={{ fontSize: 24 }} />
                            </Box>
                          }
                          sx={{
                            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                            background: 'rgba(248, 250, 252, 0.5)'
                          }}
                        />
                        <CardContent sx={{ p: 3 }}>
                          {stats.moduleStats && stats.moduleStats.length > 0 ? (
                            <Box>
                              {stats.moduleStats.map((module, index) => (
                                <Box key={module.module} sx={{ mb: 3 }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    mb: 2,
                                    p: 2,
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    border: '1px solid rgba(226, 232, 240, 0.6)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      background: 'rgba(255, 255, 255, 1)',
                                      boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)',
                                      transform: 'translateY(-1px)'
                                    }
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                      <Box sx={{ 
                                        mr: 2, 
                                        p: 1,
                                        borderRadius: '8px',
                                        background: `${getModuleColor(module.module)}20`,
                                        color: getModuleColor(module.module)
                                      }}>
                                        {getActivityIcon(module.module)}
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                                          {module.module}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                          {Math.round((module.count / (stats.totalActivities || 1)) * 100)}% of total activity
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569' }}>
                                        {module.count}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        activities
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ 
                                    position: 'relative',
                                    height: '8px',
                                    background: 'rgba(226, 232, 240, 0.6)',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${(module.count / (stats.totalActivities || 1)) * 100}%`,
                                        background: `linear-gradient(90deg, ${getModuleColor(module.module)} 0%, ${getModuleColor(module.module)}dd 100%)`,
                                        borderRadius: '4px',
                                        transition: 'width 0.8s ease-in-out'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 6, 
                              color: '#64748b',
                              background: 'rgba(248, 250, 252, 0.5)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(226, 232, 240, 0.8)'
                            }}>
                              <AssessmentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5, color: '#94a3b8' }} />
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#475569' }}>
                                No module data available
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 300, mx: 'auto' }}>
                                Module statistics will appear here once activities are logged and tracked across the system
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} lg={4}>
                      <Card sx={{ 
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                      }}>
                        <CardHeader
                          title="Activity Types"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 700,
                            color: '#1e293b'
                          }}
                          avatar={
                            <Box sx={{
                              p: 1.5,
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                              color: 'white'
                            }}>
                              <TimelineIcon sx={{ fontSize: 24 }} />
                            </Box>
                          }
                          sx={{
                            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                            background: 'rgba(248, 250, 252, 0.5)'
                          }}
                        />
                        <CardContent sx={{ p: 3 }}>
                          {stats.activityTypeStats && stats.activityTypeStats.length > 0 ? (
                            <Box>
                              {stats.activityTypeStats.map((type, index) => (
                                <Box key={type.activityType} sx={{ mb: 3 }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    mb: 2,
                                    p: 2,
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    border: '1px solid rgba(226, 232, 240, 0.6)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      background: 'rgba(255, 255, 255, 1)',
                                      boxShadow: '0 4px 12px rgba(71, 85, 105, 0.1)',
                                      transform: 'translateY(-1px)'
                                    }
                                  }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                      <Chip
                                        label={type.activityType}
                                        color={getActivityColor(type.activityType)}
                                        size="small"
                                        sx={{ 
                                          mr: 2, 
                                          fontWeight: 600,
                                          borderRadius: '8px'
                                        }}
                                      />
                                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                                        {Math.round((type.count / (stats.totalActivities || 1)) * 100)}%
                                      </Typography>
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#475569' }}>
                                      {type.count}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ 
                                    position: 'relative',
                                    height: '6px',
                                    background: 'rgba(226, 232, 240, 0.6)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                  }}>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: `${(type.count / (stats.totalActivities || 1)) * 100}%`,
                                        backgroundColor: `${getActivityColor(type.activityType)}.main`,
                                        borderRadius: '3px',
                                        transition: 'width 0.8s ease-in-out'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 4, 
                              color: '#64748b',
                              background: 'rgba(248, 250, 252, 0.5)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(226, 232, 240, 0.8)'
                            }}>
                              <TimelineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: '#94a3b8' }} />
                              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#475569' }}>
                                No activity type data
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748b' }}>
                                Activity type statistics will appear here once activities are logged
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Trends Tab */}
              {activeTab === 3 && (
                <Box sx={{ p: 3 }}>
                  {/* Enhanced Header Stats for Trends */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '120px',
                          height: '120px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(40px, -40px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingUpIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Peak Day
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {activityTrends && activityTrends.length > 0 
                              ? Math.max(...activityTrends.map(t => t.count))
                              : 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Highest activity in 30 days
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(30px, -30px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AnalyticsIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Avg Daily
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {activityTrends && activityTrends.length > 0 
                              ? Math.round(activityTrends.reduce((sum, t) => sum + t.count, 0) / activityTrends.length)
                              : 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Average activities per day
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Card sx={{ 
                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '90px',
                          height: '90px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                          transform: 'translate(25px, -25px)'
                        }
                      }}>
                        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TimelineIcon sx={{ fontSize: 32, mr: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Total Days
                            </Typography>
                          </Box>
                          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                            {activityTrends?.length || 0}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Days with activity data
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Enhanced Trends Content */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                      <Card sx={{ 
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                      }}>
                        <CardHeader
                          title="Activity Trends (Last 30 Days)"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 700,
                            color: '#1e293b'
                          }}
                          avatar={
                            <Box sx={{
                              p: 1.5,
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                              color: 'white'
                            }}>
                              <TrendingUpIcon sx={{ fontSize: 24 }} />
                            </Box>
                          }
                          sx={{
                            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                            background: 'rgba(248, 250, 252, 0.5)'
                          }}
                        />
                        <CardContent sx={{ p: 3 }}>
                          {activityTrends && activityTrends.length > 0 ? (
                            <Grid container spacing={2}>
                              {activityTrends.slice(0, 15).map((trend, index) => {
                                const maxCount = Math.max(...activityTrends.map(t => t.count));
                                const percentage = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;
                                const isPeak = trend.count === maxCount;
                                
                                return (
                                  <Grid item xs={12} sm={6} md={4} lg={3} key={trend.date}>
                                    <Card 
                                      variant="outlined" 
                                      sx={{ 
                                        height: '100%',
                                        background: isPeak 
                                          ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.05) 0%, rgba(100, 116, 139, 0.05) 100%)'
                                          : 'rgba(255, 255, 255, 0.8)',
                                        border: isPeak 
                                          ? '2px solid #475569'
                                          : '1px solid rgba(226, 232, 240, 0.6)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.15)',
                                          transform: 'translateY(-4px) scale(1.02)',
                                          background: isPeak 
                                            ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.1) 0%, rgba(100, 116, 139, 0.1) 100%)'
                                            : 'rgba(255, 255, 255, 1)'
                                        },
                                        position: 'relative',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {isPeak && (
                                        <Box sx={{
                                          position: 'absolute',
                                          top: 0,
                                          right: 0,
                                          background: '#475569',
                                          color: 'white',
                                          px: 1,
                                          py: 0.5,
                                          fontSize: '10px',
                                          fontWeight: 600,
                                          borderRadius: '0 0 0 8px'
                                        }}>
                                          PEAK
                                        </Box>
                                      )}
                                      <CardContent sx={{ 
                                        textAlign: 'center', 
                                        p: 2,
                                        position: 'relative'
                                      }}>
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            fontWeight: 600, 
                                            color: '#475569', 
                                            mb: 1,
                                            fontSize: '0.875rem'
                                          }}
                                        >
                                          {new Date(trend.date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric' 
                                          })}
                                        </Typography>
                                        <Typography 
                                          variant="h4" 
                                          sx={{ 
                                            fontWeight: 700, 
                                            color: isPeak ? '#475569' : '#64748b', 
                                            mb: 1,
                                            fontSize: '1.75rem'
                                          }}
                                        >
                                          {trend.count}
                                        </Typography>
                                        <Typography 
                                          variant="caption" 
                                          sx={{ 
                                            color: '#94a3b8',
                                            fontWeight: 500
                                          }}
                                        >
                                          activities
                                        </Typography>
                                        
                                        {/* Activity Bar */}
                                        <Box sx={{ 
                                          mt: 2,
                                          position: 'relative',
                                          height: '4px',
                                          background: 'rgba(226, 232, 240, 0.6)',
                                          borderRadius: '2px',
                                          overflow: 'hidden'
                                        }}>
                                          <Box
                                            sx={{
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              height: '100%',
                                              width: `${percentage}%`,
                                              background: isPeak 
                                                ? 'linear-gradient(90deg, #475569 0%, #64748b 100%)'
                                                : 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 100%)',
                                              borderRadius: '2px',
                                              transition: 'width 0.8s ease-in-out'
                                            }}
                                          />
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 8, 
                              color: '#64748b',
                              background: 'rgba(248, 250, 252, 0.5)',
                              borderRadius: '12px',
                              border: '2px dashed rgba(226, 232, 240, 0.8)'
                            }}>
                              <TrendingUpIcon sx={{ fontSize: 80, mb: 3, opacity: 0.5, color: '#94a3b8' }} />
                              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#475569', mb: 2 }}>
                                No trend data available
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 400, mx: 'auto', mb: 3 }}>
                                Activity trends will appear here once sufficient data is collected over time. 
                                The system tracks daily activity patterns to show usage trends.
                              </Typography>
                              <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 1,
                                p: 2,
                                borderRadius: '8px',
                                background: 'rgba(71, 85, 105, 0.05)',
                                border: '1px solid rgba(71, 85, 105, 0.1)'
                              }}>
                                <InfoIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                  Data is collected automatically as users interact with the system
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} lg={4}>
                      <Stack spacing={3}>
                        {/* Popular Pages Card */}
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                        }}>
                          <CardHeader
                            title="Popular Pages"
                            titleTypographyProps={{ 
                              variant: 'h6', 
                              fontWeight: 700,
                              color: '#1e293b'
                            }}
                            avatar={
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                color: 'white'
                              }}>
                                <RouteIcon sx={{ fontSize: 24 }} />
                              </Box>
                            }
                            sx={{
                              borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                              background: 'rgba(248, 250, 252, 0.5)'
                            }}
                          />
                          <CardContent sx={{ p: 3 }}>
                            {popularPages && popularPages.length > 0 ? (
                              <List sx={{ p: 0 }}>
                                {popularPages.map((page, index) => (
                                  <ListItem key={page.pageUrl} sx={{ 
                                    px: 0, 
                                    py: 1.5,
                                    borderRadius: '8px',
                                    mb: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      background: 'rgba(71, 85, 105, 0.05)'
                                    }
                                  }}>
                                    <ListItemAvatar>
                                      <Avatar sx={{ 
                                        bgcolor: index < 3 ? '#475569' : '#94a3b8', 
                                        width: 36, 
                                        height: 36, 
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                      }}>
                                        {index + 1}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                          {page.pageUrl}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                          {page.visitCount} visits
                                        </Typography>
                                      }
                                    />
                                    <Chip 
                                      label={`#${index + 1}`} 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: index < 3 ? '#475569' : '#e2e8f0',
                                        color: index < 3 ? 'white' : '#64748b',
                                        fontWeight: 600,
                                        borderRadius: '6px'
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Box sx={{ 
                                textAlign: 'center', 
                                py: 4, 
                                color: '#64748b',
                                background: 'rgba(248, 250, 252, 0.5)',
                                borderRadius: '12px',
                                border: '2px dashed rgba(226, 232, 240, 0.8)'
                              }}>
                                <RouteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: '#94a3b8' }} />
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#475569' }}>
                                  No page data available
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  Popular pages will appear here once page views are tracked
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>

                        {/* Recent Activity Summary Card */}
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          boxShadow: '0 8px 32px rgba(71, 85, 105, 0.08)'
                        }}>
                          <CardHeader
                            title="Recent Activity Summary"
                            titleTypographyProps={{ 
                              variant: 'h6', 
                              fontWeight: 700,
                              color: '#1e293b'
                            }}
                            avatar={
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                color: 'white'
                              }}>
                                <TimelineIcon sx={{ fontSize: 24 }} />
                              </Box>
                            }
                            sx={{
                              borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                              background: 'rgba(248, 250, 252, 0.5)'
                            }}
                          />
                          <CardContent sx={{ p: 3 }}>
                            {stats.recentActivity && stats.recentActivity.length > 0 ? (
                              <List sx={{ p: 0 }}>
                                {stats.recentActivity.slice(0, 6).map((activity, index) => (
                                  <ListItem key={index} sx={{ 
                                    px: 0, 
                                    py: 1.5,
                                    borderRadius: '8px',
                                    mb: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      background: 'rgba(71, 85, 105, 0.05)'
                                    }
                                  }}>
                                    <ListItemAvatar>
                                      <Avatar 
                                        sx={{ 
                                          width: 36, 
                                          height: 36,
                                          bgcolor: `${getActivityColor(activity.activityType)}.main`,
                                          fontSize: '0.875rem',
                                          fontWeight: 600
                                        }}
                                      >
                                        {getActivityIcon(activity.module)}
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                          {activity.userName || 'Unknown User'}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                                          {activity.activityType} • {activity.module} • {formatTimestamp(activity.timestamp).relative}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Box sx={{ 
                                textAlign: 'center', 
                                py: 4, 
                                color: '#64748b',
                                background: 'rgba(248, 250, 252, 0.5)',
                                borderRadius: '12px',
                                border: '2px dashed rgba(226, 232, 240, 0.8)'
                              }}>
                                <TimelineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5, color: '#94a3b8' }} />
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#475569' }}>
                                  No recent activity
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  Recent activity summary will appear here
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Activity Details Dialog */}
          <Dialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Activity Details
              <IconButton
                onClick={() => setDetailDialogOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <ViewIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selectedActivity && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedActivity.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      User
                    </Typography>
                    <Typography variant="body1">
                      {selectedActivity.user?.userName || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {selectedActivity.user?.email || selectedActivity.userId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Activity Type
                    </Typography>
                    <Chip
                      label={selectedActivity.activityType}
                      color={getActivityColor(selectedActivity.activityType)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Module
                    </Typography>
                    <Typography variant="body1">
                      {selectedActivity.module}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Timestamp
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedActivity.timestamp).toLocaleString()}
                    </Typography>
                  </Grid>
                  {selectedActivity.entityType && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Entity Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.entityType}
                      </Typography>
                    </Grid>
                  )}
                  {selectedActivity.entityId && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Entity ID
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.entityId}
                      </Typography>
                    </Grid>
                  )}
                  {selectedActivity.details && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Details
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(selectedActivity.details, null, 2)}
                        </pre>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}