import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('/api/student/available-quizzes');
        setQuizzes(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Failed to fetch available quizzes.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Available Quizzes</div>
          <div className="topbar-subtitle">Choose a quiz and start testing your knowledge.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="panel">
        <div className="panel-header">Select Assessment</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-folder-open"></i>
            <h3>No quizzes available</h3>
            <p>Check back later when teachers have published new quizzes.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Teacher</th>
                  <th>Time Limit</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(q => (
                  <tr key={q.quizId}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{q.title}</td>
                    <td>{q.teacherName}</td>
                    <td><span className="badge badge-warn"><i className="fa-regular fa-clock" style={{marginRight: '4px'}}></i>{q.duration} mins</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/student/quizzes/${q.quizId}/take`} className="btn-accent" style={{ padding: '.5rem 1rem', fontSize: '.85rem' }}>
                        Start Quiz <i className="fa-solid fa-play" style={{marginLeft: '6px', fontSize: '.75rem'}}></i>
                      </Link>
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
