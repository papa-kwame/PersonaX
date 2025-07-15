import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DashboardIcon from '@mui/icons-material/Speed';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import SecurityIcon from '@mui/icons-material/Security';
import RouteIcon from '@mui/icons-material/AltRoute';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function Sidebar({ className = "" }) {
  const location = useLocation();
  const { hasRole } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({
    admin: false,
    maintenance: false
  });

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Menu configuration
  let menuItems = [
    { path: '/vehicles', icon: <DirectionsCarIcon />, label: 'Vehicles', roles: ['Admin'] },
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
    { path: '/admin/users', icon: <GroupIcon />, label: 'User Management' },
    { path: '/admin/roles', icon: <SecurityIcon />, label: 'Role Management' },
    { path: '/admin/routes', icon: <RouteIcon />, label: 'Routes' },
    { path: '/admin/logger', icon: <LocalGasStationIcon />, label: 'Fuel Logger' },
    { path: '/schedule', icon: <CalendarTodayIcon />, label: 'Schedule' },
  ];

  const authData = JSON.parse(localStorage.getItem('authData'));
  const hasRouteRoles = Array.isArray(authData?.routeRoles) && authData.routeRoles.length > 0;
  const shouldShowRequestsMenu = hasRole('Admin') || hasRouteRoles;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{
        sx: {
          width: 280,
          background: '#111',
          color: '#fff',
          borderRight: 'none',
          boxShadow: 3,
          position: 'sticky',
          top: 0,
          height: '100vh',
          [`& .MuiDrawer-paper`]: {
            width: 280,
            boxSizing: 'border-box',
            background: '#111',
            color: '#fff',
            borderRight: 'none',
            boxShadow: 3,
            position: 'sticky',
            top: 0,
            height: '100vh',
          },
        },
      }}
      className={className}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%'  }}>

        <List sx={{ pt: 1, pb: 1 ,mt: 7}}>
          {menuItems.map((item) =>
            item.roles.some(role => hasRole(role)) && (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 ,  width: '80%'}}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    width: '100%',
                    mx: 'auto',
                    borderRadius: 999,
                    px: 2.5,
                    py: 1.2,
                    color: isActive(item.path) ? '#fff' : '#eee',
                    background: isActive(item.path) ? '#fff' : 'none',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    boxShadow: isActive(item.path) ? 1 : 0,
                    '&:hover': {
                      background: isActive(item.path) ? '#222' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(item.path) ? '#fff' : '#eee', minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          )}

          {shouldShowRequestsMenu && (
            <>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => toggleMenu('maintenance')}
                  sx={{
                    width: '80%',
                    mx: 'auto',
                    borderRadius: 999,
                    px: 2.5,
                    py: 1.2,
                    color: expandedMenus.maintenance ? '#fff' : '#eee',
                    background: expandedMenus.maintenance ? '#222' : 'none',
                    fontWeight: expandedMenus.maintenance ? 700 : 500,
                    boxShadow: expandedMenus.maintenance ? 1 : 0,
                    '&:hover': {
                      background: expandedMenus.maintenance ? '#222' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: expandedMenus.maintenance ? '#fff' : '#fff', minWidth: 36 }}>
                    <BuildIcon />
                  </ListItemIcon>
                  <ListItemText primary="Requests" />
                  {expandedMenus.maintenance ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedMenus.maintenance} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 0, ml: 0 }}>
                  {maintenanceMenuItems.map((item, idx) => (
                    <Box key={item.path} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ width: 18, minWidth: 18, height: 70, borderLeft: idx === 0 ? '2px solid #222' : '2px solid #222', ml: 3, mr: 1, opacity: 0.7 }} />
                      <ListItem disablePadding sx={{ mb: 1, width: 'calc(80% - 18px)' }}>
                        <ListItemButton
                          component={Link}
                          to={item.path}
                          selected={isActive(item.path)}
                          sx={{
                            width: '100%',
                            borderRadius: 999,
                            px: 2,
                            py: 1,
                            color: isActive(item.path) ? '#fff' : '#fff',
                            background: isActive(item.path) ? '#fff' : 'none',
                            fontWeight: isActive(item.path) ? 700 : 500,
                            fontSize: '0.97rem',
                            '&:hover': {
                              background: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.08)',
                              color: '#fff',
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          <ListItemIcon sx={{ color: isActive(item.path) ? '#111' : '#bbb', minWidth: 36 }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {hasRole('Admin') && (
            <>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => toggleMenu('admin')}
                  sx={{
                    width: '80%',
                    mx: 'auto',
                    borderRadius: 999,
                    px: 2.5,
                    py: 1.2,
                    color: expandedMenus.admin ? '#fff' : '#eee',
                    background: expandedMenus.admin ? '#222' : 'none',
                    fontWeight: expandedMenus.admin ? 700 : 500,
                    boxShadow: expandedMenus.admin ? 1 : 0,
                    '&:hover': {
                      background: expandedMenus.admin ? '#222' : 'rgba(255,255,255,0.08)',
                      color: '#fff',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: expandedMenus.admin ? '#fff' : '#eee', minWidth: 36 }}>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin" />
                  {expandedMenus.admin ? <ExpandLess sx={{ color: '#fff' }} /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedMenus.admin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 0, ml: 0 }}>
                  {adminMenuItems.map((item, idx) => (
                    <Box key={item.path} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ width: 18, minWidth: 18, height: 60, borderLeft: idx === 0 ? '2px solid #222' : '2px solid #222', ml: 3, mr: 1, opacity: 0.7 }} />
                      <ListItem disablePadding sx={{ mb: 1, width: 'calc(80% - 18px)' }}>
                        <ListItemButton
                          component={Link}
                          to={item.path}
                          selected={isActive(item.path)}
                          sx={{
                            width: '100%',
                            borderRadius: 999,
                            px: 2,
                            py: 1,
                            color: isActive(item.path) ? '#fff' : '#fff',
                            background: isActive(item.path) ? '#fff' : 'none',
                            fontWeight: isActive(item.path) ? 700 : 500,
                            fontSize: '0.97rem',
                            '&:hover': {
                              background: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.08)',
                              color: '#fff',
                            },
                            transition: 'all 0.2s',
                          }}
                        >
                          <ListItemIcon sx={{ color: isActive(item.path) ? '#111' : '#bbb', minWidth: 36 }}>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.label} />
                        </ListItemButton>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ my: 2 }} />
        <Box sx={{ px: 3, py: 2, color: 'text.secondary', fontSize: '0.85rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <i className="bi bi-info-circle" style={{ marginRight: 8 }}></i>
            <span>v1.0.0</span>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}