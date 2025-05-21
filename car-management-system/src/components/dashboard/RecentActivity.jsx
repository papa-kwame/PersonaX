import React from "react";
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock, 
  FiFileText, 
  FiPlus,
  FiDollarSign,FiUser,FiTool
} from "react-icons/fi";
import "./dashboard.css";

export default function RecentActivity({ activities }) {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'maintenance':
        return <FiTool />;
      case 'assignment':
        return <FiUser />;
      case 'document':
        return <FiFileText />;
      case 'vehicle':
        return <FiPlus />;
      case 'expense':
        return <FiDollarSign />;
      default:
        return <FiCheckCircle />;
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    
    const priorityClasses = {
      high: 'priority-high',
      medium: 'priority-medium',
      low: 'priority-low'
    };
    
    return (
      <span className={`priority-badge ${priorityClasses[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="recent-activity">
      <div className="section-header">
        <h2 className="section-title">Recent Activity</h2>
        <button className="view-all-btn">View All</button>
      </div>
      
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <p className="activity-action">{activity.action}</p>
                {getPriorityBadge(activity.priority)}
              </div>
              <div className="activity-meta">
                <span className="activity-user">
                  <FiUser size={14} /> {activity.user}
                </span>
                <span className="activity-time">
                  <FiClock size={14} /> {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}