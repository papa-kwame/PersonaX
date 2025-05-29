import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  IconButton,
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
  useMediaQuery
} from '@mui/material';
import { Edit, Delete, Add, LocalGasStation, DirectionsCar, AttachMoney, CalendarToday, ArrowBack, ArrowForward } from '@mui/icons-material';
import { format } from 'date-fns';

const FuelLogList = () => {
  const { userId, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [formData, setFormData] = useState({
    fuelAmount: '',
    cost: '',
    fuelStation: '',
    vehicleId: ''
  });
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isAuthenticated && userId) {
      console.log("User ID:", userId); 
      fetchFuelLogs();
    }
  }, [isAuthenticated, userId]);

  const fetchFuelLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/FuelLogs', {
        params: { userId }
      });
      console.log("API Response:", response.data);
      setFuelLogs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching fuel logs:", err);
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
      fetchFuelLogs();
      setOpenDialog(false);
      setFormData({
        fuelAmount: '',
        cost: '',
        fuelStation: '',
      });
    } catch (err) {
      console.error('Error submitting form:', err.response?.data || err.message);
      setError('Failed to add fuel log');
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
      fetchFuelLogs();
      setOpenEditDialog(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update fuel log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/FuelLogs/${id}`);
      fetchFuelLogs();
      setOpenDetailDialog(false);
    } catch (err) {
      console.error(err);
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
      0: theme.palette.primary.main,
      1: '#0172B2', // Total blue
      2: '#FFD700', // Shell yellow
      3: '#008000', // PetroSA green
      4: theme.palette.secondary.main,
      5: '#C00',    // Puma red
      6: '#000',    // StarOil black
      7: '#666',    // AlliedOil gray
      8: '#FFA500', // ZenPetroleum orange
      9: theme.palette.text.secondary
    };
    return colors[fuelStationType] || theme.palette.text.secondary;
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 0));
  };

  const logsPerPage = 2;
  const displayedLogs = fuelLogs.slice(currentPage * logsPerPage, (currentPage + 1) * logsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4} textAlign="center">
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          onClick={fetchFuelLogs}
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            boxShadow: theme.shadows[1],
            '&:hover': {
              boxShadow: theme.shadows[3]
            }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: isMobile ? 2 : 3,
      maxWidth: '450px',
      margin: '0 auto',
      border: '1px solid',
      borderColor: theme.palette.divider,
      borderRadius: '12px',
      height: '320px',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1]
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h8" component="h7" sx={{
          fontWeight: 300,
          color: theme.palette.text.primary,
          letterSpacing: '0.5px'
        }}>
          Fuel Logs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Add Log
        </Button>
      </Box>

      <Grid container spacing={2}>
        {displayedLogs.map((log) => (
          <Grid item xs={12} key={log.id}>
            <Card
              onClick={() => handleViewDetails(log)}
              sx={{
                borderRadius: '12px',
                boxShadow: theme.shadows[1],
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                  cursor: 'pointer',
                  borderLeft: `4px solid ${getFuelStationColor(log.fuelStation)}`
                }
              }}
            >
              <CardContent sx={{
                padding: '6px',
                '&:last-child': { paddingBottom: '6px' },
                width: '400px'
              }}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{
                    bgcolor: getFuelStationColor(log.fuelStation),
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                  }}>
                    <LocalGasStation fontSize="small" />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="h9" component="div" sx={{
                      fontWeight: 300,
                      color: theme.palette.text.primary,
                      lineHeight: 1.3
                    }}>
                      {log.fuelAmount}L
                    </Typography>
                    <Typography variant="subtitle2" sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      letterSpacing: 0.2
                    }}>
                      {getFuelStationName(log.fuelStation)}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="subtitle1" sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}>
                      <AttachMoney fontSize="small" sx={{
                        color: theme.palette.success.main,
                        mr: 0.5,
                        fontSize: '18px'
                      }} />
                      {log.cost.toFixed(2)}
                    </Typography>
                    <Chip
                      label={format(new Date(log.date), 'MMM d, yyyy')}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.action.selected,
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                        borderRadius: '8px',
                        mt: 0.5
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box display="flex" justifyContent="center" mt={3} alignItems="center">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          startIcon={<ArrowBack />}
          sx={{
            mr: 1,
            borderRadius: '8px',
            px: 2,
            textTransform: 'none',
            color: currentPage === 0 ? theme.palette.text.disabled : theme.palette.primary.main
          }}
        >
          Previous
        </Button>
        <Chip
          label={`${currentPage + 1} of ${Math.ceil(fuelLogs.length / logsPerPage)}`}
          size="small"
          sx={{
            backgroundColor: theme.palette.action.selected,
            color: theme.palette.text.primary,
            fontWeight: 500
          }}
        />
        <Button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * logsPerPage >= fuelLogs.length}
          endIcon={<ArrowForward />}
          sx={{
            ml: 1,
            borderRadius: '8px',
            px: 2,
            textTransform: 'none',
            color: (currentPage + 1) * logsPerPage >= fuelLogs.length ?
              theme.palette.text.disabled : theme.palette.primary.main
          }}
        >
          Next
        </Button>
      </Box>

      {/* Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {currentLog && (
          <>
            <Box sx={{
              bgcolor: getFuelStationColor(currentLog.fuelStation),
              p: 3,
              color: 'white',
              background: `linear-gradient(135deg, ${getFuelStationColor(currentLog.fuelStation)} 0%, ${theme.palette.primary.dark} 100%)`
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                    {getFuelStationName(currentLog.fuelStation)}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {format(new Date(currentLog.date), 'PPPP')}
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 56,
                  height: 56,
                  backdropFilter: 'blur(5px)'
                }}>
                  <LocalGasStation fontSize="large" />
                </Avatar>
              </Box>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50],
                    height: '100%'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                      FUEL DETAILS
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocalGasStation color="primary" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {currentLog.fuelAmount} Liters
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <AttachMoney color="primary" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Cost
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ${currentLog.cost.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: theme.palette.grey[50],
                    height: '100%'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                      VEHICLE INFO
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" alignItems="center" mb={2}>
                      <DirectionsCar color="primary" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Vehicle
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {currentLog.vehicle ? currentLog.vehicle.name : 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <CalendarToday color="primary" sx={{ mr: 1.5 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Date & Time
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {format(new Date(currentLog.date), 'hh:mm a')}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={() => setOpenDetailDialog(false)}
                sx={{
                  mr: 2,
                  borderRadius: '8px',
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Close
              </Button>
              <Box flexGrow={1} />
              <Button
                startIcon={<Edit />}
                onClick={() => handleEdit(currentLog)}
                variant="outlined"
                sx={{
                  mr: 1,
                  borderRadius: '8px',
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Edit
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={() => handleDelete(currentLog.id)}
                variant="outlined"
                color="error"
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  textTransform: 'none'
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        }}>
          Add Fuel Log
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="fuelAmount"
              label="Fuel Amount (Liters)"
              type="number"
              value={formData.fuelAmount}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
              InputLabelProps={{
                sx: {
                  color: theme.palette.text.secondary
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="cost"
              label="Cost ($)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="fuelStation"
              label="Fuel Station"
              value={formData.fuelStation}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
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
                <MenuItem key={key} value={key}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{
                      bgcolor: getFuelStationColor(key),
                      width: 24,
                      height: 24,
                      mr: 1.5
                    }}>
                      <LocalGasStation sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography>{value}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              mr: 2,
              borderRadius: '8px',
              px: 3,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            sx={{
              px: 3,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: theme.shadows[1],
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            Save Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        }}>
          Edit Fuel Log
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleUpdate}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="fuelAmount"
              label="Fuel Amount (Liters)"
              type="number"
              value={formData.fuelAmount}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="cost"
              label="Cost ($)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="fuelStation"
              label="Fuel Station"
              value={formData.fuelStation}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '8px'
                }
              }}
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
                <MenuItem key={key} value={key}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{
                      bgcolor: getFuelStationColor(key),
                      width: 24,
                      height: 24,
                      mr: 1.5
                    }}>
                      <LocalGasStation sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography>{value}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{
              mr: 2,
              borderRadius: '8px',
              px: 3,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            color="primary"
            variant="contained"
            sx={{
              px: 3,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: theme.shadows[1],
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            Update Log
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FuelLogList;
