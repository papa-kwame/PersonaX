import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getVehicles,
  deleteVehicle,
  createVehicle,
  updateVehicle
} from '../../services/vehicles';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  styled
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DeleteModal from '../common/DeleteModal';
import VehicleFilters from './VehicleFilters';
import VehicleModal from './VehicleModal';
// Styled components for consistent styling
const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '100%',
  [theme.breakpoints.up('lg')]: {
    maxWidth: '1200px'
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(3),
  overflow: 'hidden'
}));

const StyledTableRow = styled(TableRow)(({ theme, warning }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 123, 255, 0.03)'
  },
  ...(warning && {
    backgroundColor: '#fff3e0'
  })
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid #e9ecef'
}));

const StyledTableHeadCell = styled(StyledTableCell)(({ theme }) => ({
  backgroundColor: '#f8f9fa',
  fontWeight: 600,
  color: '#495057',
  borderTop: 'none'
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  padding: '8px 16px'
}));

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    vehicleType: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'make', direction: 'asc' });
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        let data = await getVehicles();

        // Apply filters
        if (filters.status) {
          data = data.filter(v => v.status === filters.status);
        }

        if (filters.vehicleType) {
          data = data.filter(v => v.vehicleType === filters.vehicleType);
        }

        // Apply search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          data = data.filter(v =>
            v.make.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.licensePlate.toLowerCase().includes(query) ||
            v.vin.toLowerCase().includes(query)
          );
        }

        // Sort data
        data.sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });

        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [filters, sortConfig, searchQuery]);

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteVehicle(vehicleToDelete.id);
      setVehicles(vehicles.filter(v => v.id !== vehicleToDelete.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const handleAddVehicle = () => {
    setCurrentVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (currentVehicle) {
        await updateVehicle(currentVehicle.id, vehicleData);
      } else {
        await createVehicle(vehicleData);
      }
      setShowVehicleModal(false);
      // Refresh the vehicle list
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

  const paginate = (event, value) => setCurrentPage(value);

  return (
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 600 }}>
          Vehicle Inventory
        </Typography>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddVehicle}
        >
          Add Vehicle
        </StyledButton>
      </Box>

      <VehicleFilters
        filters={filters}
        setFilters={setFilters}
        vehicleCount={vehicles.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {loading && <Typography>Loading vehicles...</Typography>}
      {error && <Typography color="error">Error: {error}</Typography>}
      {!loading && vehicles.length === 0 && (
        <Typography>No vehicles found matching your criteria</Typography>
      )}

      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>License Plate</StyledTableHeadCell>
                <StyledTableHeadCell onClick={() => handleSort('model')}>
                  Model {sortConfig.key === 'model' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </StyledTableHeadCell>
                <StyledTableHeadCell onClick={() => handleSort('year')}>
                  Year {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </StyledTableHeadCell>
                <StyledTableHeadCell onClick={() => handleSort('make')}>
                  Make {sortConfig.key === 'make' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </StyledTableHeadCell>
                <StyledTableHeadCell onClick={() => handleSort('currentMileage')}>
                  Mileage {sortConfig.key === 'currentMileage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </StyledTableHeadCell>
                <StyledTableHeadCell>Roadworthy</StyledTableHeadCell>
                <StyledTableHeadCell>Registration</StyledTableHeadCell>
                <StyledTableHeadCell>Next Service</StyledTableHeadCell>
                <StyledTableHeadCell>Actions</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentVehicles.map((vehicle) => (
                <StyledTableRow
                  key={vehicle.id}
                  warning={isExpired(vehicle.roadworthyExpiry) || isExpired(vehicle.registrationExpiry)}
                >
                  <StyledTableCell>
                    <Link to={`/vehicles/${vehicle.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {vehicle.licensePlate}
                    </Link>
                  </StyledTableCell>
                  <StyledTableCell>{vehicle.make}</StyledTableCell>
                  <StyledTableCell>{vehicle.model}</StyledTableCell>
                  <StyledTableCell>{vehicle.year}</StyledTableCell>
                  <StyledTableCell>{vehicle.currentMileage.toLocaleString()}</StyledTableCell>
                  <StyledTableCell sx={{ color: isExpired(vehicle.roadworthyExpiry) ? 'error.main' : 'inherit' }}>
                    {vehicle.roadworthyExpiry ? new Date(vehicle.roadworthyExpiry).toLocaleDateString() : 'N/A'}
                  </StyledTableCell>
                  <StyledTableCell sx={{ color: isExpired(vehicle.registrationExpiry) ? 'error.main' : 'inherit' }}>
                    {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString() : 'N/A'}
                  </StyledTableCell>
                  <StyledTableCell sx={{ color: isExpired(vehicle.nextServiceDue) ? 'error.main' : 'inherit' }}>
                    {vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue).toLocaleDateString() : 'N/A'}
                  </StyledTableCell>
                  <StyledTableCell>
                    <IconButton onClick={() => handleEditVehicle(vehicle)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(vehicle)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={totalPages} page={currentPage} onChange={paginate} color="primary" />
      </Box>

      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={`${vehicleToDelete?.make} ${vehicleToDelete?.model} (${vehicleToDelete?.licensePlate})`}
      />

      <VehicleModal
        show={showVehicleModal}
        onHide={() => setShowVehicleModal(false)}
        vehicle={currentVehicle}
        onSave={handleSaveVehicle}
        title={currentVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      />
    </StyledContainer>
  );
}