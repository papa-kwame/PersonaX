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
  Slide
} from '@mui/material';
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
  CheckCircle
} from '@mui/icons-material';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

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

  const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    transition: 'all 0.3s ease',
  
    '&:hover': {
      transform: 'translateY(-2px)',
     
    }
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
    const bgColor = colors[station] || theme.palette.text.secondary;
    return {
      backgroundColor: bgColor,
      color: theme.palette.getContrastText ? theme.palette.getContrastText(bgColor) : '#fff',
      fontWeight: 600,
      fontSize: '0.7rem'
    };
  });

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
      setSubmitSuccess(true);
      setTimeout(() => {
        fetchFuelLogs();
        setOpenEditDialog(false);
        setSubmitSuccess(false);
      }, 1500);
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
      1: '#0172B2',
      2: '#FFD700',
      3: '#008000',
      4: theme.palette.secondary.main,
      5: '#C00',
      6: '#000',
      7: '#666',
      8: '#FFA500',
      9: theme.palette.text.secondary
    };
    return colors[fuelStationType] || theme.palette.text.secondary;
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
      <Box display="flex" justifyContent="center" alignItems="center" height={245}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} height={245} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Typography color="error" variant="body2" gutterBottom>
          {error}
        </Typography>
        <Button
          onClick={fetchFuelLogs}
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: 430,
      height: 245,
      p: 2,
      backgroundColor: theme.palette.background.paper,
      borderRadius: '16px',
      boxShadow: theme.shadows[3],
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${theme.palette.divider}`
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: theme.palette.text.primary }}>
          Recent Fuel Logs
        </Typography>
        <Box>
          <Tooltip title="Add new fuel log">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                size="small"
                onClick={() => setOpenDialog(true)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                  },
                  mr: 1
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </motion.div>
          </Tooltip>
          <Button
            endIcon={<ArrowForward />}
            size="small"
            sx={{
              textTransform: 'none',
              color: theme.palette.primary.main
            }}
            onClick={() => setOpenViewAllDialog(true)}
          >
            View All
          </Button>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {fuelLogs.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            p={2}
          >
            <LocalGasStation sx={{
              fontSize: 48,
              color: theme.palette.text.disabled,
              mb: 1,
              opacity: 0.6
            }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No fuel logs recorded
            </Typography>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ mt: 1 }}
              >
                Add First Log
              </Button>
            </motion.div>
          </Box>
        ) : (
          <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
            {fuelLogs.slice(0, 2).map((log) => (
              <motion.div
                key={log.id}
                whileHover={{ scale: 1.01 }}
              >
                <StyledCard
                  onClick={() => handleViewDetails(log)}
                  sx={{
                    mb: 1.5,
                    cursor: 'pointer',
                    borderLeft: `4px solid ${getFuelStationColor(log.fuelStation)}`
                  }}
                >
                  <CardContent sx={{ p: '12px !important' }}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{
                        bgcolor: getFuelStationColor(log.fuelStation),
                        width: 36,
                        height: 36,
                        mr: 1.5
                      }}>
                        <LocalGasStation fontSize="small" />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {log.fuelAmount}L at {getFuelStationName(log.fuelStation)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(log.date), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.success.dark }}>
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

      <Dialog
        open={openViewAllDialog}
        onClose={() => setOpenViewAllDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            borderRadius: '16px'
          }
        }}
        TransitionComponent={Slide}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 2,
          px: 3
        }}>
          <Box display="flex" alignItems="center">
            <LocalGasStation sx={{ mr: 1.5 }} />
            <Typography variant="h6">My Fuel Logs</Typography>
          </Box>
          <IconButton
            onClick={() => setOpenViewAllDialog(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Station</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amount (L)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Cost</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
    {fuelLogs
  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  .map((log) => (
    <TableRow
      key={log.id}
      hover
      sx={{
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      {/* Date */}
      <TableCell sx={{ py: 2, fontSize: '0.95rem' }}>
        {format(new Date(log.date), 'MMM d, yyyy')}
      </TableCell>

      {/* Station */}
      <TableCell sx={{ py: 2 }}>
        <Box display="flex" alignItems="center">
          <StationBadge
            station={log.fuelStation}
            label={getFuelStationName(log.fuelStation)}
            size="small"
          />
        </Box>
      </TableCell>

      {/* Fuel Amount */}
      <TableCell align="right" sx={{ py: 2, fontWeight: 500, fontSize: '0.9rem' }}>
        {log.fuelAmount} L
      </TableCell>

      {/* Cost */}
      <TableCell
        align="right"
        sx={{
          py: 2,
          fontWeight: 600,
          color: theme.palette.success.main,
          fontSize: '0.95rem',
        }}
      >
        ${log.cost.toFixed(2)}
      </TableCell>

      {/* Vehicle Info */}
      <TableCell sx={{ py: 2, fontSize: '0.9rem', color: theme.palette.text.secondary }}>
        {log.vehicle ? (
          <Box fontWeight={500}>
            {log.vehicle.make} {log.vehicle.model}
          </Box>
        ) : (
          <Box fontStyle="italic" color={theme.palette.grey[500]}>
            N/A
          </Box>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell sx={{ py: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>


          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(log.id);
              }}
              sx={{
                color: theme.palette.error.main,
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
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
    borderTop: `1px solid ${theme.palette.divider}`,
    px: 4,
    py: 2,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Inter, sans-serif',
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
      color: theme.palette.text.secondary,
    },
    '& .MuiTablePagination-actions': {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    '& .MuiSelect-select': {
      padding: '6px 12px',
      borderRadius: '8px',
      backgroundColor: theme.palette.grey[100],
      fontWeight: 500,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 20,
      color: theme.palette.primary.main,
    },
    boxShadow: `0 -1px 3px rgba(0, 0, 0, 0.05)`,
    borderRadius: '0 0 12px 12px'
  }}
/>

        </DialogContent>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{
          bgcolor: theme.palette.primary.main,
          color: 'white',
          py: 2,
          px: 3
        }}>
          Add Fuel Log
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {submitSuccess ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}>
              <CheckCircle sx={{
                fontSize: 60,
                color: theme.palette.success.main,
                mb: 2
              }} />
              <Typography variant="h6" gutterBottom>
                Log Added Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
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
                sx={{ mb: 2 }}
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
                sx={{ mb: 2 }}
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
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getFuelStationColor(parseInt(key)),
                        mr: 1.5
                      }} />
                      {value}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pr: 3 }}>
          {!submitSuccess && (
            <Button
              onClick={() => setOpenDialog(false)}
              size="medium"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={submitSuccess ? () => setOpenDialog(false) : handleSubmit}
            color="primary"
            variant="contained"
            size="medium"
            sx={{
              minWidth: 100,
              borderRadius: '8px'
            }}
          >
            {submitSuccess ? 'Close' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
        TransitionComponent={Fade}
      >
        {currentLog && (
          <>
            <DialogTitle sx={{
              bgcolor: getFuelStationColor(currentLog.fuelStation),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              py: 2,
              px: 3
            }}>
              <LocalGasStation sx={{ mr: 1.5 }} />
              <Typography variant="h6">
                {getFuelStationName(currentLog.fuelStation)}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {format(new Date(currentLog.date), 'PPP')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {format(new Date(currentLog.date), 'p')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Divider />
                </Grid>
                <Grid item xs={6} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fuel Amount
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {currentLog.fuelAmount} Liters
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Cost
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                    ${currentLog.cost.toFixed(2)}
                  </Typography>
                </Grid>
                {currentLog.vehicle && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Vehicle
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {currentLog.vehicle.make} {currentLog.vehicle.model}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, pr: 3 }}>
              <Button
                onClick={() => setOpenDetailDialog(false)}
                size="medium"
                sx={{ mr: 1 }}
              >
                Close
              </Button>
              <Button
                startIcon={<Edit />}
                onClick={() => handleEdit(currentLog)}
                variant="outlined"
                size="medium"
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={() => handleDelete(currentLog.id)}
                variant="outlined"
                color="error"
                size="medium"
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>


    </Box>
  );
};

export default FuelLogList;
