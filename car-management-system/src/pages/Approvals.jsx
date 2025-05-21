import React, { useState } from 'react';
import { dummyRequests } from '../components/approval/dummyData';

const Approvals = () => {
  const [requests, setRequests] = useState(dummyRequests);
  const [activeTab, setActiveTab] = useState('employee');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  // Employee submits new request
  const handleSubmitRequest = (newRequest) => {
    setRequests([...requests, {
      ...newRequest,
      id: `REQ-${Date.now()}`,
      status: 'pending_hr',
      createdAt: new Date().toISOString(),
      submittedBy: 'Current User'
    }]);
  };

  // HR approves/rejects
  const handleHRApproval = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'pending_mechanic',
        hrApprovedBy: "Michael Brown",
        hrApprovedAt: new Date().toISOString()
      } : req
    ));
  };

  const handleHRRejection = (requestId, reason) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: "Michael Brown",
        rejectedAt: new Date().toISOString()
      } : req
    ));
  };

  // Mechanic submits quote
  const handleSubmitQuote = (quoteData) => {
    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? { 
        ...req, 
        quote: quoteData, 
        status: 'pending_finance' 
      } : req
    ));
    setSelectedRequest(null);
    setActiveTab('finance');
  };

  // Finance approves/rejects
  const handleFinanceApproval = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'pending_manager',
        financeReview: {
          reviewedBy: "Lisa Wong",
          reviewedAt: new Date().toISOString(),
          notes: "Approved for manager review"
        }
      } : req
    ));
  };

  const handleFinanceRejection = (requestId, reason) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'rejected_by_finance',
        rejectionReason: reason,
        rejectedBy: "Lisa Wong",
        rejectedAt: new Date().toISOString()
      } : req
    ));
  };

  // Manager approves/rejects
  const handleManagerApproval = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'approved',
        managerApproval: {
          approvedBy: "James Wilson",
          approvedAt: new Date().toISOString(),
          notes: "Approved for repair"
        }
      } : req
    ));
  };

  const handleManagerRejection = (requestId, reason) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'needs_revision',
        rejectionReason: reason,
        rejectedBy: "James Wilson",
        rejectedAt: new Date().toISOString()
      } : req
    ));
  };

  // Start repair
  const handleStartRepair = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'in_progress',
        workStartedAt: new Date().toISOString(),
        assignedMechanic: "Auto Repair Center"
      } : req
    ));
  };

  // Complete repair
  const handleCompleteRepair = (requestId, notes) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'completed',
        workCompletedAt: new Date().toISOString(),
        completionNotes: notes
      } : req
    ));
  };

  return (
    <div className="approvals-container">
      <div className="approvals-header">
        <h1>Vehicle Repair Approval System</h1>
      </div>
      
      <div className="approvals-tabs">
        <button 
          className={`tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
          onClick={() => handleTabChange('employee')}
        >
          <i className="icon">+</i> New Request
        </button>
        <button 
          className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
          onClick={() => handleTabChange('hr')}
        >
          <i className="icon">👥</i> HR Approvals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => handleTabChange('finance')}
        >
          <i className="icon">💰</i> Finance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manager' ? 'active' : ''}`}
          onClick={() => handleTabChange('manager')}
        >
          <i className="icon">👔</i> Manager
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => handleTabChange('tracking')}
        >
          <i className="icon">🔧</i> Tracking
        </button>
      </div>

      <div className="approvals-content">
        {activeTab === 'employee' && (
          <RepairRequestForm onSubmit={handleSubmitRequest} />
        )}

        {activeTab === 'hr' && (
          <HRApprovalDashboard 
            requests={requests.filter(req => req.status === 'pending_hr')} 
            onApprove={handleHRApproval}
            onReject={handleHRRejection}
            onSelectForQuote={(request) => {
              setSelectedRequest(request);
              setActiveTab('mechanic');
            }}
          />
        )}

        {activeTab === 'mechanic' && selectedRequest && (
          <MechanicQuoteForm 
            request={selectedRequest}
            onSubmit={handleSubmitQuote}
            onCancel={() => setActiveTab('hr')}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceApprovalDashboard 
            requests={requests.filter(req => req.status === 'pending_finance')} 
            onApprove={handleFinanceApproval}
            onReject={handleFinanceRejection}
          />
        )}

        {activeTab === 'manager' && (
          <ManagerApprovalDashboard 
            requests={requests.filter(req => req.status === 'pending_manager')} 
            onApprove={handleManagerApproval}
            onReject={handleManagerRejection}
          />
        )}

        {activeTab === 'tracking' && (
          <RepairTrackingDashboard 
            requests={requests.filter(req => 
              ['approved', 'in_progress', 'completed'].includes(req.status))
            }
            onStartRepair={handleStartRepair}
            onCompleteRepair={handleCompleteRepair}
          />
        )}
      </div>
    </div>
  );
};

// Sub-components
const RepairRequestForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    issueDescription: '',
    urgency: 'medium',
    department: 'Sales',
    mileage: '',
    attachments: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      vehicleId: '',
      issueDescription: '',
      urgency: 'medium',
      department: 'Sales',
      mileage: '',
      attachments: []
    });
  };

  return (
    <div className="form-container">
      <h2>New Repair Request</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Vehicle ID</label>
            <input
              type="text"
              value={formData.vehicleId}
              onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              required
              placeholder="e.g., VH-2023-001"
            />
          </div>
          <div className="form-group">
            <label>Current Mileage</label>
            <input
              type="text"
              value={formData.mileage}
              onChange={(e) => setFormData({...formData, mileage: e.target.value})}
              placeholder="e.g., 45,230 miles"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Urgency</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({...formData, urgency: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical (Vehicle Undrivable)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Issue Description</label>
          <textarea
            rows="4"
            value={formData.issueDescription}
            onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
            required
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div className="form-group">
          <label>Attachments (Photos/Documents)</label>
          <input
            type="file"
            multiple
            onChange={(e) => setFormData({...formData, attachments: [...e.target.files]})}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

const HRApprovalDashboard = ({ requests, onApprove, onReject, onSelectForQuote }) => {
  return (
    <div className="dashboard-container">
      <h2>HR Approval Dashboard</h2>
      <p className="subtitle">Pending Requests: {requests.length}</p>
      
      {requests.length === 0 ? (
        <div className="alert info">No pending requests</div>
      ) : (
        <div className="request-list">
          {requests.map(request => (
            <ApprovalCard
              key={request.id}
              request={request}
              onApprove={() => onApprove(request.id)}
              onReject={() => {
                const reason = prompt('Please enter rejection reason:');
                if (reason) onReject(request.id, reason);
              }}
              showQuoteButton={true}
              onSelectForQuote={onSelectForQuote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ApprovalCard = ({ 
  request, 
  showActions = false, 
  onApprove, 
  onReject,
  showQuoteButton = false,
  onSelectForQuote
}) => {
  const formattedDate = new Date(request.createdAt).toLocaleString();

  return (
    <div className="approval-card">
      <div className="card-header">
        <h3>Repair Request #{request.id}</h3>
        <span className={`status-badge ${request.status}`}>
          {request.status.replace(/_/g, ' ')}
        </span>
      </div>
      <div className="card-body">
        <div className="card-row">
          <div className="card-col">
            <p><strong>Vehicle ID:</strong> {request.vehicleId}</p>
            <p><strong>Submitted:</strong> {formattedDate}</p>
            <p>
              <strong>Urgency:</strong> 
              <span className={`urgency-tag ${request.urgency}`}>
                {request.urgency}
              </span>
            </p>
            <p><strong>Submitted By:</strong> {request.submittedBy}</p>
          </div>
          <div className="card-col">
            <p><strong>Department:</strong> {request.department}</p>
            <p><strong>Mileage:</strong> {request.mileage}</p>
          </div>
        </div>
        
        <div className="card-description">
          <p><strong>Issue Description:</strong></p>
          <p>{request.issueDescription}</p>
        </div>

        {request.rejectionReason && (
          <div className="alert error">
            <strong>Rejection Reason:</strong> {request.rejectionReason}
          </div>
        )}

        {showActions && (
          <div className="card-actions">
            <button 
              className="btn-success"
              onClick={onApprove}
            >
              Approve
            </button>
            <button 
              className="btn-danger"
              onClick={onReject}
            >
              Reject
            </button>
          </div>
        )}

        {showQuoteButton && (
          <div className="card-actions">
            <button 
              className="btn-primary"
              onClick={() => onSelectForQuote(request)}
            >
              Provide Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MechanicQuoteForm = ({ request, onSubmit, onCancel }) => {
  const [quoteData, setQuoteData] = useState({
    laborCost: '',
    partsCost: '',
    estimatedTime: '',
    notes: '',
    submittedBy: 'Auto Repair Center'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalCost = parseFloat(quoteData.laborCost || 0) + parseFloat(quoteData.partsCost || 0);
    onSubmit({
      ...quoteData,
      laborCost: parseFloat(quoteData.laborCost),
      partsCost: parseFloat(quoteData.partsCost),
      totalCost,
      submittedAt: new Date().toISOString()
    });
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Provide Repair Quote</h2>
        <p className="request-id">Request #{request.id}</p>
      </div>
      
      <div className="vehicle-details">
        <h3>Vehicle Details</h3>
        <div className="detail-row">
          <div className="detail-item">
            <strong>Vehicle ID:</strong> {request.vehicleId}
          </div>
          <div className="detail-item">
            <strong>Urgency:</strong> 
            <span className={`urgency-tag ${request.urgency}`}>
              {request.urgency}
            </span>
          </div>
        </div>
        <div className="detail-item">
          <strong>Issue:</strong> {request.issueDescription}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Labor Cost ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quoteData.laborCost}
              onChange={(e) => setQuoteData({...quoteData, laborCost: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Parts Cost ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={quoteData.partsCost}
              onChange={(e) => setQuoteData({...quoteData, partsCost: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Estimated Repair Time</label>
          <input
            type="text"
            value={quoteData.estimatedTime}
            onChange={(e) => setQuoteData({...quoteData, estimatedTime: e.target.value})}
            placeholder="e.g., 2 hours, 1 day"
            required
          />
        </div>

        <div className="form-group">
          <label>Your Shop Name</label>
          <input
            type="text"
            value={quoteData.submittedBy}
            onChange={(e) => setQuoteData({...quoteData, submittedBy: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Additional Notes</label>
          <textarea
            rows="3"
            value={quoteData.notes}
            onChange={(e) => setQuoteData({...quoteData, notes: e.target.value})}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit Quote
          </button>
        </div>
      </form>
    </div>
  );
};

const FinanceApprovalDashboard = ({ requests, onApprove, onReject }) => {
  return (
    <div className="dashboard-container">
      <h2>Finance Approval Dashboard</h2>
      <p className="subtitle">Pending Quotes: {requests.length}</p>
      
      {requests.length === 0 ? (
        <div className="alert info">No pending quotes for approval</div>
      ) : (
        <div className="request-list">
          {requests.map(request => (
            <div key={request.id} className="approval-card">
              <ApprovalCard request={request} showActions={false} />
              
              <div className="quote-details">
                <h3>Quote Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Vendor:</strong> {request.quote?.submittedBy}
                  </div>
                  <div className="detail-item">
                    <strong>Labor Cost:</strong> ${request.quote?.laborCost?.toFixed(2)}
                  </div>
                  <div className="detail-item">
                    <strong>Parts Cost:</strong> ${request.quote?.partsCost?.toFixed(2)}
                  </div>
                  <div className="detail-item">
                    <strong>Total Cost:</strong> ${request.quote?.totalCost?.toFixed(2)}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Estimated Time:</strong> {request.quote?.estimatedTime}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Notes:</strong> {request.quote?.notes}
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-success"
                  onClick={() => onApprove(request.id)}
                >
                  Approve Quote
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => {
                    const reason = prompt('Please enter rejection reason:');
                    if (reason) onReject(request.id, reason);
                  }}
                >
                  Reject Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ManagerApprovalDashboard = ({ requests, onApprove, onReject }) => {
  return (
    <div className="dashboard-container">
      <h2>Manager Final Approval</h2>
      <p className="subtitle">Pending Approvals: {requests.length}</p>
      
      {requests.length === 0 ? (
        <div className="alert info">No pending approvals</div>
      ) : (
        <div className="request-list">
          {requests.map(request => (
            <div key={request.id} className="approval-card">
              <ApprovalCard request={request} showActions={false} />
              
              <div className="financial-details">
                <h3>Financial Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Total Cost:</strong> ${request.quote?.totalCost?.toFixed(2)}
                  </div>
                  <div className="detail-item">
                    <strong>Department Budget:</strong> {request.department}
                  </div>
                  <div className="detail-item">
                    <strong>Finance Approval:</strong> {request.financeReview?.reviewedBy}
                  </div>
                  <div className="detail-item full-width">
                    <strong>Finance Notes:</strong> {request.financeReview?.notes}
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-success"
                  onClick={() => onApprove(request.id)}
                >
                  Final Approval
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => {
                    const reason = prompt('Please enter requested changes:');
                    if (reason) onReject(request.id, reason);
                  }}
                >
                  Request Changes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RepairTrackingDashboard = ({ requests, onStartRepair, onCompleteRepair }) => {
  return (
    <div className="dashboard-container">
      <h2>Repair Tracking Dashboard</h2>
      
      {requests.length === 0 ? (
        <div className="alert info">No repair requests found</div>
      ) : (
        <div className="request-list">
          {requests.map(request => (
            <div key={request.id} className="approval-card">
              <ApprovalCard request={request} showActions={false} />
              
              <div className="approval-progress">
                <h3>Approval Progress</h3>
                {request.requiredApprovers && request.requiredApprovers.length > 0 ? (
                  <ul className="approver-list">
                    {request.requiredApprovers.map(approver => (
                      <li key={approver.name} className="approver-item">
                        <div className="approver-avatar">
                          <span>👤</span>
                        </div>
                        <div className="approver-info">
                          <div className="approver-name">{approver.name}</div>
                          <div className={`approver-status ${approver.approved ? 'approved' : 'pending'}`}>
                            {approver.approved ? 'Approved' : 'Pending'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-approvers">No approvers assigned.</p>
                )}
              </div>

              {request.status === 'approved' && (
                <div className="card-actions">
                  <button 
                    className="btn-warning"
                    onClick={() => onStartRepair(request.id)}
                  >
                    <span>🔧</span> Start Repair
                  </button>
                </div>
              )}

              {request.status === 'in_progress' && (
                <div className="card-actions">
                  <button 
                    className="btn-success"
                    onClick={() => {
                      const notes = prompt('Enter completion notes:');
                      if (notes) onCompleteRepair(request.id, notes);
                    }}
                  >
                    <span>✓</span> Complete Repair
                  </button>
                </div>
              )}

              {request.status === 'completed' && (
                <div className="alert success">
                  <h4>Repair Completed</h4>
                  <p>{request.completionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;