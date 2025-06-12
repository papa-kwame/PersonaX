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
  TablePagination,
  Stack,
  useTheme,
  useMediaQuery,
  Badge,
  InputAdornment
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
  Search,
  BarChart,
  PieChart,
  AttachMoney,
  LocalGasStation,
  Event,
  Person,
  CarRental
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import * as docx from 'docx';
import { saveAs as saveDocx } from 'file-saver';
import { Chart as ChartJS, ArcElement, Tooltip as ToolTipChart, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import { styled } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ToolTipChart,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

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

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  borderRadius: theme.shape.borderRadius * 2,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StatCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'scale(1.02)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
}));

const HoverTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AdminFuelLogger = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    endDate: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    fuelLogsPage: 0,
    fuelLogsRowsPerPage: 10,
    vehiclesPage: 0,
    vehiclesRowsPerPage: 10,
  });
  const [stats, setStats] = useState({
    totalFuel: 0,
    totalCost: 0,
    averageCostPerLiter: 0,
    topUsers: [],
  });

  const [formData, setFormData] = useState({
    vehicleId: '',
    fuelAmount: '',
    cost: '',
    fuelStation: '',
    date: new Date(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fuelLogs.length > 0 && users.length > 0) {
      calculateStats();
    }
  }, [fuelLogs, users]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsResponse, vehiclesResponse, usersResponse] = await Promise.all([
        api.get('/api/FuelLogs'),
        api.get('/api/Vehicles'),
        api.get('/api/Auth/users'),
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

  const calculateStats = () => {
    const totalFuel = fuelLogs.reduce((sum, log) => sum + log.fuelAmount, 0);
    const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const averageCostPerLiter = totalFuel > 0 ? totalCost / totalFuel : 0;

    const userStats = users
      .map((user) => {
        const userLogs = fuelLogs.filter((log) => log.userId === user.id);
        const userFuel = userLogs.reduce((sum, log) => sum + log.fuelAmount, 0);
        const userCost = userLogs.reduce((sum, log) => sum + log.cost, 0);
        return {
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          fuelAmount: userFuel,
          cost: userCost,
        };
      })
      .filter((user) => user.fuelAmount > 0)
      .sort((a, b) => b.fuelAmount - a.fuelAmount)
      .slice(0, 5);

    setStats({
      totalFuel,
      totalCost,
      averageCostPerLiter,
      topUsers: userStats,
    });
  };

  const handleOpenDialog = (log = null) => {
    if (log) {
      setCurrentLog(log);
      setFormData({
        vehicleId: log.vehicleId,
        fuelAmount: log.fuelAmount,
        cost: log.cost,
        fuelStation:
          Object.keys(fuelStationTypeMapping).find(
            (key) => fuelStationTypeMapping[key] === log.fuelStation.toString()
          ) || log.fuelStation,
        date: new Date(log.date),
      });
    } else {
      setCurrentLog(null);
      setFormData({
        vehicleId: '',
        fuelAmount: '',
        cost: '',
        fuelStation: '',
        date: new Date(),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = currentLog ? `/api/FuelLogs/${currentLog.id}` : '/api/FuelLogs';
      const method = currentLog ? 'put' : 'post';
      const data = currentLog
        ? {
            fuelAmount: formData.fuelAmount,
            cost: formData.cost,
            fuelStation: fuelStationTypeMapping[formData.fuelStation] || formData.fuelStation,
          }
        : {
            ...formData,
            fuelStation: fuelStationTypeMapping[formData.fuelStation] || formData.fuelStation,
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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...fuelLogs];

    if (filters.vehicleId) {
      filtered = filtered.filter((log) => log.vehicleId === filters.vehicleId);
    }

    if (filters.userId) {
      filtered = filtered.filter((log) => log.userId === filters.userId);
    }

    if (filters.startDate) {
      filtered = filtered.filter((log) => new Date(log.date) >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter((log) => new Date(log.date) <= filters.endDate);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.fuelStation.toLowerCase().includes(term) ||
          log.vehicle?.licensePlate?.toLowerCase().includes(term) ||
          users.find((u) => u.id === log.userId)?.name.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const handleChangePage = (event, newPage, type) => {
    setPagination((prev) => ({
      ...prev,
      [`${type}Page`]: newPage,
    }));
  };

  const handleChangeRowsPerPage = (event, type) => {
    setPagination((prev) => ({
      ...prev,
      [`${type}RowsPerPage`]: parseInt(event.target.value, 10),
      [`${type}Page`]: 0,
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
      { header: 'Fuel Station', key: 'fuelStation', width: 25 },
    ];

    const filteredLogs = applyFilters();
    filteredLogs.forEach((log) => {
      const vehicle = vehicles.find((v) => v.id === log.vehicleId);
      const user = users.find((u) => u.id === log.userId);
      worksheet.addRow({
        date: new Date(log.date).toLocaleDateString(),
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A',
        user: user ? user.name : 'N/A',
        fuelAmount: log.fuelAmount,
        cost: `₵${log.cost.toFixed(2)}`,
        fuelStation: log.fuelStation,
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
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
      styles: {
        paragraphStyles: [
          {
            id: 'heading1',
            name: 'Heading 1',
            run: {
              size: 32,
              bold: true,
              color: theme.palette.primary.main,
              font: 'Calibri',
            },
            paragraph: {
              spacing: { after: 200 },
            },
          },
          {
            id: 'heading2',
            name: 'Heading 2',
            run: {
              size: 26,
              bold: true,
              font: 'Calibri',
            },
            paragraph: {
              spacing: { after: 100 },
            },
          },
        ],
      },
    });

    doc.addSection({
      children: [
        new Paragraph({
          text: 'Fuel Logs Report',
          heading: HeadingLevel.HEADING_1,
          style: 'heading1',
        }),
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          style: 'heading2',
        }),
      ],
    });

    const filteredLogs = applyFilters();
    filteredLogs.forEach((log) => {
      const vehicle = vehicles.find((v) => v.id === log.vehicleId);
      const user = users.find((u) => u.id === log.userId);

      doc.addSection({
        children: [
          new Paragraph({
            text: `${new Date(log.date).toLocaleDateString()} - ${
              vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A'
            }`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Assigned to: ', bold: true }),
              new TextRun({ text: user ? user.name : 'N/A' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Fuel Amount: ', bold: true }),
              new TextRun({ text: `${log.fuelAmount} L` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Cost: ', bold: true }),
              new TextRun({ text: `₵${log.cost.toFixed(2)}` }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Fuel Station: ', bold: true }),
              new TextRun({ text: log.fuelStation }),
            ],
          }),
          new Paragraph({ text: '' }),
        ],
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

  const filteredLogs = applyFilters();

  const fuelByVehicleChartData = {
    labels: vehicles.slice(0, 5).map((v) => `${v.make} ${v.model}`),
    datasets: [
      {
        label: 'Fuel Consumption (L)',
        data: vehicles
          .slice(0, 5)
          .map(
            (v) =>
              fuelLogs.filter((l) => l.vehicleId === v.id).reduce((sum, log) => sum + log.fuelAmount, 0)
          ),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
        ],
        borderColor: [
          theme.palette.primary.dark,
          theme.palette.secondary.dark,
          theme.palette.error.dark,
          theme.palette.warning.dark,
          theme.palette.info.dark,
        ],
        borderWidth: 1,
      },
    ],
  };

  const fuelByStationChartData = {
    labels: Object.keys(fuelStationTypeMapping),
    datasets: [
      {
        label: 'Fuel Purchases',
        data: Object.keys(fuelStationTypeMapping).map(
          (station) => fuelLogs.filter((l) => l.fuelStation === station).length
        ),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8AC24A',
          '#F06292',
          '#7986CB',
          '#A1887F',
        ],
      },
    ],
  };

  const renderTableCell = (content, icon = null, align = 'left', color = 'default') => {
    return (
      <TableCell align={align}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
            gap: 1,
          }}
        >
          {icon &&
            React.cloneElement(icon, {
              sx: {
                color: theme.palette[color]?.main || theme.palette.text.primary,
                fontSize: '1.1rem',
              },
            })}
          <Typography variant="body2" color={color !== 'default' ? `${color}.main` : 'text.primary'}>
            {content}
          </Typography>
        </Box>
      </TableCell>
    );
  };

  const dialogStyles = {
    dialogTitle: {
      bgcolor: theme.palette.primary.main,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      py: 2,
      px: 3,
    },
    dialogContent: {
      py: 3,
      px: 3,
    },
    dialogActions: {
      px: 3,
      py: 2,
      borderTop: `1px solid ${theme.palette.divider}`,
    },
  };

  const filterPanelStyles = {
    p: 3,
    mb: 3,
    borderRadius: 2,
    background: theme.palette.background.paper,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: `1px solid ${theme.palette.divider}`,
  };

  const tabStyles = {
    minHeight: 48,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  };

  const cardHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    pb: 1,
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalGasStation sx={{ fontSize: '1.7rem', color: theme.palette.primary.main, mr: 2 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 300, color: theme.palette.text.primary }}>
              Fuel Logs Management
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: isMobile ? 1 : 0 }}>
            <ActionButton variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Add Log
            </ActionButton>
            <Tooltip title="Export to Excel">
              <ActionButton variant="outlined" color="primary" startIcon={<FileDownload />} onClick={exportToExcel}>
                Excel
              </ActionButton>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton
                color="primary"
                onClick={fetchData}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Paper sx={filterPanelStyles}>
<Grid container spacing={2} alignItems="center">
  <Grid item xs={12} sm={6} md={3}>
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search logs..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      size="small"
    />
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <FormControl fullWidth size="small" sx={{ minWidth: '120px' }}>
      <InputLabel>Vehicle</InputLabel>
      <Select
        value={filters.vehicleId}
        onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
        label="Vehicle"
      >
        <MenuItem value="">All Vehicles</MenuItem>
        {vehicles.map((vehicle) => (
          <MenuItem key={vehicle.id} value={vehicle.id}>
            {vehicle.make} {vehicle.model}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <FormControl fullWidth size="small" sx={{ minWidth: '120px' }}>
      <InputLabel>User</InputLabel>
      <Select
        value={filters.userId}
        onChange={(e) => handleFilterChange('userId', e.target.value)}
        label="User"
      >
        <MenuItem value="">All Users</MenuItem>
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <DatePicker
      label="Start Date"
      value={filters.startDate}
      onChange={(date) => handleFilterChange('startDate', date)}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          sx: { minWidth: '120px' }
        }
      }}
    />
  </Grid>
  <Grid item xs={12} sm={6} md={2}>
    <DatePicker
      label="End Date"
      value={filters.endDate}
      onChange={(date) => handleFilterChange('endDate', date)}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          sx: { minWidth: '120px' }
        }
      }}
    />
  </Grid>
  <Grid item xs={12} container justifyContent="flex-end" marginLeft='310px'>
    <Button
      variant="outlined"
      color="secondary"
      onClick={() => setFilters({
        vehicleId: '',
        userId: '',
        startDate: null,
        endDate: null,
      })}
      size="small"
    >
      Clear
    </Button>
  </Grid>
</Grid>

        </Paper>

        <Paper
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
              },
            }}
          >
            <Tab label="Fuel Logs" icon={<Description />} sx={tabStyles} />
            <Tab label="Vehicles" icon={<DirectionsCar />} sx={tabStyles} />
            <Tab label="Statistics" icon={<BarChart />} sx={tabStyles} />
          </Tabs>
        </Paper>

        {loading ? (
          <LinearProgress color="primary" sx={{ height: 2 }} />
        ) : (
          <>
            {activeTab === 0 && (
              <Paper
                sx={{
                  mb: 2,
                  overflow: 'hidden',
                  boxShadow: 'none',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
             <TableContainer>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        <StyledTableCell>Date</StyledTableCell>
        <StyledTableCell>Vehicle</StyledTableCell>
        <StyledTableCell>User</StyledTableCell>
        <StyledTableCell align="right">Fuel (L)</StyledTableCell>
        <StyledTableCell align="right">Cost</StyledTableCell>
        <StyledTableCell>Station</StyledTableCell>
        <StyledTableCell>Actions</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredLogs.length > 0 ? (
        filteredLogs
          .slice(
            pagination.fuelLogsPage * pagination.fuelLogsRowsPerPage,
            pagination.fuelLogsPage * pagination.fuelLogsRowsPerPage +
              pagination.fuelLogsRowsPerPage
          )
          .map((log) => {
            const vehicle = vehicles.find((v) => v.id === log.vehicleId);
            const user = users.find((u) => u.id === log.userId);
            return (
              <HoverTableRow key={log.id}>
                {renderTableCell(
                  new Date(log.date).toLocaleDateString(),
                  <Event />,
                  'left',
                  'textSecondary'
                )}
                <TableCell>
                  {vehicle ? (
                    <Tooltip
                      title={`${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`}
                    >
                      <Chip
                        avatar={
                          <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                            <DirectionsCar />
                          </Avatar>
                        }
                        label={`${vehicle.make} ${vehicle.model}`}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: theme.palette.divider,
                          backgroundColor: theme.palette.action.hover,
                        }}
                      />
                    </Tooltip>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {user ? (
                    <Tooltip title={`${user.email} | ${user.phone || 'No phone'}`}>
                      <Chip
                        avatar={<Avatar src={user.avatar} alt={user.name} />}
                        label={user.name}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: theme.palette.divider,
                          backgroundColor: theme.palette.action.hover,
                        }}
                      />
                    </Tooltip>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                {renderTableCell(log.fuelAmount, <LocalGasStation />, 'right', null)}
                {renderTableCell(`₵${log.cost.toFixed(2)}`, null, 'right', null)}
                <TableCell>
                  <Chip
                    label={
                      Object.keys(fuelStationTypeMapping).find(
                        (key) => fuelStationTypeMapping[key] === log.fuelStation.toString()
                      ) || log.fuelStation
                    }
                    size="small"
                    color="info"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleOpenDialog(log)}
                        size="small"
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(log.id)}
                        size="small"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </HoverTableRow>
            );
          })
      ) : (
        <TableRow>
          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
            <Typography color="text.secondary" variant="body1">
              No fuel logs found matching your criteria
            </Typography>
          </TableCell>
        </TableRow>
      )}
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
                  sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '52px',
                    },
                  }}
                />
              </Paper>
            )}

            {activeTab === 1 && (
              <>
                <Grid container spacing={3}>
                  {vehicles
                    .slice(
                      pagination.vehiclesPage * pagination.vehiclesRowsPerPage,
                      pagination.vehiclesPage * pagination.vehiclesRowsPerPage +
                        pagination.vehiclesRowsPerPage
                    )
                    .map((vehicle) => {
                      const assignedUser = users.find((u) => u.id === vehicle.userId);
                      const vehicleLogs = fuelLogs.filter((log) => log.vehicleId === vehicle.id);
                      const totalFuel = vehicleLogs.reduce((sum, log) => sum + log.fuelAmount, 0);
                      const totalCost = vehicleLogs.reduce((sum, log) => sum + log.cost, 0);

                      return (
                        <Grid item key={vehicle.id} xs={12} sm={6} md={4}>
                          <StyledCard>
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Box sx={cardHeaderStyles}>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                                {vehicle.make} {vehicle.model}
                                </Typography>
                                <Chip
                                  label={vehicle.licensePlate}
                                  color="primary"
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                VIN: {vehicle.vin || 'N/A'}
                              </Typography>

                              <Divider sx={{ my: 1 }} />

                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                  gap: 1,
                                }}
                              >
                                <Person color="action" />
                                <Typography variant="body2">
                                  {assignedUser ? (
                                    <span>
                                      Assigned to <strong>{assignedUser.name}</strong>
                                    </span>
                                  ) : (
                                    'Unassigned'
                                  )}
                                </Typography>
                              </Box>

                              <Grid container spacing={1} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                  <StatCard>
                                    <Typography variant="caption" color="text.secondary">
                                      Logs
                                    </Typography>
                                    <Typography variant="h6">{vehicleLogs.length}</Typography>
                                  </StatCard>
                                </Grid>
                                <Grid item xs={4}>
                                  <StatCard>
                                    <Typography variant="caption" color="text.secondary">
                                      Fuel
                                    </Typography>
                                    <Typography variant="h6">{totalFuel.toFixed(2)} L</Typography>
                                  </StatCard>
                                </Grid>
                                <Grid item xs={4}>
                                  <StatCard>
                                    <Typography variant="caption" color="text.secondary">
                                      Cost
                                    </Typography>
                                    <Typography variant="h6">₵{totalCost.toFixed(2)}</Typography>
                                  </StatCard>
                                </Grid>
                              </Grid>

                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                startIcon={<BarChart />}
                                onClick={async () => {
                                  const stats = await getVehicleStats(vehicle.id);
                                  console.log('Vehicle stats:', stats);
                                }}
                              >
                                View Details
                              </Button>
                            </CardContent>
                          </StyledCard>
                        </Grid>
                      );
                    })}
                </Grid>
                <TablePagination
                  rowsPerPageOptions={[6, 12, 24]}
                  component="div"
                  count={vehicles.length}
                  rowsPerPage={pagination.vehiclesRowsPerPage}
                  page={pagination.vehiclesPage}
                  onPageChange={(e, newPage) => handleChangePage(e, newPage, 'vehicles')}
                  onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, 'vehicles')}
                  sx={{ mt: 2 }}
                />
              </>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <StatCard>
                    <LocalGasStation sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalFuel.toFixed(2)} L
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Fuel Consumed
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard>
                    <AttachMoney sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      ₵{stats.totalCost.toFixed(2)}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Fuel Cost
                    </Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard>
                    <CarRental sx={{ fontSize: 40, mb: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      ₵{stats.averageCostPerLiter.toFixed(2)}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Avg. Cost per Liter
                    </Typography>
                  </StatCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={cardHeaderStyles}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Fuel Consumption by Vehicle (Top 5)
                      </Typography>
                    </Box>
                    <Box sx={{ height: 300 }}>
                      <Bar
                        data={fuelByVehicleChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                usePointStyle: true,
                                padding: 20,
                              },
                            },
                            tooltip: {
                              backgroundColor: theme.palette.background.paper,
                              titleColor: theme.palette.text.primary,
                              bodyColor: theme.palette.text.secondary,
                              borderColor: theme.palette.divider,
                              borderWidth: 1,
                              padding: 10,
                              usePointStyle: true,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: {
                                color: theme.palette.divider,
                              },
                              ticks: {
                                color: theme.palette.text.secondary,
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: theme.palette.text.secondary,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={cardHeaderStyles}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        <PieChart sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Purchases by Fuel Station
                      </Typography>
                    </Box>
                    <Box sx={{ height: 300 }}>
                      <Pie
                        data={fuelByStationChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            tooltip: {
                              backgroundColor: theme.palette.background.paper,
                              titleColor: theme.palette.text.primary,
                              bodyColor: theme.palette.text.secondary,
                              borderColor: theme.palette.divider,
                              borderWidth: 1,
                              padding: 10,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      boxShadow: 'none',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={cardHeaderStyles}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        <AssignmentInd sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Top Users by Fuel Consumption
                      </Typography>
                    </Box>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Fuel (L)</TableCell>
                          <TableCell align="right">Cost</TableCell>
                          <TableCell align="right">Avg. Cost/L</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.topUsers.map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={user.userAvatar} sx={{ width: 32, height: 32, mr: 2 }} />
                                {user.userName}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{user.fuelAmount.toFixed(2)} L</TableCell>
                            <TableCell align="right">₵{user.cost.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              ₵{(user.fuelAmount > 0 ? user.cost / user.fuelAmount : 0).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </>
        )}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle sx={dialogStyles.dialogTitle}>
            {currentLog ? (
              <>
                <Edit sx={{ mr: 1 }} />
                Edit Fuel Log
              </>
            ) : (
              <>
                <Add sx={{ mr: 1 }} />
                Add New Fuel Log
              </>
            )}
          </DialogTitle>
          <DialogContent sx={dialogStyles.dialogContent}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    label="Vehicle"
                    required
                  >
                    {vehicles.map((vehicle) => (
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
                  size="small"
                  InputProps={{
                    endAdornment: <LocalGasStation color="action" />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="cost"
                  label="Cost (₵)"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <AttachMoney color="action" />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fuel Station</InputLabel>
                  <Select
                    name="fuelStation"
                    value={formData.fuelStation}
                    onChange={handleInputChange}
                    label="Fuel Station"
                    required
                  >
                    {Object.keys(fuelStationTypeMapping).map((station) => (
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
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={dialogStyles.dialogActions}>
            <ActionButton
              onClick={handleCloseDialog}
              variant="outlined"
              color="inherit"
              sx={{
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.divider,
                },
              }}
            >
              Cancel
            </ActionButton>
            <ActionButton onClick={handleSubmit} variant="contained" color="primary" sx={{ ml: 1 }}>
              {currentLog ? 'Update' : 'Create'}
            </ActionButton>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminFuelLogger;
