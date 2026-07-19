import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/admin/students');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this student?',
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
      await axios.delete(`/api/admin/delete-student/${id}`);
      setSuccess('Student deleted successfully.');
      setStudents(students.filter(s => s.userId !== id));
    } catch (err) {
      console.error('Delete student error:', err.response?.status, err.response?.data);
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete student.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Student Directory</div>
          <div className="topbar-subtitle">View all registered students in the platform.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />
      <Popup type="success" message={success} clear={setSuccess} />

      <div className="panel">
        <div className="panel-header">Registered Students</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-user-graduate"></i>
            <h3>No students found</h3>
            <p>No students have registered on the platform yet.</p>
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
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.userId}>
                    <td style={{ fontWeight: 600 }}>#{s.userId}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.fullName}</td>
                    <td className="text-muted">{s.email}</td>
                    <td><span className="badge badge-info"><i className="fa-solid fa-user-graduate" style={{marginRight: '4px'}}></i> Student</span></td>
                    <td className="text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(s.userId)} className="btn-danger" style={{ padding: '.4rem .8rem', fontSize: '.8rem' }}>
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

export default Students;
