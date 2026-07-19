import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get('/api/admin/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      setError('Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this quiz globally?',
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
      await axios.delete(`/api/admin/delete-quiz/${id}`);
      setSuccess('Quiz deleted successfully.');
      setQuizzes(quizzes.filter(q => q.quizId !== id));
    } catch (err) {
      setError('Failed to delete quiz.');
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Global Quizzes</div>
          <div className="topbar-subtitle">Monitor and manage all quizzes created by teachers.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />
      <Popup type="success" message={success} clear={setSuccess} />

      <div className="panel">
        <div className="panel-header">All Quizzes</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-clipboard-list"></i>
            <h3>No quizzes found</h3>
            <p>Teachers have not created any quizzes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Teacher</th>
                  <th>Questions</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(q => (
                  <tr key={q.quizId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.title}</td>
                    <td>{q.teacherName}</td>
                    <td><span className="badge badge-info">{q.questionsCount} Qs</span></td>
                    <td><span className="badge badge-warn"><i className="fa-regular fa-clock" style={{marginRight: '4px'}}></i>{q.duration} mins</span></td>
                    <td>
                      <span className={`badge ${q.status === 'Published' ? 'badge-success' : 'badge-warn'}`}>
                        <i className={`fa-solid ${q.status === 'Published' ? 'fa-circle-check' : 'fa-circle-dot'}`} style={{marginRight: '4px'}}></i>
                        {q.status}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleDelete(q.quizId)} className="btn-danger" style={{ padding: '.4rem .8rem', fontSize: '.8rem' }}>
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

export default Quizzes;
