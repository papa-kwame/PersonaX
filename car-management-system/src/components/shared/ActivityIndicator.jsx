import React, { useState, useEffect } from 'react';
import { Box, Tooltip } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';

const ActivityIndicator = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsActive(true);
    }

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      const token = localStorage.getItem('authToken');
      setIsActive(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isActive) return null;

  return (
    <Tooltip title="You are currently active">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
        }}
      >
        <FiberManualRecord 
          sx={{ 
            fontSize: 8, 
            color: '#4caf50',
            animation: 'pulse 2s infinite'
          }} 
        />
        <Box
          component="span"
          sx={{
            fontSize: '0.75rem',
            color: '#4caf50',
            fontWeight: 500,
          }}
        >
          Active
        </Box>
      </Box>
    </Tooltip>
  );
};

export default ActivityIndicator; 