import React from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";

export default function StatsCard({ title, stats, link, linkText, icon, color }) {
  return (
    <div className="stats-card" style={{ borderTop: `4px solid ${color}` }}>
      <div className="stats-card-header">
        <div 
          className="stats-icon" 
          style={{ 
            backgroundColor: `${color}15`,
            color: color
          }}
        >
          {icon}
        </div>
        <h3>{title}</h3>
      </div>
      
      <div className="stats-content">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="stat-item">
            <span className="stat-label">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
            </span>
            <span className="stat-value" style={{ color }}>
              {value}
            </span>
          </div>
        ))}
      </div>
      
      {link && linkText && (
        <Link to={link} className="stats-link" style={{ color }}>
          {linkText} &rarr;
        </Link>
      )}
    </div>
  );
}