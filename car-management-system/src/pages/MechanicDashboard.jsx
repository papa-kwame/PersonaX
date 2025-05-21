import React, { useState } from 'react';
import { dummyRequests } from '../components/approval/dummyData';
import MechanicQuoteForm from '../components/mechanic/MechanicQuoteForm';
import MechanicWorkOrders from '../components/mechanic/MechanicWorkOrders';

import MechanicNavbar from '../components/mechanic/MechanicNavbar';

const MechanicDashboard = () => {
  const [requests, setRequests] = useState(dummyRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Filter requests for mechanic view
  const pendingRequests = requests.filter(req => req.status === 'pending_mechanic');
  const assignedRequests = requests.filter(req => req.status === 'in_progress' && req.assignedMechanic === "Auto Repair Center");
  const completedRequests = requests.filter(req => req.status === 'completed' && req.assignedMechanic === "Auto Repair Center");

  const handleSubmitQuote = (quoteData) => {
    setRequests(requests.map(req => 
      req.id === selectedRequest.id ? { 
        ...req, 
        quote: quoteData, 
        status: 'pending_finance' 
      } : req
    ));
    setSelectedRequest(null);
    setActiveTab('pending');
  };

  const handleStartWork = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'in_progress',
        workStartedAt: new Date().toISOString()
      } : req
    ));
  };

  const handleCompleteWork = (requestId) => {
    const completionNotes = prompt("Enter completion notes and any additional details:");
    if (completionNotes) {
      setRequests(requests.map(req => 
        req.id === requestId ? { 
          ...req, 
          status: 'completed',
          workCompletedAt: new Date().toISOString(),
          completionNotes
        } : req
      ));
    }
  };

  return (
    <div className="mechanic-dashboard">
    <MechanicNavbar/>
      <div className="dashboard-containers">
        {/* Sidebar */}
        <div className="mechanic-sidebar">
          <div className="sidebar-header">
            <div className="mechanic-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <h3>Mechanic Portal</h3>
            <p className="shop-name">Auto Repair Center</p>
          </div>
          
          <nav className="mechanic-nav">
            <button 
              className={`nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <i className="bi bi-clipboard"></i>
              <span>Pending Quotes</span>
              <span className="badge">{pendingRequests.length}</span>
            </button>
            
            <button 
              className={`nav-btn ${activeTab === 'assigned' ? 'active' : ''}`}
              onClick={() => setActiveTab('assigned')}
            >
              <i className="bi bi-wrench"></i>
              <span>My Work Orders</span>
              <span className="badge">{assignedRequests.length}</span>
            </button>
            
            <button 
              className={`nav-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              <i className="bi bi-check-circle"></i>
              <span>Completed</span>
              <span className="badge">{completedRequests.length}</span>
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <div className="performance-metrics">
              <div className="metric">
                <span>This Month</span>
                <strong>12 Jobs</strong>
              </div>
              <div className="metric">
                <span>Avg. Time</span>
                <strong>3.2h</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mechanic-main">
          {selectedRequest ? (
            <MechanicQuoteForm 
              request={selectedRequest}
              onSubmit={handleSubmitQuote}
              onCancel={() => setSelectedRequest(null)}
            />
          ) : (
            <div className="work-section">
              <div className="section-header">
                <h2>
                  {activeTab === 'pending' && 'Pending Quotes'}
                  {activeTab === 'assigned' && 'My Work Orders'}
                  {activeTab === 'completed' && 'Completed Repairs'}
                </h2>
                <div className="status-indicators">
                  <div className={`indicator pending ${activeTab === 'pending' ? 'active' : ''}`}>
                    <span>{pendingRequests.length}</span> Pending
                  </div>
                  <div className={`indicator in-progress ${activeTab === 'assigned' ? 'active' : ''}`}>
                    <span>{assignedRequests.length}</span> In Progress
                  </div>
                  <div className={`indicator completed ${activeTab === 'completed' ? 'active' : ''}`}>
                    <span>{completedRequests.length}</span> Completed
                  </div>
                </div>
              </div>

              {activeTab === 'pending' && (
                <div className="request-grid">
                  {pendingRequests.length === 0 ? (
                    <div className="empty-state">
                      <i className="bi bi-check2-circle"></i>
                      <h3>No pending quotes</h3>
                      <p>All caught up! Check back later for new requests.</p>
                    </div>
                  ) : (
                    pendingRequests.map(request => (
                      <div key={request.id} className="request-card pending">
                        <div className="card-header">
                          <h4>Request #{request.id}</h4>
                          <span className="urgency-badge">{request.urgency}</span>
                        </div>
                        <div className="card-body">
                          <div className="vehicle-info">
                            <i className="bi bi-truck"></i>
                            <div>
                              <strong>{request.vehicleId}</strong>
                              <span>{request.mileage}</span>
                            </div>
                          </div>
                          <div className="issue-description">
                            <p>{request.issueDescription}</p>
                          </div>
                          <div className="request-meta">
                            <span><i className="bi bi-calendar"></i> {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span><i className="bi bi-building"></i> {request.department}</span>
                          </div>
                        </div>
                        <div className="card-footer">
                          <button 
                            className="btn-primary"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <i className="bi bi-pencil"></i> Prepare Quote
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'assigned' && (
                <MechanicWorkOrders 
                  requests={assignedRequests}
                  onComplete={handleCompleteWork}
                />
              )}

              {activeTab === 'completed' && (
                <div className="completed-requests">
                  {completedRequests.length === 0 ? (
                    <div className="empty-state">
                      <i className="bi bi-wrench"></i>
                      <h3>No completed repairs</h3>
                      <p>Work on assigned jobs to see them appear here.</p>
                    </div>
                  ) : (
                    completedRequests.map(request => (
                      <div key={request.id} className="completed-card">
                        <div className="card-header">
                          <h4>WO-{request.id}</h4>
                          <div className="completion-date">
                            <i className="bi bi-calendar-check"></i>
                            {new Date(request.workCompletedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="vehicle-summary">
                            <div className="vehicle-info">
                              <i className="bi bi-truck"></i>
                              <div>
                                <strong>{request.vehicleId}</strong>
                                <span>{request.mileage}</span>
                              </div>
                            </div>
                            <div className="repair-cost">
                              <span>Total Cost</span>
                              <strong>${request.finalCost?.toFixed(2) || request.quote?.totalCost.toFixed(2)}</strong>
                            </div>
                          </div>
                          
                          <div className="repair-details">
                            <div className="detail">
                              <label>Issue</label>
                              <p>{request.issueDescription}</p>
                            </div>
                            <div className="detail">
                              <label>Work Performed</label>
                              <p>{request.completionNotes}</p>
                            </div>
                          </div>
                          
                          <div className="time-metrics">
                            <div className="metric">
                              <label>Estimated</label>
                              <span>{request.quote?.estimatedTime}</span>
                            </div>
                            <div className="metric">
                              <label>Actual Time</label>
                              <span>4.5 hours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;