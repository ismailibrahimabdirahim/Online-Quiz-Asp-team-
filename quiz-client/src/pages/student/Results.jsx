import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/api/student/results');
        setResults(res.data);
      } catch (err) {
        setError('Failed to fetch results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">My Results</div>
          <div className="topbar-subtitle">Review your past quiz attempts and scores.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="panel">
        <div className="panel-header">Quiz History</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-clock-rotate-left"></i>
            <h3>No quizzes attempted</h3>
            <p>You haven't taken any quizzes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Teacher</th>
                  <th>Score</th>
                  <th>Date Attempted</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.resultId}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.quizTitle}</td>
                    <td>{r.teacherName}</td>
                    <td>
                      <span className={`badge ${r.score >= 50 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '.9rem', padding: '.4rem .8rem' }}>
                        <i className={`fa-solid ${r.score >= 50 ? 'fa-medal' : 'fa-xmark'}`} style={{marginRight: '6px'}}></i>
                        {Math.round(r.score)}%
                      </span>
                    </td>
                    <td className="text-muted">{new Date(r.attemptedAt).toLocaleString()}</td>
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

export default Results;
