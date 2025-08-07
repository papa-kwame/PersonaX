import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, Divider, Tooltip, alpha, TextField, DialogContentText, CircularProgress, LinearProgress
} from '@mui/material';
import {
  DirectionsCar as CarIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon,
  CalendarToday as CalendarIcon, Engineering as EngineeringIcon, Receipt as ReceiptIcon,
  MonetizationOn as MoneyIcon, Notes as NotesIcon, Schedule as ScheduleIcon,
  Warning as WarningIcon, CheckCircle as CheckIcon, Cancel as CancelIcon,
  Info as InfoIcon, ColorLens as ColorLensIcon, LocalGasStation as LocalGasStationIcon,
  Save as SaveIcon, WarningAmberOutlined as AlertTriangleIcon, Timer as ClockIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const COLORS = {
  PRIMARY: '#1a1a1a',
  SECONDARY: '#6366f1',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  BACKGROUND: '#f8fafc',
  TEXT_PRIMARY: '#1e293b',
  TEXT_SECONDARY: '#64748b',
  DIVIDER: '#e2e8f0',
  WHITE: '#ffffff',
  BLACK: '#000000',
  CARD_BG: '#ffffff',
  CARD_BORDER: '#f1f5f9'
};

export default function VehicleShowModal({ vehicle, open, onClose, onEdit, onDelete }) {
  const [editDocumentModal, setEditDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editDate, setEditDate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const daysUntilExpiry = (dateString) => {
    if (!dateString) return Infinity;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (dateString) => {
    if (!dateString) return 'no-data';
    const expiryDate = new Date(dateString);
    const today = new Date();
    const days = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'expired';
    if (days <= 30) return 'critical';
    if (days <= 90) return 'warning';
    return 'good';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'success';
      case 'assigned': return 'primary';
      case 'in maintenance': return 'warning';
      case 'out of service': return 'error';
      default: return 'default';
    }
  };

  const getExpiryColor = (status) => {
    switch (status) {
      case 'expired': return COLORS.ERROR;
      case 'critical': return COLORS.ERROR;
      case 'warning': return COLORS.WARNING;
      case 'good': return COLORS.SUCCESS;
      default: return COLORS.TEXT_SECONDARY;
    }
  };

  const getExpiryIcon = (status) => {
    switch (status) {
      case 'expired': return <CancelIcon />;
      case 'critical': return <AlertTriangleIcon />;
      case 'warning': return <ClockIcon />;
      case 'good': return <CheckIcon />;
      default: return <InfoIcon />;
    }
  };

  const getExpiryText = (status, days) => {
    switch (status) {
      case 'expired': return 'Expired';
      case 'critical': return `${Math.abs(days)} days overdue`;
      case 'warning': return `${days} days remaining`;
      case 'good': return `${days} days remaining`;
      default: return 'No data';
    }
  };

  const handleEditDocument = (documentType) => {
    setEditingDocument(documentType);
    setEditDate(vehicle[documentType] ? new Date(vehicle[documentType]) : new Date());
    setEditDocumentModal(true);
  };

  const handleUpdateDocument = async () => {
    if (!editingDocument || !editDate) return;
    
    setIsUpdating(true);
    try {
      const updatedVehicle = {
        ...vehicle,
        [editingDocument]: editDate.toISOString()
      };
      
      // Call the update API
      const response = await fetch(`https://localhost:7092/api/vehicles/${vehicle.id}?userId=${localStorage.getItem('userId')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updatedVehicle)
      });

      if (response.ok) {
        // Update the local vehicle data
        Object.assign(vehicle, updatedVehicle);
        setEditDocumentModal(false);
        setEditingDocument(null);
        setEditDate(null);
      } else {
        console.error('Failed to update document date');
      }
    } catch (error) {
      console.error('Error updating document date:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditDocumentModal(false);
    setEditingDocument(null);
    setEditDate(null);
  };

  if (!vehicle) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ height: '90vh', overflow: 'auto', backgroundColor: COLORS.BACKGROUND }}>
          {/* Header */}
          <Box sx={{
            p: 4,
            background: COLORS.CARD_BG,
            borderBottom: `1px solid ${COLORS.CARD_BORDER}`,
            color: COLORS.TEXT_PRIMARY,
            position: 'relative'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Avatar sx={{
                  bgcolor: COLORS.PRIMARY,
                  mr: 3,
                  width: 56,
                  height: 56
                }}>
                  <CarIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={300} sx={{ 
                    mb: 1,
                    color: COLORS.TEXT_PRIMARY
                  }}>
                    {vehicle.make} {vehicle.model} ( {vehicle.year} )
                  </Typography>
                  

                  <Typography variant="body2" sx={{ 
                    color: COLORS.TEXT_SECONDARY,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}>
                    VIN: {vehicle.vin}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  position: 'relative',
                  background: '#fff',
                  border: '2.5px solid #222',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  fontFamily: 'inherit, sans-serif',
                  fontWeight: 300,
                  fontSize: 24,
                  color: '#181818',
                  letterSpacing: 2,
                  width: 200,
                  height: 44,
                  padding: '0 12px',
                  margin: '2px 0',
                  userSelect: 'all',
                  overflow: 'hidden',
                }}>
                  {vehicle.licensePlate}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 2, 
                    right: 6, 
                    display: 'flex',
                    flexDirection: 'column', 
                    alignItems: 'center'
                  }}>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
                      alt="Ghana Flag"
                      style={{ 
                        width: 16, 
                        height: 10, 
                        border: '1px solid #222', 
                        borderRadius: 2, 
                        marginBottom: 1 
                      }}
                    />
                    <Typography sx={{ 
                      fontWeight: 700, 
                      color: '#181818', 
                      fontSize: 8, 
                      letterSpacing: 1, 
                      marginTop: 0 
                    }}>
                      GH
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  onClick={onClose}
                  sx={{ 
                    color: COLORS.TEXT_SECONDARY,
                    backgroundColor: alpha(COLORS.TEXT_SECONDARY, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(COLORS.TEXT_SECONDARY, 0.2)
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Document Status Cards */}
          <Box sx={{ p: 4, pb: 2 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              fontWeight: 700,
              color: COLORS.TEXT_PRIMARY,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <ScheduleIcon sx={{ color: COLORS.SECONDARY }} />
              Document Status
            </Typography>
            
            <Grid container spacing={3}>
              {[
                { title: 'Roadworthy Certificate', date: vehicle.roadworthyExpiry, type: 'document' },
                { title: 'Registration', date: vehicle.registrationExpiry, type: 'document' },
                { title: 'Insurance', date: vehicle.insuranceExpiry, type: 'document' },
                { title: 'Next Service Due', date: vehicle.nextServiceDue, type: 'service' }
              ].map((doc, index) => {
                const status = getExpiryStatus(doc.date);
                const days = daysUntilExpiry(doc.date);
                const color = getExpiryColor(status);
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                      border: `1px solid ${COLORS.CARD_BORDER}`,
                      background: COLORS.CARD_BG,
                      overflow: 'visible',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        transition: 'all 0.3s ease'
                      },
                      width: '260px'
                    }}>
                      <CardContent sx={{ p: 3, position: 'relative' }}>
                        {/* Status Indicator */}
                        <Box sx={{
                          position: 'absolute',
                          top: -8,
                          right: 16,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          backgroundColor: color,
                          color: COLORS.WHITE,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}>
                          {getExpiryIcon(status)}
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {getExpiryText(status, days)}
                          </Typography>
                        </Box>

                        {/* Edit Button for Expired/Critical/Warning Documents */}
                        {(status === 'expired' || status === 'critical' || status === 'warning') && (
                          <Box sx={{
                            position: 'absolute',
                            top: 25,
                            right: 8,
                            zIndex: 1
                          }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDocument(doc.date === vehicle.roadworthyExpiry ? 'roadworthyExpiry' :
                                                 doc.date === vehicle.registrationExpiry ? 'registrationExpiry' :
                                                 doc.date === vehicle.insuranceExpiry ? 'insuranceExpiry' :
                                                 'nextServiceDue');
                              }}
                              sx={{
                                backgroundColor: alpha(COLORS.WARNING, 0.1),
                                color: COLORS.WARNING,
                                width: 28,
                                height: 28,
                                '&:hover': {
                                  backgroundColor: alpha(COLORS.WARNING, 0.2)
                                }
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}

                        {/* Document Icon */}
                        <Box sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: status === 'expired' ? alpha(COLORS.ERROR, 0.1) :
                                           status === 'critical' ? alpha(COLORS.ERROR, 0.1) :
                                           status === 'warning' ? alpha(COLORS.WARNING, 0.1) :
                                           status === 'good' ? alpha(COLORS.SUCCESS, 0.1) :
                                           alpha(COLORS.TEXT_SECONDARY, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          border: `1px solid ${status === 'expired' ? alpha(COLORS.ERROR, 0.2) :
                                             status === 'critical' ? alpha(COLORS.ERROR, 0.2) :
                                             status === 'warning' ? alpha(COLORS.WARNING, 0.2) :
                                             status === 'good' ? alpha(COLORS.SUCCESS, 0.2) :
                                             alpha(COLORS.TEXT_SECONDARY, 0.2)}`
                        }}>
                          {doc.type === 'service' ? (
                            <EngineeringIcon sx={{ 
                              color: status === 'expired' ? COLORS.ERROR :
                                     status === 'critical' ? COLORS.ERROR :
                                     status === 'warning' ? COLORS.WARNING :
                                     status === 'good' ? COLORS.SUCCESS :
                                     COLORS.TEXT_SECONDARY,
                              fontSize: 24 
                            }} />
                          ) : (
                            <ScheduleIcon sx={{ 
                              color: status === 'expired' ? COLORS.ERROR :
                                     status === 'critical' ? COLORS.ERROR :
                                     status === 'warning' ? COLORS.WARNING :
                                     status === 'good' ? COLORS.SUCCESS :
                                     COLORS.TEXT_SECONDARY,
                              fontSize: 24 
                            }} />
                          )}
                        </Box>

                        {/* Title */}
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600,
                          color: COLORS.TEXT_PRIMARY,
                          mb: 1,
                          fontSize: '1rem'
                        }}>
                          {doc.title}
                        </Typography>

                        {/* Date */}
                        <Typography variant="body2" sx={{ 
                          color: COLORS.TEXT_SECONDARY,
                          mb: 2,
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}>
                          {formatDate(doc.date)}
                        </Typography>

                        {/* Progress Bar */}
                        {status !== 'no-data' && (
                          <Box sx={{ mt: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={status === 'expired' ? 100 : Math.max(0, Math.min(100, (days / 365) * 100))}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(color, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: color,
                                  borderRadius: 3
                                }
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Vehicle Details */}
          <Box sx={{ p: 4, pt: 2 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              fontWeight: 400,
              color: COLORS.TEXT_PRIMARY,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <InfoIcon sx={{ color: COLORS.SECONDARY }} />
              Vehicle Details
            </Typography>
            
            <Grid container spacing={2}>
              {/* Technical Specs */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: `1px solid ${COLORS.CARD_BORDER}`,
                  background: COLORS.CARD_BG
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 600,
                      color: COLORS.PRIMARY,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <EngineeringIcon sx={{ fontSize: 20 }} />
                      Technical Specifications
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Fuel Type
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.fuelType}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Transmission
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.transmission}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Mileage
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.currentMileage?.toLocaleString() || 'N/A'} miles
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Type
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.vehicleType}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Color
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Box sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: vehicle.color || '#ccc',
                              border: vehicle.color === 'white' ? '2px solid #e2e8f0' : 'none',
                              mr: 1,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                            <Typography variant="body1" sx={{ fontWeight: 600, color: COLORS.TEXT_PRIMARY }}>
                              {vehicle.color}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Seating
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.seatingCapacity} seats
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>



            </Grid>
          </Box>
        </Box>
      </DialogContent>

      {/* Edit Document Modal */}
      <Dialog
        open={editDocumentModal}
        onClose={handleCloseEditModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: COLORS.TEXT_PRIMARY,
          fontWeight: 600
        }}>
          <EditIcon sx={{ color: COLORS.WARNING }} />
          Update {editingDocument?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: COLORS.TEXT_SECONDARY }}>
            Update the expiry date for this document. This will help maintain accurate records and ensure timely renewals.
          </DialogContentText>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="New Expiry Date"
              value={editDate}
              onChange={(newDate) => setEditDate(newDate)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              )}
              minDate={new Date()}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseEditModal}
            sx={{ 
              color: COLORS.TEXT_SECONDARY,
              '&:hover': {
                backgroundColor: alpha(COLORS.TEXT_SECONDARY, 0.1)
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateDocument}
            disabled={isUpdating || !editDate}
            startIcon={isUpdating ? <CircularProgress size={16} /> : <SaveIcon />}
            variant="contained"
            sx={{
              backgroundColor: COLORS.WARNING,
              '&:hover': {
                backgroundColor: COLORS.WARNING,
                opacity: 0.9
              },
              '&:disabled': {
                backgroundColor: alpha(COLORS.TEXT_SECONDARY, 0.3)
              }
            }}
          >
            {isUpdating ? 'Updating...' : 'Update Date'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
} 