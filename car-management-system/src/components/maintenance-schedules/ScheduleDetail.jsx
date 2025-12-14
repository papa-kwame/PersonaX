import React from 'react';
import { format } from 'date-fns';
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const ScheduleDetail = ({
  selectedSchedule,
  handleBackToList,
  setProgressForm,
  setOpenProgressDialog,
  setShowCompleteConfirm,
  loading,
  progressUpdates,
  logisticsBySchedule,
  logisticsForms,
  loadLogistics,
  togglePlanForm,
  updatePlanField,
  submitPlan,
  postEvent,
  hasRole,
  userId,
  getStatusBadge
}) => {
  if (!selectedSchedule) return null;

  return (
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
                Vehicle Picked Up
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
                Logistics
              </h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <Button variant="outlined" size="small" onClick={() => loadLogistics(selectedSchedule.id)}>
                  Load Snapshot
                </Button>
                {hasRole && hasRole('Admin') && (
                  <Button variant="outlined" size="small" onClick={() => togglePlanForm(selectedSchedule.id)}>
                    {logisticsForms[selectedSchedule.id]?.open ? 'Hide Plan' : 'Plan / Update'}
                  </Button>
                )}
                {hasRole && hasRole('Mechanic') && selectedSchedule.assignedMechanicId === userId && (
                  <>
                    <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'received')}>
                      Received
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'pickup')}>
                      Picked up
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'work-start')}>
                      Start work
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => postEvent(selectedSchedule.id, 'ready-for-return')}>
                      Ready for return
                    </Button>
                    <Button size="small" variant="contained" onClick={() => postEvent(selectedSchedule.id, 'returned')}>
                      Returned
                    </Button>
                  </>
                )}
              </div>

              {logisticsForms[selectedSchedule.id]?.open && hasRole && hasRole('Admin') && (
                <Box sx={{ p: 2.5, border: '1px solid #e5e7eb', borderRadius: 2, mb: 2, backgroundColor: '#fafbff' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937' }}>
                    Pickup
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            checked={!!(logisticsForms[selectedSchedule.id]?.pickupRequired)} 
                            onChange={(e) => updatePlanField(selectedSchedule.id, 'pickupRequired', e.target.checked)} 
                          />
                        } 
                        label="Pickup required" 
                      />
                      <TextField 
                        fullWidth 
                        size="small" 
                        sx={{ mt: 1 }} 
                        placeholder="Pickup address" 
                        value={logisticsForms[selectedSchedule.id]?.pickupAddress || ''} 
                        onChange={(e) => updatePlanField(selectedSchedule.id, 'pickupAddress', e.target.value)} 
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <DateTimePicker
                          label="Pickup window start"
                          value={logisticsForms[selectedSchedule.id]?.pickupWindowStart || null}
                          onChange={(v) => updatePlanField(selectedSchedule.id, 'pickupWindowStart', v)}
                          renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                        />
                        <DateTimePicker
                          label="Pickup window end"
                          value={logisticsForms[selectedSchedule.id]?.pickupWindowEnd || null}
                          onChange={(v) => updatePlanField(selectedSchedule.id, 'pickupWindowEnd', v)}
                          renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1f2937' }}>
                        Return
                      </Typography>
                      <FormControlLabel 
                        control={
                          <Checkbox 
                            checked={!!(logisticsForms[selectedSchedule.id]?.returnRequired)} 
                            onChange={(e) => updatePlanField(selectedSchedule.id, 'returnRequired', e.target.checked)} 
                          />
                        } 
                        label="Return required" 
                      />
                      <TextField 
                        fullWidth 
                        size="small" 
                        sx={{ mt: 1 }} 
                        placeholder="Return address" 
                        value={logisticsForms[selectedSchedule.id]?.returnAddress || ''} 
                        onChange={(e) => updatePlanField(selectedSchedule.id, 'returnAddress', e.target.value)} 
                      />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <DateTimePicker
                          label="Return window start"
                          value={logisticsForms[selectedSchedule.id]?.returnWindowStart || null}
                          onChange={(v) => updatePlanField(selectedSchedule.id, 'returnWindowStart', v)}
                          renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                        />
                        <DateTimePicker
                          label="Return window end"
                          value={logisticsForms[selectedSchedule.id]?.returnWindowEnd || null}
                          onChange={(v) => updatePlanField(selectedSchedule.id, 'returnWindowEnd', v)}
                          renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="Contact name" 
                        value={logisticsForms[selectedSchedule.id]?.contactName || ''} 
                        onChange={(e) => updatePlanField(selectedSchedule.id, 'contactName', e.target.value)} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        placeholder="Contact phone" 
                        value={logisticsForms[selectedSchedule.id]?.contactPhone || ''} 
                        onChange={(e) => updatePlanField(selectedSchedule.id, 'contactPhone', e.target.value)} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        size="small" 
                        multiline 
                        rows={2} 
                        placeholder="Notes" 
                        value={logisticsForms[selectedSchedule.id]?.notes || ''} 
                        onChange={(e) => updatePlanField(selectedSchedule.id, 'notes', e.target.value)} 
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button size="small" variant="contained" onClick={() => submitPlan(selectedSchedule.id)}>
                      Save plan
                    </Button>
                  </Box>
                </Box>
              )}

              {logisticsBySchedule[selectedSchedule.id] && (
                <Box sx={{ p: 2, border: '1px dashed #e5e7eb', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Snapshot
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption">
                      <strong>Received:</strong> {logisticsBySchedule[selectedSchedule.id].receivedAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].receivedAt), 'PPpp') : '-'}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Picked up:</strong> {logisticsBySchedule[selectedSchedule.id].pickedUpAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].pickedUpAt), 'PPpp') : '-'}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Work started:</strong> {logisticsBySchedule[selectedSchedule.id].workStartedAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].workStartedAt), 'PPpp') : '-'}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Ready:</strong> {logisticsBySchedule[selectedSchedule.id].readyForReturnAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].readyForReturnAt), 'PPpp') : '-'}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Returned:</strong> {logisticsBySchedule[selectedSchedule.id].returnedAt ? format(new Date(logisticsBySchedule[selectedSchedule.id].returnedAt), 'PPpp') : '-'}
                    </Typography>
                  </Box>
                </Box>
              )}
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
  );
};

export default ScheduleDetail;














