import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const PerformanceDashboard = ({ isOpen = true, onClose }) => {
  const [performanceData, setPerformanceData] = useState({
    memoryUsage: 0,
    renderCount: 0,
    slowRenders: 0,
    averageRenderTime: 0,
    components: []
  });
  const [expanded, setExpanded] = useState(false);

  const getMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }, []);

  const getPerformanceMetrics = useCallback(() => {
    const memory = getMemoryUsage();
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      memoryUsage: memory.used,
      memoryTotal: memory.total,
      memoryLimit: memory.limit,
      loadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.loadEventStart) : 0,
      domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart) : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    };
  }, [getMemoryUsage]);

  const refreshMetrics = useCallback(() => {
    const metrics = getPerformanceMetrics();
    setPerformanceData(prev => ({
      ...prev,
      ...metrics,
      lastUpdated: new Date().toLocaleTimeString()
    }));
  }, [getPerformanceMetrics]);

  useEffect(() => {
    if (isOpen) {
      refreshMetrics();
      const interval = setInterval(refreshMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, refreshMetrics]);

  const getMemoryStatus = () => {
    const usage = performanceData.memoryUsage / performanceData.memoryLimit;
    if (usage > 0.8) return { status: 'critical', color: 'error' };
    if (usage > 0.6) return { status: 'warning', color: 'warning' };
    return { status: 'good', color: 'success' };
  };

  const memoryStatus = getMemoryStatus();

  if (!isOpen) return null;

  // Determine if this is being used as a full page or overlay
  const isFullPage = !onClose; // If no onClose prop, it's being used as a full page

  return (
    <Card sx={{ 
      position: isFullPage ? 'static' : 'fixed', 
      top: isFullPage ? 'auto' : 20, 
      right: isFullPage ? 'auto' : 20, 
      width: isFullPage ? '100%' : 400, 
      maxWidth: isFullPage ? '1200px' : 'none',
      margin: isFullPage ? 'auto' : '0',
      zIndex: isFullPage ? 'auto' : 9999,
      boxShadow: isFullPage ? '0 4px 20px rgba(0,0,0,0.08)' : '0 8px 32px rgba(0,0,0,0.12)',
      borderRadius: '16px'
    }}>
      <CardContent sx={{ p: isFullPage ? 4 : 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant={isFullPage ? "h4" : "h6"} sx={{ fontWeight: 600 }}>
            {isFullPage ? "System Performance Dashboard" : "Performance Monitor"}
          </Typography>
          <Box>
            <IconButton size="small" onClick={refreshMetrics}>
              <RefreshIcon />
            </IconButton>
            {!isFullPage && (
            <IconButton size="small" onClick={onClose}>
              ×
            </IconButton>
            )}
          </Box>
        </Box>

        {isFullPage && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Real-time monitoring of system performance metrics including memory usage, load times, and rendering performance.
          </Typography>
        )}

        {!isFullPage && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontStyle: 'italic' }}>
            💡 Tip: Press Ctrl+M to toggle this overlay
          </Typography>
        )}

        {/* Memory Usage */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Memory Usage
            </Typography>
            <Chip 
              label={memoryStatus.status} 
              color={memoryStatus.color} 
              size="small"
              icon={<MemoryIcon />}
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(performanceData.memoryUsage / performanceData.memoryLimit) * 100}
            color={memoryStatus.color}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {performanceData.memoryUsage}MB / {performanceData.memoryLimit}MB
          </Typography>
        </Box>

        {/* Performance Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {performanceData.loadTime}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Load Time
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {performanceData.domContentLoaded}ms
              </Typography>
              <Typography variant="caption" color="text.secondary">
                DOM Ready
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Performance Alerts */}
        {performanceData.memoryUsage / performanceData.memoryLimit > 0.8 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            High memory usage detected! Consider refreshing the page.
          </Alert>
        )}

        {performanceData.slowRenders > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {performanceData.slowRenders} slow renders detected
          </Alert>
        )}

        {/* Detailed Metrics */}
        <Button
          fullWidth
          onClick={() => setExpanded(!expanded)}
          endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />}
          sx={{ mb: 1 }}
        >
          Detailed Metrics
        </Button>

        <Collapse in={expanded}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>First Paint</TableCell>
                  <TableCell align="right">{Math.round(performanceData.firstPaint)}ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>First Contentful Paint</TableCell>
                  <TableCell align="right">{Math.round(performanceData.firstContentfulPaint)}ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Memory</TableCell>
                  <TableCell align="right">{performanceData.memoryTotal}MB</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="right">{performanceData.lastUpdated}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>

        {/* Performance Tips */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Performance Tips:
          </Typography>
          <Typography variant="caption" display="block">
            • Close unused tabs to free memory
          </Typography>
          <Typography variant="caption" display="block">
            • Avoid keeping many components mounted
          </Typography>
          <Typography variant="caption" display="block">
            • Use lazy loading for large components
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;
