import { useState } from 'react';

const exportFormats = [
  { id: 'csv', name: 'CSV', icon: 'bi-filetype-csv' },
  { id: 'pdf', name: 'PDF', icon: 'bi-filetype-pdf' },
  { id: 'json', name: 'JSON', icon: 'bi-filetype-json' },
  { id: 'xlsx', name: 'Excel', icon: 'bi-file-earmark-excel' }
];

export default function LogExportModal({ 
  isOpen, 
  onClose, 
  onExport 
}) {
  const [format, setFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState({
    timestamp: true,
    user: true,
    action: true,
    details: true,
    ip: false
  });

  if (!isOpen) return null;

  const toggleField = (field) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Export Audit Logs</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">
          <div className="mb-4">
            <h6>Export Format</h6>
            <div className="export-format-options">
              {exportFormats.map(f => (
                <div 
                  key={f.id}
                  className={`format-option ${format === f.id ? 'selected' : ''}`}
                  onClick={() => setFormat(f.id)}
                >
                  <i className={`bi ${f.icon}`}></i>
                  <span>{f.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h6>Include Fields</h6>
            <div className="field-options">
              {Object.entries(includeFields).map(([field, included]) => (
                <div 
                  key={field} 
                  className="form-check form-check-inline"
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={included}
                    onChange={() => toggleField(field)}
                    id={`field-${field}`}
                  />
                  <label 
                    className="form-check-label" 
                    htmlFor={`field-${field}`}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => {
              onExport();
              onClose();
            }}
          >
            <i className="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>
    </div>
  );
}