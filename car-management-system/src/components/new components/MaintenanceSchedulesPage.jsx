import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import './MaintenanceDashboard.css'; // Import the CSS file
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Box, Button, Typography, Divider, Paper, TextField, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Grid, IconButton, Collapse
} from '@mui/material';
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
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import {
  PersonCheck,
  PlusCircle,
  Trash,
  PencilSquare,
  People,
  Search,
  Person,
  Hourglass
} from 'react-bootstrap-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProgressUpdates from './ProgressUpdates';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const MaintenanceDashboard = ({ sidebarExpanded = true }) => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const [completeForm, setCompleteForm] = useState({
    laborHours: 0,
    totalCost: 0,
    partsUsed: [{ partName: '', quantity: 1, unitPrice: 0 }]
  });
  const [progressForm, setProgressForm] = useState({
    expectedCompletionDate: '',
    comment: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const assignmentsPerPage = 9;
  const totalPages = Math.ceil(schedules.length / assignmentsPerPage);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterMechanic, setFilterMechanic] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const uniqueVehicles = Array.from(new Set(schedules.map(s => `${s.vehicleMake} ${s.vehicleModel} (${s.licensePlate})`)));
  const uniqueMechanics = Array.from(new Set(schedules.map(s => s.assignedMechanicName).filter(Boolean)));

  const filteredSchedules = schedules.slice(
    (currentPage - 1) * assignmentsPerPage,
    currentPage * assignmentsPerPage
  ).filter(schedule => {
    let match = true;
    if (filterStatus !== 'all' && schedule.status !== filterStatus) match = false;
    if (filterVehicle !== 'all' && `${schedule.vehicleMake} ${schedule.vehicleModel} (${schedule.licensePlate})` !== filterVehicle) match = false;
    if (filterMechanic !== 'all' && schedule.assignedMechanicName !== filterMechanic) match = false;
    if (filterStartDate && new Date(schedule.scheduledDate) < filterStartDate) match = false;
    if (filterEndDate && new Date(schedule.scheduledDate) > filterEndDate) match = false;
    if (searchText && !(
      schedule.vehicleMake?.toLowerCase().includes(searchText.toLowerCase()) ||
      schedule.vehicleModel?.toLowerCase().includes(searchText.toLowerCase()) ||
      schedule.licensePlate?.toLowerCase().includes(searchText.toLowerCase()) ||
      schedule.reason?.toLowerCase().includes(searchText.toLowerCase())
    )) match = false;
    return match;
  });

  // Fetch data
  useEffect(() => {
    fetchUserSchedules();
  }, []);

  useEffect(() => {
    if (selectedSchedule && viewMode === 'detail') {
      fetchProgressUpdates(selectedSchedule.maintenanceRequestId);
    }
  }, [selectedSchedule, viewMode]);

  useEffect(() => {
    if (selectedSchedule && viewMode === 'detail') {
      const handleEsc = (e) => {
        if (e.key === 'Escape') handleBackToList();
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
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

 const fetchProgressUpdates = async (requestId) => {
  try {
    const response = await api.get(`/api/MaintenanceRequest/progress-updates/request/${requestId}`);
    setProgressUpdates(response.data);
  } catch (error) {
    showAlert('Failed to fetch progress updates', 'danger');
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
      fetchProgressUpdates(selectedSchedule.maintenanceRequestId);
      setOpenProgressDialog(false);
    } catch (error) {
      showAlert('Failed to submit progress update', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant) => {
    if (variant === 'success') toast.success(message);
    else toast.error(message);
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

  const handleViewDetails = async (schedule) => {
    setSelectedSchedule(schedule);
    setViewMode('detail');
    setLoading(true);
    try {
      const response = await api.get(`/api/MaintenanceRequest/progress-updates/request/${schedule.maintenanceRequestId}`);
      setProgressUpdates(response.data);
    } catch (error) {
      showAlert('Failed to fetch progress updates for this assignment', 'danger');
      setProgressUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedSchedule(null);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 3,
      width: sidebarExpanded ? '100%' : 'calc(100% + 100px)',
      alignItems: 'flex-start',
      mt: 2,
      px: { xs: 1, sm: 2, md: 4 },
      pb: 4,
      transition: 'width 0.3s ease-in-out'
    }}>
      {/* Main Schedule/Assignments Section (70%) */}
      <Box sx={{
        flex: { xs: 'unset', md: 7 },
        minWidth: 0,
        width: { xs: '100%', md: '70%' },
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 4,
        boxShadow: '0 2px 24px rgba(37,99,235,0.07)',
        p: { xs: 1, sm: 2, md: 3 },
        mb: { xs: 3, md: 0 }
      }}>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <main className="dashboard-main">
        <div className="dashboard-container1">
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          {!loading && viewMode === 'list' && activeTab === 'assignments' && (
            <>
                <Box sx={{
                  width: '100%',
                  mb: 3,
                  px: { xs: 0, sm: 2, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <Box sx={{
                    width: '100%',
                    maxWidth: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.85)',
                    borderRadius: 4,
                    boxShadow: '0 2px 16px rgba(37,99,235,0.07)',
                    p: 1.5,
                    mb: 1,
                    gap: 2
                  }}>
                    <Search fontSize={24} />
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Search by vehicle, mechanic, status, etc."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      InputProps={{ disableUnderline: true, sx: { fontSize: 20, pl: 1, background: 'transparent' } }}
                      sx={{ flex: 1, fontWeight: 300, fontSize: 15, background: 'transparent' }}
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Hourglass/>}
                      endIcon={<span style={{ fontSize: 18 }}>{filtersOpen ? '▲' : '▼'}</span>}
                      onClick={() => setFiltersOpen(f => !f)}
                      sx={{ fontWeight: 300, borderRadius: 3, px: 2, py: 1, fontSize: 16 }}
                    >
                      Filters
                    </Button>
                  </Box>
                  <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
                    <Box sx={{
                      width: '100%',
                      maxWidth: 1200,
                      background: 'rgba(245,248,255,0.97)',
                      borderRadius: 4,
                      boxShadow: '0 2px 24px rgba(37,99,235,0.10)',
                      p: 2.5,
                      mt: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'center',
                    }}>
                      <FormControl sx={{ minWidth: 140 }} size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} label="Status">
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="Scheduled">Scheduled</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: 180 }} size="small">
                        <InputLabel>Vehicle</InputLabel>
                        <Select value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} label="Vehicle">
                          <MenuItem value="all">All</MenuItem>
                          {uniqueVehicles.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: 160 }} size="small">
                        <InputLabel>Mechanic</InputLabel>
                        <Select value={filterMechanic} onChange={e => setFilterMechanic(e.target.value)} label="Mechanic">
                          <MenuItem value="all">All</MenuItem>
                          {uniqueMechanics.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Start Date"
                          value={filterStartDate}
                          onChange={setFilterStartDate}
                          renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 120 }} />}
                        />
                        <DatePicker
                          label="End Date"
                          value={filterEndDate}
                          onChange={setFilterEndDate}
                          renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 120 }} />}
                        />
                      </LocalizationProvider>
                      <Button variant="outlined" color="secondary" onClick={() => {
                        setFilterStatus('all');
                        setFilterVehicle('all');
                        setFilterMechanic('all');
                        setFilterStartDate(null);
                        setFilterEndDate(null);
                      }}>Reset</Button>
                    </Box>
                  </Collapse>
                </Box>
                {/* Two-column layout: schedules list (left), progress updates (right) */}
                <Box sx={{ display: 'flex', gap: 4, mt: 3, width: '100%', maxWidth: '100%', mx: 'auto',minHeight:'600px' }}>
                  {/* Schedules List */}
                  <Paper elevation={3} sx={{ flex: 1.2, p: 2, borderRadius: 4, minWidth: 400, maxHeight: 700, overflowY: 'auto' }}>
                    <Typography variant="h6" fontWeight={500}  sx={{ mb: 2 }}>
                      Scheduled Maintenance
                    </Typography>
                    {filteredSchedules.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        <EventIcon sx={{ fontSize: 48, mb: 1, color: 'primary.light' }} />
                        <Typography variant="h6" fontWeight={700}>No scheduled maintenance</Typography>
                        <Typography variant="body2">You have no scheduled maintenance at this time.</Typography>
                      </Box>
                    ) : (
                      <List>
                        {filteredSchedules.map(schedule => (
                          <React.Fragment key={schedule.id}>
                            <ListItem
                              alignItems="flex-start"
                              selected={selectedSchedule && selectedSchedule.id === schedule.id}
                              onClick={() => { setSelectedSchedule(schedule); fetchProgressUpdates(schedule.maintenanceRequestId); }}
                              sx={{
                                mb: 2,
                                borderRadius: 3,
                               boxShadow:'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                                background: selectedSchedule && selectedSchedule.id === schedule.id ? '#fff' : '#f9fafd',
                                position: 'relative',
                                pl: 3,
                                pr: 3,
                                py: 2.5,
                                '&:hover': { background: '#f0f4fa', cursor: 'pointer' },
                                minHeight: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'background 0.2s',
                              }}
                            >
                              <ListItemAvatar sx={{  mr : 3 }}>
                                <Avatar sx={{  width: 56, height: 56 }}>
                                  <DirectionsCarIcon fontSize="large" />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Typography fontWeight={400} sx={{ fontSize: 22 }}>
                                      {schedule.vehicleMake} {schedule.vehicleModel} ({schedule.licensePlate})
                                    </Typography>
                                    <Chip label={schedule.status} color={schedule.status === 'Completed' ? 'success' : schedule.status === 'In Progress' ? 'info' : 'warning'} size="medium" sx={{ fontWeight: 800, fontSize: 16, height: 32 }} />
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 1 }}>
                                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, fontSize: 17 }}>
                                      <strong>Date:</strong> {format(new Date(schedule.scheduledDate), 'PPP')}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="large"
                                  sx={{ fontWeight: 800, borderRadius: 2, px: 3, py: 1.5, textTransform: 'none', fontSize: 16 }}
                                  onClick={e => { e.stopPropagation(); handleViewDetails(schedule); }}
                                >
                                  View Details
                                </Button>

                              </Box>
                            </ListItem>
                            <Divider variant="inset" component="li" sx={{ my: 1 }} />
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Paper>

                </Box>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                      <button
                        className="secondary-button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          className={`secondary-button${currentPage === i + 1 ? ' active' : ''}`}
                          style={{ fontWeight: currentPage === i + 1 ? 'bold' : 'normal' }}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        className="secondary-button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
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
            <div className="modal-overlay">
              <div className="modal-container">
                <button
                  className="modal-close"
                  onClick={handleBackToList}
                  aria-label="Close"
                >
                  &times;
                </button>
                <div className="detail-header">
                  <div className="header-left">
                    <h3 className="vehicle-title">
                      {selectedSchedule.vehicleMake} {selectedSchedule.vehicleModel} ({selectedSchedule.licensePlate})
                    </h3>
                  </div>
                  <div className="header-actions">
                    {selectedSchedule.status !== 'Completed' && (
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
                    )}
                    {selectedSchedule.status !== 'Completed' && (
                      <button
                        onClick={() => setShowCompleteConfirm(true)}
                        className="primary-button"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="spinner small"></div>
                            Processing...
                          </>
                        ) : 'Complete Maintenance'}
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
            </div>
          )}
        </div>
      </main>

      {/* Progress Update Modal */}
      {openProgressDialog && (
        <div className="modal-overlay">
            <div className="modal-container modern-progress-modal">
            <div className="modal-content">
                <div className="modal-header modern-modal-header">
                <PendingIcon className="modal-icon warning" />
                <h3 className="modal-title">Progress Update</h3>
              </div>
                <div className="modal-summary modern-modal-summary">
                <p className="summary-text">
                  <strong>{selectedSchedule?.vehicleMake} {selectedSchedule?.vehicleModel}</strong> ({selectedSchedule?.licensePlate}) - {selectedSchedule?.repairType}
                </p>
              </div>
                <div className="modal-form modern-modal-form">
                  <div className="form-grid modern-form-grid">
                    <div className="form-group modern-form-group">
                      <label htmlFor="expectedDate" className="form-label modern-form-label">Expected Completion</label>
                    <input
                      type="date"
                      id="expectedDate"
                        className="form-input modern-form-input"
                      value={progressForm.expectedCompletionDate}
                      onChange={(e) => setProgressForm({ ...progressForm, expectedCompletionDate: e.target.value })}
                    />
                  </div>
                    <div className="form-group full-width modern-form-group">
                      <label htmlFor="comment" className="form-label modern-form-label">Comments</label>
                    <textarea
                      id="comment"
                      rows="3"
                        className="form-textarea modern-form-textarea"
                      value={progressForm.comment}
                      onChange={(e) => setProgressForm({ ...progressForm, comment: e.target.value })}
                        placeholder="Add any comments or notes..."
                    ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer modern-modal-footer">
                <button
                  type="button"
                    className="secondary-button modern-secondary-button"
                  onClick={() => setOpenProgressDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                    className="primary-button modern-primary-button"
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

        {/* Confirmation Modal for Completing Maintenance */}
        {showCompleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(30, 41, 59, 0.18)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.25s',
          }}>
            <div style={{
              minWidth: 340,
              maxWidth: 420,
              width: '90vw',
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(37,99,235,0.13)',
              padding: '2.2rem 2.2rem 1.5rem 2.2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: '1.5px solid #e0eaff',
              position: 'relative',
              animation: 'scaleIn 0.22s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <span style={{ fontSize: 32, color: '#fbbf24', filter: 'drop-shadow(0 2px 8px #fbbf2433)' }}>⚠️</span>
                <span style={{ fontWeight: 900, fontSize: 23, color: '#222', letterSpacing: 0.2 }}>Are you sure?</span>
              </div>
              <div style={{ fontSize: 17, color: '#374151', marginBottom: 28, textAlign: 'center', fontWeight: 500 }}>
                Are you sure you have completed all necessary work on this vehicle?
              </div>
              <div style={{ display: 'flex', gap: 18, justifyContent: 'flex-end', width: '100%' }}>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: '1.5px solid #2563eb',
                    color: '#2563eb',
                    fontWeight: 700,
                    borderRadius: 8,
                    padding: '0.7rem 1.6rem',
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                    boxShadow: '0 1px 6px rgba(37,99,235,0.06)',
                  }}
                  onClick={() => setShowCompleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  style={{
                    background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.7rem 1.8rem',
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(37,99,235,0.13)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:'center',
                    gap: 8,
                    transition: 'background 0.18s, box-shadow 0.18s',
                  }}
                  onClick={() => {
                    setShowCompleteConfirm(false);
                    handleCompleteWithInvoice();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span style={{ fontSize: 18, marginRight: 6 }}>⏳</span> Processing...
                    </>
                  ) : (
                    <>
                     Yes, Complete
                    </>
                  )}
                </button>
              </div>
              <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
                button:active { transform: scale(0.97); }
                button:focus { outline: 2px solid #2563eb33; }
              `}</style>
            </div>
          </div>
        )}
      </Box>
 
      <Box sx={{
        minWidth: 0,
        width: { xs: '100%', md: '30%' },
        borderRadius: 4,
        maxHeight: { md: '100vh' },
        overflowY: 'auto',
        position: 'sticky',

      }}>
        <ProgressUpdates userId={userId} />
      </Box>
    </Box>
  );
};

export default MaintenanceDashboard;
