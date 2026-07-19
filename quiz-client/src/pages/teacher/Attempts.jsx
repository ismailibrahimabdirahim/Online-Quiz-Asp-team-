import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';

const Attempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await axios.get('/api/teacher/attempts');
        setAttempts(res.data);
      } catch (err) {
        setError('Failed to fetch attempts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Student Attempts</div>
          <div className="topbar-subtitle">Review real-time submissions and final grades from your students. 
            <strong> Attempts</strong> are the raw logs of when a student started and finished a quiz.
          </div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="panel">
        <div className="panel-header">Recent Submissions</div>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x text-accent"></i>
          </div>
        ) : attempts.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-clipboard-list"></i>
            <h3>No attempts yet</h3>
            <p>Students have not attempted your quizzes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Grade</th>
                  <th>Score</th>
                  <th>Date Attempted</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map(a => (
                  <tr key={a.attemptId}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.studentName}</td>
                    <td style={{ fontWeight: 600 }}>{a.quizTitle}</td>
                    <td style={{ fontWeight: 700, color: a.grade === 'F' ? '#DC2626' : 'var(--accent)' }}>{a.grade}</td>
                    <td>
                      <span className={`badge ${a.score >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        <i className={`fa-solid ${a.score >= 50 ? 'fa-check' : 'fa-xmark'}`} style={{marginRight: '4px'}}></i>
                        {Math.round(a.score)}%
                      </span>
                    </td>
                    <td className="text-muted">{new Date(a.startTime).toLocaleString()}</td>
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

export default Attempts;
