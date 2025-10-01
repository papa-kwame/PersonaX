import React from "react";
import { 
  FiAlertCircle, 
  FiCheck, 
  FiX, 
  FiClock,
  FiUser,
  FiDollarSign,
  FiFileText,
  FiTool
} from "react-icons/fi";
import "./dashboard.css";

export default function PendingApprovals({ approvals }) {
  const getApprovalIcon = (type) => {
    switch(type) {
      case 'Assignment':
        return <FiUser />;
      case 'Maintenance':
        return <FiTool />;
      case 'Document':
        return <FiFileText />;
      case 'Expense':
        return <FiDollarSign />;
      default:
        return <FiAlertCircle />;
    }
  };

  const handleApprove = (id) => {
    // Add your approval logic here
  };

  const handleReject = (id) => {
    // Add your rejection logic here
  };

  return (
    <div className="pending-approvals">
      <div className="section-header">
        <h2 className="section-title">Pending Approvals</h2>
        <button className="view-all-btn">View All</button>
      </div>
      
      <div className="approval-list">
        {approvals.map((approval) => (
          <div key={approval.id} className="approval-item">
            <div className="approval-icon">
              {getApprovalIcon(approval.type)}
            </div>
            
            <div className="approval-content">
              <div className="approval-header">
                <h4>
                  {approval.type} #{approval.id}
                  <span className="approval-date">
                    <FiClock size={12} /> {approval.date}
                  </span>
                </h4>
                <p className="approval-message">{approval.message}</p>
              </div>
              
              <div className="approval-details">
                {approval.vehicle && (
                  <p><strong>Vehicle:</strong> {approval.vehicle}</p>
                )}
                {approval.user && (
                  <p><strong>User:</strong> {approval.user}</p>
                )}
                {approval.cost && (
                  <p><strong>Cost:</strong> {approval.cost}</p>
                )}
                {approval.expiry && (
                  <p><strong>Expiry:</strong> {approval.expiry}</p>
                )}
              </div>
              
              <div className="approval-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleApprove(approval.id)}
                >
                  <FiCheck /> Approve
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleReject(approval.id)}
                >
                  <FiX /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}