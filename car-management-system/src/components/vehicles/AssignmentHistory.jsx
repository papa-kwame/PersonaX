import React from 'react';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

export default function AssignmentHistory({ vehicleId }) {
  // This would be replaced with actual data fetching
  const assignments = [
    { id: 1, user: 'John Smith', startDate: '2023-01-15', endDate: '2023-05-20', status: 'completed' },
    { id: 2, user: 'Sarah Johnson', startDate: '2023-05-21', endDate: null, status: 'active' }
  ];

  return (
    <div className="assignment-history">
      <div className="section-header">
        <h3>Assignment History</h3>
        <button className="btn primary-btn">
          <FiPlus /> New Assignment
        </button>
      </div>
      
      <div className="assignment-list">
        {assignments.length === 0 ? (
          <div className="no-records">
            <FiUser size={48} />
            <p>No assignment records found for this vehicle</p>
          </div>
        ) : (
          assignments.map(assignment => (
            <div key={assignment.id} className="assignment-record">
              <div className="record-user">
                <FiUser />
                <span>{assignment.user}</span>
              </div>
              <div className="record-dates">
                <div className="start-date">
                  <FiCalendar />
                  <span>Start: {new Date(assignment.startDate).toLocaleDateString()}</span>
                </div>
                <div className="end-date">
                  <FiCalendar />
                  <span>
                    {assignment.endDate ? 
                     `End: ${new Date(assignment.endDate).toLocaleDateString()}` : 
                     'Currently assigned'}
                  </span>
                </div>
              </div>
              <div className={`record-status ${assignment.status}`}>
                {assignment.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}