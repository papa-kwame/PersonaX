import React, { useState, useEffect } from 'react'
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
  Save as SaveIcon, WarningAmberOutlined as AlertTriangleIcon, Timer as ClockIcon,
  Visibility as VisibilityIcon, DriveFolderUpload as DriveFolderUploadIcon
} from '@mui/icons-material';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';

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

  // Vehicle documents state
  const [docsRoadworthy, setDocsRoadworthy] = useState([]);
  const [docsInsurance, setDocsInsurance] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState({ roadworthy: false, insurance: false, general: false });
  const [selectedFiles, setSelectedFiles] = useState({ roadworthy: null, insurance: null, general: null });
  const [uploadDates, setUploadDates] = useState({ roadworthy: null, insurance: null });
  const [previewDoc, setPreviewDoc] = useState(null); // { id, name, url }
  const [replaceModal, setReplaceModal] = useState(false);
  const [replaceDoc, setReplaceDoc] = useState(null); // { id, key, fileName }
  const [replaceFile, setReplaceFile] = useState(null);
  const [replaceDate, setReplaceDate] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const [expanded, setExpanded] = useState({ roadworthy: false, insurance: false });

  const getAuthData = () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { token, userId } = JSON.parse(authData);
      return { token, userId };
    }
    return { token: localStorage.getItem('authToken'), userId: localStorage.getItem('userId') };
  };
  
  const { userId: ctxUserId } = useAuth() || {};
  const { token, userId: authUserId } = getAuthData();
  const userId = ctxUserId || authUserId;

  const fetchDocuments = async (type) => {
    if (!vehicle?.id) return;
    try {
      const res = await fetch(`https://localhost:7092/api/Vehicles/${vehicle.id}/documents/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (type === 'roadworthy') setDocsRoadworthy(data);
      if (type === 'insurance') setDocsInsurance(data);
    } catch (e) {
      }
  };

  useEffect(() => {
    if (open && vehicle?.id) {
      setLoadingDocs(true);
      Promise.all([
        fetchDocuments('roadworthy'),
        fetchDocuments('insurance')
      ]).finally(() => setLoadingDocs(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle?.id]);

  const handleFileSelect = (type, file) => {
    setSelectedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleUpload = async (type) => {
    if (!selectedFiles[type]) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const form = new FormData();
      form.append('file', selectedFiles[type]);
      let url = `https://localhost:7092/api/Vehicles/${vehicle.id}/documents/${type}?userId=${encodeURIComponent(userId)}`;
      if (type !== 'general' && uploadDates[type]) {
        url += `&expiryDate=${encodeURIComponent(uploadDates[type].toISOString())}`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (res.ok) {
        await fetchDocuments(type);
        setSelectedFiles(prev => ({ ...prev, [type]: null }));
      } else {
        }
    } catch (e) {
      } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleReplaceFile = async (documentId, newFile, newExpiryDate) => {
    if (!newFile && !newExpiryDate) return;
    try {
      const form = new FormData();
      if (newFile) form.append('file', newFile);
      let url = `https://localhost:7092/api/Vehicles/documents/${documentId}?userId=${encodeURIComponent(userId)}`;
      if (newExpiryDate) url += `&expiryDate=${encodeURIComponent(newExpiryDate.toISOString())}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (res.ok) {
        // Refresh all docs
        await Promise.all([
          fetchDocuments('roadworthy'),
          fetchDocuments('insurance')
        ]);
      } else {
        }
    } catch (e) {
      }
  };

  const openReplace = (doc) => {
    setReplaceDoc(doc); // { id, key, fileName }
    setReplaceFile(null);
    setReplaceDate(null);
    setReplaceModal(true);
  };
  const closeReplace = () => {
    setReplaceModal(false);
    setReplaceDoc(null);
    setReplaceFile(null);
    setReplaceDate(null);
  };
  const confirmReplace = async () => {
    if (!replaceDoc) return;
    setReplacing(true);
    await handleReplaceFile(replaceDoc.id, replaceFile, replaceDate);
    setReplacing(false);
    closeReplace();
  };

  const openPreview = async (docId, name) => {
    try {
      const res = await fetch(`https://localhost:7092/api/Vehicles/documents/${docId}/file`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewDoc({ id: docId, name, url });
    } catch (e) {
      }
  };

  const closePreview = () => {
    if (previewDoc?.url) URL.revokeObjectURL(previewDoc.url);
    setPreviewDoc(null);
  };

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
      const response = await fetch(`https://localhost:7092/api/vehicles/${vehicle.id}?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        }
    } catch (error) {
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
            p: 1,
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
              fontWeight: 400,
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
                { key: 'roadworthy', title: 'Roadworthy Certificate', date: vehicle.roadworthyExpiry, type: 'document' },
                { key: 'insurance', title: 'Insurance', date: vehicle.insuranceExpiry, type: 'document' },
                { key: 'service', title: 'Next Service Due', date: vehicle.nextServiceDue, type: 'service' }
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
                      width: '357px'
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

                        {/* Embedded Upload for Roadworthy & Insurance (minimal by default; toggle with chevron) */}
                        {(doc.key === 'roadworthy' || doc.key === 'insurance') && (
                          <Box sx={{ mt: 1 }}>
                            <Tooltip title={expanded[doc.key] ? 'Hide' : 'Manage'} placement="top">
                              <IconButton
                                size="small"
                                onClick={() => setExpanded(prev => ({ ...prev, [doc.key]: !prev[doc.key] }))}
                                sx={{
                                  position: 'absolute',
                                  top: 25,
                                  right: (status === 'expired' || status === 'critical' || status === 'warning') ? 40 : 8,
                                  backgroundColor: alpha(COLORS.TEXT_SECONDARY, 0.08),
                                  '&:hover': { backgroundColor: alpha(COLORS.TEXT_SECONDARY, 0.16) }
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            {expanded[doc.key] && (
                              <>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                      const list = (doc.key === 'roadworthy' ? docsRoadworthy : docsInsurance);
                                      if (list && list.length > 0) {
                                        const latest = [...list].sort((a,b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
                                        openPreview(latest.id, latest.fileName);
                                      }
                                    }}
                                    disabled={(doc.key === 'roadworthy' ? docsRoadworthy : docsInsurance).length === 0}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    View latest
                                  </Button>
                                </Box>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                  <DatePicker
                                    label="Expiry Date (optional)"
                                    value={uploadDates[doc.key]}
                                    onChange={(d) => setUploadDates(prev => ({ ...prev, [doc.key]: d }))}
                                    renderInput={(params) => <TextField {...params} size="small" fullWidth sx={{ mb: 1 }} />}
                                  />
                                </LocalizationProvider>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button component="label" variant="outlined" size="small">
                                    Choose File
                                    <input hidden type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileSelect(doc.key, e.target.files?.[0] || null)} />
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={!selectedFiles[doc.key] || uploading[doc.key]}
                                    onClick={() => handleUpload(doc.key)}
                                  >
                                    {uploading[doc.key] ? 'Uploading…' : 'Upload'}
                                  </Button>
                                </Box>

                                <Divider sx={{ my: 1.5 }} />
                                <Box sx={{ maxHeight: 140, overflow: 'auto' }}>
                                  {loadingDocs ? (
                                    <Typography variant="body2" color="text.secondary">Loading…</Typography>
                                  ) : (
                                    [...(doc.key === 'roadworthy' ? docsRoadworthy : docsInsurance)]
                                      .sort((a,b) => new Date(b.uploadDate) - new Date(a.uploadDate))
                                      .map((d) => (
                                        <Box key={d.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton size="small" onClick={() => openPreview(d.id, d.fileName)}>
                                              <VisibilityIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                            <Box sx={{ cursor: 'pointer' }} onClick={() => openPreview(d.id, d.fileName)}>
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.fileName}</Typography>
                                              <Typography variant="caption" color="text.secondary">{new Date(d.uploadDate).toLocaleString()}</Typography>
                                            </Box>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button size="small" variant="text" onClick={() => openReplace({ id: d.id, key: doc.key, fileName: d.fileName })}>Update</Button>
                                          </Box>
                                        </Box>
                                      ))
                                  )}
                                </Box>
                              </>
                            )}
                          </Box>
                        )}

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

            {/* Secondary upload panels removed; using embedded Manage sections per card */}
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
            
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: `1px solid ${COLORS.CARD_BORDER}`,
                 
                  background: COLORS.CARD_BG,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                  }
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
                      <InfoIcon sx={{ fontSize: 20 }} />
                      Basic Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {/* Top Row - 6 cards */}
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Vehicle Type
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
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
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
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
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
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
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
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Engine Size
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.engineSize}L
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Seating Capacity
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

                      {/* Bottom Row - 6 cards */}
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Current Mileage
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.currentMileage?.toLocaleString() || 'N/A'} km
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={2}>
                        <Box sx={{
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Service Interval
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {vehicle.serviceInterval?.toLocaleString() || 'N/A'} km
                            </Typography>
                          </Box>
                      </Grid>
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Purchase Date
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {formatDate(vehicle.purchaseDate)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Purchase Price
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            ₵{vehicle.purchasePrice?.toLocaleString() || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={2}>
                        <Box sx={{ 
                          mb: 2,
                          p: 2,
                          width: '160px',
                          borderRadius: 2,
                          backgroundColor: alpha(COLORS.PRIMARY, 0.02),
                          border: `1px solid ${alpha(COLORS.PRIMARY, 0.08)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: alpha(COLORS.PRIMARY, 0.04),
                            border: `1px solid ${alpha(COLORS.PRIMARY, 0.12)}`
                          }
                        }}>
                          <Typography variant="caption" sx={{ 
                            color: COLORS.TEXT_SECONDARY,
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Next Service Due
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600,
                            color: COLORS.TEXT_PRIMARY,
                            mt: 0.5
                          }}>
                            {formatDate(vehicle.nextServiceDue)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={2}>
                        {/* Empty space for balance */}
                      </Grid>

                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

            </Grid>
          </Box>
        </Box>
      </DialogContent>

      {/* In-app Document Preview */}
      <Dialog open={!!previewDoc} onClose={closePreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{previewDoc?.name}</Typography>
          <IconButton onClick={closePreview}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {previewDoc?.url && (
            <Box sx={{ height: '75vh' }}>
              <iframe title="doc-preview" src={previewDoc.url} style={{ width: '100%', height: '100%', border: 'none' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
        </DialogActions>
      </Dialog>

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