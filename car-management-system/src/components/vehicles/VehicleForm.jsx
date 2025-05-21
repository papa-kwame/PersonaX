// src/components/vehicles/VehicleForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVehicleById, createVehicle, updateVehicle } from '../../services/vehicles';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/Vehicles.css';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: '',
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

  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      const loadVehicle = async () => {
        try {
          const vehicle = await getVehicleById(id);
          setFormData({
            ...vehicle,
            purchaseDate: vehicle.purchaseDate?.split('T')[0],
            lastServiceDate: vehicle.lastServiceDate?.split('T')[0],
            roadworthyExpiry: vehicle.roadworthyExpiry?.split('T')[0],
            registrationExpiry: vehicle.registrationExpiry?.split('T')[0],
            insuranceExpiry: vehicle.insuranceExpiry?.split('T')[0],
            nextServiceDue: vehicle.nextServiceDue?.split('T')[0]
          });
        } catch (err) {
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      loadVehicle();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!validateForm()) return;

    try {
      if (id) {
        await updateVehicle(id, formData);
      } else {
        await createVehicle(formData);
      }
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['currentMileage', 'purchasePrice', 'serviceInterval', 'seatingCapacity', 'engineSize'].includes(name)
        ? parseFloat(value) || 0 : value
    }));

    // Validate field on change if form has been submitted
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

  if (loading) return <div className="text-center my-4">Loading vehicle data...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="container mt-4 vehicle-form-container">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">{id ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {[
                { name: 'make', label: 'Make *', placeholder: 'Enter vehicle make' },
                { name: 'model', label: 'Model *', placeholder: 'Enter vehicle model' },
                { 
                  name: 'year', 
                  label: 'Year *', 
                  type: 'number', 
                  min: 1900, 
                  max: new Date().getFullYear() + 1,
                  placeholder: 'Enter manufacturing year'
                },
                { name: 'licensePlate', label: 'License Plate *', placeholder: 'Enter license plate' },
                { name: 'vin', label: 'VIN *', placeholder: 'Enter 17-character VIN' },
                { 
                  name: 'currentMileage', 
                  label: 'Current Mileage', 
                  type: 'number', 
                  min: 0,
                  placeholder: 'Enter current mileage'
                },
                { name: 'color', label: 'Color', placeholder: 'Enter vehicle color' },
                { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
                { 
                  name: 'purchasePrice', 
                  label: 'Purchase Price ($)', 
                  type: 'number', 
                  step: 0.01, 
                  min: 0,
                  placeholder: 'Enter purchase price'
                },
                { name: 'lastServiceDate', label: 'Last Service Date', type: 'date' },
                { name: 'nextServiceDue', label: 'Next Service Due', type: 'date' },
                { 
                  name: 'serviceInterval', 
                  label: 'Service Interval (miles)', 
                  type: 'number', 
                  min: 0,
                  placeholder: 'Enter service interval'
                },
                { 
                  name: 'engineSize', 
                  label: 'Engine Size (cc)', 
                  type: 'number', 
                  min: 0,
                  placeholder: 'Enter engine size'
                },
                { name: 'roadworthyExpiry', label: 'Roadworthy Expiry', type: 'date' },
                { name: 'registrationExpiry', label: 'Registration Expiry', type: 'date' },
                { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date' },
                { 
                  name: 'seatingCapacity', 
                  label: 'Seating Capacity', 
                  type: 'number', 
                  min: 1,
                  placeholder: 'Enter seating capacity'
                },
              ].map(({ name, label, type = 'text', placeholder = '', ...rest }) => (
                <div className="col-md-4" key={name}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className={`form-control ${validationErrors[name] ? 'is-invalid' : ''}`}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    {...rest}
                  />
                  {validationErrors[name] && (
                    <div className="invalid-feedback d-block">{validationErrors[name]}</div>
                  )}
                </div>
              ))}

              <div className="col-md-4">
                <label className="form-label">Status *</label>
                <select
                  className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Maintenance">In Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
                {validationErrors.status && (
                  <div className="invalid-feedback d-block">{validationErrors.status}</div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Vehicle Type</label>
                <select
                  className={`form-select ${validationErrors.vehicleType ? 'is-invalid' : ''}`}
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
                </select>
                {validationErrors.vehicleType && (
                  <div className="invalid-feedback d-block">{validationErrors.vehicleType}</div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Fuel Type</label>
                <select
                  className={`form-select ${validationErrors.fuelType ? 'is-invalid' : ''}`}
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                >
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="LPG">LPG</option>
                </select>
                {validationErrors.fuelType && (
                  <div className="invalid-feedback d-block">{validationErrors.fuelType}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea
                  className={`form-control ${validationErrors.notes ? 'is-invalid' : ''}`}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter any additional notes"
                />
                {validationErrors.notes && (
                  <div className="invalid-feedback d-block">{validationErrors.notes}</div>
                )}
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-between">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/vehicles')}>
                <i className="bi bi-arrow-left me-2"></i>Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {id ? (
                  <>
                    <i className="bi bi-save me-2"></i>Update Vehicle
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>Add Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}