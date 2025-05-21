import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

const actionTypes = [
  'Login', 'Logout', 'Create', 'Update', 
  'Delete', 'Permission Change', 'System'
];

export default function AuditFilters({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    actionType: '',
    searchTerm: '',
    dateRange: null
  });
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  useEffect(() => {
    onFilter({
      ...filters,
      searchTerm: debouncedSearchTerm
    });
  }, [debouncedSearchTerm, filters.actionType, filters.dateRange]);

  return (
    <div className="audit-filters card shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Action Type</label>
            <select
              className="form-select"
              value={filters.actionType}
              onChange={(e) => setFilters({...filters, actionType: e.target.value})}
              disabled={loading}
            >
              <option value="">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Date Range</label>
            <input
              type="date"
              className="form-control"
              onChange={(e) => setFilters({...filters, dateRange: {
                start: e.target.value,
                end: filters.dateRange?.end || e.target.value
              }})}
              disabled={loading}
            />
          </div>
          
          <div className="col-md-4">
            <label className="form-label">Search</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search logs..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                disabled={loading}
              />
              <button 
                className="btn btn-outline-secondary" 
                type="button"
                onClick={() => setFilters({
                  actionType: '',
                  searchTerm: '',
                  dateRange: null
                })}
                disabled={loading}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}