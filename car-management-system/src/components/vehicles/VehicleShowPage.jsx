import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiClock, FiDollarSign, FiCalendar,
  FiTool, FiFileText, FiAlertTriangle, FiUser
} from 'react-icons/fi';
import DocumentStatusCard from './DocumentStatusCard';
import { getVehicleById, deleteVehicle, updateVehicle } from '../../services/vehicles';
import VehicleModal from './VehicleModal';
import '../../styles/Vehicles.css';

export default function VehicleShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const vehicleData = await getVehicleById(id);
        setVehicle({
          ...vehicleData,
          purchaseDate: vehicleData.purchaseDate?.split('T')[0],
          roadworthyExpiry: vehicleData.roadworthyExpiry?.split('T')[0],
          registrationExpiry: vehicleData.registrationExpiry?.split('T')[0],
          insuranceExpiry: vehicleData.insuranceExpiry?.split('T')[0],
          nextServiceDue: vehicleData.nextServiceDue?.split('T')[0]
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteVehicle(id);
      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      await updateVehicle(id, vehicleData);
      setShowEditModal(false);
      // Refresh the vehicle details
      const updatedVehicleData = await getVehicleById(id);
      setVehicle({
        ...updatedVehicleData,
        purchaseDate: updatedVehicleData.purchaseDate?.split('T')[0],
        roadworthyExpiry: updatedVehicleData.roadworthyExpiry?.split('T')[0],
        registrationExpiry: updatedVehicleData.registrationExpiry?.split('T')[0],
        insuranceExpiry: updatedVehicleData.insuranceExpiry?.split('T')[0],
        nextServiceDue: updatedVehicleData.nextServiceDue?.split('T')[0]
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

  const daysUntilExpiry = (dateString) => {
    if (!dateString) return Infinity;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading vehicle details...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-alert">
        <FiAlertTriangle size={24} />
        <p>Error: {error}</p>
      </div>
      <button className="btn back-btn" onClick={() => navigate('/vehicles')}>
        <FiArrowLeft /> Back to Vehicle List
      </button>
    </div>
  );

  if (!vehicle) return (
    <div className="not-found-container">
      <h2>Vehicle not found</h2>
      <button className="btn back-btn" onClick={() => navigate('/vehicles')}>
        <FiArrowLeft /> Back to Vehicle List
      </button>
    </div>
  );

  return (
    <div className="vehicle-show-container">
      <div className="vehicle-header">
        <button className="btn back-btn" onClick={() => navigate('/vehicles')}>
          <FiArrowLeft /> Back to List
        </button>

        <div className="vehicle-title">
          <h1>
            {vehicle.make} {vehicle.model} ({vehicle.year})
            <span className={`status-badge ${vehicle.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {vehicle.status}
            </span>
          </h1>
          <p className="vehicle-subtitle">VIN: {vehicle.vin} | License: {vehicle.licensePlate}</p>
        </div>

        <div className="action-buttons">
          <button
            className="btn edit-btn"
            onClick={() => setShowEditModal(true)}
          >
            <FiEdit2 /> Edit Vehicle
          </button>
          <button
            className="btn delete-btn"
            onClick={() => setShowDeleteModal(true)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>

      <div className="document-status-cards">
        <DocumentStatusCard title="Roadworthy Certificate" expiryDate={vehicle.roadworthyExpiry} daysUntilExpiry={daysUntilExpiry(vehicle.roadworthyExpiry)} />
        <DocumentStatusCard title="Registration" expiryDate={vehicle.registrationExpiry} daysUntilExpiry={daysUntilExpiry(vehicle.registrationExpiry)} />
        <DocumentStatusCard title="Insurance" expiryDate={vehicle.insuranceExpiry} daysUntilExpiry={daysUntilExpiry(vehicle.insuranceExpiry)} />
        <DocumentStatusCard title="Next Service" expiryDate={vehicle.nextServiceDue} daysUntilExpiry={daysUntilExpiry(vehicle.nextServiceDue)} isService />
      </div>

      <div className="vehicle-details-section">
        <h2>Vehicle Details</h2>
        <div className="details-grid">
          <DetailItem label="Make" value={vehicle.make} icon={<FiTool />} />
          <DetailItem label="Model" value={vehicle.model} icon={<FiTool />} />
          <DetailItem label="Year" value={vehicle.year} icon={<FiCalendar />} />
          <DetailItem label="VIN" value={vehicle.vin} icon={<FiFileText />} />
          <DetailItem label="License Plate" value={vehicle.licensePlate} icon={<FiFileText />} />
          <DetailItem label="Current Mileage" value={`${vehicle.currentMileage?.toLocaleString() || 'N/A'} miles`} icon={<FiClock />} />
          <DetailItem label="Vehicle Type" value={vehicle.vehicleType || 'N/A'} icon={<FiTool />} />
          <DetailItem label="Color" value={vehicle.color || 'N/A'} icon={<div className="color-swatch" style={{ backgroundColor: vehicle.color || '#ccc' }}></div>} />
          <DetailItem label="Fuel Type" value={vehicle.fuelType} icon={<FiTool />} />
          <DetailItem label="Transmission" value={vehicle.transmission} icon={<FiTool />} />
          <DetailItem label="Engine Size" value={vehicle.engineSize ? `${vehicle.engineSize} cc` : 'N/A'} icon={<FiTool />} />
          <DetailItem label="Seating Capacity" value={vehicle.seatingCapacity} icon={<FiUser />} />
          <DetailItem label="Purchase Date" value={formatDate(vehicle.purchaseDate)} icon={<FiCalendar />} />
          <DetailItem label="Purchase Price" value={vehicle.purchasePrice ? `GH₵${vehicle.purchasePrice.toLocaleString()}` : 'N/A'} icon={<FiDollarSign />} />
          {vehicle.notes && (
            <div className="detail-item full-width">
              <div className="detail-label"><FiFileText /> Notes:</div>
              <div className="detail-value notes">{vehicle.notes}</div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this vehicle? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn secondary-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn danger-btn" onClick={handleDelete}><FiTrash2 /> Delete Vehicle</button>
            </div>
          </div>
        </div>
      )}

      <VehicleModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        vehicle={vehicle}
        onSave={handleSaveVehicle}
        title="Edit Vehicle"
      />
    </div>
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="detail-item">
      <div className="detail-label">{icon && <span className="detail-icon">{icon}</span>}{label}:</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}
