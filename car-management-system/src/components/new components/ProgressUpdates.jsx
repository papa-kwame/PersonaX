import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';

import {
  PersonCheck,
  PlusCircle,
  Trash,
  PencilSquare,
  People,
  Search,
  Person,
  ChatSquare
} from 'react-bootstrap-icons';
const getColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '000000'.substring(0, 6 - c.length) + c;
};

const ProgressUpdates = ({ userId }) => {
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const fetchAllProgressUpdates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/MaintenanceRequest/progress-updates/user/${userId}`);
      setProgressUpdates(response.data);
    } catch (error) {
        setProgressUpdates([]);
    } finally {
      setLoading(false);
    }
  };
    fetchAllProgressUpdates();
  }, [userId]);

  const stats = useMemo(() => {
    if (!progressUpdates.length) return { total: 0, mostActive: null };
    const vehicleCount = {};
    progressUpdates.forEach((u) => {
      const v = `${u.vehicle?.make} ${u.vehicle?.model} (${u.vehicle?.plate})`;
      vehicleCount[v] = (vehicleCount[v] || 0) + 1;
    });
    const mostActive = Object.entries(vehicleCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    return { total: progressUpdates.length, mostActive };
  }, [progressUpdates]);

  return (
    <div style={{
      width: '100%',
      maxWidth: 600,
      margin: '0 auto',
      padding: '1.5rem 0',
      background: 'rgb(255, 255, 255)',
      borderRadius: 22,
      boxShadow:' rgba(0, 0, 0, 0.16) 0px 1px 4px',
      position: 'relative',
      minHeight: 804,
      overflow: 'visible',
      transition: 'box-shadow 0.3s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
        padding: '0 1.2rem',
        fontFamily: 'Open Sans, sans-serif',
      }}>
        <div style={{ fontWeight: 400, fontSize: 23, letterSpacing: 0.5 }}>Progress Updates</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#374151', opacity: 0.8 }}>
          {stats.total} {stats.total === 1 ? 'update' : 'updates'}
        </div>
      </div>


      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#2563eb', fontWeight: 700 }}>Loading...</div>
      ) : progressUpdates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#b0b8c1' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>No progress updates</div>
          <div style={{ fontSize: 15, color: '#8a99b3', marginTop: 4 }}>No progress updates have been submitted yet.</div>
        </div>
      ) : (
        <div style={{ position: 'relative',  padding:12, minHeight: 200 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {progressUpdates.map((update, idx) => (
          

                <div style={{
                  background: 'linear-gradient(120deg, rgba(255,255,255,0.98) 80%, #e0eaff 120%)',
                  borderRadius: 18,
                  boxShadow: '0 2px 16px rgba(37,99,235,0.10)',
                  padding: '1.1rem 1.3rem',
                  minWidth: 0,
                  flex: 1,
                  border: '1.5px solid #e0eaff',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  <div style={{ fontWeight: 400, fontSize: 18, color: '#222', marginBottom: 2, letterSpacing: 0.2 }}>
                    {update.vehicle?.make} {update.vehicle?.model}{' '}
                    <span style={{ color: '#6c757d', fontWeight: 300, fontSize: 15 }}>
                      ({update.vehicle?.plate})
                    </span>
                  </div>
                  <div style={{ fontWeight: 300, color: '#2563eb', fontSize: 15, marginBottom: 2, fontStyle: 'italic', opacity: 0.85 }}>
              
                </div>
                  <div style={{
                    background: 'rgba(245,248,255,0.85)',
                    borderRadius: 12,
                    padding: '0.7rem 1rem',
                    margin: '10px 0 6px 0',
                    fontSize: 16,
                    color: '#374151',
                    fontWeight: 500,
                    boxShadow: '0 1px 6px rgba(37, 100, 235, 0.37)',
                    
                  }}>
                    <div style={{marginRight:'20px',display:'flex', alignItems:'center', gap:'10px'}}>
                    <ChatSquare/>
                    {update.comment || <span style={{ color: '#b0b8c1' }}>No comment</span>}
                    </div>
            
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 18,
                    marginTop: 6,
                    fontSize: 15,
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ color: '#6c757d', fontWeight: 500 }}>
                      <span style={{ marginRight: 4 }}>📅</span>
                      {update.timestamp ? format(new Date(update.timestamp), 'PPpp') : '-'}
                </div>
                {update.expectedCompletionDate && (
                      <div style={{
                        color: '#2563eb',
                        fontWeight: 600,
                        background: 'rgba(224,234,255,0.7)',
                        borderRadius: 16,
                        padding: '0.25rem 0.9rem',
                      }}>
                        <span style={{ fontSize: 18, marginRight: 6 }}>⏳</span>
                        Expected: {format(new Date(update.expectedCompletionDate), 'PP')}
                  </div>
                )}
                  </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressUpdates;
