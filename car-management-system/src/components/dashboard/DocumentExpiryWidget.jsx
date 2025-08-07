import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Button,
  Badge
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DocumentExpiryWidget = ({ sidebarExpanded = true }) => {
  const [expiryData, setExpiryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVehicles, setExpandedVehicles] = useState(new Set());
  const [daysThreshold, setDaysThreshold] = useState(30);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/Vehicles/document-expiry?days=${daysThreshold}`);
      setExpiryData(response.data);
    } catch (err) {
      setError('Failed to fetch document expiry data');
      console.error('Error fetching expiry data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryData();
  }, [daysThreshold]);

  const toggleVehicleExpansion = (vehicleId) => {
    const newExpanded = new Set(expandedVehicles);
    if (newExpanded.has(vehicleId)) {
      newExpanded.delete(vehicleId);
    } else {
      newExpanded.add(vehicleId);
    }
    setExpandedVehicles(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Expired':
        return 'error';
      case 'Critical':
        return 'error';
      case 'Warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Expired':
      case 'Critical':
        return <ErrorIcon />;
      case 'Warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getDocumentIcon = (documentType) => {
    switch (documentType) {
      case 'Service Due':
        return <AssignmentIcon />;
      case 'Registration':
        return <CarIcon />;
      case 'Insurance':
        return <InfoIcon />;
      case 'Roadworthy Certificate':
        return <ScheduleIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCriticalCount = () => {
    return expiryData.reduce((count, vehicle) => {
      return count + vehicle.expiringDocuments.filter(doc => 
        doc.status === 'Expired' || doc.status === 'Critical'
      ).length;
    }, 0);
  };

  const getWarningCount = () => {
    return expiryData.reduce((count, vehicle) => {
      return count + vehicle.expiringDocuments.filter(doc => 
        doc.status === 'Warning'
      ).length;
    }, 0);
  };

  if (loading) {
    return (
      <Card sx={{ 
        width: sidebarExpanded ? '650px' : '750px', 
        height: '426px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out'
      }}>
        <CardContent sx={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ 
        width: sidebarExpanded ? '650px' : '750px', 
        height: '426px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out'
      }}>
        <CardContent sx={{ flex: 1 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchExpiryData}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = getCriticalCount();
  const warningCount = getWarningCount();

  return (
    <Card sx={{ 
      width: sidebarExpanded ? '650px' : '750px', 
      height: '426px',
      display: 'flex',
      marginBottom:'30px',
      flexDirection: 'column',
      transition: 'width 0.3s ease-in-out'
    }}>
      <CardContent sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        p: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Document Expiry
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={fetchExpiryData}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {criticalCount > 0 && (
            <Chip
              icon={<ErrorIcon />}
              label={`${criticalCount} Critical`}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
          {warningCount > 0 && (
            <Chip
              icon={<WarningIcon />}
              label={`${warningCount} Warnings`}
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
          <Chip
            label={`${expiryData.length} Vehicles`}
            color="info"
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Vehicle List */}
        {expiryData.length === 0 ? (
          <Box textAlign="center" py={4}>
            <CarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No documents expiring in the next {daysThreshold} days
            </Typography>
          </Box>
        ) : (
          <List sx={{ 
            flex: 1, 
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            {expiryData.map((vehicle, index) => {
              const criticalDocs = vehicle.expiringDocuments.filter(doc => 
                doc.status === 'Expired' || doc.status === 'Critical'
              );
              const hasCritical = criticalDocs.length > 0;

              return (
                <React.Fragment key={vehicle.vehicleId}>
                  <ListItem 
                    sx={{ 
                      px: 0.9, 
                      py: 1,
                      backgroundColor: hasCritical ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={vehicle.expiringDocuments.length}
                        color={hasCritical ? "error" : "warning"}
                        max={99}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: hasCritical ? 'error.main' : 'warning.main',
                            width: 40,
                            height: 40
                          }}
                        >
                          <CarIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {vehicle.make} {vehicle.model}
                          </Typography>
                          {hasCritical && (
                            <Chip
                              label="Critical"
                              color="error"
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.licensePlate} • {vehicle.expiringDocuments.length} document(s) expiring
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => toggleVehicleExpansion(vehicle.vehicleId)}
                    >
                      {expandedVehicles.has(vehicle.vehicleId) ? 
                        <ExpandLessIcon /> : <ExpandMoreIcon />
                      }
                    </IconButton>
                  </ListItem>

                  <Collapse in={expandedVehicles.has(vehicle.vehicleId)}>
                    <Box sx={{ pl: 6, pr: 2, pb: 1 }}>
                      {vehicle.expiringDocuments.map((doc, docIndex) => (
                        <Box key={docIndex} sx={{ mb: 1 }}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: doc.status === 'Expired' || doc.status === 'Critical' 
                                  ? '#f44336' : '#ff9800'
                              }}
                            />
                            <Typography variant="body2" fontWeight={500}>
                              {doc.documentType}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(doc.status)}
                              label={doc.status}
                              color={getStatusColor(doc.status)}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Expires: {formatDate(doc.expiryDate)} 
                            {doc.daysUntilExpiry < 0 
                              ? ` (${Math.abs(doc.daysUntilExpiry)} days overdue)`
                              : doc.daysUntilExpiry === 0
                              ? ' (Today)'
                              : ` (in ${doc.daysUntilExpiry} days)`
                            }
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>

                  {index < expiryData.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
        )}

        {/* View All Button */}
        {expiryData.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
  <Button
              component={Link}
              to="/vehicles"
    size="small"
              endIcon={<CarIcon />}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              View All Vehicles
  </Button>
</Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentExpiryWidget; 