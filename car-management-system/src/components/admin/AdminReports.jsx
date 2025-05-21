import { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import DateRangePicker from './DateRangePicker';
import ReportScheduler from './ReportScheduler';

Chart.register(...registerables);

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('usage');

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`);
        const data = await response.json();
        setReportData(data);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [dateRange]);

  const handleDateChange = (range) => {
    setDateRange(range);
  };

  const userActivityData = {
    labels: reportData?.userActivity.labels || [],
    datasets: [
      {
        label: 'Active Users',
        data: reportData?.userActivity.activeUsers || [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'New Users',
        data: reportData?.userActivity.newUsers || [],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const systemUsageData = {
    labels: reportData?.systemUsage.labels || [],
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: reportData?.systemUsage.cpu || [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Memory Usage (%)',
        data: reportData?.systemUsage.memory || [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        yAxisID: 'y'
      },
      {
        label: 'Requests',
        data: reportData?.systemUsage.requests || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        yAxisID: 'y1'
      }
    ]
  };

  const roleDistributionData = {
    labels: reportData?.roleDistribution.labels || [],
    datasets: [{
      data: reportData?.roleDistribution.data || [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="admin-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-graph-up me-2"></i> Reports</h2>
        <DateRangePicker 
          initialRange={dateRange}
          onChange={handleDateChange}
        />
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            System Usage
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Activity
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Role Distribution
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {activeTab === 'usage' && (
            <div className="col-12 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">System Usage</h5>
                  <ReportScheduler reportType="system-usage" />
                </div>
                <div className="card-body">
                  <Line 
                    data={systemUsageData}
                    options={{
                      responsive: true,
                      interaction: {
                        mode: 'index',
                        intersect: false
                      },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: { display: true, text: 'Usage %' }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: { display: true, text: 'Requests' },
                          grid: { drawOnChartArea: false }
                        }
                      },
                      plugins: {
                        zoom: {
                          zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'xy'
                          },
                          pan: {
                            enabled: true,
                            mode: 'xy'
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              let label = context.dataset.label || '';
                              if (label) label += ': ';
                              label += context.parsed.y;
                              if (context.dataset.label === 'CPU Usage (%)' || 
                                  context.dataset.label === 'Memory Usage (%)') {
                                label += '%';
                              }
                              return label;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <>
              <div className="col-md-8 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">User Activity</h5>
                  </div>
                  <div className="card-body">
                    <Bar
                      data={userActivityData}
                      options={{
                        responsive: true,
                        scales: {
                          y: { beginAtZero: true }
                        },
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: { mode: 'index', intersect: false }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Top Active Users</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {reportData?.topUsers.map((user, index) => (
                        <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">{index + 1}</span>
                            <div>
                              <div>{user.name}</div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                          <span className="badge bg-success">{user.activityCount} actions</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'roles' && (
            <div className="col-12">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Role Distribution</h5>
                    </div>
                    <div className="card-body d-flex justify-content-center">
                      <div style={{ maxWidth: '400px', width: '100%' }}>
                        <Pie
                          data={roleDistributionData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { position: 'right' },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card shadow-sm h-100">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Permission Statistics</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Permission</th>
                              <th>Users</th>
                              <th>% of Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData?.permissionStats.map(stat => (
                              <tr key={stat.permission}>
                                <td>
                                  <code>{stat.permission}</code>
                                </td>
                                <td>{stat.userCount}</td>
                                <td>
                                  <div className="progress" style={{ height: '20px' }}>
                                    <div 
                                      className="progress-bar" 
                                      role="progressbar" 
                                      style={{ width: `${stat.percentage}%` }}
                                      aria-valuenow={stat.percentage}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    >
                                      {stat.percentage}%
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}