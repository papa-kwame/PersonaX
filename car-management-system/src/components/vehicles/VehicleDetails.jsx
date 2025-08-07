// src/components/vehicles/VehicleDetails.jsx
import { useState, useEffect } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById, deleteVehicle } from '../../services/vehicles';
import DocumentStatusCard from './DocumentStatusCard';
import '../../styles/Vehicles.css';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const data = await getVehicleById(id);
        setVehicle(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadVehicle();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        navigate('/vehicles');
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return formatDateDisplay(dateString);
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const daysUntilExpiry = (dateString) => {
    if (!dateString) return Infinity;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="loading">Loading vehicle details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!vehicle) return <div className="not-found">Vehicle not found</div>;

  return (
    <div className="vehicle-details-container">
      <div className="details-header">
        <h2>{vehicle.make} {vehicle.model} ({vehicle.year})</h2>
        <div className="action-buttons">
          <button 
            className="btn edit-btn"
            onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
          >
            Edit
          </button>
          <button className="btn delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
      
      <div className="document-status-cards">
        <DocumentStatusCard 
          title="Roadworthy Certificate"
          expiryDate={vehicle.roadworthyExpiry}
          daysUntilExpiry={daysUntilExpiry(vehicle.roadworthyExpiry)}
        />
        <DocumentStatusCard 
          title="Registration"
          expiryDate={vehicle.registrationExpiry}
          daysUntilExpiry={daysUntilExpiry(vehicle.registrationExpiry)}
        />
        <DocumentStatusCard 
          title="Insurance"
          expiryDate={vehicle.insuranceExpiry}
          daysUntilExpiry={daysUntilExpiry(vehicle.insuranceExpiry)}
        />
        <DocumentStatusCard 
          title="Next Service"
          expiryDate={vehicle.nextServiceDue}
          daysUntilExpiry={daysUntilExpiry(vehicle.nextServiceDue)}
          isService={true}
        />
      </div>
      
      <div className="details-grid">
        {/* Basic Information */}
        <DetailItem label="License Plate" value={vehicle.licensePlate} />
        <DetailItem label="VIN" value={vehicle.vin} />
        <DetailItem label="Vehicle Type" value={vehicle.vehicleType} />
        <DetailItem label="Color" value={vehicle.color || 'N/A'} />
        
        {/* Status and Mileage */}
        <DetailItem 
          label="Status" 
          value={<span className={`status-badge ${vehicle.status.toLowerCase().replace(' ', '-')}`}>{vehicle.status}</span>} 
        />
        <DetailItem label="Mileage" value={`${vehicle.currentMileage.toLocaleString()} miles`} />
        
        {/* Technical Specifications */}
        <DetailItem label="Fuel Type" value={vehicle.fuelType} />
        <DetailItem label="Transmission" value={vehicle.transmission} />
        <DetailItem label="Engine Size" value={vehicle.engineSize ? `${vehicle.engineSize} cc` : 'N/A'} />
        <DetailItem label="Seating Capacity" value={vehicle.seatingCapacity} />
        
        {/* Purchase Information */}
        <DetailItem label="Purchase Date" value={formatDate(vehicle.purchaseDate)} />
        <DetailItem label="Purchase Price" value={vehicle.purchasePrice ? `GH₵${vehicle.purchasePrice.toLocaleString()}` : 'N/A'} />
        
        {/* Maintenance Information */}
        <DetailItem label="Last Service Date" value={formatDate(vehicle.lastServiceDate)} />
        <DetailItem label="Service Interval" value={vehicle.serviceInterval ? `${vehicle.serviceInterval.toLocaleString()} miles` : 'N/A'} />
        
        {/* Notes */}
        {vehicle.notes && (
          <div className="detail-item full-width">
            <div className="detail-label">Notes:</div>
            <div className="detail-value notes">{vehicle.notes}</div>
          </div>
        )}
      </div>
      
      <div className="back-link">
        <button className="btn back-btn" onClick={() => navigate('/vehicles')}>
          Back to Vehicle List
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <div className="detail-label">{label}:</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}