import React, { useEffect, useState } from 'react';
import { Modal, Spinner, Alert, Button } from 'react-bootstrap';
import { getVehicleById } from '../../services/vehicles';
import { FiX } from 'react-icons/fi';
import '../../styles/Vehicles.css';

export default function VehicleModal({ vehicleId, show, onClose }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show || !vehicleId) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const v = await getVehicleById(vehicleId);
        setVehicle(v);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [vehicleId, show]);

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Vehicle Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div className="text-center p-3">
            <Spinner animation="border" />
          </div>
        )}
        {error && (
          <Alert variant="danger">Error: {error}</Alert>
        )}
        {vehicle && (
          <div>
            <h4>{vehicle.make} {vehicle.model} ({vehicle.year})</h4>
            <p>License Plate: {vehicle.licensePlate}</p>
            <p>VIN: {vehicle.vin}</p>
            <p>Mileage: {vehicle.currentMileage?.toLocaleString()} miles</p>
            <p>Status: {vehicle.status}</p>
            <p>Fuel Type: {vehicle.fuelType}</p>
            <p>Transmission: {vehicle.transmission}</p>
            <p>Color: <span style={{ backgroundColor: vehicle.color, padding: '0 10px' }}>{vehicle.color}</span></p>
            {vehicle.notes && (
              <div>
                <h6>Notes</h6>
                <p>{vehicle.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          <FiX className="me-1" /> Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
