// EMERGENCY DEBUG VERSION - Use this if main Mechanic component is still hanging
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

const MechanicDebug = () => {
  const { userId, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    const log = (message) => {
      console.log(message);
      setDebugInfo(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
    };

    log('🔍 Component mounted');
    log(`🔑 userId: ${userId || 'null'}`);
    log(`🔐 isAuthenticated: ${isAuthenticated}`);
    log(`📦 localStorage authData: ${localStorage.getItem('authData') ? 'EXISTS' : 'MISSING'}`);

    // Force loading to stop after 2 seconds
    const timeout = setTimeout(() => {
      log('⏰ 2 seconds passed - forcing stop');
    }, 2000);

    return () => {
      clearTimeout(timeout);
      log('🧹 Component unmounted');
    };
  }, [userId, isAuthenticated]);

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🔧 Mechanic Debug Mode
      </Typography>
      
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f0f0', borderRadius: 2 }}>
        <Typography variant="h6">Current State:</Typography>
        <Typography>userId: {userId || 'null'}</Typography>
        <Typography>isAuthenticated: {String(isAuthenticated)}</Typography>
        <Typography>Auth Data: {localStorage.getItem('authData') ? 'Exists' : 'Missing'}</Typography>
      </Box>

      <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Debug Log:</Typography>
        {debugInfo.map((item, index) => (
          <Typography key={index} sx={{ fontFamily: 'monospace', fontSize: 12, mb: 0.5 }}>
            [{item.time}] {item.message}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default MechanicDebug;










