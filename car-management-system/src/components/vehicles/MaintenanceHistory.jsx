import React from 'react';
import { FiTool, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function MaintenanceHistory({ vehicleId }) {
  // This would be replaced with actual data fetching
  const maintenanceRecords = [
    { id: 1, type: 'Oil Change', date: '2023-05-10', mileage: 45000, cost: 120.50, status: 'completed' },
    { id: 2, type: 'Tire Rotation', date: '2023-03-15', mileage: 42000, cost: 85.00, status: 'completed' },
    { id: 3, type: 'Brake Inspection', date: '2023-06-20', mileage: 48000, cost: null, status: 'pending' }
  ];

  return (
    <div className="maintenance-history">
      <div className="section-header">
        <h3>Maintenance History</h3>
        <button className="btn primary-btn">
          <FiPlus /> Add Maintenance Record
        </button>
      </div>
      
      <div className="maintenance-list">
        {maintenanceRecords.length === 0 ? (
          <div className="no-records">
            <FiTool size={48} />
            <p>No maintenance records found for this vehicle</p>
          </div>
        ) : (
          maintenanceRecords.map(record => (
            <div key={record.id} className="maintenance-record">
              <div className="record-type">
                <FiTool />
                <span>{record.type}</span>
              </div>
              <div className="record-date">
                <FiClock />
                <span>{new Date(record.date).toLocaleDateString()}</span>
              </div>
              <div className="record-mileage">
                {record.mileage.toLocaleString()} miles
              </div>
              <div className="record-cost">
                {record.cost ? `$${record.cost.toFixed(2)}` : 'Not specified'}
              </div>
              <div className={`record-status ${record.status}`}>
                {record.status === 'completed' ? <FiCheckCircle /> : <FiAlertCircle />}
                {record.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}