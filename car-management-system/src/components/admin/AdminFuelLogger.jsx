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
// Remove import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';

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
  height: '280px',
  width:'350px',
  display: 'flex',
  flexDirection: 'column',
}));

const StatCard = styled(Card)(({ theme, sidebarExpanded }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  height: '100%',
  width: sidebarExpanded ? '350px' : '450px',
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

const AdminFuelLogger = ({ sidebarExpanded = true }) => {
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

  const [openVehicleLogsModal, setOpenVehicleLogsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleFuelLogs, setVehicleFuelLogs] = useState([]);
  const [vehicleLogsLoading, setVehicleLogsLoading] = useState(false);
  const [openStatsModal, setOpenStatsModal] = useState(false);
  const [statsStartDate, setStatsStartDate] = useState(null);
  const [statsEndDate, setStatsEndDate] = useState(null);
  const [statsUser, setStatsUser] = useState('');
  const [rangeStats, setRangeStats] = useState(null);
  const [rangeUserStats, setRangeUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  // 1. Add state for export modal and export filters
  const [openExportModal, setOpenExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(null);
  const [exportEndDate, setExportEndDate] = useState(null);
  const [exportUser, setExportUser] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

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
    }
  };

  const handleDelete = async (id) => {
    try {
      // Find the log to get the userId
      const log = fuelLogs.find(l => l.id === id);
      const userId = log?.userId || 'admin';
      await api.delete(`/api/FuelLogs/${id}?userId=${userId}`);
      fetchData();
    } catch (error) {
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

  // 4. Update exportToExcel and exportToWord to accept filters and use them to filter logs before exporting
  const exportToExcel = async (filters = {}) => {
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

    let logs = [...fuelLogs];
    if (filters.startDate) logs = logs.filter(log => new Date(log.date) >= filters.startDate);
    if (filters.endDate) logs = logs.filter(log => new Date(log.date) <= filters.endDate);
    if (filters.userId) logs = logs.filter(log => log.userId === filters.userId);

    filteredLogs.forEach((log) => {
      const vehicle = vehicles.find((v) => v.id === log.vehicleId);
      const user = users.find((u) => u.id === log.userId);
      worksheet.addRow({
        date: new Date(log.date).toLocaleDateString(),
        vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : 'N/A',
        user: user ? user.userName : 'N/A',
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

  const exportToWord = async (filters = {}) => {
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

    let logs = [...fuelLogs];
    if (filters.startDate) logs = logs.filter(log => new Date(log.date) >= filters.startDate);
    if (filters.endDate) logs = logs.filter(log => new Date(log.date) <= filters.endDate);
    if (filters.userId) logs = logs.filter(log => log.userId === filters.userId);

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
              new TextRun({ text: user ? user.userName : 'N/A' }),
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

  const handleViewVehicleLogs = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleLogsLoading(true);
    setOpenVehicleLogsModal(true);
    try {
      const response = await api.get(`/api/FuelLogs/vehicle/${vehicle.id}`);
      setVehicleFuelLogs(response.data);
    } catch (error) {
      setVehicleFuelLogs([]);
    } finally {
      setVehicleLogsLoading(false);
    }
  };

  const handleOpenStatsModal = () => {
    setOpenStatsModal(true);
    setStatsStartDate(null);
    setStatsEndDate(null);
    setStatsUser('');
    setRangeStats(null);
    setRangeUserStats(null);
  };
  const handleCloseStatsModal = () => setOpenStatsModal(false);

  const fetchRangeStats = async () => {
    if (!statsStartDate || !statsEndDate) return;
    setStatsLoading(true);
    try {
      if (statsUser) {
        const res = await api.get(`/api/FuelLogs/stats/user/${statsUser}/date-range`, {
          params: { startDate: statsStartDate, endDate: statsEndDate }
        });
        setRangeUserStats(res.data);
        setRangeStats(null);
      } else {
        const res = await api.get('/api/FuelLogs/stats/date-range', {
          params: { startDate: statsStartDate, endDate: statsEndDate }
        });
        setRangeStats(res.data);
        setRangeUserStats(null);
      }
    } catch (err) {
      setRangeStats(null);
      setRangeUserStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth={false} sx={{ 
        mt: 4, 
        mb: 4, 
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '100% !important',
        width: sidebarExpanded ? '100%' : 'calc(100% + 100px)',
        transition: 'width 0.3s ease-in-out'
      }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            p: 3,
            border: '1px solid #e5e7eb',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '6px',
              backgroundColor: '#f3f4f6',
              mr: 2,
              border: '1px solid #e5e7eb'
            }}>
              <LocalGasStation sx={{ fontSize: '1.5rem', color: '#374151' }} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" sx={{ 
                fontWeight: 600, 
                color: '#111827',
                mb: 0.5
              }}>
                Fuel Management
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#6b7280',
                fontWeight: 400
              }}>
                Track and manage vehicle fuel consumption
            </Typography>
          </Box>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ 
            mt: isMobile ? 2 : 0,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              sx={{ 
                borderRadius: '6px', 
                fontWeight: 500, 
                px: 3, 
                py: 1.5,
                backgroundColor: '#374151',
                '&:hover': {
                  backgroundColor: '#1f2937'
                }
              }} 
              onClick={() => handleOpenDialog()}
            >
              Add Log
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<FileDownload />} 
              sx={{ 
                borderRadius: '6px', 
                fontWeight: 500, 
                px: 3, 
                py: 1.5,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }} 
              onClick={() => setOpenExportModal(true)}
            >
                Export
              </Button>
            
            <Button
              variant="outlined"
              startIcon={<BarChart />}
              sx={{ 
                borderRadius: '6px', 
                fontWeight: 500, 
                px: 3, 
                py: 1.5,
                borderColor: '#d1d5db',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
              onClick={handleOpenStatsModal}
            >
              Analytics
            </Button>
            
              <IconButton
                onClick={fetchData}
                sx={{
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#6b7280',
                p: 1.5,
                  '&:hover': {
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  borderColor: '#9ca3af'
                  },
                }}
              >
                <Refresh />
              </IconButton>
          </Stack>
        </Box>

        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            p: 3,
          mb: 4,
            borderRadius: '8px',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
              <TextField
                variant="outlined"
            placeholder="Search fuel logs..."
            size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                  <Search sx={{ color: '#6b7280' }} />
                    </InputAdornment>
                  ),
              sx: { 
                borderRadius: '6px', 
                background: '#ffffff',
                '& fieldset': { borderColor: '#d1d5db' },
                '&:hover fieldset': { borderColor: '#9ca3af' },
                '&.Mui-focused fieldset': { borderColor: '#374151' }
              }
            }}
            sx={{ 
              minWidth: 280,
              flex: 1,
              '& .MuiInputBase-root': {
                height: '40px'
              }
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ color: '#6b7280' }}>Vehicle</InputLabel>
                <Select
                  value={filters.vehicleId}
                  onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                  label="Vehicle"
              sx={{ 
                borderRadius: '6px',
                background: '#ffffff',
                height: '40px',
                '& fieldset': { borderColor: '#d1d5db' },
                '&:hover fieldset': { borderColor: '#9ca3af' },
                '&.Mui-focused fieldset': { borderColor: '#374151' }
              }}
                >
                  <MenuItem value="">All Vehicles</MenuItem>
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#6b7280' }}>User</InputLabel>
                <Select
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  label="User"
              sx={{ 
                borderRadius: '6px',
                background: '#ffffff',
                height: '40px',
                '& fieldset': { borderColor: '#d1d5db' },
                '&:hover fieldset': { borderColor: '#9ca3af' },
                '&.Mui-focused fieldset': { borderColor: '#374151' }
              }}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                  {user.userName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
          
              <Button
                variant="outlined"
            startIcon={<Search />}
            onClick={applyFilters}
            sx={{ 
              borderRadius: '6px',
              fontWeight: 500,
              px: 3,
              py: 1.5,
              height: '40px',
              borderColor: '#d1d5db',
              color: '#374151',
              '&:hover': {
                borderColor: '#9ca3af',
                color: '#374151',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Apply Filters
          </Button>
        </Paper>

        {/* Tabs */}
        <Paper
          sx={{
            mb: 4,
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                height: 2,
                backgroundColor: '#374151',
              },
              '& .MuiTab-root': {
                fontWeight: 500,
                fontSize: '0.875rem',
                textTransform: 'none',
                py: 2,
                px: 3,
                color: '#6b7280',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                },
              },
              '& .Mui-selected': {
                color: '#374151',
                fontWeight: 600,
              },
            }}
          >
            <Tab 
              label="Fuel Logs" 
              icon={<Description sx={{ fontSize: '1.1rem' }} />} 
              iconPosition="start"
            />
            <Tab 
              label="Vehicles" 
              icon={<DirectionsCar sx={{ fontSize: '1.1rem' }} />} 
              iconPosition="start"
            />
            <Tab 
              label="Statistics" 
              icon={<BarChart sx={{ fontSize: '1.1rem' }} />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ mb: 3 }}>
            <LinearProgress 
              sx={{ 
                height: 2,
                backgroundColor: '#f3f4f6',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#374151',
                }
              }} 
            />
            <Typography sx={{ 
              mt: 1, 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Loading fuel logs...
            </Typography>
          </Box>
        ) : (
          <>
            {activeTab === 0 && (
              <Paper
                sx={{
                  mb: 3,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#ffffff',
                }}
              >
               <TableContainer sx={{ borderRadius: '8px', overflow: 'hidden' }}>
  <Table stickyHeader>
    <TableHead>
                     <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                       <StyledTableCell sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         Date
                       </StyledTableCell>
                       <StyledTableCell sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         Vehicle
                       </StyledTableCell>
                       <StyledTableCell sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         User
                       </StyledTableCell>
                       <StyledTableCell align="right" sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         Fuel (L)
                       </StyledTableCell>
                       <StyledTableCell align="right" sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         Cost
                       </StyledTableCell>
                       <StyledTableCell sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         Station
                       </StyledTableCell>
                       <StyledTableCell sx={{ 
                         fontWeight: 600, 
                         color: '#374151',
                         fontSize: '0.875rem',
                         borderBottom: '1px solid #e5e7eb'
                       }}>
                         Actions
                       </StyledTableCell>
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
                <TableCell sx={{ py: 2 }}>
                  {vehicle ? (
                    <Tooltip
                      title={`${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`}
                    >
                      <Chip
                        avatar={
                          <Avatar sx={{ 
                            bgcolor: '#f3f4f6',
                            width: 20,
                            height: 20,
                            fontSize: '0.75rem',
                            border: '1px solid #e5e7eb'
                          }}>
                            <DirectionsCar sx={{ fontSize: '0.75rem', color: '#6b7280' }} />
                          </Avatar>
                        }
                        label={`${vehicle.make} ${vehicle.model}`}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: '#d1d5db',
                          backgroundColor: '#ffffff',
                          fontWeight: 500,
                          fontSize: '0.75rem',
                          '&:hover': {
                            backgroundColor: '#f9fafb',
                            borderColor: '#9ca3af'
                          }
                        }}
                      />
                    </Tooltip>
                  ) : (
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  {user ? (
                    <Typography sx={{ 
                      fontWeight: 500, 
                      color: '#374151',
                      fontSize: '0.875rem'
                    }}>
                      {user.userName}
                    </Typography>
                  ) : (
                    <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                      N/A
                    </Typography>
                  )}
                </TableCell>
                {renderTableCell(log.fuelAmount, <LocalGasStation />, 'right', null)}
                {renderTableCell(`₵${log.cost.toFixed(2)}`, null, 'right', null)}
                <TableCell sx={{ py: 2 }}>
                  <Chip
                    label={
                      Object.keys(fuelStationTypeMapping).find(
                        (key) => fuelStationTypeMapping[key] === log.fuelStation.toString()
                      ) || log.fuelStation
                    }
                    size="small"
                    sx={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      border: '1px solid #e5e7eb',
                      '&:hover': {
                        backgroundColor: '#e5e7eb'
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleOpenDialog(log)}
                        size="small"
                        sx={{
                          color: '#6b7280',
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                          p: 0.5,
                          border: '1px solid #e5e7eb',
                          '&:hover': {
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            borderColor: '#d1d5db'
                          }
                        }}
                      >
                        <Edit sx={{ fontSize: '0.875rem' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(log.id)}
                        size="small"
                        sx={{
                          color: '#ef4444',
                          backgroundColor: '#fef2f2',
                          borderRadius: '4px',
                          p: 0.5,
                          border: '1px solid #fecaca',
                          '&:hover': {
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderColor: '#fca5a5'
                          }
                        }}
                      >
                        <Delete sx={{ fontSize: '0.875rem' }} />
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
            <Box sx={{ textAlign: 'center' }}>
              <LocalGasStation sx={{ 
                fontSize: '2.5rem', 
                color: '#d1d5db', 
                mb: 2 
              }} />
              <Typography sx={{ 
                color: '#6b7280', 
                fontSize: '1rem',
                fontWeight: 500,
                mb: 1
              }}>
                No fuel logs found
            </Typography>
              <Typography sx={{ 
                color: '#9ca3af', 
                fontSize: '0.875rem' 
              }}>
                No fuel logs match your current search criteria
              </Typography>
            </Box>
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
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    '& .MuiTablePagination-toolbar': {
                      minHeight: '56px',
                      px: 3,
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontWeight: 500,
                    },
                    '& .MuiTablePagination-select': {
                      fontSize: '0.875rem',
                    },
                    '& .MuiIconButton-root': {
                      color: '#6b7280',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                      },
                      '&.Mui-disabled': {
                        color: '#d1d5db',
                      },
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
                            <CardContent sx={{ flexGrow: 2 }}>
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

                              <Grid container spacing={1} sx={{ mb: 2 }}>
                                <Grid item xs={4}>
                                  <StatCard sidebarExpanded={sidebarExpanded}>
                                    <Typography variant="caption" color="text.secondary">
                                      Logs
                                    </Typography>
                                    <Typography variant="h6">{vehicleLogs.length}</Typography>
                                  </StatCard>
                                </Grid>
                                <Grid item xs={4}>
                                  <StatCard sidebarExpanded={sidebarExpanded}>
                                    <Typography variant="caption" color="text.secondary">
                                      Fuel
                                    </Typography>
                                    <Typography variant="h6">{totalFuel.toFixed(2)} L</Typography>
                                  </StatCard>
                                </Grid>
                                <Grid item xs={4}>
                                  <StatCard sidebarExpanded={sidebarExpanded}>
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
                                onClick={() => handleViewVehicleLogs(vehicle)}
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
              <Box sx={{ width: '100%', pb: 2 }}>

                <Grid container spacing={4}>
              
                  {[  ].map((stat, idx) => (
                    <Grid item xs={12} md={4} key={stat.label}>
                      <Box sx={{
                        p: 4,
                        borderRadius: 6,
                        background: stat.gradient,
                        boxShadow: '0 12px 40px 0 rgba(60, 80, 180, 0.18)',
                        border: '1.5px solid rgba(120,140,200,0.13)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 180,
                        '::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(180,210,255,0.13) 100%)',
                          zIndex: 1,
                          pointerEvents: 'none',
                          animation: 'shimmer 2.5s infinite linear',
                        },
                        '@keyframes shimmer': {
                          '0%': { backgroundPosition: '-400px 0' },
                          '100%': { backgroundPosition: '400px 0' },
                        },
                      }}>
                        <Box sx={{ mb: 1, zIndex: 2 }}>{stat.icon}</Box>
                        <Typography variant="h3" sx={{ fontWeight: 900,  letterSpacing: '1.2px', zIndex: 2, fontSize: '2.3rem', mb: 0.5 }}>
                          {stat.value}
                    </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 700, zIndex: 2, fontSize: '1.08rem' }}>
                          {stat.label}
                    </Typography>
                      </Box>
                </Grid>
                  ))}
                  {/* Charts */}
                <Grid item xs={12} md={6}>
                    <Box sx={{
                      borderRadius: 6,
                      boxShadow: '0 12px 40px 0 rgba(60, 80, 180, 0.18)',
                      border: '1.5px solid rgba(120,140,200,0.13)',
                      background: 'linear-gradient(120deg, #fafdff 80%, #e9f0fb 100%)',
                      height: '100%',
                      backdropFilter: 'blur(12px)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <Box sx={{
                        display: 'flex', alignItems: 'center', mb: 2, px: 3, py: 2,
                        borderTopLeftRadius: 6, borderTopRightRadius: 6,
                        boxShadow: '0 2px 12px rgba(25,118,210,0.10)',
                      }}>
                        <BarChart sx={{ verticalAlign: 'middle', mr: 1, color: 'black', fontSize: 32 }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'black', letterSpacing: '0.5px' }}>
                        Fuel Consumption by Vehicle (Top 5)
                      </Typography>
                    </Box>
                      <Box sx={{ height: 300, px: 2, pb: 2 }}>
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
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                      borderRadius: 6,
                      boxShadow: '0 12px 40px 0 rgba(60, 80, 180, 0.18)',
                      border: '1.5px solid rgba(120,140,200,0.13)',
                      background: 'linear-gradient(120deg, #fafdff 80%, #e9f0fb 100%)',
                      height: '100%',
                      backdropFilter: 'blur(12px)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <Box sx={{
                        display: 'flex', alignItems: 'center', mb: 2, px: 3, py: 2,
                        color:'black',
                        borderTopLeftRadius: 6, borderTopRightRadius: 6,
                        boxShadow: '0 2px 12px rgba(25,118,210,0.10)',
                      }}>
                        <PieChart sx={{ verticalAlign: 'middle', mr: 1, color: 'black', fontSize: 32 }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'black', letterSpacing: '0.5px' }}>
                        Purchases by Fuel Station
                      </Typography>
                    </Box>
                      <Box sx={{ height: 300, px: 2, pb: 2 }}>
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
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)', background: '#fff', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AssignmentInd sx={{ verticalAlign: 'middle', mr: 1,  }} />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
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
                  </Card>
                </Grid>
              </Grid>
              </Box>
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
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(25, 118, 210, 0.13)',
              borderLeft: '6px solid',
              borderColor: 'primary.main',
              background: '#fff',
            },
          }}
        >
          <DialogTitle sx={{
            display: 'flex', alignItems: 'center', fontWeight: 800, color: 'primary.main', fontSize: '1.3rem',
            pl: 4, pr: 6, py: 3, borderBottom: '2px solid #e3e8f0', background: 'rgba(25, 118, 210, 0.03)', position: 'relative',
          }}>
            {currentLog ? (
              <><Edit sx={{ mr: 1 }} />Edit Fuel Log</>
            ) : (
              <><Add sx={{ mr: 1 }} />Add New Fuel Log</>
            )}
          </DialogTitle>
          <DialogContent sx={{ py: 4, px: 4 }}>
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
                    sx={{ borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0' }}
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
                    sx: { borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0' }
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
                    sx: { borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0' }
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
                    sx={{ borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0' }}
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
                      sx: { borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0' }
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{
            px: 4, py: 2.5, borderTop: '2px solid #e3e8f0', background: '#f8fafc', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px'
          }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 3, minWidth: 100, borderColor: '#e3e8f0', color: 'primary.main', fontWeight: 700, '&:hover': { backgroundColor: 'primary.light', color: '#fff' } }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ ml: 1, borderRadius: 3, minWidth: 100, fontWeight: 700 }}>
              {currentLog ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openVehicleLogsModal}
          onClose={() => setOpenVehicleLogsModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(25, 118, 210, 0.13)',
              borderLeft: '6px solid',
              borderColor: 'primary.main',
              background: '#fff',
            },
          }}
        >
          <DialogTitle sx={{
            display: 'flex', alignItems: 'center', fontWeight: 800, color: 'primary.main', fontSize: '1.3rem',
            pl: 4, pr: 6, py: 3, borderBottom: '2px solid #e3e8f0', background: 'rgba(25, 118, 210, 0.03)', position: 'relative',
          }}>
            <BarChart sx={{ mr: 1 }} />
            Fuel Logs for {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : ''}
          </DialogTitle>
          <DialogContent sx={{ py: 4, px: 4 }}>
            {vehicleLogsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <LinearProgress color="primary" sx={{ width: '100%' }} />
              </Box>
            ) : vehicleFuelLogs.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No fuel logs found for this vehicle.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Fuel (L)</TableCell>
                      <TableCell>Cost</TableCell>
                      <TableCell>Station</TableCell>
                      <TableCell>User</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicleFuelLogs.map((log) => {
                      const user = users.find((u) => u.id === log.userId);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                          <TableCell>{log.fuelAmount}</TableCell>
                          <TableCell>₵{log.cost}</TableCell>
                          <TableCell>{
                            Object.keys(fuelStationTypeMapping).find(
                              (key) => fuelStationTypeMapping[key] === log.fuelStation.toString()
                            ) || log.fuelStation
                          }</TableCell>
                          <TableCell>
                            {user ? user.userName : 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 4, py: 2.5, borderTop: '2px solid #e3e8f0', background: '#f8fafc', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px' }}>
            <Button
              onClick={() => setOpenVehicleLogsModal(false)}
              variant="outlined"
              color="inherit"
              sx={{ borderRadius: 3, minWidth: 100, borderColor: '#e3e8f0', color: 'primary.main', fontWeight: 700, '&:hover': { backgroundColor: 'primary.light', color: '#fff' } }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Stats Modal */}
        <Dialog open={openStatsModal} onClose={handleCloseStatsModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.3rem', background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)', color: '#fff', letterSpacing: '0.7px' }}>
            Custom Fuel Stats
          </DialogTitle>
          <DialogContent sx={{ p: 4, background: 'linear-gradient(120deg, #fafdff 80%, #e9f0fb 100%)' }}>
            <Stack spacing={3}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={statsStartDate}
                    onChange={setStatsStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0', mb: 2 }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={statsEndDate}
                    onChange={setStatsEndDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { borderRadius: 3, background: '#f4f8fd', border: '1.5px solid #e3e8f0', mb: 2 }
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth size="small">
                <InputLabel>User (optional)</InputLabel>
                <Select
                  value={statsUser}
                  onChange={e => setStatsUser(e.target.value)}
                  label="User (optional)"
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>{user.userName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={fetchRangeStats} disabled={statsLoading || !statsStartDate || !statsEndDate} sx={{ fontWeight: 700, borderRadius: 3 }}>
                {statsLoading ? 'Loading...' : 'Get Stats'}
              </Button>
              {(rangeStats || rangeUserStats) && (
                <Paper sx={{ mt: 2, p: 3, borderRadius: 4, background: 'linear-gradient(120deg, #fafdff 80%, #e9f0fb 100%)', boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)' }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                    Results
                  </Typography>
                  <Stack spacing={1.5}>
                    <Typography><b>Date Range:</b> {rangeStats ? `${rangeStats.startDate} to ${rangeStats.endDate}` : `${rangeUserStats?.startDate} to ${rangeUserStats?.endDate}`}</Typography>
                    {rangeUserStats && <Typography><b>User:</b> {rangeUserStats.userName}</Typography>}
                    <Typography><b>Total Fuel:</b> {rangeStats ? rangeStats.totalFuel : rangeUserStats?.totalFuel} L</Typography>
                    <Typography><b>Total Cost:</b> ₵{rangeStats ? rangeStats.totalCost : rangeUserStats?.totalCost}</Typography>
                    <Typography><b>Average Cost/Litre:</b> ₵{rangeStats ? rangeStats.averageCostPerLitre : rangeUserStats?.averageCostPerLitre}</Typography>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)' }}>
            <Button onClick={handleCloseStatsModal} color="inherit" sx={{ fontWeight: 700, borderRadius: 3, color: '#fff' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Export Modal */}
        <Dialog open={openExportModal} onClose={() => setOpenExportModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.2rem', background: '#f5f7fa', borderBottom: '1px solid #e3e8f0' }}>
            Export Fuel Logs
          </DialogTitle>
          <DialogContent sx={{ p: 4, background: '#fff' }}>
            <Stack spacing={3}>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={exportStartDate}
                    onChange={setExportStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { borderRadius: 2, background: '#f7fafd', border: '1px solid #e3e8f0', mb: 2 }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={exportEndDate}
                    onChange={setExportEndDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { borderRadius: 2, background: '#f7fafd', border: '1px solid #e3e8f0', mb: 2 }
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth size="small">
                <InputLabel>User (optional)</InputLabel>
                <Select
                  value={exportUser}
                  onChange={e => setExportUser(e.target.value)}
                  label="User (optional)"
                  sx={{ borderRadius: 2, background: '#f7fafd', border: '1px solid #e3e8f0' }}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>{user.userName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setOpenExportModal(false)}
                  sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    setExportLoading(true);
                    await exportToExcel({
                      startDate: exportStartDate,
                      endDate: exportEndDate,
                      userId: exportUser
                    });
                    setExportLoading(false);
                    setOpenExportModal(false);
                  }}
                  disabled={exportLoading || !exportStartDate || !exportEndDate}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  {exportLoading ? 'Exporting...' : 'Export to Excel'}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={async () => {
                    setExportLoading(true);
                    await exportToWord({
                      startDate: exportStartDate,
                      endDate: exportEndDate,
                      userId: exportUser
                    });
                    setExportLoading(false);
                    setOpenExportModal(false);
                  }}
                  disabled={exportLoading || !exportStartDate || !exportEndDate}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  {exportLoading ? 'Exporting...' : 'Export to Word'}
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ background: '#f5f7fa', borderTop: '1px solid #e3e8f0' }}>
            <Button onClick={() => setOpenExportModal(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: 2, color: 'primary.main', textTransform: 'none' }}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminFuelLogger;
