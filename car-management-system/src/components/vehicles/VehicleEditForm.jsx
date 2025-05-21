// src/components/vehicles/VehicleEditForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiSave, FiX, FiTool, FiCalendar,
  FiDollarSign, FiClock, FiFileText, FiUser
} from 'react-icons/fi';
import { getVehicleById, updateVehicle } from '../../services/vehicles';

export default function VehicleEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', licensePlate: '', vin: '',
    currentMileage: 0, status: 'Available', purchaseDate: '',
    purchasePrice: 0, color: '', fuelType: 'Gasoline',
    lastServiceDate: '', roadworthyExpiry: '', registrationExpiry: '',
    insuranceExpiry: '', nextServiceDue: '', serviceInterval: 10000,
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
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: ['currentMileage','purchasePrice','serviceInterval','seatingCapacity','engineSize'].includes(name)
        ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateVehicle(id, formData);
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
            <FormGroup label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} />
            <FormGroup label="Purchase Price" name="purchasePrice" type="number" value={formData.purchasePrice} onChange={handleChange} />
            <FormGroup label="Current Mileage" name="currentMileage" type="number" value={formData.currentMileage} onChange={handleChange} />
          </div>

          <div className="form-column">
            <h3><FiCalendar /> Dates & Maintenance</h3>
            <FormGroup label="Last Service Date" name="lastServiceDate" type="date" value={formData.lastServiceDate} onChange={handleChange} />
            <FormGroup label="Next Service Due" name="nextServiceDue" type="date" value={formData.nextServiceDue} onChange={handleChange} />
            <FormGroup label="Service Interval (km)" name="serviceInterval" type="number" value={formData.serviceInterval} onChange={handleChange} />
          </div>

          <div className="form-column">
            <h3><FiFileText /> Documents & Expiries</h3>
            <FormGroup label="Roadworthy Expiry" name="roadworthyExpiry" type="date" value={formData.roadworthyExpiry} onChange={handleChange} />
            <FormGroup label="Registration Expiry" name="registrationExpiry" type="date" value={formData.registrationExpiry} onChange={handleChange} />
            <FormGroup label="Insurance Expiry" name="insuranceExpiry" type="date" value={formData.insuranceExpiry} onChange={handleChange} />
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
