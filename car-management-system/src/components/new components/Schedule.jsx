import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Card,
  ListGroup,
  Modal,
  Form,
  Badge,
  Alert,
  Dropdown,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Schedule.css';
import api from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activities, setActivities] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState({
    schedules: false,
    requests: false,
    mechanics: false,
    scheduling: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [allProgressUpdates, setAllProgressUpdates] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    assignedMechanicId: '',
    maintenanceRequestId: '',
    reason: '',
    comments: ''
  });

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return new Date().toISOString();
    }
    return date.toISOString();
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, schedules: true, requests: true, mechanics: true }));
        setError(null);

        const [schedulesResponse, approvedRequestsResponse, mechanicsResponse, progressUpdatesResponse] = await Promise.all([
          api.get('api/MaintenanceRequest/schedules'),
          api.get('api/MaintenanceRequest/approved-requests'),
          api.get('api/Auth/mechanics'),
          api.get('api/MaintenanceRequest/progress-updates')
        ]);

        const getEventDate = (schedule) => {
          if (
            schedule.completedDate &&
            schedule.completedDate !== '0001-01-01T00:00:00' &&
            schedule.status === 'Completed'
          ) {
            return schedule.completedDate;
          }
          return schedule.scheduledDate;
        };

        const activitiesData = schedulesResponse.data.reduce((acc, schedule) => {
          const eventDate = getEventDate(schedule);
          const date = new Date(formatDateString(eventDate)).toISOString().split('T')[0];
          if (!acc[date]) acc[date] = [];

          acc[date].push({
            id: schedule.id,
            title: schedule.reason,
            time: formatTime(eventDate),
            type: 'maintenance',
            licensePlate: schedule.licensePlate || 'N/A',
            vehicleMake: schedule.vehicleMake || 'N/A',
            vehicleModel: schedule.vehicleModel || 'N/A',
            reason: schedule.reason || 'N/A',
            priority: schedule.priority || 'Medium',
            status: schedule.status || 'Scheduled',
            mechanic: schedule.assignedMechanicName || 'Unassigned',
            comments: schedule.comments || 'No comments',
            requestId: schedule.maintenanceRequestId,
            repairType: schedule.repairType || 'N/A',
            completedDate: schedule.completedDate || null
          });
          return acc;
        }, {});

        setActivities(activitiesData);
        setSchedules(schedulesResponse.data);
        setApprovedRequests(approvedRequestsResponse.data);
        setMechanics(mechanicsResponse.data);
        setProgressUpdates(progressUpdatesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(prev => ({ ...prev, schedules: false, requests: false, mechanics: false }));
      }
    };

    fetchData();
  }, []);

  const filteredActivities = Object.entries(activities).reduce((acc, [date, activities]) => {
    const filtered = activities.filter(activity => {
      if (filter === 'all') return true;
      if (filter === 'high') return activity.priority === 'High';
      if (filter === 'unassigned') return activity.mechanic === 'Unassigned';
      return true;
    });

    if (filtered.length > 0) {
      acc[date] = filtered;
    }

    return acc;
  }, {});

  const formatTime = (dateString) => {
    const date = new Date(formatDateString(dateString));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDayActivityCount = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayActivities = filteredActivities[dateString] || [];
    return dayActivities.length;
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setScheduleData(prev => ({ ...prev, scheduledDate: new Date().toISOString().split('T')[0] }));
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    viewMode === 'week' ? newDate.setDate(newDate.getDate() - 7) : newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    viewMode === 'week' ? newDate.setDate(newDate.getDate() + 7) : newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getWeekDates = (date) => {
    const startDate = new Date(date);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    return Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() + i);
      return newDate;
    });
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysFromPrevMonth = startDay === 0 ? 6 : startDay - 1;
    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) =>
      new Date(year, month - 1, prevMonthLastDay - daysFromPrevMonth + i + 1)
    );

    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) =>
      new Date(year, month, i + 1)
    );

    const totalCells = Math.ceil((prevMonthDays.length + currentMonthDays.length) / 7) * 7;
    const daysFromNextMonth = totalCells - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = Array.from({ length: daysFromNextMonth }, (_, i) =>
      new Date(year, month + 1, i + 1)
    );

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
    setShowDayModal(true);
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setScheduleData({
      assignedMechanicId: '',
      maintenanceRequestId: request.id,
      scheduledDate: new Date().toISOString().split('T')[0],
      reason: request.description,
      comments: ''
    });
    setShowRequestModal(false);
    setShowScheduleModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleMaintenance = async () => {
    if (!scheduleData.assignedMechanicId) {
      toast.error('Please select a mechanic');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, scheduling: true }));
      setError(null);

      const payload = {
        ...scheduleData,
        scheduledDate: new Date(scheduleData.scheduledDate).toISOString()
      };

      await api.post(
        `api/MaintenanceRequest/${scheduleData.maintenanceRequestId}/schedule`,
        payload
      );

      const [schedulesResponse, approvedRequestsResponse] = await Promise.all([
        api.get('api/MaintenanceRequest/schedules'),
        api.get('api/MaintenanceRequest/approved-requests')
      ]);

      const getEventDate = (schedule) => {
        if (
          schedule.completedDate &&
          schedule.completedDate !== '0001-01-01T00:00:00' &&
          schedule.status === 'Completed'
        ) {
          return schedule.completedDate;
        }
        return schedule.scheduledDate;
      };

      const activitiesData = schedulesResponse.data.reduce((acc, schedule) => {
        const eventDate = getEventDate(schedule);
        const date = new Date(formatDateString(eventDate)).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];

        acc[date].push({
          id: schedule.id,
          title: schedule.reason,
          time: formatTime(eventDate),
          type: 'maintenance',
          licensePlate: schedule.licensePlate || 'N/A',
          vehicleMake: schedule.vehicleMake || 'N/A',
          vehicleModel: schedule.vehicleModel || 'N/A',
          reason: schedule.reason || 'N/A',
          priority: schedule.priority || 'Medium',
          status: schedule.status || 'Scheduled',
          mechanic: schedule.assignedMechanicName || 'Unassigned',
          comments: schedule.comments || 'No comments',
          requestId: schedule.maintenanceRequestId,
          repairType: schedule.repairType || 'N/A',
          completedDate: schedule.completedDate || null
        });
        return acc;
      }, {});

      setActivities(activitiesData);
      setSchedules(schedulesResponse.data);
      setApprovedRequests(approvedRequestsResponse.data);
      setShowScheduleModal(false);
      toast.success('Schedule Requested successfully!');
    } catch (err) {
      console.error('Error scheduling maintenance:', err);
      toast.error(err.response?.data?.message || 'Failed to schedule maintenance');
    } finally {
      setLoading(prev => ({ ...prev, scheduling: false }));
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'primary';
      case 'scheduled': return 'info';
      case 'cancelled': return 'secondary';
      case 'overdue': return 'danger';
      default: return 'warning';
    }
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);

    return (
      <div className="week-view-container">
        <div className="week-header">
          {weekDates.map((date, index) => {
            const isWeekend = [0, 6].includes(date.getDay());

            return (
              <div
                key={`header-${index}`}
                className={`day-header ${isToday(date) ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
              >
                <div className="weekday-name">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="date-number">
                  {date.getDate()}
                  {isToday(date) && <div className="today-indicator"></div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="week-grid">
          {weekDates.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isWeekend = [0, 6].includes(date.getDay());
            const dayActivities = filteredActivities[dateString] || [];

            return (
              <div
                key={`day-${index}`}
                className={`day-cell ${isToday(date) ? 'today' : ''} ${isWeekend ? 'weekend' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
                onClick={() => handleDayClick(date)}
              >
                <div className="day-number">{date.getDate()}</div>
                {dayActivities.length > 0 ? (
                  dayActivities.map((activity, i) => (
                          <div
                            key={i}
                      className={`activity-badge ${activity.status ? activity.status.toLowerCase() : ''}`}
                      title={activity.title}
                          >
                              {activity.repairType}
                            </div>
                  ))
                ) : (
                  isCurrentMonth && (
                      <div className="empty-day">
                        <button
                          className="add-activity-btn"
                        onClick={e => {
                            e.stopPropagation();
                            setShowRequestModal(true);
                          }}
                        >
                          <i className="bi bi-plus-lg"></i>
                          <span>Schedule</span>
                        </button>
                      </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDates = getMonthDates(currentDate);
    const weeks = [];

    for (let i = 0; i < monthDates.length; i += 7) {
      weeks.push(monthDates.slice(i, i + 7));
    }

    return (
      <div className="month-view">
        <Row className="week-header g-0">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <Col key={index} className="day-header"><strong>{day}</strong></Col>
          ))}
        </Row>
        {weeks.map((week, weekIndex) => (
          <Row key={weekIndex} className="week-row g-0">
            {week.map((date, dayIndex) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const dateString = date.toISOString().split('T')[0];
              const dayActivities = filteredActivities[dateString] || [];
              return (
                <Col
                  key={dayIndex}
                  className={`day-cell ${isCurrentMonth ? 'current-month' : 'other-month'} ${isToday(date) ? 'today' : ''}`}
                  onClick={() => isCurrentMonth && handleDayClick(date)}
                >
                  <div className="day-number">{date.getDate()}</div>
                  {dayActivities.map((activity, i) => (
                    <div
                      key={i}
                      className={`activity-badge ${activity.status ? activity.status.toLowerCase() : ''}`}
                      title={activity.title}
                    >
                      {activity.repairType}
                        </div>
                  ))}
                </Col>
              );
            })}
          </Row>
        ))}
      </div>
    );
  };

  const renderDayModal = () => {
    if (!selectedDay) return null;

    const dateString = selectedDay.toISOString().split('T')[0];
    const dayActivities = filteredActivities[dateString] || [];
    const formattedDate = selectedDay.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <Modal
        show={showDayModal}
        onHide={() => setShowDayModal(false)}
        size="lg"
        centered
        className="day-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="d-flex align-items-center">
            <div className="modal-icon">
              <i className="bi bi-calendar-event"></i>
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{formattedDate}</h4>
              <small className="opacity-80">
                {dayActivities.length} scheduled {dayActivities.length === 1 ? 'activity' : 'activities'}
              </small>
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {dayActivities.length > 0 ? (
            <div className="activity-list">
              {dayActivities.map(activity => {
                const activityProgress = progressUpdates.find(update => update.scheduleId === activity.id);
                return (
                  <div key={activity.id} className={`activity-card activity-${activity.type}`}>
                    <div className="activity-time-badge">
                      <h5 className="activity-title">
                        <i className={`bi ${
                          activity.type === 'maintenance' ? 'bi-tools' :
                          activity.type === 'meeting' ? 'bi-people-fill' :
                          activity.type === 'meal' ? 'bi-egg-fried' :
                          'bi-exclamation-triangle'
                        } me-2`}></i>
                        {activity.repairType}
                      </h5>
                      <div>
                        <Badge pill bg={getPriorityBadgeColor(activity.priority)} className="ms-2">
                          {activity.priority}
                        </Badge>
                        <Badge pill bg={getStatusBadgeColor(activity.status)} className="ms-2">
                          {activity.status}  {new Date(activity.completedDate).toLocaleString()}
                        </Badge>
              
                    
                      </div>
                    </div>
                    <div className="activity-main">
                      <div className="activity-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Vehicle:</span>
                          <span className="detail-value">
                            {activity.vehicleMake} {activity.vehicleModel}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">License Plate:</span>
                          <span className="detail-value" style={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              position: 'relative',
                              background: '#fff',
                              border: '2.5px solid #222',
                              borderRadius: '6px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                              fontFamily: 'inherit, sans-serif',
                              fontWeight: 300,
                              fontSize: 36,
                              color: '#181818',
                              letterSpacing: 2,
                              width: 290,
                              height: 66,
                              padding: '0 12px',
                              margin: '2px 0',
                              userSelect: 'all',
                              overflow: 'hidden',
                            }}>
                              {activity.licensePlate}
                              <span style={{ position: 'absolute', top: 3, right: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
                                  alt="Ghana Flag"
                                  style={{ width: 22, height: 14, border: '1px solid #222', borderRadius: 2, marginBottom: 1 }}
                                />
                                <span style={{ fontWeight: 700, color: '#181818', fontSize: 10, letterSpacing: 1, marginTop: 0 }}>GH</span>
                              </span>
                            </span>
                          </span>
                        </div>
                        <div className="detail-item-mechanic">
                          <span className="detail-label">Assigned Mechanic:</span>
                          <span className="detail-value"> {activity.mechanic}</span>
                        </div>
                      </div>
                      <div className="section-header"><i className="bi bi-info-circle"></i> Reason</div>
                      <div className="activity-reason">{activity.reason}</div>
                      {activity.comments && (
                        <>
                          <div className="section-header"><i className="bi bi-chat-left-text"></i> Mechanic Notes</div>
                        <div className="activity-comments">
                          <div className="comments-box">
                            <i className="bi bi-chat-left-quote"></i>
                              <span>{activity.comments}</span>
                          </div>
                        </div>
                        </>
                      )}
                      {(activityProgress || activity.completedDate) && (
                        <>
                          <div className="section-header"><i className="bi bi-flag"></i> Completion Info</div>
                          <div className="completion-info">
                      {activityProgress && (
                              <span className="progress-box"><strong>Expected:</strong> {new Date(activityProgress.expectedCompletionDate).toLocaleString()}</span>
                            )}

                          </div>
                        </>
                      )}
                      {activityProgress && activityProgress.comment && (
                        <div className="section-header"><i className="bi bi-chat-left-dots"></i> Progress Comment</div>
                      )}
                      {activityProgress && activityProgress.comment && (
                          <div className="progress-box">
                          <span><strong>Comment:</strong> {activityProgress.comment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state text-center py-5">
              <i className="bi bi-calendar-x text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="mt-3">No maintenance scheduled</h4>
              <p className="text-muted">
                There are no activities scheduled for {formattedDate}
              </p>
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => {
                  setShowDayModal(false);
                  setShowRequestModal(true);
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Schedule Maintenance
              </Button>
            </div>
          )}
        </Modal.Body>


      </Modal>
    );
  };

  const renderScheduleModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        centered
        className="schedule-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            <i className="bi bi-calendar-plus me-2"></i>
            Schedule Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

          <div className="request-details mb-4">
            <h5 className="section-title">
              <i className="bi bi-info-circle me-2"></i>
              Request Information
            </h5>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Vehicle:</span>
                <span className="detail-value">{selectedRequest.vehicleMake} {selectedRequest.vehicleModel}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">License Plate:</span>
                <span className="detail-value" style={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    position: 'relative',
                    background: '#fff',
                    border: '2.5px solid #222',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    fontFamily: 'Impact, Arial Black, Arial, sans-serif',
                    fontWeight: 900,
                    fontSize: 26,
                    color: '#181818',
                    letterSpacing: 2,
                    width: 210,
                    height: 44,
                    padding: '0 12px',
                    margin: '2px 0',
                    userSelect: 'all',
                    overflow: 'hidden',
                  }}>
                    {selectedRequest.licensePlate}
                    <span style={{ position: 'absolute', top: 3, right: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
                        alt="Ghana Flag"
                        style={{ width: 22, height: 14, border: '1px solid #222', borderRadius: 2, marginBottom: 1 }}
                      />
                      <span style={{ fontWeight: 700, color: '#181818', fontSize: 10, letterSpacing: 1, marginTop: 0 }}>GH</span>
                    </span>
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Priority:</span>
                <span className="detail-value">
                  <Badge bg={getPriorityBadgeColor(selectedRequest.priority)}>
                    {selectedRequest.priority}
                  </Badge>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedRequest.description}</span>
              </div>
            </div>
          </div>

          <Form>
            <h5 className="section-title mb-3">
              <i className="bi bi-gear me-2"></i>
              Scheduling Details
            </h5>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-person-wrench me-2"></i>
                Assigned Mechanic 
              </Form.Label>
              <Form.Control
                as="select"
                name="assignedMechanicId"
                value={scheduleData.assignedMechanicId}
                onChange={handleInputChange}
                required
                className="form-select-lg"
              >
                <option value="">Select mechanic</option>
                {mechanics.map(mechanic => (
                  <option key={mechanic.id} value={mechanic.id}>
                    {mechanic.userName}
                  </option>
                ))}
              </Form.Control>
              <Form.Text className="text-muted">
                Select the mechanic responsible for this maintenance
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-chat-left-text me-2"></i>
                Additional Comments
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comments"
                value={scheduleData.comments}
                onChange={handleInputChange}
                placeholder="Enter any special instructions or notes for the mechanic..."
                className="form-control-lg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setShowScheduleModal(false)}
            disabled={loading.scheduling}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleScheduleMaintenance}
            disabled={loading.scheduling}
            className="d-flex align-items-center"
          >
            {loading.scheduling ? (
              <>
                <LoadingSpinner size="12px" text="Scheduling..." />
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Request
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const renderRequestListModal = () => {
    return (
      <Modal
        show={showRequestModal}
        onHide={() => setShowRequestModal(false)}
        size="lg"
        centered
        className="requests-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            <div className='me22'>
              <i className="bi bi-list-check me-2 me333"></i>
              Approved Requests 
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading.requests ? (
            <div className="text-center py-4">
              <LoadingSpinner size="sm" text="Loading requests..." fullPage={false} />
            </div>
          ) : approvedRequests.length > 0 ? (
            <ListGroup variant="flush" className="request-list">
              {approvedRequests.map(request => (
                <ListGroup.Item
                  key={request.id}
                  action
                  onClick={() => handleRequestClick(request)}
                  className="py-3 request-item"
                >
                  <Row className="align-items-center">
                    <Col md={4}>
                      <h6 className="mb-1 request-title">
                        {request.vehicleMake} {request.vehicleModel}
                      </h6>
                      <small className="text-muted">
                        <i className="bi bi-upc-scan me-1"></i>
                        {request.licensePlate}
                      </small>
                    </Col>
                    <Col md={4}>
                      <p className="mb-1 text-truncate request-description">
                        <i className="bi bi-card-text me-1"></i>
                        {request.description}
                      </p>
                      <small className="text-muted">
                        <i className="bi bi-person me-1"></i>
                        Requested by: {request.requestedByUserName}
                      </small>
                    </Col>
                    <Col md={2} className="text-center">
                      <Badge
                        bg={getPriorityBadgeColor(request.priority)}
                        className="priority-badge"
                      >
                        {request.priority}
                      </Badge>
                    </Col>
                    <Col md={2} className="text-end">
                      <small className="text-muted request-date">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </small>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center py-4 empty-requests">
              <i className="bi bi-check-circle text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">No approved requests available</h5>
              <p className="text-muted">
                All approved requests have been scheduled or there are no pending approvals.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setShowRequestModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  const fetchAllProgressUpdatesModal = async () => {
    setLoadingProgress(true);
    try {
      const response = await api.get('api/MaintenanceRequest/progress-updates');
      setAllProgressUpdates(response.data);
    } catch (err) {
      setAllProgressUpdates([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  return (
    <Container className="schedule-container">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <div className='divider'>
            <h2 className="page-title">
              <i className="bi bi-calendar-week me-2"></i>
              Schedule
            </h2>
          </div>
        </Col>
        <Col className="d-flex justify-content-end">
          <Dropdown className="me-3">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-filter">
              <i className="bi bi-funnel me-2"></i>
              Filter: {filter === 'all' ? 'All' : filter === 'high' ? 'High Priority' : 'Unassigned'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilter('all')}>All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter('high')}>High Priority</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter('unassigned')}>Unassigned</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <ButtonGroup className="me-3">
            <Button
              variant={viewMode === 'month' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </ButtonGroup>
          <ButtonGroup className="me-3">
            <Button variant="outline-secondary" onClick={goToPrevious}>
              &lt;
            </Button>
            <Button variant="outline-secondary" onClick={goToToday}>
              <div>
                {viewMode === 'week'
                  ? ` ${currentDate.toLocaleDateString('en-US', { month: 'long',  year: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </Button>
            <Button variant="outline-secondary" onClick={goToNext}>
              &gt;
            </Button>
          </ButtonGroup>
          <Button variant="primary" onClick={() => setShowRequestModal(true)}>
            Requests ({approvedRequests.length})
          </Button>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="progress-tooltip">View Progress Updates</Tooltip>}
          >
            <Button
              variant="light"
              className="rounded-circle ms-2 d-flex align-items-center justify-content-center"
              style={{ border: '1px solid #ececec', boxShadow: 'none', width: 40, height: 40, padding: 0 }}
              onClick={() => {
                setShowProgressModal(true);
                fetchAllProgressUpdatesModal();
              }}
            >
              <i className="bi bi-list-check" style={{ fontSize: 20, color: '#2563eb' }}></i>
            </Button>
          </OverlayTrigger>
        </Col>
      </Row>

      <div className="current-view-display mb-3">
        <h5 className="text-muted">
          {viewMode === 'week' ? (
            `Week of ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
          ) : (
            currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          )}
        </h5>
      </div>

      {loading.schedules ? (
        <div className="text-center py-5 loading-state">
          <LoadingSpinner size="md" text="Loading schedule data..." fullPage={false} />
        </div>
      ) : viewMode === 'week' ? renderWeekView() : renderMonthView()}

      {renderDayModal()}
      {renderRequestListModal()}
      {renderScheduleModal()}

      <Modal
        show={showProgressModal}
        onHide={() => setShowProgressModal(false)}
        size="lg"
        centered
        dialogClassName="progress-modal-lg"
        backdropClassName="progress-modal-backdrop"
      >
        <Modal.Header closeButton style={{ border: 'none', background: '#f7f8fa', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: 22 }}>
            <i className="bi bi-list-check me-2 text-primary"></i> Progress Updates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#f7f8fa', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 32, minHeight: 500 }}>
          {loadingProgress ? (
            <div className="text-center py-4">
              <LoadingSpinner size="md" text="Loading..." fullPage={false} />
            </div>
          ) : allProgressUpdates.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-emoji-neutral" style={{ fontSize: 48, color: '#b0b8c1' }}></i>
              <div className="mt-3" style={{ fontSize: 20, fontWeight: 600 }}>No progress updates found.</div>
              <div style={{ color: '#8a99b3', fontSize: 16, marginTop: 8 }}>Mechanics will post updates here as work progresses.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {allProgressUpdates.map((update, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 18,
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 2px 16px rgba(37,99,235,0.07)',
                    padding: '22px 28px',
                    margin: 0,
                    border: 'none',
                    transition: 'box-shadow 0.18s, background 0.18s',
                  }}
                >
                  <div style={{ flexShrink: 0, marginRight: 12 }}>
                    <i className="bi bi-tools" style={{ fontSize: 28, color: '#2563eb', opacity: 0.85 }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#222', marginBottom: 2 }}>
                      {update.vehicle?.make} {update.vehicle?.model}
                      <span style={{ color: '#6c757d', fontWeight: 500, fontSize: 15, marginLeft: 10 }}>
                        ({update.vehicle?.plate})
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 15, marginBottom: 2 }}>
                      {update.mechanic}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 6, fontSize: 15 }}>
                      <div style={{ color: '#374151' }}>
                        <i className="bi bi-calendar-event me-1" style={{ color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 500 }}>Expected:</span> {update.expectedCompletionDate ? new Date(update.expectedCompletionDate).toLocaleString() : '-'}
                      </div>
                      <div style={{ color: '#374151' }}>
                        <i className="bi bi-chat-left-text me-1" style={{ color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 500 }}>Comment:</span> {update.comment || '-'}
                      </div>
                      <div style={{ color: '#6c757d' }}>
                        <i className="bi bi-clock-history me-1" style={{ color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 500 }}>Updated:</span> {update.timestamp ? new Date(update.timestamp).toLocaleString() : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SchedulePage;
