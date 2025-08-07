import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Link, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbName = (path) => {
    const nameMap = {
      'admin': 'Admin',
      'assignments': 'Assignments',
      'maintenance': 'Maintenance',
      'vehicles': 'Vehicles',
      'approvals': 'Approvals',
      'dashboard': 'Dashboard',
      'users': 'Users',
      'fuel': 'Fuel Management',
      'reports': 'Schedules',
      'settings': 'Settings',
      'profile': 'Profile',
      'new': 'New',
      'users': 'Users',
      'view': 'View',
      'details': 'Details',
      'roles': 'User Roles',
      'routes': 'Routes',
      'audit': 'Audit Log',
      'logger': 'Fuel Logger',
      'schedule': 'Schedule'
    };
    return nameMap[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <Box sx={{ 
      py: 0.5, 
      px: 1, 
      backgroundColor: 'transparent',
      height: '24px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ fontSize: '14px', color: '#666' }} />}
        sx={{
          '& .MuiBreadcrumbsseparator': {
            mx: 0.5
          }
        }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            fontSize: '12px',
            color: '#666',
            '&:hover': {
              color: '#333'
            }
          }}
        >
          <HomeIcon sx={{ fontSize: '14px', mr: 0.5 }} />
          Home
        </Link>
        
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return last ? (
            <Typography
              key={to}
              sx={{
                fontSize: '12px',
                color: '#333',
                fontWeight: 500
              }}
            >
              {getBreadcrumbName(value)}
            </Typography>
          ) : (
            <Link
              component={RouterLink}
              color="inherit"
              to={to}
              key={to}
              sx={{
                textDecoration: 'none',
                fontSize: '12px',
                color: '#666',
                '&:hover': {
                  color: '#333'
                }
              }}
            >
              {getBreadcrumbName(value)}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
