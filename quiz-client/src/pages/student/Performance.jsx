import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';

const Performance = () => {
  const [stats, setStats] = useState({ averageScore: 0, quizzesTaken: 0, highestScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/student/dashboard');
        // Simulate extended performance stats since backend only has basic dashboard stats currently
        setStats({
          averageScore: res.data.averageScore || 0,
          quizzesTaken: res.data.quizzesTaken || 0,
          highestScore: res.data.highestScore || 0
        });
      } catch (err) {
        setError('Failed to fetch performance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">My Performance</div>
          <div className="topbar-subtitle">Track your learning progress and improvement over time.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="card-stat" style={{ borderTop: '4px solid var(--accent)' }}>
          <div className="card-stat-title">Average Score</div>
          <div className="card-stat-value">{Math.round(stats.averageScore)}%</div>
          <div className="card-stat-icon"><i className="fa-solid fa-chart-line"></i></div>
        </div>
        <div className="card-stat" style={{ borderTop: '4px solid #10B981' }}>
          <div className="card-stat-title">Highest Score</div>
          <div className="card-stat-value">{Math.round(stats.highestScore)}%</div>
          <div className="card-stat-icon" style={{ background: '#D1FAE5', color: '#047857' }}><i className="fa-solid fa-trophy"></i></div>
        </div>
        <div className="card-stat" style={{ borderTop: '4px solid var(--yellow)' }}>
          <div className="card-stat-title">Quizzes Taken</div>
          <div className="card-stat-value">{stats.quizzesTaken}</div>
          <div className="card-stat-icon" style={{ background: '#FEF9C3', color: '#B45309' }}><i className="fa-solid fa-graduation-cap"></i></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Performance Insights</div>
        <div className="panel-body">
          {stats.quizzesTaken === 0 ? (
             <p style={{ color: 'var(--text-secondary)' }}>You need to take some quizzes before we can generate performance insights for you.</p>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                You have completed <strong>{stats.quizzesTaken}</strong> quizzes so far. With an average score of <strong>{Math.round(stats.averageScore)}%</strong>, you are doing a great job! Keep taking more quizzes to track your improvement across different subjects.
              </p>
              
              <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem' }}><i className="fa-solid fa-medal text-accent" style={{marginRight: '8px'}}></i> Next Goals</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <li>Aim to increase your average score to {Math.min(100, Math.round(stats.averageScore) + 5)}%</li>
                  <li>Complete 3 more quizzes this week</li>
                  <li>Review the questions you missed in your last attempt</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Performance;
