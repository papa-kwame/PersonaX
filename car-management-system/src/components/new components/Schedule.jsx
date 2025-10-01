import React, { useState, useEffect } from 'react';
import { formatDate, formatDateDisplay, formatDateShort, formatMonthYear } from '../../utils/dateUtils';
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
  const [acceptedMechanic, setAcceptedMechanic] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState({
    schedules: false,
    requests: false,
    mechanics: false,
    scheduling: false,
    acceptedMechanic: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [allProgressUpdates, setAllProgressUpdates] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Logistics state per schedule
  const [logisticsBySchedule, setLogisticsBySchedule] = useState({}); // { [scheduleId]: snapshot }
  const [logisticsForms, setLogisticsForms] = useState({}); // { [scheduleId]: { pickupRequired, pickupAddress, ... , open: bool } }

  const [scheduleData, setScheduleData] = useState({
    assignedMechanicId: '',
    maintenanceRequestId: '',
    reason: '',
    comments: ''
  });

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
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

  const fetchAcceptedMechanic = async (requestId) => {
    try {
      setLoading(prev => ({ ...prev, acceptedMechanic: true }));
      const response = await api.get(`api/MaintenanceRequest/${requestId}/accepted-mechanic`);
      setAcceptedMechanic(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // No mechanic accepted yet
        setAcceptedMechanic(null);
        return null;
      }
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, acceptedMechanic: false }));
    }
  };

  const handleRequestClick = async (request) => {
    setSelectedRequest(request);
    
    // Fetch the accepted mechanic for this request
    try {
      const acceptedMech = await fetchAcceptedMechanic(request.id);
      
      setScheduleData({
        assignedMechanicId: acceptedMech ? acceptedMech.mechanicId : '',
        maintenanceRequestId: request.id,
        scheduledDate: new Date().toISOString().split('T')[0],
        reason: request.description,
        comments: ''
      });
    } catch (error) {
    setScheduleData({
      assignedMechanicId: '',
      maintenanceRequestId: request.id,
      scheduledDate: new Date().toISOString().split('T')[0],
      reason: request.description,
      comments: ''
    });
    }
    
    setShowRequestModal(false);
    setShowScheduleModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleMaintenance = async () => {
    if (!acceptedMechanic || !acceptedMechanic.mechanicId) {
      toast.error('No mechanic has been accepted for this request yet. Please complete the cost deliberation process first.');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, scheduling: true }));
      setError(null);

      const payload = {
        ...scheduleData,
        assignedMechanicId: acceptedMechanic.mechanicId,
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
      toast.success(`Maintenance scheduled successfully with ${acceptedMechanic.mechanicName}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule maintenance');
    } finally {
      setLoading(prev => ({ ...prev, scheduling: false }));
    }
  };

  // ===== Logistics helpers =====
  const getUserId = () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const { userId } = JSON.parse(authData);
      return userId;
    }
    return localStorage.getItem('userId'); // Fallback
  };
  const userId = getUserId();
  const toIso = (v) => (v ? new Date(v).toISOString() : null);

  const loadLogistics = async (scheduleId) => {
    try {
      const res = await api.get(`api/MaintenanceRequest/${scheduleId}/schedule/logistics-snapshot`);
      setLogisticsBySchedule(prev => ({ ...prev, [scheduleId]: res.data }));
      toast.success('Loaded logistics');
    } catch (e) {
      toast.error('Failed to load logistics');
    }
  };

  const togglePlanForm = (scheduleId) => {
    setLogisticsForms(prev => ({
      ...prev,
      [scheduleId]: {
        pickupRequired: prev[scheduleId]?.pickupRequired ?? true,
        pickupAddress: prev[scheduleId]?.pickupAddress ?? '',
        pickupWindowStart: prev[scheduleId]?.pickupWindowStart ?? '',
        pickupWindowEnd: prev[scheduleId]?.pickupWindowEnd ?? '',
        returnRequired: prev[scheduleId]?.returnRequired ?? true,
        returnAddress: prev[scheduleId]?.returnAddress ?? '',
        returnWindowStart: prev[scheduleId]?.returnWindowStart ?? '',
        returnWindowEnd: prev[scheduleId]?.returnWindowEnd ?? '',
        contactName: prev[scheduleId]?.contactName ?? '',
        contactPhone: prev[scheduleId]?.contactPhone ?? '',
        notes: prev[scheduleId]?.notes ?? '',
        open: !prev[scheduleId]?.open
      }
    }));
  };

  const updatePlanField = (scheduleId, field, value) => {
    setLogisticsForms(prev => ({
      ...prev,
      [scheduleId]: { ...(prev[scheduleId] || {}), [field]: value }
    }));
  };

  const submitPlan = async (scheduleId) => {
    const form = logisticsForms[scheduleId] || {};
    const payload = {
      pickupRequired: !!form.pickupRequired,
      pickupAddress: form.pickupAddress || null,
      pickupWindowStart: toIso(form.pickupWindowStart),
      pickupWindowEnd: toIso(form.pickupWindowEnd),
      returnRequired: !!form.returnRequired,
      returnAddress: form.returnAddress || null,
      returnWindowStart: toIso(form.returnWindowStart),
      returnWindowEnd: toIso(form.returnWindowEnd),
      contactName: form.contactName || null,
      contactPhone: form.contactPhone || null,
      notes: form.notes || null
    };
    try {
      await api.post(`api/MaintenanceRequest/${scheduleId}/schedule/plan-logistics?user=${encodeURIComponent(userId)}`, payload);
      toast.success('Logistics planned');
      await loadLogistics(scheduleId);
    } catch (e) {
      toast.error(e.response?.data || 'Failed to save logistics');
    }
  };

  const postEvent = async (scheduleId, path, note) => {
    try {
      await api.post(`api/MaintenanceRequest/${scheduleId}/schedule/${path}?user=${encodeURIComponent(userId)}`, {
        timestamp: new Date().toISOString(),
        note: note || ''
      });
      toast.success('Updated');
      await loadLogistics(scheduleId);
    } catch (e) {
      toast.error(e.response?.data || 'Failed to update');
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
                  {formatDateShort(date).split('/')[0]}
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
    const formattedDate = formatDateDisplay(selectedDay);

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
                          {activity.status}  {formatDateDisplay(activity.completedDate)}
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
                              <span className="progress-box"><strong>Expected:</strong> {formatDateDisplay(activityProgress.expectedCompletionDate)}</span>
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

                      {/* Logistics Section */}
                      <div className="section-header" style={{ marginTop: 16 }}>
                        <i className="bi bi-truck"></i> Logistics
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        <Button size="sm" variant="outline-primary" onClick={() => loadLogistics(activity.id)}>Load</Button>
                        <Button size="sm" variant="outline-secondary" onClick={() => togglePlanForm(activity.id)}>
                          {logisticsForms[activity.id]?.open ? 'Hide Plan' : 'Plan / Update'}
                        </Button>
                        <Button size="sm" variant="outline-dark" onClick={() => postEvent(activity.id, 'pickup')}>Picked up</Button>
                        <Button size="sm" variant="outline-dark" onClick={() => postEvent(activity.id, 'work-start')}>Start work</Button>
                        <Button size="sm" variant="outline-dark" onClick={() => postEvent(activity.id, 'ready-for-return')}>Ready for return</Button>
                        <Button size="sm" variant="success" onClick={() => postEvent(activity.id, 'returned')}>Returned</Button>
                      </div>

                      {logisticsForms[activity.id]?.open && (
                        <div className="p-3" style={{ background: '#fbfbfc', border: '1px solid #eef1f5', borderRadius: 10 }}>
                          <Row className="g-2">
                            <Col md={6}>
                              <Form.Check
                                type="switch"
                                id={`pickup-${activity.id}`}
                                label="Pickup required"
                                checked={!!(logisticsForms[activity.id]?.pickupRequired)}
                                onChange={(e) => updatePlanField(activity.id, 'pickupRequired', e.target.checked)}
                              />
                              <Form.Control
                                className="mt-2"
                                placeholder="Pickup address"
                                value={logisticsForms[activity.id]?.pickupAddress || ''}
                                onChange={(e) => updatePlanField(activity.id, 'pickupAddress', e.target.value)}
                              />
                              <div className="d-flex gap-2 mt-2">
                                <Form.Control type="datetime-local" value={logisticsForms[activity.id]?.pickupWindowStart || ''} onChange={(e) => updatePlanField(activity.id, 'pickupWindowStart', e.target.value)} />
                                <Form.Control type="datetime-local" value={logisticsForms[activity.id]?.pickupWindowEnd || ''} onChange={(e) => updatePlanField(activity.id, 'pickupWindowEnd', e.target.value)} />
                              </div>
                            </Col>
                            <Col md={6}>
                              <Form.Check
                                type="switch"
                                id={`return-${activity.id}`}
                                label="Return required"
                                checked={!!(logisticsForms[activity.id]?.returnRequired)}
                                onChange={(e) => updatePlanField(activity.id, 'returnRequired', e.target.checked)}
                              />
                              <Form.Control
                                className="mt-2"
                                placeholder="Return address"
                                value={logisticsForms[activity.id]?.returnAddress || ''}
                                onChange={(e) => updatePlanField(activity.id, 'returnAddress', e.target.value)}
                              />
                              <div className="d-flex gap-2 mt-2">
                                <Form.Control type="datetime-local" value={logisticsForms[activity.id]?.returnWindowStart || ''} onChange={(e) => updatePlanField(activity.id, 'returnWindowStart', e.target.value)} />
                                <Form.Control type="datetime-local" value={logisticsForms[activity.id]?.returnWindowEnd || ''} onChange={(e) => updatePlanField(activity.id, 'returnWindowEnd', e.target.value)} />
                              </div>
                            </Col>
                          </Row>
                          <Row className="g-2 mt-2">
                            <Col md={6}>
                              <Form.Control placeholder="Contact name" value={logisticsForms[activity.id]?.contactName || ''} onChange={(e) => updatePlanField(activity.id, 'contactName', e.target.value)} />
                            </Col>
                            <Col md={6}>
                              <Form.Control placeholder="Contact phone" value={logisticsForms[activity.id]?.contactPhone || ''} onChange={(e) => updatePlanField(activity.id, 'contactPhone', e.target.value)} />
                            </Col>
                          </Row>
                          <Form.Control as="textarea" rows={2} className="mt-2" placeholder="Notes" value={logisticsForms[activity.id]?.notes || ''} onChange={(e) => updatePlanField(activity.id, 'notes', e.target.value)} />
                          <div className="d-flex justify-content-end mt-2">
                            <Button size="sm" onClick={() => submitPlan(activity.id)}>Save plan</Button>
                          </div>
                        </div>
                      )}

                      {logisticsBySchedule[activity.id] && (
                        <div className="mt-2 p-3" style={{ background: '#ffffff', border: '1px dashed #e6ebf2', borderRadius: 10 }}>
                          <div className="d-flex flex-wrap gap-3 small text-muted">
                            <span><strong>Picked up:</strong> {logisticsBySchedule[activity.id].pickedUpAt ? formatDateDisplay(logisticsBySchedule[activity.id].pickedUpAt, true) : '-'}</span>
                            <span><strong>Work started:</strong> {logisticsBySchedule[activity.id].workStartedAt ? formatDateDisplay(logisticsBySchedule[activity.id].workStartedAt, true) : '-'}</span>
                            <span><strong>Ready:</strong> {logisticsBySchedule[activity.id].readyForReturnAt ? formatDateDisplay(logisticsBySchedule[activity.id].readyForReturnAt, true) : '-'}</span>
                            <span><strong>Returned:</strong> {logisticsBySchedule[activity.id].returnedAt ? formatDateDisplay(logisticsBySchedule[activity.id].returnedAt, true) : '-'}</span>
                          </div>
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
        className="modern-schedule-modal"
        backdrop="static"
      >
        <div className="modern-schedule-content">
          {/* Modern Header */}
          <div className="modern-schedule-header">
            <div className="modern-schedule-title">
              <i className="bi bi-calendar-plus-fill modern-schedule-icon"></i>
              <span>Schedule Maintenance Request</span>
            </div>
            <button 
              className="modern-schedule-close"
              onClick={() => setShowScheduleModal(false)}
            >
              ×
            </button>
          </div>

          {/* Modern Body */}
          <div className="modern-schedule-body">
            {error && (
              <div className="modern-alert modern-alert-error">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button 
                  className="modern-alert-close"
                  onClick={() => setError(null)}
                >
                  ×
                </button>
              </div>
            )}

            {/* Request Information Card */}
            <div className="modern-info-card">
              <div className="modern-card-header">
                <i className="bi bi-info-circle-fill modern-card-icon"></i>
                <span>Request Information</span>
              </div>
              <div className="modern-info-grid">
                <div className="modern-info-item">
                  <span className="modern-info-label">Vehicle</span>
                  <span className="modern-info-value">{selectedRequest.vehicleMake} {selectedRequest.vehicleModel}</span>
                </div>
                <div className="modern-info-item">
                  <span className="modern-info-label">License Plate</span>
                  <div className="modern-license-plate">
                    {selectedRequest.licensePlate}
                    <div className="modern-flag-container">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/640px-Flag_of_Ghana.svg.png"
                        alt="Ghana Flag"
                        className="modern-flag"
                      />
                      <span className="modern-country-code">GH</span>
              </div>
                  </div>
                </div>
                <div className="modern-info-item">
                  <span className="modern-info-label">Priority</span>
                  <Badge className={`modern-priority-badge ${selectedRequest.priority.toLowerCase()}`}>
                    {selectedRequest.priority}
                  </Badge>
              </div>
                <div className="modern-info-item">
                  <span className="modern-info-label">Description</span>
                  <span className="modern-info-value">{selectedRequest.description}</span>
              </div>
            </div>
          </div>

            {/* Scheduling Details Card */}
            <div className="modern-info-card">
              <div className="modern-card-header">
                <i className="bi bi-gear-fill modern-card-icon"></i>
                <span>Scheduling Details</span>
              </div>
              
              <div className="modern-mechanic-section">
                <div className="modern-section-label">
                <i className="bi bi-person-wrench me-2"></i>
                Assigned Mechanic 
                </div>
                
                {loading.acceptedMechanic ? (
                  <div className="modern-loading-card">
                    <div className="modern-spinner"></div>
                    <span>Loading accepted mechanic...</span>
                  </div>
                ) : acceptedMechanic ? (
                  <div className="modern-mechanic-card modern-mechanic-success">
                    <div className="modern-mechanic-header">
                      <i className="bi bi-check-circle-fill modern-success-icon"></i>
                      <div className="modern-mechanic-info">
                        <h6 className="modern-mechanic-name">{acceptedMechanic.mechanicName}</h6>
                        <div className="modern-mechanic-details">
                          <div className="modern-mechanic-detail">
                            <i className="bi bi-envelope me-2"></i>
                            {acceptedMechanic.mechanicEmail}
                          </div>
                          {acceptedMechanic.mechanicPhone && (
                            <div className="modern-mechanic-detail">
                              <i className="bi bi-telephone me-2"></i>
                              {acceptedMechanic.mechanicPhone}
                            </div>
                          )}
                          <div className="modern-mechanic-detail modern-cost">
                            <i className="bi bi-currency-dollar me-2"></i>
                            Final Cost: ${acceptedMechanic.finalAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                    <input type="hidden" name="assignedMechanicId" value={acceptedMechanic.mechanicId} />
                  </div>
                ) : (
                  <div className="modern-mechanic-card modern-mechanic-warning">
                    <div className="modern-mechanic-header">
                      <i className="bi bi-exclamation-triangle-fill modern-warning-icon"></i>
                      <div className="modern-mechanic-info">
                        <h6 className="modern-mechanic-name">No Mechanic Accepted Yet</h6>
                        <p className="modern-mechanic-message">
                          This request hasn't completed the cost deliberation process yet. 
                          Please ensure a mechanic proposal has been accepted before scheduling.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="modern-help-text">
                  {acceptedMechanic 
                    ? "This is the mechanic who was selected through the cost deliberation process"
                    : "Complete the cost deliberation process first to assign a mechanic"
                  }
                </div>
              </div>
            </div>

            {/* Additional Comments Card */}
            <div className="modern-info-card">
              <div className="modern-card-header">
                <i className="bi bi-chat-left-text-fill modern-card-icon"></i>
                <span>Additional Comments</span>
              </div>
              <div className="modern-comments-section">
                <textarea
                name="comments"
                value={scheduleData.comments}
                onChange={handleInputChange}
                placeholder="Enter any special instructions or notes for the mechanic..."
                  className="modern-comments-textarea"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <div className="modern-schedule-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setShowScheduleModal(false)}
            disabled={loading.scheduling}
              className="modern-cancel-btn"
          >
              <i className="bi bi-x-lg me-2"></i>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleScheduleMaintenance}
            disabled={loading.scheduling}
              className="modern-request-btn"
          >
            {loading.scheduling ? (
              <>
                  <div className="modern-spinner me-2"></div>
                  Scheduling...
              </>
            ) : (
              <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Schedule Request
              </>
            )}
          </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderRequestListModal = () => {
    return (
      <Modal
        show={showRequestModal}
        onHide={() => setShowRequestModal(false)}
        size="xl"
        centered
        className="modern-requests-modal"
        backdrop="static"
      >
        <div className="modern-modal-content">
          {/* Modern Header */}
          <div className="modern-modal-header">
            <div className="modern-modal-title">
              <i className="bi bi-check-circle-fill modern-modal-icon"></i>
              <span>Approved Maintenance Requests</span>
            </div>
            <button 
              className="modern-modal-close"
              onClick={() => setShowRequestModal(false)}
            >
              ×
            </button>
          </div>

          {/* Modern Body */}
          <div className="modern-modal-body">
          {loading.requests ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading approved requests...</p>
            </div>
          ) : approvedRequests.length > 0 ? (
              <div className="modern-request-list">
              {approvedRequests.map(request => (
                  <div
                  key={request.id}
                    className="modern-request-card"
                  onClick={() => handleRequestClick(request)}
                  >
                    <div className="modern-request-main">
                      <div className="modern-request-info">
                        <div className="modern-request-title">
                        {request.vehicleMake} {request.vehicleModel}
                        </div>
                        <div className="modern-request-plate">
                          <i className="bi bi-upc-scan me-2"></i>
                        {request.licensePlate}
                        </div>
                        <div className="modern-request-description">
                          <i className="bi bi-card-text me-2"></i>
                        {request.description}
                        </div>
                        <div className="modern-request-user">
                          <i className="bi bi-person me-2"></i>
                        Requested by: {request.requestedByUserName}
                        </div>
                      </div>
                      <div className="modern-request-meta">
                      <Badge
                          className={`modern-priority-badge ${request.priority.toLowerCase()}`}
                      >
                        {request.priority}
                      </Badge>
                        <div className="modern-request-date">
                          <i className="bi bi-calendar3 me-2"></i>
                        {formatDateDisplay(request.requestDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 empty-requests">
                <div className="empty-state-icon">
                  <i className="bi bi-check-circle-fill"></i>
            </div>
                <h4 className="mt-4 mb-3">All Caught Up!</h4>
                <p className="text-muted mb-4">
                  No approved requests are currently available for scheduling.
                </p>
                <div className="empty-state-actions">
          <Button
                    variant="outline-primary"
            onClick={() => setShowRequestModal(false)}
                    className="me-2"
          >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Schedule
          </Button>
                </div>
              </div>
            )}
          </div>

        </div>
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
                                  ? ` ${formatMonthYear(currentDate)}`
                : formatMonthYear(currentDate)}
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
            `Week of ${formatDateDisplay(currentDate)}`
          ) : (
            formatMonthYear(currentDate)
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
                        <span style={{ fontWeight: 500 }}>Expected:</span> {update.expectedCompletionDate ? formatDateDisplay(update.expectedCompletionDate, true) : '-'}
                      </div>
                      <div style={{ color: '#374151' }}>
                        <i className="bi bi-chat-left-text me-1" style={{ color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 500 }}>Comment:</span> {update.comment || '-'}
                      </div>
                      <div style={{ color: '#6c757d' }}>
                        <i className="bi bi-clock-history me-1" style={{ color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 500 }}>Updated:</span> {update.timestamp ? formatDateDisplay(update.timestamp, true) : '-'}
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
