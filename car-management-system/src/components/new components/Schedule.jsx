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
  Spinner,
  Alert,
  Dropdown
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Schedule.css';
import api from '../../services/api';

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

  const [scheduleData, setScheduleData] = useState({
    assignedMechanicId: '',
    maintenanceRequestId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    reason: '',
    comments: ''
  });

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, schedules: true, requests: true, mechanics: true }));
      setError(null);

      const [schedulesResponse, approvedRequestsResponse, mechanicsResponse] = await Promise.all([
        api.get('api/MaintenanceRequest/schedules'),
        api.get('api/MaintenanceRequest/approved-requests'),
        api.get('api/Auth/mechanics')
      ]);

      const activitiesData = schedulesResponse.data.reduce((acc, schedule) => {
        const date = new Date(schedule.scheduledDate).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];

        acc[date].push({
          id: schedule.id,
          title: schedule.reason,
          time: formatTime(schedule.scheduledDate),
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
          repairType: schedule.repairType || 'N/A' 
        });
        return acc;
      }, {});

      setActivities(activitiesData);
      setSchedules(schedulesResponse.data);
      setApprovedRequests(approvedRequestsResponse.data);
      setMechanics(mechanicsResponse.data);
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
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      setError('Please select a mechanic');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, scheduling: true }));
      setError(null);

      const payload = {
        ...scheduleData,
        scheduledDate: new Date(scheduleData.scheduledDate).toISOString()
      };

      const response = await api.post(
        `api/MaintenanceRequest/${scheduleData.maintenanceRequestId}/schedule`,
        payload
      );

      const [schedulesResponse, approvedRequestsResponse] = await Promise.all([
        api.get('api/MaintenanceRequest/schedules'),
        api.get('api/MaintenanceRequest/approved-requests')
      ]);

      const activitiesData = schedulesResponse.data.reduce((acc, schedule) => {
        const date = new Date(schedule.scheduledDate).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];

        acc[date].push({
          id: schedule.id,
          title: schedule.reason,
          time: formatTime(schedule.scheduledDate),
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
          repairType:schedule.repairType
        });
        return acc;
      }, {});

      setActivities(activitiesData);
      setSchedules(schedulesResponse.data);
      setApprovedRequests(approvedRequestsResponse.data);
      setShowScheduleModal(false);
      setSuccess('Maintenance scheduled successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Error scheduling maintenance:', err);
      setError(err.response?.data?.message || 'Failed to schedule maintenance');
    } finally {
      setLoading(prev => ({ ...prev, scheduling: false }));
    }
  };

  // UI rendering functions
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
  const today = new Date().toDateString();

  return (
    <div className="week-view-container">
      <div className="week-header">
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === today;
          const isWeekend = [0, 6].includes(date.getDay());
          
          return (
            <div 
              key={`header-${index}`}
              className={`day-header ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''}`}
            >
              <div className="weekday-name">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="date-number">
                {date.getDate()}
                {isToday && <div className="today-indicator"></div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="week-grid">
        {weekDates.map((date, index) => {
          const dateString = date.toISOString().split('T')[0];
          const isToday = date.toDateString() === today;
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isWeekend = [0, 6].includes(date.getDay());
          const activityCount = getDayActivityCount(date);
          const dayActivities = filteredActivities[dateString] || [];
          const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#ff0000'; // Red for high priority
    case 'medium':
      return '#ffa500'; // Orange for medium priority
    case 'low':
      return '#008000'; // Green for low priority
    default:
      return '#000000'; // Default color
  }
};

          return (
            <div 
              key={`day-${index}`}
              className={`day-column ${isToday ? 'today' : ''} ${isWeekend ? 'weekend' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              {/* Activity preview */}
              {loading.schedules ? (
                <div className="loading-indicator">
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              ) : (
                <>
                  {activityCount > 0 && (
                    <div className="activities-preview">
                      {/* Show up to 3 activity previews */}
                      {dayActivities.slice(0, 3).map((activity, i) => (
                        <div 
                          key={i}
                          className={`activity-preview ${activity.priority.toLowerCase()}`}
                          style={{ borderLeft: `3px solid ${getPriorityColor(activity.priority)}` }}
                        >
                          <div className="activity-title">
                            {activity.repairType}
                          </div>
                          <div className="activity-vehicle">
                            {activity.licensePlate}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show "+X more" if there are additional activities */}
                      {activityCount > 3 && (
                        <div className="more-activities">
                          +{activityCount - 3} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Empty state */}
                  {activityCount === 0 && isCurrentMonth && (
                    <div className="empty-day">
                      <button 
                        className="add-activity-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRequestModal(true);
                        }}
                      >
                        <i className="bi bi-plus-lg"></i>
                        <span>Schedule</span>
                      </button>
                    </div>
                  )}
                </>
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
              const activityCount = getDayActivityCount(date);
              return (
                <Col
                  key={dayIndex}
                  className={`day-cell ${isCurrentMonth ? 'current-month' : 'other-month'} ${
                    date.toDateString() === new Date().toDateString() ? 'today' : ''
                  }`}
                  onClick={() => isCurrentMonth && handleDayClick(date)}
                >
                  <div className="day-number">{date.getDate()}</div>
                  <div className="day-activities-preview">
                    {loading.schedules ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      isCurrentMonth && activityCount > 0 && (
                        <div className="activity-count">
                          {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
                        </div>
                      )
                    )}
                  </div>
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
            {dayActivities.map(activity => (
              <div key={activity.id} className={`activity-card activity-${activity.type}`}>
                <div className="activity-time-badge">
                  <span className="time">{activity.time}</span>
                  <Badge pill bg={getPriorityBadgeColor(activity.priority)} className="ms-2">
                    {activity.priority}
                  </Badge>
                  <Badge pill bg={getStatusBadgeColor(activity.status)} className="ms-2">
                    {activity.status}
                  </Badge>
                </div>

                <div className="activity-main">
                  <h5 className="activity-title">
                    <i className={`bi ${
                      activity.type === 'maintenance' ? 'bi-tools' :
                      activity.type === 'meeting' ? 'bi-people-fill' :
                      activity.type === 'meal' ? 'bi-egg-fried' :
                      'bi-exclamation-triangle'
                    } me-2`}></i>
                    {activity.repairType} {/* Display repairType here */}
                  </h5>

                  <div className="activity-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Vehicle:</span>
                      <span className="detail-value">
                        {activity.vehicleMake} {activity.vehicleModel}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">License Plate:</span>
                      <span className="detail-value">{activity.licensePlate}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Request ID:</span>
                      <span className="detail-value">{activity.requestId}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">Assigned Mechanic:</span>
                      <span className="detail-value">{activity.mechanic}</span>
                    </div>
                  </div>

                  <div className="activity-reason">
                    <h6>Reason:</h6>
                    <p>{activity.reason}</p>
                  </div>

                  {activity.comments && (
                    <div className="activity-comments">
                      <h6>Mechanic Notes:</h6>
                      <div className="comments-box">
                        <i className="bi bi-chat-left-quote"></i>
                        <p>{activity.comments}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
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

      <Modal.Footer className="modal-footer">
        <Button
          variant="outline-secondary"
          onClick={() => setShowDayModal(false)}
          className="d-flex align-items-center"
        >
          <i className="bi bi-x-lg me-2"></i>
          Close
        </Button>
      </Modal.Footer>
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
            Schedule Maintenance
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
                <span className="detail-value">{selectedRequest.licensePlate}</span>
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
                Assigned Mechanic *
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
                <i className="bi bi-calendar-date me-2"></i>
                Scheduled Date *
              </Form.Label>
              <Form.Control
                type="date"
                name="scheduledDate"
                value={scheduleData.scheduledDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="form-control-lg"
              />
              <Form.Text className="text-muted">
                Select the date when maintenance should be performed
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
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Scheduling...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Schedule Maintenance
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
            <i className="bi bi-list-check me-2"></i>
            Approved Maintenance Requests ({approvedRequests.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading.requests ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading requests...</p>
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

  return (
    <Container className="schedule-container">
      {/* Success Alert */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible className="mt-3">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </Alert>
      )}

      {/* Error Alert */}
      {error && !showScheduleModal && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="mt-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

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
            <Button variant={viewMode === 'week' ? 'primary' : 'outline-primary'} onClick={goToToday}>
              Today
            </Button>
          </ButtonGroup>
          <ButtonGroup className="me-3">
            <Button variant="outline-secondary" onClick={goToPrevious}>
              &lt;
            </Button>
            <Button variant="outline-secondary" onClick={goToToday}>
              <div>
                {viewMode === 'week'
                  ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
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
        </Col>
      </Row>

      {/* Current View Display */}
      <div className="current-view-display mb-3">
        <h5 className="text-muted">
          {viewMode === 'week' ? (
            `Week of ${currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
          ) : (
            currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          )}
        </h5>
      </div>

      {/* Main Calendar View */}
      {loading.schedules ? (
        <div className="text-center py-5 loading-state">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading schedule data...</p>
        </div>
      ) : viewMode === 'week' ? renderWeekView() : renderMonthView()}

      {/* Modals */}
      {renderDayModal()}
      {renderRequestListModal()}
      {renderScheduleModal()}
    </Container>
  );
};

export default SchedulePage;
