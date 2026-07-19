import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/admin/teachers');
      setTeachers(res.data);
    } catch (err) {
      setError('Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this teacher?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1A1A2E' : '#FFFFFF',
      color: document.body.classList.contains('dark-mode') ? '#F1F5F9' : '#1F2937',
      customClass: { popup: 'beautiful-popup' }
    });
    if (!result.isConfirmed) return;
    setError(''); setSuccess('');
    try {
      await axios.delete(`/api/admin/delete-teacher/${id}`);
      setSuccess('Teacher deleted successfully.');
      setTeachers(teachers.filter(t => t.userId !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete teacher.');
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Manage Teachers</div>
          <div className="topbar-subtitle">View and manage all registered teacher accounts.</div>
        </div>
        <Link to="/admin/teachers/create" className="btn-accent">
          <i className="fa-solid fa-plus"></i> Add Teacher
        </Link>
      </div>

      <Popup type="error" message={error} clear={setError} />
      <Popup type="success" message={success} clear={setSuccess} />

      <div className="panel">
        <div className="panel-header">Teacher Roster</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-chalkboard-user"></i>
            <h3>No teachers found</h3>
            <p>You haven't added any teacher accounts yet.</p>
            <Link to="/admin/teachers/create" className="btn-accent mt-2">Create First Teacher</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.userId}>
                    <td style={{ fontWeight: 600 }}>#{t.userId}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.fullName}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{t.email}</td>
                    <td><span className="badge badge-success"><i className="fa-solid fa-chalkboard-user" style={{marginRight: '4px'}}></i> Teacher</span></td>
                    <td style={{ color: 'var(--text-primary)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(t.userId)} className="btn-danger" style={{ padding: '.4rem .8rem', fontSize: '.8rem' }}>
                        <i className="fa-solid fa-trash-can"></i> Delete
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

export default Teachers;
