import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Collapse,
  Popper,
  Paper,
  MenuList,
  MenuItem,
  ClickAwayListener
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  Assignment as AssignmentIcon,
  LocalGasStation as FuelIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Route as RouteIcon,
  Assessment as ReportsIcon,
  Security as SecurityIcon,
  Create as CreateIcon,
  ListAlt as ListIcon,
  History as HistoryIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Sidebar({ onSidebarToggle }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [flyoutAnchor, setFlyoutAnchor] = useState(null);
  const [flyoutItems, setFlyoutItems] = useState([]);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();

  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
    // Close flyout when sidebar is toggled
    if (newState) {
      setFlyoutOpen(false);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setFlyoutOpen(false); // Close flyout after navigation
  };

  const handleFlyoutOpen = (event, item) => {
    if (!sidebarExpanded && item.hasSubmenu) {
      setFlyoutAnchor(event.currentTarget);
      setFlyoutItems(item.subItems);
      setFlyoutOpen(true);
    } else if (sidebarExpanded) {
      // Normal dropdown behavior when expanded
      if (item.text === 'Requests') {
        setMaintenanceOpen(!maintenanceOpen);
      } else if (item.text === 'Admin') {
        setAdminOpen(!adminOpen);
      }
    }
  };

  const handleFlyoutClose = () => {
    setFlyoutOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Menu configuration
  let menuItems = [
    { path: '/vehicles', icon: <CarIcon />, label: 'Vehicles', roles: ['Admin'] },
  ];

  if (hasRole('Admin')) {
    menuItems.unshift({
      path: '/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      roles: ['Admin'],
    });
  } else if (hasRole('User')) {
    menuItems.unshift({
      path: '/userdashboard',
      icon: <DashboardIcon />,
      label: 'User Dashboard',
      roles: ['User'],
    });
  }

  const maintenanceMenuItems = [
    { path: '/maintenance', icon: <BuildIcon />, label: 'Maintenance Requests' },
    { path: '/requestsss', icon: <AssignmentIcon />, label: 'Vehicle Requests' },
  ];

  const adminMenuItems = [
    { path: '/admin/users', icon: <PeopleIcon />, label: 'User Management' },
    { path: '/admin/roles', icon: <SecurityIcon />, label: 'Role Management' },
    { path: '/admin/routes', icon: <RouteIcon />, label: 'Routes' },
    { path: '/admin/audit', icon: <CalendarIcon />, label: 'Audit Log' },
    { path: '/admin/logger', icon: <FuelIcon />, label: 'Fuel Logger' },
    { path: '/schedule', icon: <CalendarIcon />, label: 'Schedule' },
  ];

  const authData = JSON.parse(localStorage.getItem('authData'));
  const hasRouteRoles = Array.isArray(authData?.routeRoles) && authData.routeRoles.length > 0;
  const shouldShowRequestsMenu = hasRole('Admin') || hasRouteRoles;

  const drawerWidth = sidebarExpanded ? 280 : 70;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        height: 'calc(100vh - 64px)',
        top: '64px',
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          height: 'calc(100vh - 64px)',
          top: '64px',
          backgroundColor: '#000000',
          color: '#ffffff',
          borderRight: '1px solid #333333',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '& *::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }
      }}
    >
      {/* Header Section */}
      <Box sx={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        borderBottom: '1px solid #333333',
        flexShrink: 0,
        backgroundColor: '#111111'
      }}>
        <IconButton
          onClick={toggleSidebar}
                  sx={{
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            width: 36,
            height: 36,
                    '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <i className={sidebarExpanded ? "bi bi-layout-sidebar-inset-reverse" : "bi bi-layout-sidebar-inset"} style={{ fontSize: '1.1rem' }}></i>
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1, overflowY: 'auto' }}>
        {menuItems.map((item) =>
          item.roles.some(role => hasRole(role)) && (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={!sidebarExpanded ? item.label : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    height: 52,
                    borderRadius: '12px',
                    mx: 0.5,
                    backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: isActive(item.path) ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateX(8px) translateY(-2px) scale(1.05) rotate(1deg)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                      filter: 'brightness(1.1)'
                    },
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    // Ensure consistent positioning when collapsed
                    ...(sidebarExpanded ? {} : {
                      justifyContent: 'center',
                      minWidth: 'auto',
                      width: '100%'
                    })
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: sidebarExpanded ? 44 : 40,
                    color: isActive(item.path) ? '#ffffff' : '#cccccc',
                    // Center icon when collapsed
                    ...(sidebarExpanded ? {} : {
                      margin: 0,
                      display: 'flex',
                      justifyContent: 'center'
                    })
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {sidebarExpanded && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: isActive(item.path) ? 600 : 500,
                          color: isActive(item.path) ? '#ffffff' : '#cccccc',
                          letterSpacing: '0.3px'
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        )}

        {shouldShowRequestsMenu && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={(event) => {
                  if (!sidebarExpanded) {
                    setFlyoutAnchor(event.currentTarget);
                    setFlyoutItems(maintenanceMenuItems);
                    setFlyoutOpen(true);
                  } else {
                    setMaintenanceOpen(!maintenanceOpen);
                  }
                }}
                sx={{
                  height: 52,
                  borderRadius: '12px',
                  mx: 0.5,
                  backgroundColor: maintenanceOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: maintenanceOpen ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: maintenanceOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: maintenanceOpen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(8px) translateY(-2px) scale(1.05) rotate(1deg)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    filter: 'brightness(1.1)'
                  },
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  // Ensure consistent positioning when collapsed
                  ...(sidebarExpanded ? {} : {
                    justifyContent: 'center',
                    minWidth: 'auto',
                    width: '100%'
                  })
                }}
              >
                <ListItemIcon sx={{
                  minWidth: sidebarExpanded ? 44 : 40,
                  color: maintenanceOpen ? '#ffffff' : '#cccccc',
                  // Center icon when collapsed
                  ...(sidebarExpanded ? {} : {
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'center'
                  })
                }}>
                  <BuildIcon />
                </ListItemIcon>
                {sidebarExpanded && (
                  <>
                    <ListItemText
                      primary="Requests"
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: maintenanceOpen ? 600 : 500,
                          color: maintenanceOpen ? '#ffffff' : '#cccccc',
                          letterSpacing: '0.3px'
                        }
                      }}
                    />
                    {maintenanceOpen ? (
                      <ExpandLessIcon sx={{ color: '#999999', fontSize: 20 }} />
                    ) : (
                      <ExpandMoreIcon sx={{ color: '#999999', fontSize: 20 }} />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            {sidebarExpanded && (
              <Collapse in={maintenanceOpen}>
                <List component="div" disablePadding>
                  {maintenanceMenuItems.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigation(subItem.path)}
                        sx={{
                          height: 44,
                          borderRadius: '10px',
                          mx: 0.5,
                          ml: 3,
                          backgroundColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: isActive(subItem.path) ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                          '&:hover': {
                            backgroundColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            borderColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                            transform: 'translateX(12px) translateY(-3px) scale(1.08) rotate(2deg)',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                            filter: 'brightness(1.15)'
                          },
                          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        <ListItemIcon sx={{
                          minWidth: sidebarExpanded ? 44 : 40,
                          color: isActive(subItem.path) ? '#ffffff' : '#cccccc',
                          // Center icon when collapsed
                          ...(sidebarExpanded ? {} : {
                            margin: 0,
                            display: 'flex',
                            justifyContent: 'center'
                          })
                        }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem',
                              fontWeight: isActive(subItem.path) ? 500 : 400,
                              color: isActive(subItem.path) ? '#ffffff' : '#aaaaaa',
                              letterSpacing: '0.2px'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </>
        )}

        {hasRole('Admin') && (
          <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={(event) => {
                  if (!sidebarExpanded) {
                    setFlyoutAnchor(event.currentTarget);
                    setFlyoutItems(adminMenuItems);
                    setFlyoutOpen(true);
                  } else {
                    setAdminOpen(!adminOpen);
                  }
                }}
                sx={{
                  height: 52,
                  borderRadius: '12px',
                  mx: 0.5,
                  backgroundColor: adminOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: adminOpen ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: adminOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: adminOpen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(8px) translateY(-2px) scale(1.05) rotate(1deg)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                    filter: 'brightness(1.1)'
                  },
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  // Ensure consistent positioning when collapsed
                  ...(sidebarExpanded ? {} : {
                    justifyContent: 'center',
                    minWidth: 'auto',
                    width: '100%'
                  })
                }}
              >
                <ListItemIcon sx={{
                  minWidth: sidebarExpanded ? 44 : 40,
                  color: adminOpen ? '#ffffff' : '#cccccc',
                  // Center icon when collapsed
                  ...(sidebarExpanded ? {} : {
                    margin: 0,
                    display: 'flex',
                    justifyContent: 'center'
                  })
                }}>
                  <SecurityIcon />
                </ListItemIcon>
                {sidebarExpanded && (
                  <>
                    <ListItemText
                      primary="Admin"
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem',
                          fontWeight: adminOpen ? 600 : 500,
                          color: adminOpen ? '#ffffff' : '#cccccc',
                          letterSpacing: '0.3px'
                        }
                      }}
                    />
                    {adminOpen ? (
                      <ExpandLessIcon sx={{ color: '#999999', fontSize: 20 }} />
                    ) : (
                      <ExpandMoreIcon sx={{ color: '#999999', fontSize: 20 }} />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            {sidebarExpanded && (
              <Collapse in={adminOpen}>
                <List component="div" disablePadding>
                  {adminMenuItems.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigation(subItem.path)}
                        sx={{
                          height: 44,
                          borderRadius: '10px',
                          mx: 0.5,
                          ml: 3,
                          backgroundColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                          border: isActive(subItem.path) ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                          '&:hover': {
                            backgroundColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                            borderColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
                            transform: 'translateX(6px) scale(1.03)',
                            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)'
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <ListItemIcon sx={{
                          minWidth: sidebarExpanded ? 44 : 40,
                          color: isActive(subItem.path) ? '#ffffff' : '#cccccc',
                          // Center icon when collapsed
                          ...(sidebarExpanded ? {} : {
                            margin: 0,
                            display: 'flex',
                            justifyContent: 'center'
                          })
                        }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem',
                              fontWeight: isActive(subItem.path) ? 500 : 400,
                              color: isActive(subItem.path) ? '#ffffff' : '#aaaaaa',
                              letterSpacing: '0.2px'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </>
        )}
      </List>

      {/* Flyout Menu for Collapsed Sidebar */}
      <Popper
        open={flyoutOpen && !sidebarExpanded}
        anchorEl={flyoutAnchor}
        placement="right-start"
        sx={{
          zIndex: 1300,
          mt: 1
        }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 0],
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleFlyoutClose}>
          <Paper
            elevation={8}
            sx={{
              minWidth: 220,
              maxWidth: 280,
              borderRadius: '12px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              '& .MuiMenuList-root': {
                padding: 0
              }
            }}
          >
            <Box sx={{
              p: 2,
              borderBottom: '1px solid #333333',
              backgroundColor: '#111111'
            }}>
              <Typography sx={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '0.5px'
              }}>
                {flyoutItems.length > 0 && flyoutItems[0]?.label?.includes('Request') ? 'Requests' : 'Admin'}
              </Typography>
            </Box>
            <MenuList sx={{ py: 1 }}>
              {flyoutItems.map((subItem, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleNavigation(subItem.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    mx: 1,
                    mb: 0.5,
                    borderRadius: '8px',
                    backgroundColor: isActive(subItem.path) ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: isActive(subItem.path) ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive(subItem.path) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isActive(subItem.path) ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'
                    },
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box sx={{
                    color: isActive(subItem.path) ? '#3b82f6' : '#cccccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24
                  }}>
                    {subItem.icon}
                  </Box>
                  <Typography sx={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(subItem.path) ? 600 : 500,
                    color: isActive(subItem.path) ? '#ffffff' : '#cccccc',
                    letterSpacing: '0.2px'
                  }}>
                    {subItem.label}
                  </Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>

    </Drawer>
  );
}