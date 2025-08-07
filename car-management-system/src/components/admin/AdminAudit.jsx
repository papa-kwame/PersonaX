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
  Home as HomeIcon, Analytics as AnalyticsIcon, Settings as SettingsIcon
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
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Most Active Users
                    </Typography>
                    <List>
                      {mostActiveUsers.map((user, index) => (
                        <ListItem key={user.userId}>
                          <ListItemAvatar>
                            <Avatar>{user.userName?.charAt(0) || 'U'}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.userName || `User ${user.userId.substring(0, 8)}...`}
                            secondary={`${user.activityCount} activities • ${user.userEmail || user.userId.substring(0, 8)}...`}
                          />
                          <Chip label={new Date(user.lastActivity).toLocaleDateString()} size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Popular Pages
                    </Typography>
                    <List>
                      {popularPages.map((page, index) => (
                        <ListItem key={page.pageUrl}>
                          <ListItemAvatar>
                            <Avatar>{index + 1}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={page.pageUrl}
                            secondary={`${page.visitCount} visits`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              )}

              {/* Module Analytics Tab */}
              {activeTab === 2 && (
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                          title="Activity by Module"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 600,
                            color: 'grey.800'
                          }}
                          avatar={<AssessmentIcon color="primary" />}
                        />
                        <CardContent>
                          {stats.moduleStats && stats.moduleStats.length > 0 ? (
                            <Box>
                              {stats.moduleStats.map((module, index) => (
                                <Box key={module.module} sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Box sx={{ mr: 1, color: 'grey.600' }}>
                                        {getActivityIcon(module.module)}
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'grey.800' }}>
                                        {module.module}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      {module.count}
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(module.count / (stats.totalActivities || 1)) * 100}
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      backgroundColor: 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, ${getModuleColor(module.module)} 0%, ${getModuleColor(module.module)}dd 100%)`
                                      }
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'grey.500' }}>
                              <AssessmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                              <Typography variant="h6" gutterBottom>
                                No module data available
                              </Typography>
                              <Typography variant="body2">
                                Module statistics will appear here once activities are logged
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                          title="Activity Types Distribution"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 600,
                            color: 'grey.800'
                          }}
                          avatar={<TimelineIcon color="primary" />}
                        />
                        <CardContent>
                          {stats.activityTypeStats && stats.activityTypeStats.length > 0 ? (
                            <Box>
                              {stats.activityTypeStats.map((type, index) => (
                                <Box key={type.activityType} sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Chip
                                        label={type.activityType}
                                        color={getActivityColor(type.activityType)}
                                        size="small"
                                        sx={{ mr: 1, fontWeight: 600 }}
                                      />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      {type.count}
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={(type.count / (stats.totalActivities || 1)) * 100}
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 4,
                                      backgroundColor: 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        backgroundColor: `${getActivityColor(type.activityType)}.main`
                                      }
                                    }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'grey.500' }}>
                              <TimelineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                              <Typography variant="h6" gutterBottom>
                                No activity type data available
                              </Typography>
                              <Typography variant="body2">
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
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card>
                        <CardHeader
                          title="Activity Trends (Last 30 Days)"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 600,
                            color: 'grey.800'
                          }}
                          avatar={<TrendingUpIcon color="primary" />}
                        />
                        <CardContent>
                          {activityTrends && activityTrends.length > 0 ? (
                            <Grid container spacing={2}>
                              {activityTrends.slice(0, 12).map((trend, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={trend.date}>
                                  <Card 
                                    variant="outlined" 
                                    sx={{ 
                                      height: '100%',
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'grey.800', mb: 1 }}>
                                        {trend.date}
                                      </Typography>
                                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                                        {trend.count}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        activities
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 6, color: 'grey.500' }}>
                              <TrendingUpIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                              <Typography variant="h6" gutterBottom>
                                No trend data available
                              </Typography>
                              <Typography variant="body2">
                                Activity trends will appear here once sufficient data is collected
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader
                          title="Popular Pages"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 600,
                            color: 'grey.800'
                          }}
                          avatar={<RouteIcon color="primary" />}
                        />
                        <CardContent>
                          {popularPages && popularPages.length > 0 ? (
                            <List sx={{ p: 0 }}>
                              {popularPages.map((page, index) => (
                                <ListItem key={page.pageUrl} sx={{ px: 0, py: 1 }}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.75rem' }}>
                                      {index + 1}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.800' }}>
                                        {page.pageUrl}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="caption" color="textSecondary">
                                        {page.visitCount} visits
                                      </Typography>
                                    }
                                  />
                                  <Chip 
                                    label={`#${index + 1}`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'grey.500' }}>
                              <RouteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                              <Typography variant="h6" gutterBottom>
                                No page data available
                              </Typography>
                              <Typography variant="body2">
                                Popular pages will appear here once page views are tracked
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardHeader
                          title="Recent Activity Summary"
                          titleTypographyProps={{ 
                            variant: 'h6', 
                            fontWeight: 600,
                            color: 'grey.800'
                          }}
                          avatar={<TimelineIcon color="primary" />}
                        />
                        <CardContent>
                          {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            <List sx={{ p: 0 }}>
                              {stats.recentActivity.slice(0, 8).map((activity, index) => (
                                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                  <ListItemAvatar>
                                    <Avatar 
                                      sx={{ 
                                        width: 32, 
                                        height: 32,
                                        bgcolor: `${getActivityColor(activity.activityType)}.main`,
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {getActivityIcon(activity.module)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.800' }}>
                                        {activity.userName || 'Unknown User'}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="caption" color="textSecondary">
                                        {activity.activityType} • {activity.module} • {formatTimestamp(activity.timestamp).relative}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'grey.500' }}>
                              <TimelineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                              <Typography variant="h6" gutterBottom>
                                No recent activity
                              </Typography>
                              <Typography variant="body2">
                                Recent activity summary will appear here
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
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