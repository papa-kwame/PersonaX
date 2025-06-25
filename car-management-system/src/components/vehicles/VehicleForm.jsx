// src/components/vehicles/VehicleForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVehicleById, createVehicle, updateVehicle } from '../../services/vehicles';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const [formData, setFormData] = useState({
    id: generateGUID(),
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
    { name: 'make', label: 'Make', required: true, col: 'col-md-4' },
    { name: 'model', label: 'Model', required: true, col: 'col-md-4' },
    { 
      name: 'year', 
      label: 'Year', 
      type: 'number', 
      required: true,
      attrs: { min: 1900, max: new Date().getFullYear() + 1 },
      col: 'col-md-4' 
    },
    { name: 'licensePlate', label: 'License Plate', required: true, col: 'col-md-4' },
    { name: 'vin', label: 'VIN', required: true, col: 'col-md-4' },
    { 
      name: 'currentMileage', 
      label: 'Current Mileage', 
      type: 'number',
      attrs: { min: 0 },
      col: 'col-md-4' 
    },
    { name: 'color', label: 'Color', col: 'col-md-4' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', col: 'col-md-4' },
    { 
      name: 'purchasePrice', 
      label: 'Purchase Price ($)', 
      type: 'number',
      attrs: { step: 0.01, min: 0 },
      col: 'col-md-4' 
    },
    { name: 'lastServiceDate', label: 'Last Service Date', type: 'date', col: 'col-md-4' },
    { name: 'nextServiceDue', label: 'Next Service Due', type: 'date', col: 'col-md-4' },
    { 
      name: 'serviceInterval', 
      label: 'Service Interval (miles)', 
      type: 'number',
      attrs: { min: 0 },
      col: 'col-md-4' 
    },
    { 
      name: 'engineSize', 
      label: 'Engine Size (cc)', 
      type: 'number',
      attrs: { min: 0 },
      col: 'col-md-4' 
    },
    { name: 'roadworthyExpiry', label: 'Roadworthy Expiry', type: 'date', col: 'col-md-4' },
    { name: 'registrationExpiry', label: 'Registration Expiry', type: 'date', col: 'col-md-4' },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date', col: 'col-md-4' },
    { 
      name: 'seatingCapacity', 
      label: 'Seating Capacity', 
      type: 'number',
      attrs: { min: 1 },
      col: 'col-md-4' 
    },
  ];

  if (loading) return (
    <div className="container mt-4">
      <div className="progress">
        <div className="progress-bar progress-bar-striped progress-bar-animated w-100"></div>
      </div>
      <p className="mt-3">Loading vehicle data...</p>
    </div>
  );

  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger">{error}</div>
    </div>
  );

  return (
    <div className="container-fluid "  style={{ maxWidth: '1550px',maxHeight: '150px' }}>
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">{id ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Standard fields */}
              {fields.map((field) => (
                <div key={field.name} className={field.col || 'col-md-6'}>
                  <label htmlFor={field.name} className="form-label">
                    {field.label} {field.required && <span className="text-danger">*</span>}
                  </label>
                  <input
                    id={field.name}
                    className={`form-control ${validationErrors[field.name] ? 'is-invalid' : ''}`}
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    {...(field.attrs || {})}
                  />
                  {validationErrors[field.name] && (
                    <div className="invalid-feedback">{validationErrors[field.name]}</div>
                  )}
                </div>
              ))}

              {/* Status dropdown */}
              <div className="col-md-4">
                <label htmlFor="status" className="form-label">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  id="status"
                  className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.status && (
                  <div className="invalid-feedback">{validationErrors.status}</div>
                )}
              </div>

              {/* Vehicle Type dropdown */}
              <div className="col-md-4">
                <label htmlFor="vehicleType" className="form-label">Vehicle Type</label>
                <select
                  id="vehicleType"
                  className={`form-select ${validationErrors.vehicleType ? 'is-invalid' : ''}`}
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  {vehicleTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.vehicleType && (
                  <div className="invalid-feedback">{validationErrors.vehicleType}</div>
                )}
              </div>

              {/* Fuel Type dropdown */}
              <div className="col-md-4">
                <label htmlFor="fuelType" className="form-label">Fuel Type</label>
                <select
                  id="fuelType"
                  className={`form-select ${validationErrors.fuelType ? 'is-invalid' : ''}`}
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                >
                  {fuelTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.fuelType && (
                  <div className="invalid-feedback">{validationErrors.fuelType}</div>
                )}
              </div>

              {/* Notes textarea */}
              <div className="col-12">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  className={`form-control ${validationErrors.notes ? 'is-invalid' : ''}`}
                  name="notes"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
                {validationErrors.notes && (
                  <div className="invalid-feedback">{validationErrors.notes}</div>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/vehicles')}
              >
                <i className="bi bi-arrow-left me-2"></i>Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {id ? (
                  <>
                    <i className="bi bi-save me-2"></i>Update Vehicle
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg me-2"></i>Add Vehicle
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