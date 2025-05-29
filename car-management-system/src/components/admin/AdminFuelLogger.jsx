import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  TablePagination
} from '@mui/material';
import {
  Delete,
  Edit,
  Add,
  FileDownload,
  Description,
  AssignmentInd,
  DirectionsCar,
  FilterAlt,
  Refresh,
  Search
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import * as docx from 'docx';
import { saveAs as saveDocx } from 'file-saver';
import api from '../../services/api';

const fuelStationTypeMapping = {
  GOIL: '1',
  Total: '2',
  Shell: '3',
  PetroSA: '4',
  Frimps: '5',
  Puma: '6',
  StarOil: '7',
  AlliedOil: '8',
  ZenPetroleum: '9',
  Other: '0'
};

const AdminFuelLogger = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vehicleId: '',
    userId: '',
    startDate: null,
    endDate: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    fuelLogsPage: 0,
    fuelLogsRowsPerPage: 10,
    vehiclesPage: 0,
    vehiclesRowsPerPage: 10
  });

  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelAmount: '',
    cost: '',
    fuelStation: '',
    date: new Date()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsResponse, vehiclesResponse, usersResponse] = await Promise.all([
        api.get('/api/FuelLogs'),
        api.get('/api/Vehicles'),
        api.get('/api/Auth/users')
      ]);

      setFuelLogs(logsResponse.data);
      setVehicles(vehiclesResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (log = null) => {
    if (log) {
      setCurrentLog(log);
      setFormData({
        vehicleId: log.vehicleId,
        fuelAmount: log.fuelAmount,
        cost: log.cost,
        fuelStation: log.fuelStation,
        date: new Date(log.date)
      });
    } else {
      setCurrentLog(null);
      setFormData({
        vehicleId: '',
        fuelAmount: '',
        cost: '',
        fuelStation: '',
        date: new Date()
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = currentLog ? `/api/FuelLogs/${currentLog.id}` : '/api/FuelLogs';
      const method = currentLog ? 'put' : 'post';
      const data = currentLog ? {
        fuelAmount: formData.fuelAmount,
        cost: formData.cost,
        fuelStation: fuelStationTypeMapping[formData.fuelStation] || formData.fuelStation
      } : {
        ...formData,
        fuelStation: fuelStationTypeMapping[formData.fuelStation] || formData.fuelStation
      };

      await api[method](url, data);

      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving fuel log:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/FuelLogs/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting fuel log:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...fuelLogs];

    if (filters.vehicleId) {
      filtered = filtered.filter(log => log.vehicleId === filters.vehicleId);
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.date) >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.date) <= filters.endDate);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.fuelStation.toLowerCase().includes(term) ||
        (log.vehicle?.licensePlate?.toLowerCase().includes(term)) ||
        (users.find(u => u.id === log.userId)?.name.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  const handleChangePage = (event, newPage, type) => {
    setPagination(prev => ({
      ...prev,
      [`${type}Page`]: newPage
    }));
  };

  const handleChangeRowsPerPage = (event, type) => {
    setPagination(prev => ({
      ...prev,
      [`${type}RowsPerPage`]: parseInt(event.target.value, 10),
      [`${type}Page`]: 0
    }));
  };

  const exportToExcel = async () => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Fuel Logs');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Vehicle', key: 'vehicle', width: 20 },
      { header: 'Assigned To', key: 'user', width: 20 },
      { header: 'Fuel Amount (L)', key: 'fuelAmount', width: 15 },
      { header: 'Cost', key: 'cost', width: 15 },
      { header: 'Fuel Station', key: 'fuelStation', width: 25 }
    ];

    const filteredLogs = applyFilters();
    filteredLogs.forEach(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      const user = users.find(u => u.id === log.userId);
      worksheet.addRow({
        date: new Date(log.date).toLocaleDateString(),
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A',
        user: user ? user.name : 'N/A',
        fuelAmount: log.fuelAmount,
        cost: log.cost,
        fuelStation: log.fuelStation
      });
    });

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Fuel_Logs_Export.xlsx');
  };

  const exportToWord = async () => {
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = docx;

    const doc = new Document({
      title: 'Fuel Logs Report',
      description: 'Generated by Fleet Management System',
    });

    doc.addSection({
      children: [
        new Paragraph({
          text: 'Fuel Logs Report',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          spacing: { after: 400 }
        })
      ]
    });

    const filteredLogs = applyFilters();
    filteredLogs.forEach(log => {
      const vehicle = vehicles.find(v => v.id === log.vehicleId);
      const user = users.find(u => u.id === log.userId);

      doc.addSection({
        children: [
          new Paragraph({
            text: `${new Date(log.date).toLocaleDateString()} - ${vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'}`,
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Assigned to: ', bold: true }),
              new TextRun({ text: user ? user.name : 'N/A' })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Fuel Amount: ', bold: true }),
              new TextRun({ text: `${log.fuelAmount} L` })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Cost: ', bold: true }),
              new TextRun({ text: `$${log.cost.toFixed(2)}` })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Fuel Station: ', bold: true }),
              new TextRun({ text: log.fuelStation })
            ]
          }),
          new Paragraph({ text: '' })
        ]
      });
    });

    const buffer = await Packer.toBlob(doc);
    saveDocx(buffer, 'Fuel_Logs_Report.docx');
  };

  const getVehicleStats = async (vehicleId) => {
    try {
      const response = await api.get(`/api/FuelLogs/stats/${vehicleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      return null;
    }
  };

  const getUserStats = async (userId) => {
    try {
      const response = await api.get(`/api/FuelLogs/user/stats?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  };

  const filteredLogs = applyFilters();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Fuel Logs Management
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ mr: 2 }}
            >
              Add Log
            </Button>
            <Tooltip title="Export to Excel">
              <IconButton color="primary" onClick={exportToExcel}>
                <FileDownload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export to Word">
              <IconButton color="primary" onClick={exportToWord}>
                <Description />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton color="primary" onClick={fetchData}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search..."
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={filters.vehicleId}
                  onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                  label="Vehicle"
                >
                  <MenuItem value="">All Vehicles</MenuItem>
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  label="User"
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterAlt />}
                onClick={() => setFilters({
                  vehicleId: '',
                  userId: '',
                  startDate: null,
                  endDate: null
                })}
              >
                Clear Filters
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Fuel Logs" icon={<Description />} />
          <Tab label="Vehicles" icon={<DirectionsCar />} />
          <Tab label="Statistics" icon={<AssignmentInd />} />
        </Tabs>

        {loading ? (
          <LinearProgress />
        ) : (
          <>
            {activeTab === 0 && (
              <>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Assigned To</TableCell>
                        <TableCell>Fuel Amount (L)</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Fuel Station</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs.slice(pagination.fuelLogsPage * pagination.fuelLogsRowsPerPage, pagination.fuelLogsPage * pagination.fuelLogsRowsPerPage + pagination.fuelLogsRowsPerPage).map(log => {
                        const vehicle = vehicles.find(v => v.id === log.vehicleId);
                        const user = users.find(u => u.id === log.userId);
                        return (
                          <TableRow key={log.id}>
                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {vehicle ? (
                                <Tooltip title={`${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`}>
                                  <Chip
                                    avatar={<Avatar><DirectionsCar /></Avatar>}
                                    label={`${vehicle.make} ${vehicle.model}`}
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {user ? (
                                <Tooltip title={`${user.email} | ${user.phone || 'No phone'}`}>
                                  <Chip
                                    avatar={<Avatar src={user.avatar} alt={user.name} />}
                                    label={user.name}
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell>{log.fuelAmount} L</TableCell>
                            <TableCell>${log.cost.toFixed(2)}</TableCell>
                            <TableCell>{log.fuelStation}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleOpenDialog(log)}>
                                <Edit color="primary" />
                              </IconButton>
                              <IconButton onClick={() => handleDelete(log.id)}>
                                <Delete color="error" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredLogs.length}
                  rowsPerPage={pagination.fuelLogsRowsPerPage}
                  page={pagination.fuelLogsPage}
                  onPageChange={(e, newPage) => handleChangePage(e, newPage, 'fuelLogs')}
                  onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, 'fuelLogs')}
                />
              </>
            )}

            {activeTab === 1 && (
              <>
                <Grid container spacing={3}>
                  {vehicles.slice(pagination.vehiclesPage * pagination.vehiclesRowsPerPage, pagination.vehiclesPage * pagination.vehiclesRowsPerPage + pagination.vehiclesRowsPerPage).map(vehicle => {
                    const assignedUser = users.find(u => u.id === vehicle.userId);
                    const vehicleLogs = fuelLogs.filter(log => log.vehicleId === vehicle.id);
                    const totalFuel = vehicleLogs.reduce((sum, log) => sum + log.fuelAmount, 0);
                    const totalCost = vehicleLogs.reduce((sum, log) => sum + log.cost, 0);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="h6" component="div">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </Typography>
                              <Chip label={vehicle.licensePlate} color="primary" />
                            </Box>
                            <Typography color="text.secondary" sx={{ mt: 1 }}>
                              VIN: {vehicle.vin || 'N/A'}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <AssignmentInd color="action" sx={{ mr: 1 }} />
                              <Typography>
                                {assignedUser ? (
                                  <span>
                                    Assigned to <strong>{assignedUser.name}</strong>
                                  </span>
                                ) : 'Unassigned'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">
                                Fuel Logs: <strong>{vehicleLogs.length}</strong>
                              </Typography>
                              <Typography variant="body2">
                                Total Fuel: <strong>{totalFuel.toFixed(2)} L</strong>
                              </Typography>
                              <Typography variant="body2">
                                Total Cost: <strong>${totalCost.toFixed(2)}</strong>
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              sx={{ mt: 2 }}
                              onClick={async () => {
                                const stats = await getVehicleStats(vehicle.id);
                                console.log('Vehicle stats:', stats);
                              }}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={vehicles.length}
                  rowsPerPage={pagination.vehiclesRowsPerPage}
                  page={pagination.vehiclesPage}
                  onPageChange={(e, newPage) => handleChangePage(e, newPage, 'vehicles')}
                  onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, 'vehicles')}
                />
              </>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Fuel Consumption Overview
                    </Typography>
                    <Box sx={{ height: 300, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Fuel Consumption Chart</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Users by Fuel Consumption
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Fuel (L)</TableCell>
                          <TableCell align="right">Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map(user => {
                          const userLogs = fuelLogs.filter(log => log.userId === user.id);
                          const totalFuel = userLogs.reduce((sum, log) => sum + log.fuelAmount, 0);
                          const totalCost = userLogs.reduce((sum, log) => sum + log.cost, 0);

                          if (userLogs.length === 0) return null;

                          return (
                            <TableRow key={user.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar src={user.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                                  {user.name}
                                </Box>
                              </TableCell>
                              <TableCell align="right">{totalFuel.toFixed(2)} L</TableCell>
                              <TableCell align="right">${totalCost.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        }).filter(Boolean)
                        .sort((a, b) => b.props.children[1].props.children - a.props.children[1].props.children)
                        .slice(0, 5)}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{currentLog ? 'Edit Fuel Log' : 'Add New Fuel Log'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    label="Vehicle"
                    required
                  >
                    {vehicles.map(vehicle => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fuelAmount"
                  label="Fuel Amount (L)"
                  type="number"
                  value={formData.fuelAmount}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="cost"
                  label="Cost ($)"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Fuel Station</InputLabel>
                  <Select
                    name="fuelStation"
                    value={formData.fuelStation}
                    onChange={handleInputChange}
                    label="Fuel Station"
                    required
                  >
                    {Object.keys(fuelStationTypeMapping).map(station => (
                      <MenuItem key={station} value={station}>
                        {station}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {currentLog ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminFuelLogger;
