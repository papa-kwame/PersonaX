import React from 'react';
import { Pending as PendingIcon } from '@mui/icons-material';

const ProgressUpdateModal = ({
  openProgressDialog,
  setOpenProgressDialog,
  selectedSchedule,
  progressForm,
  setProgressForm,
  handleSubmitProgressUpdate,
  loading
}) => {
  if (!openProgressDialog) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container modern-progress-modal">
        <div className="modal-content">
          <div className="modal-header modern-modal-header">
            <PendingIcon className="modal-icon warning" />
            <h3 className="modal-title">Estimated Return</h3>
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
                />
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
  );
};

export default ProgressUpdateModal;














