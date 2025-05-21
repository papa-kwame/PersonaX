import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import AuditFilters from './AuditFilters';
import LogExportModal from './LogExportModal';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const logTableRef = useRef();
  const ws = useRef(null);



  // Initial log fetch
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/audit-logs');
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleFilter = (filters) => {
    let results = [...logs];
    
    if (filters.actionType) {
      results = results.filter(log => log.action === filters.actionType);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(log => 
        log.user.email.toLowerCase().includes(term) ||
        log.action.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term)
      );
    }
    
    if (filters.dateRange) {
      results = results.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateRange.start) &&
        new Date(log.timestamp) <= new Date(filters.dateRange.end)
      );
    }
    
    setFilteredLogs(results);
  };

  const handleExport = useReactToPrint({
    content: () => logTableRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8f9fa !important; }
      }
    `
  });

  return (
    <div className="admin-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-journal-text me-2"></i> Audit Logs</h2>
        <div>
          <button 
            className={`btn btn-sm me-2 ${liveMode ? 'btn-success' : 'btn-outline-secondary'}`}
            onClick={() => setLiveMode(!liveMode)}
          >
            <i className={`bi ${liveMode ? 'bi-wifi' : 'bi-wifi-off'}`}></i>
            {liveMode ? ' Live' : ' Paused'}
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setExportModalOpen(true)}
          >
            <i className="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>

      <AuditFilters onFilter={handleFilter} loading={loading} />

      <div className="card shadow-sm mt-4">
        <div className="card-body p-0">
          <div className="table-responsive" ref={logTableRef}>
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: '160px' }}>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <div className="text-nowrap">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-muted small">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={log.user.avatar || '/images/default-avatar.png'} 
                            alt={log.user.name}
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                          <div>
                            <div>{log.user.name}</div>
                            <div className="text-muted small">{log.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '300px' }}>
                        {log.details}
                      </td>
                      <td>
                        <code>{log.ipAddress}</code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LogExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}

function getActionColor(action) {
  const map = {
    'login': 'success',
    'logout': 'secondary',
    'create': 'primary',
    'update': 'info',
    'delete': 'danger',
    'permission': 'warning'
  };
  return map[action.toLowerCase()] || 'dark';
}