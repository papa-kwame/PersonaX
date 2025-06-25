import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import './MaintenanceDashboard.css'; // Import the CSS file
import {
  Build as BuildIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  DirectionsCar as DirectionsCarIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const MaintenanceDashboard = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  // Form states
  const [completeForm, setCompleteForm] = useState({
    laborHours: 0,
    totalCost: 0,
    partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
  });
  const [progressForm, setProgressForm] = useState({
    expectedCompletionDate: '',
    comment: ''
  });

  // Fetch data
  useEffect(() => {
    fetchUserSchedules();
  }, []);

  useEffect(() => {
    if (selectedSchedule && viewMode === 'detail') {
      fetchProgressUpdates(selectedSchedule.id);
    }
  }, [selectedSchedule, viewMode]);

  const fetchUserSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/MaintenanceRequest/user/${userId}/schedules`);
      setSchedules(response.data);
    } catch (error) {
      showAlert('Failed to fetch your schedules', 'danger');
    } finally {
      setLoading(false);
    }
  };

 const fetchProgressUpdates = async (scheduleId) => {
  try {
    const response = await api.get(`/api/MaintenanceRequest/progress-updates/user/${userId}`);
    setProgressUpdates(response.data);
  } catch (error) {
    showAlert('Failed to fetch progress updates', 'danger');
  }
};

const fetchAllProgressUpdates = async () => {
  try {
    setLoading(true);
    const response = await api.get(`/api/MaintenanceRequest/progress-updates/user/${userId}`);
    setProgressUpdates(response.data);
  } catch (error) {
    showAlert('Failed to fetch progress updates', 'danger');
  } finally {
    setLoading(false);
  }
};

  const handleCompleteWithInvoice = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    try {
      const invoiceData = {
        invoice: {
          laborHours: completeForm.laborHours,
          totalCost: completeForm.totalCost,
          partsUsed: completeForm.partsUsed.filter(part => part.partName)
        }
      };
      await api.post(`/api/MaintenanceRequest/${selectedSchedule.id}/complete-with-invoice`, invoiceData, {
        params: { user: userId }
      });
      showAlert('Maintenance completed and invoice submitted', 'success');
      fetchUserSchedules();
      setOpenCompleteDialog(false);
      setViewMode('list');
    } catch (error) {
      showAlert('Failed to complete maintenance', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProgressUpdate = async () => {
    if (!selectedSchedule) return;
    setLoading(true);
    try {
      await api.post(`/api/MaintenanceRequest/${selectedSchedule.id}/progress-update`, progressForm, {
        params: { user: userId }
      });
      showAlert('Progress update submitted', 'success');
      fetchProgressUpdates(selectedSchedule.id);
      setOpenProgressDialog(false);
    } catch (error) {
      showAlert('Failed to submit progress update', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const handleAddPart = () => {
    setCompleteForm({
      ...completeForm,
      partsUsed: [...completeForm.partsUsed, { partName: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemovePart = (index) => {
    const newParts = [...completeForm.partsUsed];
    newParts.splice(index, 1);
    setCompleteForm({ ...completeForm, partsUsed: newParts });
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...completeForm.partsUsed];
    newParts[index][field] = value;
    setCompleteForm({ ...completeForm, partsUsed: newParts });
  };

  const getStatusBadge = (status) => {
    let className = 'status-badge';
    switch (status) {
      case 'Completed': className += ' status-completed'; break;
      case 'In Progress': className += ' status-in-progress'; break;
      case 'Pending': className += ' status-pending'; break;
      case 'Cancelled': className += ' status-cancelled'; break;
      default: className += ' status-default';
    }
    return <span className={className}>{status}</span>;
  };

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSchedule(null);
  };

  return (
    <div className="maintenance-dashboard">
      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.variant}`}>
          {alert.message}
          <button
            onClick={() => setAlert({ ...alert, show: false })}
            className="alert-close"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="header-title">
            <BuildIcon className="header-icon" />
            Maintenance Dashboard
          </h1>
          <div className="header-tabs">
            <button
              className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('assignments');
                setViewMode('list');
              }}
            >
              My Assignments
            </button>
            <button
              className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('progress');
                fetchAllProgressUpdates();
                setViewMode('list');
              }}
            >
              Progress Updates
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container1">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          {!loading && viewMode === 'list' && activeTab === 'assignments' && (
            <>
              <div className="list-header">
                <h2 className="list-title">My Maintenance Assignments</h2>
                <p className="list-count">
                  {schedules.length} {schedules.length === 1 ? 'assignment' : 'assignments'}
                </p>
              </div>

              {schedules.length === 0 ? (
                <div className="empty-state">
                  <ScheduleIcon className="empty-icon" />
                  <h3 className="empty-title">No assignments</h3>
                  <p className="empty-message">You have no assigned maintenance tasks at this time.</p>
                </div>
              ) : (
                <div className="assignment-list">
                  <ul className="list-items">
                    {schedules.map((schedule) => (
                      <li key={schedule.id} className="list-item">
                        <div className="item-content">
                          <div className="item-main">
                            <div className="item-icon">
                              <DirectionsCarIcon className="vehicle-icon" />
                            </div>
                            <div className="item-details">
                              <p className="vehicle-name">
                                {schedule.vehicleMake} {schedule.vehicleModel}
                              </p>
                              <p className="vehicle-info">
                                <span className="repair-type">{schedule.repairType}</span>
                                <span className="divider">·</span>
                                <span className="license-plate">{schedule.licensePlate}</span>
                              </p>
                            </div>
                          </div>
                          <div className="item-actions">
                            {getStatusBadge(schedule.status)}
                            <div className="action-buttons">
                              <button
                                onClick={() => handleViewDetails(schedule)}
                                className="secondary-button"
                              >
                                Details
                              </button>
                              {schedule.status !== 'Completed' && (
                                <button
                                  onClick={() => {
                                    setSelectedSchedule(schedule);
                                    setCompleteForm({
                                      laborHours: 0,
                                      totalCost: 0,
                                      partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
                                    });
                                    setOpenCompleteDialog(true);
                                  }}
                                  className="primary-button"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="item-footer">
                          <div className="footer-left">
                            <p className="schedule-date">
                              <ScheduleIcon className="date-icon" />
                              {schedule.scheduledDate ?
                                format(new Date(schedule.scheduledDate), 'PPpp') :
                                'No scheduled date'}
                            </p>
                          </div>
                          <div className="footer-right">
                            <button
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setProgressForm({
                                  expectedCompletionDate: '',
                                  comment: ''
                                });
                                setOpenProgressDialog(true);
                              }}
                              className="text-button"
                            >
                              Add Progress
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {!loading && viewMode === 'list' && activeTab === 'progress' && (
            <>
              <div className="list-header">
                <h2 className="list-title">Maintenance Progress Updates</h2>
                <p className="list-count">
                  {progressUpdates.length} {progressUpdates.length === 1 ? 'update' : 'updates'}
                </p>
              </div>

              {progressUpdates.length === 0 ? (
                <div className="empty-state">
                  <EventIcon className="empty-icon" />
                  <h3 className="empty-title">No progress updates</h3>
                  <p className="empty-message">No progress updates have been submitted yet.</p>
                </div>
              ) : (
                <div className="progress-updates">
                  {progressUpdates.map((update, index) => (
                    <div key={index} className="update-card">
                      <div className="update-header">
                        <div className="update-avatar">
                          {update.mechanic?.charAt(0).toUpperCase() || 'M'}
                        </div>
                        <div className="update-title">
                          <h3 className="vehicle-title">
                            {update.vehicle?.make} {update.vehicle?.model} ({update.vehicle?.plate})
                          </h3>
                          <p className="update-time">
                            Updated on {format(new Date(update.timestamp), 'PPpp')}
                          </p>
                        </div>
                      </div>
                      <div className="update-content">
                        <p className="update-comment">{update.comment}</p>
                        <div className="update-tags">
                          {update.expectedCompletionDate && (
                            <span className="date-tag expected">
                              <EventIcon className="tag-icon" />
                              Expected: {format(new Date(update.expectedCompletionDate), 'PP')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && viewMode === 'detail' && selectedSchedule && (
            <div className="detail-view">
              <div className="detail-header">
                <div className="header-left">
                  <button
                    onClick={handleBackToList}
                    className="back-button"
                  >
                    <ArrowBackIcon />
                  </button>
                  <h3 className="vehicle-title">
                    {selectedSchedule.vehicleMake} {selectedSchedule.vehicleModel} ({selectedSchedule.licensePlate})
                  </h3>
                </div>
                <div className="header-actions">
                  <button
                    onClick={() => {
                      setProgressForm({
                        expectedCompletionDate: '',
                        comment: ''
                      });
                      setOpenProgressDialog(true);
                    }}
                    className="secondary-button"
                  >
                    Add Progress
                  </button>
                  {selectedSchedule.status !== 'Completed' && (
                    <button
                      onClick={() => {
                        setCompleteForm({
                          laborHours: 0,
                          totalCost: 0,
                          partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
                        });
                        setOpenCompleteDialog(true);
                      }}
                      className="primary-button"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
              <p className="detail-subtitle">
                {selectedSchedule.repairType} · {getStatusBadge(selectedSchedule.status)}
              </p>

              <div className="detail-content">
                <div className="detail-grid">
                  <div className="detail-section">
                    <h4 className="section-title">
                      <DescriptionIcon className="section-icon" />
                      Assignment Details
                    </h4>
                    <div className="section-content">
                      <div className="detail-field">
                        <label className="field-label">Scheduled Date</label>
                        <p className="field-value">
                          {selectedSchedule.scheduledDate ?
                            format(new Date(selectedSchedule.scheduledDate), 'PPpp') :
                            'Not scheduled'}
                        </p>
                      </div>
                      <div className="detail-field">
                        <label className="field-label">Repair Type</label>
                        <p className="field-value">{selectedSchedule.repairType}</p>
                      </div>
                      <div className="detail-field">
                        <label className="field-label">Reason</label>
                        <p className="field-value">
                          {selectedSchedule.reason || 'No reason provided'}
                        </p>
                      </div>
                      <div className="detail-field">
                        <label className="field-label">Comments</label>
                        <p className="field-value">
                          {selectedSchedule.comments || 'No comments'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="section-title">
                      <ScheduleIcon className="section-icon" />
                      Progress History
                    </h4>

                    {progressUpdates.length === 0 ? (
                      <div className="empty-section">
                        <p className="empty-text">No progress updates yet</p>
                      </div>
                    ) : (
                      <div className="timeline">
                        <ul className="timeline-list">
                          {progressUpdates.map((update, index) => (
                            <li key={index} className="timeline-item">
                              <div className="timeline-connector"></div>
                              <div className="timeline-content">
                                <div className="timeline-avatar">
                                  {update.mechanic?.charAt(0).toUpperCase() || 'M'}
                                </div>
                                <div className="timeline-details">
                                  <p className="timeline-comment">{update.comment}</p>
                                  <div className="timeline-tags">
                                    {update.expectedCompletionDate && (
                                      <span className="date-tag expected">
                                        <EventIcon className="tag-icon" />
                                        Expected: {format(new Date(update.expectedCompletionDate), 'PP')}
                                      </span>
                                    )}

                                  </div>
                                  <div className="timeline-time">
                                    {format(new Date(update.timestamp), 'PPpp')}
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Complete with Invoice Modal */}
      {openCompleteDialog && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <CheckCircleIcon className="modal-icon success" />
                <h3 className="modal-title">Complete Maintenance</h3>
              </div>
              <div className="modal-summary">
                <p className="summary-text">
                  <strong>{selectedSchedule?.vehicleMake} {selectedSchedule?.vehicleModel}</strong> ({selectedSchedule?.licensePlate}) - {selectedSchedule?.repairType}
                </p>
              </div>

              <div className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="laborHours" className="form-label">Labor Hours</label>
                    <input
                      type="number"
                      id="laborHours"
                      className="form-input"
                      min="0"
                      step="0.5"
                      value={completeForm.laborHours}
                      onChange={(e) => setCompleteForm({ ...completeForm, laborHours: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="totalCost" className="form-label">Total Cost</label>
                    <input
                      type="number"
                      id="totalCost"
                      className="form-input"
                      min="0"
                      step="0.01"
                      value={completeForm.totalCost}
                      onChange={(e) => setCompleteForm({ ...completeForm, totalCost: e.target.value })}
                    />
                  </div>


                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setOpenCompleteDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleCompleteWithInvoice}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner small"></div>
                      Processing...
                    </>
                  ) : 'Complete Maintenance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {openProgressDialog && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <PendingIcon className="modal-icon warning" />
                <h3 className="modal-title">Progress Update</h3>
              </div>
              <div className="modal-summary">
                <p className="summary-text">
                  <strong>{selectedSchedule?.vehicleMake} {selectedSchedule?.vehicleModel}</strong> ({selectedSchedule?.licensePlate}) - {selectedSchedule?.repairType}
                </p>
              </div>

              <div className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="expectedDate" className="form-label">Expected Completion</label>
                    <input
                      type="date"
                      id="expectedDate"
                      className="form-input"
                      value={progressForm.expectedCompletionDate}
                      onChange={(e) => setProgressForm({ ...progressForm, expectedCompletionDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="comment" className="form-label">Comments</label>
                    <textarea
                      id="comment"
                      rows="3"
                      className="form-textarea"
                      value={progressForm.comment}
                      onChange={(e) => setProgressForm({ ...progressForm, comment: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setOpenProgressDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleSubmitProgressUpdate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner small"></div>
                      Processing...
                    </>
                  ) : 'Submit Update'} 
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard;
