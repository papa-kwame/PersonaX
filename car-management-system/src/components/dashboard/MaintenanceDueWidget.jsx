import React from "react";
import { FiAlertTriangle, FiClock, FiTool } from "react-icons/fi";
import "./dashboard.css";

export default function MaintenanceDueWidget() {
  const maintenanceItems = [
    { id: 1, vehicle: 'Toyota Camry (ABC123)', service: 'Oil Change', due: 'Tomorrow' },
    { id: 2, vehicle: 'Ford F-150 (DEF456)', service: 'Tire Rotation', due: 'In 3 days' },
    { id: 3, vehicle: 'Honda Civic (GHI789)', service: 'Brake Inspection', due: 'In 1 week' }
  ];

  return (
    <div className="widget-container maintenance-widget">
      <div className="section-header">
        <h2 className="section-title">
          <FiTool /> Upcoming Maintenance
        </h2>
        <button className="view-all-btn">View All</button>
      </div>
      
      <div className="widget-content">
        {maintenanceItems.map(item => (
          <div key={item.id} className="maintenance-item">
            <div className="maintenance-alert">
              <FiAlertTriangle />
            </div>
            <div className="maintenance-details">
              <h4>{item.vehicle}</h4>
              <p>{item.service}</p>
            </div>
            <div className="maintenance-due">
              <span className="due-badge">
                <FiClock /> {item.due}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}