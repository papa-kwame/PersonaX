import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getVehicles,
  deleteVehicle,
  createVehicle,
  updateVehicle,
  getVehicleById
} from '../../services/vehicles';
import {
  Button,
  Container,
  Row,
  Col,
  Modal,
  Table,
  Form,
  Spinner,
  Card,
  Badge,
  Alert,
  InputGroup,
  ListGroup,
  CloseButton
} from 'react-bootstrap';
import {
  Plus,
  PencilSquare,
  X,
  ArrowRepeat,
  Search,
  CheckCircle,
  ShieldCheck,
  ChatSquareText,
  PersonCheck
} from 'react-bootstrap-icons';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    vehicleType: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'make', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    vehicleType: 'Sedan',
    color: '',
    status: 'Available',
    currentMileage: 0,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    engineSize: '',
    seatingCapacity: 5,
    purchaseDate: '',
    purchasePrice: 0,
    lastServiceDate: '',
    serviceInterval: 10000,
    nextServiceDue: '',
    roadworthyExpiry: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    notes: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const vehiclesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      setError('');

      try {
        let data = await getVehicles();

        if (filters.status) {
          data = data.filter(v => v.status === filters.status);
        }

        if (filters.vehicleType) {
          data = data.filter(v => v.vehicleType === filters.vehicleType);
        }

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          data = data.filter(v =>
            v.make.toLowerCase().includes(query) ||
            v.model.toLowerCase().includes(query) ||
            v.licensePlate.toLowerCase().includes(query) ||
            v.vin.toLowerCase().includes(query)
          );
        }

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
      setSuccess('Vehicle deleted successfully');
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
    setFormData({
      make: '',
      model: '',
      year: '',
      licensePlate: '',
      vin: '',
      vehicleType: 'Sedan',
      color: '',
      status: 'Available',
      currentMileage: 0,
      fuelType: 'Gasoline',
      transmission: 'Automatic',
      engineSize: '',
      seatingCapacity: 5,
      purchaseDate: '',
      purchasePrice: 0,
      lastServiceDate: '',
      serviceInterval: 10000,
      nextServiceDue: '',
      roadworthyExpiry: '',
      registrationExpiry: '',
      insuranceExpiry: '',
      notes: ''
    });
    setValidationErrors({});
    setIsSubmitted(false);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setFormData({
      ...vehicle,
      purchaseDate: vehicle.purchaseDate?.split('T')[0],
      lastServiceDate: vehicle.lastServiceDate?.split('T')[0],
      roadworthyExpiry: vehicle.roadworthyExpiry?.split('T')[0],
      registrationExpiry: vehicle.registrationExpiry?.split('T')[0],
      insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0],
      nextServiceDue: vehicle.nextServiceDue?.split('T')[0]
    });
    setValidationErrors({});
    setIsSubmitted(false);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      if (formData.id) {
        await updateVehicle(formData.id, formData);
        setSuccess('Vehicle updated successfully');
      } else {
        await createVehicle(formData);
        setSuccess('Vehicle created successfully');
      }
      const data = await getVehicles();
      setVehicles(data);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['currentMileage', 'purchasePrice', 'serviceInterval', 'seatingCapacity', 'engineSize'].includes(name)
        ? parseFloat(value) || 0 : value
    }));

    if (isSubmitted) {
      validateField(name, value);
    }
  };

  const validateField = (name, value) => {
    const currentYear = new Date().getFullYear();
    let error = '';

    switch (name) {
      case 'make':
        if (!value) error = 'Make is required';
        break;
      case 'model':
        if (!value) error = 'Model is required';
        break;
      case 'year':
        if (!value || value < 1900 || value > currentYear + 1) {
          error = `Year must be between 1900 and ${currentYear + 1}`;
        }
        break;
      case 'licensePlate':
        if (!value) error = 'License plate is required';
        break;
      case 'vin':
        if (!value || value.length < 17) error = 'VIN must be 17 characters';
        break;
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.make) errors.make = 'Make is required';
    if (!formData.model) errors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > currentYear + 1) {
      errors.year = `Year must be between 1900 and ${currentYear + 1}`;
    }
    if (!formData.licensePlate) errors.licensePlate = 'License plate is required';
    if (!formData.vin || formData.vin.length < 17) errors.vin = 'VIN must be 17 characters';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

  const paginate = (page) => setCurrentPage(page);

  const vehicleTypes = [
    { value: 'Sedan', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Van', label: 'Van' },
    { value: 'Hatchback', label: 'Hatchback' },
    { value: 'Coupe', label: 'Coupe' }
  ];

  const statusOptions = [
    { value: 'Available', label: 'Available' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'In Maintenance', label: 'In Maintenance' },
    { value: 'Out of Service', label: 'Out of Service' }
  ];

  const fuelTypes = [
    { value: 'Gasoline', label: 'Gasoline' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'LPG', label: 'LPG' }
  ];

  const fields = [
    { name: 'make', label: 'Make *', required: true, md: 4 },
    { name: 'model', label: 'Model *', required: true, md: 4 },
    { 
      name: 'year', 
      label: 'Year *', 
      type: 'number', 
      required: true,
      md: 4 
    },
    { name: 'licensePlate', label: 'License Plate *', required: true, md: 4 },
    { name: 'vin', label: 'VIN *', required: true, md: 4 },
    { 
      name: 'currentMileage', 
      label: 'Current Mileage', 
      type: 'number',
      md: 4 
    },
    { name: 'color', label: 'Color', md: 4 },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', md: 4 },
    { 
      name: 'purchasePrice', 
      label: 'Purchase Price ($)', 
      type: 'number',
      md: 4 
    },
    { name: 'lastServiceDate', label: 'Last Service Date', type: 'date', md: 4 },
    { name: 'nextServiceDue', label: 'Next Service Due', type: 'date', md: 4 },
    { 
      name: 'serviceInterval', 
      label: 'Service Interval (miles)', 
      type: 'number',
      md: 4 
    },
    { 
      name: 'engineSize', 
      label: 'Engine Size (cc)', 
      type: 'number',
      md: 4 
    },
    { name: 'roadworthyExpiry', label: 'Roadworthy Expiry', type: 'date', md: 4 },
    { name: 'registrationExpiry', label: 'Registration Expiry', type: 'date', md: 4 },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date', md: 4 },
    { 
      name: 'seatingCapacity', 
      label: 'Seating Capacity', 
      type: 'number',
      md: 4 
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) setError('');
      if (success) setSuccess('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  return (
    <Container fluid className="py-4 px-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3 d-flex align-items-center justify-content-center">
                <ShieldCheck size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>Vehicle Inventory</h2>
                <p className="text-muted mb-0">Manage your fleet vehicles</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={handleAddVehicle}
              className="d-flex align-items-center shadow-sm"
              disabled={loading}
              style={{ 
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                fontWeight: 500
              }}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" className="me-2" />
              ) : (
                <Plus size={18} className="me-2" />
              )}
              Add Vehicle
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="mb-4 shadow-sm">
          <div className="d-flex align-items-center">
            <X size={20} className="me-2" />
            <strong>Error:</strong> {error}
          </div>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" onClose={() => setSuccess('')} dismissible className="mb-4 shadow-sm">
          <div className="d-flex align-items-center">
            <CheckCircle size={20} className="me-2" />
            <strong>Success:</strong> {success}
          </div>
        </Alert>
      )}

      {showForm ? (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">{formData.id ? 'Edit Vehicle' : 'Add New Vehicle'}</h5>
          </Card.Header>
          <Card.Body>
            {formLoading && <div className="mb-3"><div className="progress" style={{ height: '4px' }}><div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '100%' }}></div></div></div>}
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                {fields.map((field) => (
                  <Col md={field.md} key={field.name}>
                    <Form.Group controlId={field.name}>
                      <Form.Label>{field.label}</Form.Label>
                      <Form.Control
                        type={field.type || 'text'}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        isInvalid={!!validationErrors[field.name]}
                        disabled={formLoading}
                        {...(field.type === 'date' ? { placeholder: 'YYYY-MM-DD' } : {})}
                        {...(field.type === 'number' ? { min: field.inputProps?.min } : {})}
                      />
                      {validationErrors[field.name] && (
                        <Form.Control.Feedback type="invalid">
                          {validationErrors[field.name]}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>
                  </Col>
                ))}

                <Col md={4}>
                  <Form.Group controlId="status">
                    <Form.Label>Status *</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.status}
                      disabled={formLoading}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                    {validationErrors.status && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.status}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="vehicleType">
                    <Form.Label>Vehicle Type</Form.Label>
                    <Form.Select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.vehicleType}
                      disabled={formLoading}
                    >
                      {vehicleTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group controlId="fuelType">
                    <Form.Label>Fuel Type</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.fuelType}
                      disabled={formLoading}
                    >
                      {fuelTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="notes">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={formLoading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={handleCancel}
                  disabled={formLoading}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={formLoading}
                  style={{ 
                    backgroundColor: '#4e73df',
                    borderColor: '#4e73df',
                    fontWeight: 500
                  }}
                >
                  {formLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      {formData.id ? 'Updating...' : 'Creating...'}
                    </>
                  ) : formData.id ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="search">
                    <Form.Label>Search Vehicles</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Search />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by make, model, license plate..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="statusFilter">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="typeFilter">
                    <Form.Label>Vehicle Type</Form.Label>
                    <Form.Select
                      value={filters.vehicleType}
                      onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
                    >
                      <option value="">All Types</option>
                      {vehicleTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading vehicles...</p>
            </div>
          )}

          {!loading && vehicles.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-primary bg-opacity-10 p-4 rounded-circle d-inline-block mb-3">
                <ShieldCheck size={32} className="text-primary" />
              </div>
              <h4 style={{ color: '#2c3e50' }}>No vehicles found</h4>
              <p className="text-muted mb-4">Add your first vehicle to get started</p>
              <Button 
                variant="primary" 
                onClick={handleAddVehicle}
                className="d-inline-flex align-items-center shadow-sm"
                style={{ 
                  backgroundColor: '#4e73df',
                  borderColor: '#4e73df',
                  fontWeight: 500
                }}
              >
                <Plus size={18} className="me-2" />
                Add Vehicle
              </Button>
            </div>
          ) : (
            <>
              <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead>
                        <tr>
                          <th className="small text-uppercase text-muted">License Plate</th>
                          <th className="small text-uppercase text-muted" onClick={() => handleSort('make')}>
                            Make {sortConfig.key === 'make' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="small text-uppercase text-muted" onClick={() => handleSort('model')}>
                            Model {sortConfig.key === 'model' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="small text-uppercase text-muted" onClick={() => handleSort('year')}>
                            Year {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="small text-uppercase text-muted" onClick={() => handleSort('currentMileage')}>
                            Mileage {sortConfig.key === 'currentMileage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="small text-uppercase text-muted">Roadworthy</th>
                          <th className="small text-uppercase text-muted">Registration</th>
                          <th className="small text-uppercase text-muted">Next Service</th>
                          <th className="small text-uppercase text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentVehicles.map((vehicle) => (
                          <tr 
                            key={vehicle.id} 
                            className={isExpired(vehicle.roadworthyExpiry) || isExpired(vehicle.registrationExpiry) ? 'table-warning' : ''}
                          >
                            <td>
                              <Link to={`/vehicles/${vehicle.id}`} className="text-decoration-none text-dark">
                                {vehicle.licensePlate}
                              </Link>
                            </td>
                            <td>{vehicle.make}</td>
                            <td>{vehicle.model}</td>
                            <td>{vehicle.year}</td>
                            <td>{vehicle.currentMileage.toLocaleString()}</td>
                            <td className={isExpired(vehicle.roadworthyExpiry) ? 'text-danger' : ''}>
                              {vehicle.roadworthyExpiry ? new Date(vehicle.roadworthyExpiry).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className={isExpired(vehicle.registrationExpiry) ? 'text-danger' : ''}>
                              {vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className={isExpired(vehicle.nextServiceDue) ? 'text-danger' : ''}>
                              {vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => handleEditVehicle(vehicle)}
                                className="me-2"
                              >
                                <PencilSquare size={16} />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleDeleteClick(vehicle)}
                              >
                                <X size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>

              {vehicles.length > vehiclesPerPage && (
                <div className="d-flex justify-content-center mt-3">
                  <div className="btn-group">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'primary' : 'outline-secondary'}
                        onClick={() => paginate(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {vehicleToDelete?.make} {vehicleToDelete?.model} ({vehicleToDelete?.licensePlate})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            style={{ 
              backgroundColor: '#e74a3b',
              borderColor: '#e74a3b'
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VehicleList;