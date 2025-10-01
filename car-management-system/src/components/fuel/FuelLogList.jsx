import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Paper,
  useTheme,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Fade,
  Slide,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit,
  Delete,
  Add,
  LocalGasStation,
  DirectionsCar,
  AttachMoney,
  CalendarToday,
  ArrowForward,
  List,
  Close,
  Info,
  CheckCircle,
  Visibility
} from '@mui/icons-material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Import fuel station logos
import goilLogo from '../../assets/fuelstationlogos/goil-logo.webp';
import shellLogo from '../../assets/fuelstationlogos/Shell-Logo.png';
import starOilLogo from '../../assets/fuelstationlogos/star-oil.webp';
import frimpsLogo from '../../assets/fuelstationlogos/frimps-logo.png';
import zenLogo from '../../assets/fuelstationlogos/Zen-logo.png';
import totalLogo from '../../assets/fuelstationlogos/total-logo.jpg';
import pumaLogo from '../../assets/fuelstationlogos/puma-logo.png';
import alliedLogo from '../../assets/fuelstationlogos/allied-logo.png';

// Professional color palette
const professionalColors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  info: '#0891b2',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  border: '#e2e8f0'
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
  border: `1px solid ${professionalColors.border}`,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
 
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${professionalColors.border}`,
    background: professionalColors.surface
  }
}));

const StyledButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: '12px',
  padding: '10px 20px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  ...(variant === 'contained' && {
    background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
    color: 'white',
    '&:hover': {
      background: `linear-gradient(135deg, ${alpha(professionalColors.primary, 0.9)} 0%, ${professionalColors.primary} 100%)`
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: professionalColors.border,
    color: professionalColors.text,
    '&:hover': {
      borderColor: professionalColors.primary,
      backgroundColor: alpha(professionalColors.primary, 0.04)
    }
  })
}));

const StationBadge = styled(Chip)(({ station, theme }) => {
  const colors = {
    0: '#FFA500',
    1: '#0172B2',
    2: '#FFD700',
    3: '#008000',
    4: '#FFA500',
    5: '#C00',
    6: '#000',
    7: '#666',
    8: '#FFA500',
    9: '#FFA500'
  };
  const bgColor = colors[station] || professionalColors.secondary;
  return {
    backgroundColor: bgColor,
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.75rem',
    borderRadius: '8px',
    '& .MuiChip-label': {
      padding: '4px 8px'
    }
  };
});

// Function to get fuel station logo
const getFuelStationLogo = (fuelStationType) => {
  const logoMap = {
    0: goilLogo,      // GOIL
    1: totalLogo,     // Total
    2: shellLogo,     // Shell
    3: null,          // PetroSA (no logo available)
    4: frimpsLogo,    // Frimps
    5: pumaLogo,      // Puma
    6: starOilLogo,   // StarOil
    7: alliedLogo,    // AlliedOil
    8: zenLogo,       // ZenPetroleum
    9: null,          // Other (no logo available)
  };
  return logoMap[fuelStationType] || null;
};

const FuelLogList = () => {
  const { userId, isAuthenticated } = useAuth();
  const theme = useTheme();
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openViewAllDialog, setOpenViewAllDialog] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [formData, setFormData] = useState({
    fuelAmount: '',
    cost: '',
    fuelStation: '',
    vehicleId: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refresh, setRefresh] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchFuelLogs();
    }
  }, [isAuthenticated, userId, refresh]);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/FuelLogs/user/${userId}`);
      setFuelLogs(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch fuel logs');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fuelAmount: formData.fuelAmount,
        cost: formData.cost,
        fuelStation: parseInt(formData.fuelStation, 10)
      };

      await api.post(`/api/FuelLogs/${userId}`, payload);
      setSubmitSuccess(true);
      setTimeout(() => {
        setRefresh(prev => !prev);
        setOpenDialog(false);
        setFormData({
          fuelAmount: '',
          cost: '',
          fuelStation: '',
        });
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      let errorMsg = 'Failed to add fuel log';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (typeof err.response?.data === 'string') {
        errorMsg = err.response.data;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

  const handleViewDetails = (log) => {
    setCurrentLog(log);
    setOpenDetailDialog(true);
  };

  const handleEdit = (log) => {
    setCurrentLog(log);
    setFormData({
      fuelAmount: log.fuelAmount,
      cost: log.cost,
      fuelStation: log.fuelStation,
      vehicleId: log.vehicleId
    });
    setOpenEditDialog(true);
    setOpenDetailDialog(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/FuelLogs/${currentLog.id}`, formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        fetchFuelLogs();
        setOpenEditDialog(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Failed to update fuel log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/FuelLogs/${id}?userId=${userId}`);
      fetchFuelLogs();
      setOpenDetailDialog(false);
    } catch (err) {
      setError('Failed to delete fuel log');
    }
  };

  const getFuelStationName = (fuelStationType) => {
    const fuelStationTypes = {
      0: 'GOIL',
      1: 'Total',
      2: 'Shell',
      3: 'PetroSA',
      4: 'Frimps',
      5: 'Puma',
      6: 'StarOil',
      7: 'AlliedOil',
      8: 'ZenPetroleum',
      9: 'Other',
    };
    return fuelStationTypes[fuelStationType] || 'Unknown';
  };

  const getFuelStationColor = (fuelStationType) => {
    const colors = {
      0: professionalColors.primary,
      1: '#0172B2',
      2: '#FFD700',
      3: '#008000',
      4: professionalColors.secondary,
      5: '#C00',
      6: '#000',
      7: '#666',
      8: '#FFA500',
      9: professionalColors.secondary
    };
    return colors[fuelStationType] || professionalColors.secondary;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box 
        sx={{
          width: 430,
          height: 345,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${professionalColors.background} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
          borderRadius: '20px',
          border: `1px solid ${professionalColors.border}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}
      >
        <CircularProgress 
          size={32}
          sx={{ 
            color: professionalColors.primary,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: 430,
          height: 345,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${professionalColors.surface} 0%, ${alpha(professionalColors.surface, 0.8)} 100%)`,
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${professionalColors.border}`
        }}
      >
        <Box sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(professionalColors.error, 0.1)} 0%, ${alpha(professionalColors.error, 0.05)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2
        }}>
          <Info sx={{ color: professionalColors.error, fontSize: 32 }} />
        </Box>
        <Typography
          color={professionalColors.error}
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}
        >
          {error}
        </Typography>
        <StyledButton
          onClick={fetchFuelLogs}
          variant="outlined"
          size="medium"
        >
          Retry
        </StyledButton>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: 430,
      height: 345,
      p: 3,
      background: `linear-gradient(135deg, ${professionalColors.background} 0%, ${alpha(professionalColors.background, 0.5)} 100%)`,
      borderRadius: '24px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${professionalColors.border}`,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
          }}>
            <LocalGasStation sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h7" fontWeight={500} color={professionalColors.text}>
              Recent Fuel Logs
            </Typography>

          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Add new fuel log">
            <motion.div whileTap={{ scale: 0.95 }}>
              <IconButton
                size="small"
                onClick={() => setOpenDialog(true)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.8)} 100%)`,
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Add sx={{ fontSize: 18 }} />
              </IconButton>
            </motion.div>
          </Tooltip>
          <StyledButton
            variant="outlined"
            size="small"
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            onClick={() => setOpenViewAllDialog(true)}
          >
            View All
          </StyledButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {fuelLogs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              p: 2,
              background: `linear-gradient(135deg, ${alpha(professionalColors.surface, 0.8)} 0%, ${alpha(professionalColors.surface, 0.5)} 100%)`,
              borderRadius: '16px',
              border: `2px dashed ${alpha(professionalColors.border, 0.5)}`
            }}
          >
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(professionalColors.secondary, 0.1)} 0%, ${alpha(professionalColors.secondary, 0.05)} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2
            }}>
              <LocalGasStation sx={{ color: alpha(professionalColors.secondary, 0.6), fontSize: 32 }} />
            </Box>
            <Typography variant="h6" color={professionalColors.text} fontWeight={600} gutterBottom>
              No Fuel Logs
            </Typography>
            <Typography variant="body2" color={professionalColors.secondary} sx={{ mb: 2 }}>
              No fuel consumption logs recorded yet.
            </Typography>
            <motion.div>
              <StyledButton
                variant="contained"
                size="small"
                startIcon={<Add sx={{ fontSize: 16 }} />}
                onClick={() => setOpenDialog(true)}
              >
                Add First Log
              </StyledButton>
            </motion.div>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
            {fuelLogs.slice(0, 2).map((log) => (
              <motion.div
                key={log.id}
              >
                <StyledCard
                  onClick={() => handleViewDetails(log)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50px',
                        padding:'6px',
                                                 background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        overflow: 'hidden'
                      }}>
                        {getFuelStationLogo(log.fuelStation) ? (
                          <img 
                            src={getFuelStationLogo(log.fuelStation)} 
                            alt={getFuelStationName(log.fuelStation)}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              padding: '4px'
                            }}
                          />
                        ) : (
                          <LocalGasStation sx={{ fontSize: 20 }} />
                        )}
                      </Box>
                      <Box flexGrow={1}>
                        <Typography variant="body1" fontWeight={600} color={professionalColors.text}>
                          {log.fuelAmount}L at {getFuelStationName(log.fuelStation)}
                        </Typography>
                        <Typography variant="body2" color={professionalColors.secondary} sx={{ mt: 0.5 }}>
                          {format(new Date(log.date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ 
                        color: professionalColors.success,
                        background: `linear-gradient(135deg, ${professionalColors.success} 0%, ${alpha(professionalColors.success, 0.8)} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        ${log.cost.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </StyledCard>
              </motion.div>
            ))}
          </Box>
        )}
      </Box>

      {/* View All Dialog */}
      <StyledDialog
        open={openViewAllDialog}
        onClose={() => setOpenViewAllDialog(false)}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Slide}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.9)} 100%)`,
          color: 'white',
          py: 3,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {currentLog && getFuelStationLogo(currentLog.fuelStation) ? (
                <img 
                  src={getFuelStationLogo(currentLog.fuelStation)} 
                  alt={getFuelStationName(currentLog.fuelStation)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '2px',
                                         background: 'transparent'
                  }}
                />
              ) : (
                <LocalGasStation sx={{ fontSize: 20 }} />
              )}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              My Fuel Logs
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenViewAllDialog(false)}
            sx={{ 
              color: 'white',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: professionalColors.text }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: professionalColors.text }}>Station</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: professionalColors.text }}>Amount (L)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: professionalColors.text }}>Cost</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: professionalColors.text }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: professionalColors.text }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fuelLogs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log) => (
                    <TableRow
                      key={log.id}
                    >
                      <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>
                        {format(new Date(log.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getFuelStationLogo(log.fuelStation) ? (
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '6px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'white',
                              border: `1px solid ${alpha(professionalColors.border, 0.5)}`
                            }}>
                              <img 
                                src={getFuelStationLogo(log.fuelStation)} 
                                alt={getFuelStationName(log.fuelStation)}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  padding: '2px'
                                }}
                              />
                            </Box>
                          ) : (
                            <StationBadge
                              station={log.fuelStation}
                              label={getFuelStationName(log.fuelStation)}
                              size="small"
                            />
                          )}
                          <Typography variant="body2" fontWeight={500}>
                            {getFuelStationName(log.fuelStation)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2, fontWeight: 600, fontSize: '0.9rem' }}>
                        {log.fuelAmount} L
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          fontWeight: 700,
                          color: professionalColors.success,
                          fontSize: '0.95rem',
                        }}
                      >
                        ${log.cost.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 2, fontSize: '0.9rem', color: professionalColors.secondary }}>
                        {log.vehicle ? (
                          <Box fontWeight={600} color={professionalColors.text}>
                            {log.vehicle.make} {log.vehicle.model}
                          </Box>
                        ) : (
                          <Box fontStyle="italic" color={alpha(professionalColors.secondary, 0.6)}>
                            N/A
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(log);
                              }}
                              sx={{
                                color: professionalColors.primary,
                                borderRadius: '8px',
                                transition: 'all 0.2s',
        
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(log.id);
                              }}
                              sx={{
                                color: professionalColors.error,
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                               
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={fuelLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${professionalColors.border}`,
              px: 4,
              py: 2,
              backgroundColor: professionalColors.background,
              '& .MuiTablePagination-toolbar': {
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.85rem',
                color: professionalColors.secondary,
              },
              '& .MuiTablePagination-actions': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
              '& .MuiSelect-select': {
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: professionalColors.surface,
                fontWeight: 500,
              },
              '& .MuiSvgIcon-root': {
                fontSize: 20,
                color: professionalColors.primary,
              },
            }}
          />
        </DialogContent>
      </StyledDialog>

      {/* Add Fuel Log Dialog */}
      <StyledDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{
          background: `linear-gradient(135deg, ${professionalColors.primary} 0%, ${alpha(professionalColors.primary, 0.9)} 100%)`,
          color: 'white',
          py: 3,
          px: 4
        }}>
          <Typography variant="h6" fontWeight={700}>
            Add Fuel Log
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {submitSuccess ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(professionalColors.success, 0.1)} 0%, ${alpha(professionalColors.success, 0.05)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2
              }}>
                <CheckCircle sx={{ color: professionalColors.success, fontSize: 40 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color={professionalColors.text} gutterBottom>
                Log Added Successfully!
              </Typography>
              <Typography variant="body2" color={professionalColors.secondary}>
                Your fuel log has been recorded.
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="dense"
                required
                fullWidth
                name="fuelAmount"
                label="Fuel Amount (Liters)"
                type="number"
                value={formData.fuelAmount}
                onChange={handleInputChange}
                sx={{ mb: 3 }}
                size="medium"
                variant="outlined"
              />
              <TextField
                margin="dense"
                required
                fullWidth
                name="cost"
                label="Cost ($)"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={handleInputChange}
                sx={{ mb: 3 }}
                size="medium"
                variant="outlined"
              />
              <TextField
                margin="dense"
                required
                fullWidth
                select
                name="fuelStation"
                label="Fuel Station"
                value={formData.fuelStation}
                onChange={handleInputChange}
                size="medium"
                variant="outlined"
              >
                {Object.entries({
                  0: 'GOIL',
                  1: 'Total',
                  2: 'Shell',
                  3: 'PetroSA',
                  4: 'Frimps',
                  5: 'Puma',
                  6: 'StarOil',
                  7: 'AlliedOil',
                  8: 'ZenPetroleum',
                  9: 'Other',
                }).map(([key, value]) => (
                  <MenuItem key={key} value={key} sx={{ py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getFuelStationLogo(parseInt(key)) ? (
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: `1px solid ${alpha(professionalColors.border, 0.5)}`
                        }}>
                          <img 
                            src={getFuelStationLogo(parseInt(key))} 
                            alt={value}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              padding: '2px'
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: getFuelStationColor(parseInt(key)),
                        }} />
                      )}
                      <Typography variant="body1" sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                        {value}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pr: 4 }}>
          {!submitSuccess && (
            <StyledButton
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              size="medium"
            >
              Cancel
            </StyledButton>
          )}
          <StyledButton
            onClick={submitSuccess ? () => setOpenDialog(false) : handleSubmit}
            variant="contained"
            size="medium"
          >
            {submitSuccess ? 'Close' : 'Save'}
          </StyledButton>
        </DialogActions>
      </StyledDialog>

      {/* Detail Dialog */}
      <StyledDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
      >
        {currentLog && (
          <>
            <DialogTitle sx={{
              background: `linear-gradient(135deg, ${getFuelStationColor(currentLog.fuelStation)} 0%, ${alpha(getFuelStationColor(currentLog.fuelStation), 0.8)} 100%)`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              py: 3,
              px: 4
            }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 2,
                overflow: 'hidden'
              }}>
                {getFuelStationLogo(currentLog.fuelStation) ? (
                  <img 
                    src={getFuelStationLogo(currentLog.fuelStation)} 
                    alt={getFuelStationName(currentLog.fuelStation)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '2px'
                    }}
                  />
                ) : (
                  <LocalGasStation sx={{ fontSize: 20 }} />
                )}
              </Box>
              <Typography variant="h6" fontWeight={700}>
                {getFuelStationName(currentLog.fuelStation)}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid xs={6}>
                  <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: professionalColors.text }}>
                    {format(new Date(currentLog.date), 'PPP')}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                    Time
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: professionalColors.text }}>
                    {format(new Date(currentLog.date), 'p')}
                  </Typography>
                </Grid>
                <Grid xs={12} sx={{ mt: 2 }}>
                  <Divider sx={{ borderColor: alpha(professionalColors.border, 0.5) }} />
                </Grid>
                <Grid xs={6} sx={{ mt: 1 }}>
                  <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                    Fuel Amount
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: professionalColors.text }}>
                    {currentLog.fuelAmount} Liters
                  </Typography>
                </Grid>
                <Grid xs={6} sx={{ mt: 1 }}>
                  <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                    Total Cost
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 700, color: professionalColors.success }}>
                    ${currentLog.cost.toFixed(2)}
                  </Typography>
                </Grid>
                {currentLog.vehicle && (
                  <>
                    <Grid xs={12} sx={{ mt: 2 }}>
                      <Divider sx={{ borderColor: alpha(professionalColors.border, 0.5) }} />
                    </Grid>
                    <Grid xs={12} sx={{ mt: 1 }}>
                      <Typography variant="caption" color={professionalColors.secondary} fontWeight={600}>
                        Vehicle
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: professionalColors.text }}>
                        {currentLog.vehicle.make} {currentLog.vehicle.model}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pr: 4 }}>
              <StyledButton
                onClick={() => setOpenDetailDialog(false)}
                variant="outlined"
                size="medium"
              >
                Close
              </StyledButton>
              <StyledButton
                startIcon={<Edit sx={{ fontSize: 16 }} />}
                onClick={() => handleEdit(currentLog)}
                variant="outlined"
                size="medium"
              >
                Edit
              </StyledButton>
              <StyledButton
                startIcon={<Delete sx={{ fontSize: 16 }} />}
                onClick={() => handleDelete(currentLog.id)}
                variant="outlined"
                color="error"
                size="medium"
              >
                Delete
              </StyledButton>
            </DialogActions>
          </>
        )}
      </StyledDialog>
    </Box>
  );
};

export default FuelLogList;
