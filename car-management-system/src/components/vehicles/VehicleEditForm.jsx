// src/components/vehicles/VehicleEditForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiSave, FiX, FiTool, FiCalendar,
  FiDollarSign, FiClock, FiFileText, FiUser
} from 'react-icons/fi';
import { getVehicleById, updateVehicle } from '../../services/vehicles';
import StandardDatePicker from '../shared/StandardDatePicker';

export default function VehicleEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', licensePlate: '', vin: '',
    currentMileage: 0, status: 'Available', purchaseDate: null,
    purchasePrice: 0, color: '', fuelType: 'Gasoline',
    lastServiceDate: null, roadworthyExpiry: null, registrationExpiry: null,
    insuranceExpiry: null, nextServiceDue: null, serviceInterval: 10000,
    vehicleType: 'Sedan', seatingCapacity: 5, transmission: 'Automatic',
    engineSize: '', notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const vehicle = await getVehicleById(id);
        setFormData({
          ...vehicle,
          purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate) : null,
          lastServiceDate: vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate) : null,
          roadworthyExpiry: vehicle.roadworthyExpiry ? new Date(vehicle.roadworthyExpiry) : null,
          registrationExpiry: vehicle.registrationExpiry ? new Date(vehicle.registrationExpiry) : null,
          insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry) : null,
          nextServiceDue: vehicle.nextServiceDue ? new Date(vehicle.nextServiceDue) : null
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadVehicle();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: ['currentMileage','purchasePrice','serviceInterval','seatingCapacity','engineSize'].includes(name)
        ? parseFloat(value) || 0 : value 
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert Date objects to ISO strings for API
      const submitData = {
        ...formData,
        purchaseDate: formData.purchaseDate ? formData.purchaseDate.toISOString() : null,
        lastServiceDate: formData.lastServiceDate ? formData.lastServiceDate.toISOString() : null,
        nextServiceDue: formData.nextServiceDue ? formData.nextServiceDue.toISOString() : null,
        roadworthyExpiry: formData.roadworthyExpiry ? formData.roadworthyExpiry.toISOString() : null,
        registrationExpiry: formData.registrationExpiry ? formData.registrationExpiry.toISOString() : null,
        insuranceExpiry: formData.insuranceExpiry ? formData.insuranceExpiry.toISOString() : null
      };
      
      await updateVehicle(id, submitData);
      navigate(`/vehicles/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const FormGroup = ({ label, name, type = 'text', value, onChange }) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input type={type} id={name} name={name} value={value} onChange={onChange} />
    </div>
  );

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading vehicle...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-alert">
        <p>Error: {error}</p>
      </div>
      <button className="btn back-btn" onClick={() => navigate('/vehicles')}>
        <FiArrowLeft /> Back to Vehicle List
      </button>
    </div>
  );

  return (
    <div className="vehicle-show-container">
      <div className="vehicle-header">
        <button className="btn back-btn" onClick={() => navigate(`/vehicles/${id}`)}>
          <FiArrowLeft /> Back to Vehicle
        </button>
        <div className="vehicle-title">
          <h1>Edit Vehicle: {formData.make} {formData.model}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-columns">
          <div className="form-column">
            <h3><FiTool /> Vehicle Information</h3>
            <FormGroup label="Make" name="make" value={formData.make} onChange={handleChange} />
            <FormGroup label="Model" name="model" value={formData.model} onChange={handleChange} />
            <FormGroup label="Year" name="year" type="number" value={formData.year} onChange={handleChange} />
            <FormGroup label="License Plate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} />
            <FormGroup label="VIN" name="vin" value={formData.vin} onChange={handleChange} />
            <FormGroup label="Color" name="color" value={formData.color} onChange={handleChange} />
            <FormGroup label="Vehicle Type" name="vehicleType" value={formData.vehicleType} onChange={handleChange} />
            <FormGroup label="Status" name="status" value={formData.status} onChange={handleChange} />
          </div>

          <div className="form-column">
            <h3><FiTool /> Specifications</h3>
            <FormGroup label="Fuel Type" name="fuelType" value={formData.fuelType} onChange={handleChange} />
            <FormGroup label="Transmission" name="transmission" value={formData.transmission} onChange={handleChange} />
            <FormGroup label="Engine Size (cc)" name="engineSize" type="number" value={formData.engineSize} onChange={handleChange} />
            <FormGroup label="Seating Capacity" name="seatingCapacity" type="number" value={formData.seatingCapacity} onChange={handleChange} />
          </div>

          <div className="form-column">
            <h3><FiDollarSign /> Purchase Details</h3>
            <div className="form-group">
              <label>Purchase Date</label>
              <StandardDatePicker
                value={formData.purchaseDate}
                onChange={(date) => handleDateChange('purchaseDate', date)}
                label="Purchase Date"
                format="dd/MM/yyyy"
              />
            </div>
            <FormGroup label="Purchase Price" name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} />
            <FormGroup label="Current Mileage" name="currentMileage" type="number" value={formData.currentMileage} onChange={handleChange} />
          </div>

          <div className="form-column">
            <h3><FiCalendar /> Dates & Maintenance</h3>
            <div className="form-group">
              <label>Last Service Date</label>
              <StandardDatePicker
                value={formData.lastServiceDate}
                onChange={(date) => handleDateChange('lastServiceDate', date)}
                label="Last Service Date"
                format="dd/MM/yyyy"
              />
            </div>
            <div className="form-group">
              <label>Next Service Due</label>
              <StandardDatePicker
                value={formData.nextServiceDue}
                onChange={(date) => handleDateChange('nextServiceDue', date)}
                label="Next Service Due"
                format="dd/MM/yyyy"
                minDate={new Date()}
              />
            </div>
            <FormGroup label="Service Interval (km)" name="serviceInterval" type="number" value={formData.serviceInterval} onChange={handleChange} />
          </div>

          <div className="form-column">
            <h3><FiFileText /> Documents & Expiries</h3>
            <div className="form-group">
              <label>Roadworthy Expiry</label>
              <StandardDatePicker
                value={formData.roadworthyExpiry}
                onChange={(date) => handleDateChange('roadworthyExpiry', date)}
                label="Roadworthy Expiry"
                format="dd/MM/yyyy"
                minDate={new Date()}
              />
            </div>
            <div className="form-group">
              <label>Registration Expiry</label>
              <StandardDatePicker
                value={formData.registrationExpiry}
                onChange={(date) => handleDateChange('registrationExpiry', date)}
                label="Registration Expiry"
                format="dd/MM/yyyy"
                minDate={new Date()}
              />
            </div>
            <div className="form-group">
              <label>Insurance Expiry</label>
              <StandardDatePicker
                value={formData.insuranceExpiry}
                onChange={(date) => handleDateChange('insuranceExpiry', date)}
                label="Insurance Expiry"
                format="dd/MM/yyyy"
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes"><FiFileText /> Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary-btn">
            <FiSave /> Save Changes
          </button>
          <button type="button" className="btn secondary-btn" onClick={() => navigate(`/vehicles/${id}`)}>
            <FiX /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
