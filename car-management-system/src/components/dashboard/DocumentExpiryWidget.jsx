import React, { useState, useMemo } from 'react';
import { FiAlertCircle, FiFileText, FiCalendar, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import PropTypes from 'prop-types';

const DocumentExpiryWidget = ({ documents = [] }) => {
  // State for filters and sorting
  const [filterType, setFilterType] = useState('all');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Document types for filter dropdown
  const documentTypes = useMemo(() => {
    const types = new Set(documents.map(doc => doc.type));
    return ['all', ...Array.from(types)];
  }, [documents]);

  // Process and sort documents
  const processedDocuments = useMemo(() => {
    let result = [...documents];
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(doc => doc.type === filterType);
    }
    
    // Sort by urgency (days left)
    result.sort((a, b) => {
      return sortDirection === 'asc' 
        ? a.daysLeft - b.daysLeft 
        : b.daysLeft - a.daysLeft;
    });
    
    return result;
  }, [documents, filterType, sortDirection]);

  // Determine urgency level
  const getUrgencyClass = (daysLeft) => {
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 30) return 'warning';
    return 'normal';
  };

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="document-expiry-widget">
      <div className="widget-header">
        <h2>
          <FiFileText className="header-icon" />
          Document Expiry
          <span className="document-count">{documents.length} documents</span>
        </h2>
        
        <div className="controls">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <FiFilter />
            {showFilters ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          
          <button 
            className="sort-button"
            onClick={toggleSort}
            aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDirection === 'asc' ? 'Soonest First' : 'Latest First'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <label htmlFor="document-type-filter">Filter by type:</label>
          <select
            id="document-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {documentTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="document-list">
        {processedDocuments.length > 0 ? (
          processedDocuments.map(doc => (
            <div key={doc.id} className={`document-item ${getUrgencyClass(doc.daysLeft)}`}>
              <div className="document-alert">
                <FiAlertCircle />
              </div>
              
              <div className="document-info">
                <h3 className="document-title">{doc.vehicle}</h3>
                <span className="document-type">{doc.type}</span>
              </div>
              
              <div className="document-expiry">
                <FiCalendar className="calendar-icon" />
                <div>
                  <div className="expiry-date">{formatDate(doc.expiry)}</div>
                  <div className="days-remaining">
                    {doc.daysLeft <= 0 
                      ? 'Expired' 
                      : `${doc.daysLeft} day${doc.daysLeft !== 1 ? 's' : ''} left`}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            No documents found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

DocumentExpiryWidget.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      vehicle: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      expiry: PropTypes.string.isRequired,
      daysLeft: PropTypes.number.isRequired
    })
  )
};

export default DocumentExpiryWidget;