import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { FaCar, FaGasPump, FaCog, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

export default function VehicleModal({ show, onHide, vehicle, onSave, title }) {
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', licensePlate: '', vin: '',
    currentMileage: 0, status: 'Available', purchaseDate: '',
    purchasePrice: 0, color: '', fuelType: 'Gasoline',
    lastServiceDate: '', roadworthyExpiry: '', registrationExpiry: '',
    insuranceExpiry: '', nextServiceDue: '', serviceInterval: 10000,
    vehicleType: 'Sedan', seatingCapacity: 5, transmission: 'Automatic',
    engineSize: '', notes: ''
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        purchaseDate: vehicle.purchaseDate?.split('T')[0],
        lastServiceDate: vehicle.lastServiceDate?.split('T')[0],
        roadworthyExpiry: vehicle.roadworthyExpiry?.split('T')[0],
        registrationExpiry: vehicle.registrationExpiry?.split('T')[0],
        insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0],
        nextServiceDue: vehicle.nextServiceDue?.split('T')[0]
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['currentMileage', 'purchasePrice', 'serviceInterval', 'seatingCapacity', 'engineSize'].includes(name)
        ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaCar className="me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Basic Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Make <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="text" 
                      name="make" 
                      value={formData.make} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Model <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="text" 
                      name="model" 
                      value={formData.model} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number" 
                      name="year" 
                      value={formData.year} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>License Plate <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="text" 
                      name="licensePlate" 
                      value={formData.licensePlate} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>VIN <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="text" 
                      name="vin" 
                      value={formData.vin} 
                      onChange={handleChange} 
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Specifications</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaGasPump className="me-2" />Fuel Type</Form.Label>
                    <Form.Select 
                      name="fuelType" 
                      value={formData.fuelType} 
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="LPG">LPG</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCog className="me-2" />Transmission</Form.Label>
                    <Form.Select 
                      name="transmission" 
                      value={formData.transmission} 
                      onChange={handleChange}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle Type</Form.Label>
                    <Form.Select 
                      name="vehicleType" 
                      value={formData.vehicleType} 
                      onChange={handleChange}
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Coupe">Coupe</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Mileage</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="currentMileage" 
                      value={formData.currentMileage} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Seating Capacity</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="seatingCapacity" 
                      value={formData.seatingCapacity} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Engine Size (cc)</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="engineSize" 
                      value={formData.engineSize} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Status & Maintenance</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange}
                    >
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Maintenance">In Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><FaCalendarAlt className="me-2" />Last Service Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="lastServiceDate" 
                      value={formData.lastServiceDate} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Service Interval (km)</Form.Label>
                    <Form.Control 
                      type="number" 
                      name="serviceInterval" 
                      value={formData.serviceInterval} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Next Service Due</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="nextServiceDue" 
                      value={formData.nextServiceDue} 
                      onChange={handleChange} 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0"><FaInfoCircle className="me-2" />Additional Information</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Enter any additional notes about the vehicle..."
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Vehicle
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}