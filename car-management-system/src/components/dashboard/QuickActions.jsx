import React from "react";
import { Link } from "react-router-dom";
import { 
  FiPlus, 
  FiUser, 
  FiTool, 
  FiFileText, 
  FiDollarSign,
  FiBarChart2,
  FiClock,
  FiCalendar
} from "react-icons/fi";
import "./dashboard.css";

export default function QuickActions() {
  const actions = [
    { 
      icon: <FiUser />, 
      label: "Assign Vehicle", 
      link: "/assignments",
      color: "#4361ee"
    },
    { 
      icon: <FiTool />, 
      label: "Request Maintenance", 
      link: "/maintenance",
      color: "#f8961e"
    },
    { 
      icon: <FiPlus />, 
      label: "Add Vehicle", 
      link: "/vehicles/new",
      color: "#10b981"
    },
    { 
      icon: <FiCalendar />, 
      label: "Schedule Service", 
      link: "/maintenance/schedule",
      color: "#f72585"
    },
    { 
      icon: <FiBarChart2 />, 
      label: "View Reports", 
      link: "/reports",
      color: "#3f37c9"
    },
    { 
      icon: <FiDollarSign />, 
      label: "Fuel Tracking", 
      link: "/fuel",
      color: "#4cc9f0"
    }
  ];

  return (
    <div className="quick-actions">
      
      <div className="action-grid">
        {actions.map((action, index) => (
          <Link 
            key={index} 
            to={action.link} 
            className="action-card"
            style={{ 
              backgroundColor: `${action.color}08`, 
              border: `1px solid ${action.color}20`
            }}
          >
            <div 
              className="action-icon" 
              style={{ 
                backgroundColor: `${action.color}15`,
                color: action.color
              }}
            >
              {action.icon}
            </div>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}