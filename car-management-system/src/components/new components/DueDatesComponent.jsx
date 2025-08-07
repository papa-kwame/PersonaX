import React, { useState, useEffect } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import './DueDatesComponent.css';
import { getVehiclesWithDueDates } from '../../services/vehicles';

const DueDatesComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchDueVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getVehiclesWithDueDates(daysThreshold);
      setVehicles(data);
      setSelectedVehicle(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueVehicles();
  }, [daysThreshold]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return formatDateDisplay(date);
  };

  const handleThresholdChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDaysThreshold(value);
    }
  };

  // Modal components
  const VehicleDetailsModal = ({ vehicle, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>&times;</button>
        {vehicle ? (
          <>
            <div className="vehicle-details-header">
              <span className="vehicle-details-title">{vehicle.make} {vehicle.model} Details</span>
              <span className={`vehicle-status ${vehicle.isAssigned ? 'assigned' : 'available'}`}>{vehicle.isAssigned ? 'Assigned' : 'Available'}</span>
            </div>
            <div className="vehicle-details-body">
              <div className="vehicle-details-cols">
                <div className="vehicle-details-col">
                  <div><strong>License Plate:</strong> {vehicle.licensePlate}</div>
                  <div><strong>VIN:</strong> {vehicle.vin}</div>
                  <div><strong>Color:</strong> {vehicle.color}</div>
                  <div><strong>Mileage:</strong> {vehicle.currentMileage?.toLocaleString() || 'N/A'} miles</div>
                  <div><strong>Fuel Type:</strong> {vehicle.fuelType}</div>
                </div>
                <div className="vehicle-details-col">
                  <div><strong>Status:</strong> <span className="vehicle-status-badge">{vehicle.status}</span></div>
                  <div><strong>Seating Capacity:</strong> {vehicle.seatingCapacity}</div>
                  <div><strong>Transmission:</strong> {vehicle.transmission}</div>
                  <div><strong>Engine Size:</strong> {vehicle.engineSize || 'N/A'}L</div>
                </div>
              </div>
              <div className="vehicle-due-dates">
                <div><strong>Next Service:</strong> {formatDate(vehicle.nextServiceDue)} <span className="overdue">{vehicle.nextServiceDue && new Date(vehicle.nextServiceDue) < new Date() ? ' (PAST DUE)' : ''}</span></div>
                <div><strong>Registration Expiry:</strong> {formatDate(vehicle.registrationExpiry)}</div>
                <div><strong>Roadworthy Expiry:</strong> {formatDate(vehicle.roadworthyExpiry)}</div>
                <div><strong>Insurance Expiry:</strong> {formatDate(vehicle.insuranceExpiry)}</div>
              </div>
              <div className="vehicle-maintenance-info">
                <div><strong>Last Service:</strong> {formatDate(vehicle.lastServiceDate)}</div>
                <div><strong>Service Interval:</strong> Every {vehicle.serviceInterval || 'N/A'} miles</div>
              </div>
              <div className="vehicle-details-actions">
                <button className="edit-btn">Edit Vehicle</button>
                <button className="history-btn">Service History</button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );

  const ViewAllModal = ({ vehicles, onSelect, onClose }) => (
    <div className="modal-overlay">
      <div className="modal-card modal-card-list">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-list-header">All Due Vehicles ({vehicles.length})</div>
        <div className="modal-list">
          {vehicles.map(vehicle => (
            <div
              key={vehicle.id}
              className="vehicle-list-item"
              onClick={() => { onSelect(vehicle); onClose(); }}
            >
              <div className="vehicle-main">
                <span className="vehicle-title">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                <span className="vehicle-plate">{vehicle.licensePlate}</span>
              </div>
              <div className="vehicle-meta">{vehicle.vehicleType} • {vehicle.color}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="due-dates-container">
      <div className="due-dates-header">
        <h2>Vehicles with Upcoming Due Dates</h2>
        <div className="due-dates-controls">
          <label>Show vehicles due within:</label>
          <select value={daysThreshold} onChange={handleThresholdChange}>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
          </select>
          <button className="refresh-btn" onClick={fetchDueVehicles}>Refresh</button>
        </div>
      </div>
      <div className="due-dates-content">
        <div className="vehicle-list-panel">
          <div className="vehicle-list-header">
            Vehicles ({vehicles.length})
          </div>
          <div className="vehicle-list">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : vehicles.length > 0 ? (
              <>
                {vehicles.slice(0, 2).map(vehicle => (
                  <div
                    key={vehicle.id}
                    className="vehicle-list-item"
                    onClick={() => { setSelectedVehicle(vehicle); setShowDetailsModal(true); }}
                  >
                    <div className="vehicle-main">
                      <span className="vehicle-title">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                      <span className="vehicle-plate">{vehicle.licensePlate}</span>
                    </div>
                    <div className="vehicle-meta">{vehicle.vehicleType} • {vehicle.color}</div>
                  </div>
                ))}
                {vehicles.length > 2 && (
                  <button className="view-all-btn" onClick={() => setShowAllModal(true)}>View All</button>
                )}
              </>
            ) : (
              <div className="empty">No vehicles found with upcoming due dates</div>
            )}
          </div>
        </div>
      </div>
      {showAllModal && (
        <ViewAllModal
          vehicles={vehicles}
          onSelect={vehicle => { setSelectedVehicle(vehicle); setShowDetailsModal(true); }}
          onClose={() => setShowAllModal(false)}
        />
      )}
      {showDetailsModal && selectedVehicle && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default DueDatesComponent;