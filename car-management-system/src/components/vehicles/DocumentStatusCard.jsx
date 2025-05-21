// src/components/vehicles/DocumentStatusCard.jsx
import { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

export default function DocumentStatusCard({ 
  title, 
  expiryDate: initialExpiryDate, 
  daysUntilExpiry,
  isService = false,
  onSave 
}) {
  const [status, setStatus] = useState('valid');
  const [statusText, setStatusText] = useState('Valid');
  const [isEditing, setIsEditing] = useState(false);
  const [expiryDate, setExpiryDate] = useState(initialExpiryDate);
  const [tempDate, setTempDate] = useState(initialExpiryDate || '');

  useEffect(() => {
    updateStatus(expiryDate, daysUntilExpiry);
  }, [expiryDate, daysUntilExpiry, isService]);

  const updateStatus = (date, days) => {
    if (!date) {
      setStatus('unknown');
      setStatusText('Not Set');
      return;
    }
    
    if (days <= 0) {
      setStatus('expired');
      setStatusText(isService ? 'Due Now' : 'Expired');
    } else if (days <= 30) {
      setStatus('warning');
      setStatusText(`Expires in ${days} days`);
    } else {
      setStatus('valid');
      setStatusText(`Valid until ${new Date(date).toLocaleDateString()}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditClick = () => {
    setTempDate(expiryDate || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const newDate = tempDate || null;
    setExpiryDate(newDate);
    setIsEditing(false);
    
    // Calculate new days until expiry
    const newDaysUntilExpiry = newDate ? 
      Math.ceil((new Date(newDate) - new Date()) / (1000 * 60 * 60 * 24)) : 
      Infinity;
    
    updateStatus(newDate, newDaysUntilExpiry);
    
    // Notify parent component about the change
    if (onSave) {
      onSave(title, newDate);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className={`document-card ${status}`}>
      <div className="document-header">
        <div className="document-title">{title}</div>
        {!isEditing ? (
          <button className="icon-btn edit-btn" onClick={handleEditClick}>
            <FiEdit2 size={16} />
          </button>
        ) : (
          <div className="document-actions">
            <button className="icon-btn save-btn" onClick={handleSave}>
              <FiSave size={16} />
            </button>
            <button className="icon-btn cancel-btn" onClick={handleCancel}>
              <FiX size={16} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="document-edit-form">
          <input
            type="date"
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            className="date-input"
          />
        </div>
      ) : (
        <>
          <div className="document-expiry">
            {expiryDate ? formatDate(expiryDate) : 'Not set'}
          </div>
          <div className="document-status">{statusText}</div>
        </>
      )}
    </div>
  );
}