import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Collapse
} from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
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
  History as HistoryIcon
} from '@mui/icons-material';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Sidebar({ onSidebarToggle }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    if (onSidebarToggle) {
      onSidebarToggle(newState);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <SpeedIcon />,
      path: '/dashboard',
      primary: true
    },
    {
      text: 'Vehicles',
      icon: <CarIcon />,
      path: '/vehicles',
      primary: true
    },
    {
      text: 'Requests',
      icon: <AssignmentIcon />,
      path: '/maintenance',
      hasSubmenu: true,
      subItems: [
        { text: 'Maintenance Request', path: '/maintenance', icon: <CreateIcon /> },
        { text: 'Vehicle Requests', path: '/requestsss', icon: <ListIcon /> }
      ]
    },
    {
      text: 'Admin',
      icon: <AdminIcon />,
      path: '/admin',
      hasSubmenu: true,
      subItems: [
        { text: 'User Management', path: '/admin/users', icon: <PeopleIcon /> },
        { text: 'Role Management', path: '/admin/roles', icon: <SecurityIcon /> },
        { text: 'Route Management', path: '/admin/routes', icon: <RouteIcon /> },
        { text: 'Reports', path: '/schedule', icon: <ReportsIcon /> },
        { text: 'Audit Logs', path: '/admin/audit', icon: <HistoryIcon /> }
      ]
    }
  ];

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
          position: 'fixed'
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
        {menuItems.map((item, index) => (
          <Box key={item.text}>
            {item.hasSubmenu ? (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                    onClick={() => {
                      if (item.text === 'Requests') {
                        setMaintenanceOpen(!maintenanceOpen);
                      } else if (item.text === 'Admin') {
                        setAdminOpen(!adminOpen);
                      }
                    }}
                  sx={{
                      height: 52,
                      borderRadius: '12px',
                      mx: 0.5,
                      backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      border: isActive(item.path) ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                    '&:hover': {
                        backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                      },
                      transition: 'all 0.2s ease',
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
                      <>
                        <ListItemText
                          primary={item.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.9rem',
                              fontWeight: isActive(item.path) ? 600 : 500,
                              color: isActive(item.path) ? '#ffffff' : '#cccccc',
                              letterSpacing: '0.3px'
                            }
                          }}
                        />
                        {(item.text === 'Requests' ? maintenanceOpen : adminOpen) ? (
                          <ExpandLessIcon sx={{ color: '#999999', fontSize: 20 }} />
                        ) : (
                          <ExpandMoreIcon sx={{ color: '#999999', fontSize: 20 }} />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>
                {sidebarExpanded && (
                  <Collapse in={item.text === 'Requests' ? maintenanceOpen : adminOpen}>
                    <List sx={{ pl: 2, pt: 0.5 }}>
                      {item.subItems.map((subItem) => (
                        <ListItem key={subItem.text} disablePadding sx={{ mb: 0.25 }}>
                          <ListItemButton
                            onClick={() => handleNavigation(subItem.path)}
                            sx={{
                              height: 44,
                              borderRadius: '10px',
                              mx: 0.5,
                              backgroundColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                              border: isActive(subItem.path) ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                              '&:hover': {
                                backgroundColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                borderColor: isActive(subItem.path) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)'
                              },
                              transition: 'all 0.2s ease'
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
                              primary={subItem.text}
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
            ) : (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <Tooltip
                  title={!sidebarExpanded ? item.text : ''}
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
                        borderColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                      },
                      transition: 'all 0.2s ease',
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
                        primary={item.text}
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
            )}
                    </Box>
                  ))}
                </List>

    </Drawer>
  );
}