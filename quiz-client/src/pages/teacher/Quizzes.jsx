import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import { Link, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import Swal from 'sweetalert2';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchQuizzes();
  }, [location.key]);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(`/api/teacher/quizzes?t=${Date.now()}`);
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
      text: 'Do you really want to delete this quiz?',
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
      await axios.delete(`/api/teacher/delete-quiz/${id}`);
      setSuccess('Quiz deleted successfully.');
      setQuizzes(quizzes.filter(q => q.quizId !== id));
    } catch (err) {
      setError('Failed to delete quiz.');
    }
  };

  const handlePublish = async (id) => {
    setError(''); setSuccess('');
    try {
      await axios.post(`/api/teacher/publish-quiz/${id}`);
      setSuccess('Quiz published! Students can now see it.');
      setQuizzes(quizzes.map(q => q.quizId === id ? { ...q, status: 'Published' } : q));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish quiz.');
    }
  };

  const handleUnpublish = async (id) => {
    setError(''); setSuccess('');
    try {
      await axios.post(`/api/teacher/unpublish-quiz/${id}`);
      setSuccess('Quiz unpublished.');
      setQuizzes(quizzes.map(q => q.quizId === id ? { ...q, status: 'Unpublished' } : q));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unpublish quiz.');
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">My Quizzes</div>
          <div className="topbar-subtitle">Create and manage your assessments.</div>
        </div>
        <Link to="/teacher/quizzes/create" className="btn-accent">
          <i className="fa-solid fa-plus"></i> Create New Quiz
        </Link>
      </div>

      <Popup type="error" message={error} clear={setError} />
      <Popup type="success" message={success} clear={setSuccess} />

      <div className="panel">
        <div className="panel-header">Quiz Library</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-pen-to-square"></i>
            <h3>No quizzes created</h3>
            <p>You haven't created any assessments yet.</p>
            <Link to="/teacher/quizzes/create" className="btn-accent mt-2">Create Your First Quiz</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Time Limit</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(q => (
                  <tr key={q.quizId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.title}</td>
                    <td><span className="badge badge-info"><i className="fa-regular fa-clock" style={{marginRight: '4px'}}></i> {q.duration || q.timeLimitMinutes} mins</span></td>
                    <td>
                      <span className={`badge ${q.status === 'Published' ? 'badge-success' : 'badge-warn'}`}>
                        <i className={`fa-solid ${q.status === 'Published' ? 'fa-circle-check' : 'fa-pen'}`} style={{marginRight: '4px'}}></i>
                        {q.status || 'Draft'}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      {q.status === 'Published' ? (
                        <button onClick={() => handleUnpublish(q.quizId)} className="btn-outline" style={{ padding: '.4rem .8rem', fontSize: '.8rem', marginRight: '.5rem', color: '#92400E', borderColor: '#92400E' }}>
                          <i className="fa-solid fa-eye-slash"></i> Unpublish
                        </button>
                      ) : (q.questionsCount || 0) > 0 ? (
                        <button onClick={() => handlePublish(q.quizId)} className="btn-accent" style={{ padding: '.4rem .8rem', fontSize: '.8rem', marginRight: '.5rem' }}>
                          <i className="fa-solid fa-paper-plane"></i> Publish
                        </button>
                      ) : (
                        <span className="badge badge-warn" style={{ marginRight: '.5rem', fontSize: '.75rem' }}>
                          <i className="fa-solid fa-triangle-exclamation" style={{marginRight: '4px'}}></i> Add questions first
                        </span>
                      )}
                      <Link to={`/teacher/quizzes/${q.quizId}/questions`} className="btn-outline" style={{ padding: '.4rem .8rem', fontSize: '.8rem', marginRight: '.5rem' }}>
                        <i className="fa-solid fa-list-ul"></i> Questions
                      </Link>
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
