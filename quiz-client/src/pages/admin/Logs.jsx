import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/admin/logs');
      setLogs(res.data);
    } catch (err) {
      setError('Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    const result = await Swal.fire({
      title: 'Clear All Logs?',
      text: 'This will permanently delete all audit log entries. This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, clear all!',
      background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
      color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete('/api/admin/logs/clear');
      setSuccess('All audit logs cleared successfully.');
      setLogs([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear logs.');
    }
  };

  const handleDeleteLog = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this log?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it',
      background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
      color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`/api/admin/logs/${id}`);
      setSuccess('Audit log deleted.');
      setLogs(logs.filter(l => l.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete log.');
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">System Audit Logs</div>
          <div className="topbar-subtitle">Track and review all user activities across the platform.</div>
        </div>
        <button onClick={handleClearAll} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          <i className="fa-solid fa-trash-can"></i> Clear All Logs
        </button>
      </div>

      <Popup type="error" message={error} clear={setError} />
      <Popup type="success" message={success} clear={setSuccess} />

      <div className="panel">
        <div className="panel-header">Activity History</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-list-check"></i>
            <h3>No logs found</h3>
            <p>System activities will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>IP Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{new Date(l.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{l.user ?? 'System'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{l.action}</td>
                    <td style={{ color: 'var(--text-primary)' }}>
                      <i className="fa-solid fa-globe" style={{ marginRight: '4px', color: 'var(--accent)' }}></i>
                      {l.ipAddress}
                    </td>
                    <td>
                      <button onClick={() => handleDeleteLog(l.id)} className="btn-danger btn-sm" title="Delete Log">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Logs;
