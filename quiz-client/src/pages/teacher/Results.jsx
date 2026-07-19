import React, { useEffect, useState } from 'react';
import Popup from '../../components/Popup';
import axios from '../../api/axios';

const Results = () => {
  const [stats, setStats] = useState({ averageScore: 0, highestScore: 0, lowestScore: 0, totalAttempts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/teacher/dashboard');
        setStats({
          averageScore: res.data.averageScore || 0,
          highestScore: res.data.highestScore || 0,
          lowestScore: res.data.lowestScore || 0,
          totalAttempts: res.data.totalAttempts || 0,
          leaderboard: res.data.leaderboard || []
        });
      } catch (err) {
        setError('Failed to fetch analytics.');
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
          <div className="topbar-title">Performance Analytics</div>
          <div className="topbar-subtitle">Analyze student performance across all your quizzes.</div>
        </div>
      </div>

      <Popup type="error" message={error} clear={setError} />

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="card-stat" style={{ borderTop: '4px solid #10B981' }}>
          <div className="card-stat-title">Average Score</div>
          <div className="card-stat-value">{stats.averageScore}%</div>
          <div className="card-stat-icon" style={{ background: '#D1FAE5', color: '#047857' }}><i className="fa-solid fa-chart-line"></i></div>
        </div>
        <div className="card-stat" style={{ borderTop: '4px solid var(--accent)' }}>
          <div className="card-stat-title">Highest Score</div>
          <div className="card-stat-value">{stats.highestScore}%</div>
          <div className="card-stat-icon"><i className="fa-solid fa-trophy"></i></div>
        </div>
        <div className="card-stat" style={{ borderTop: '4px solid #EF4444' }}>
          <div className="card-stat-title">Lowest Score</div>
          <div className="card-stat-value">{stats.lowestScore}%</div>
          <div className="card-stat-icon" style={{ background: '#FEE2E2', color: '#B91C1C' }}><i className="fa-solid fa-arrow-trend-down"></i></div>
        </div>
        <div className="card-stat" style={{ borderTop: '4px solid var(--yellow)' }}>
          <div className="card-stat-title">Total Attempts</div>
          <div className="card-stat-value">{stats.totalAttempts}</div>
          <div className="card-stat-icon" style={{ background: '#FEF9C3', color: '#B45309' }}><i className="fa-solid fa-users"></i></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Insights & Recommendations</div>
        <div className="panel-body">
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Overall, your students are performing well. The average score of <strong>{stats.averageScore}%</strong> indicates a solid understanding of the material across your assessments. 
            Consider reviewing the questions that lead to the lowest scores to identify areas where students might need additional instruction or where questions could be clarified.
          </p>
        </div>
      </div>
      <div className="panel" style={{ marginTop: '2rem' }}>
        <div className="panel-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <i className="fa-solid fa-ranking-star" style={{ color: 'var(--accent)' }}></i> Student Leaderboard
        </div>
        
        {!stats.leaderboard || stats.leaderboard.length === 0 ? (
          <div className="empty-state">
            <i className="fa-solid fa-users-slash"></i>
            <h3>No data available</h3>
            <p>Students have not completed any quizzes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th>Student Name</th>
                  <th style={{ textAlign: 'center' }}>Quizzes Taken</th>
                  <th style={{ textAlign: 'right' }}>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.leaderboard.map((student, index) => (
                  <tr key={student.studentId}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {index === 0 ? <span style={{ color: '#F59E0B' }}><i className="fa-solid fa-medal"></i> 1</span>
                       : index === 1 ? <span style={{ color: '#9CA3AF' }}><i className="fa-solid fa-medal"></i> 2</span>
                       : index === 2 ? <span style={{ color: '#B45309' }}><i className="fa-solid fa-medal"></i> 3</span>
                       : <span>{index + 1}</span>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.studentName}</td>
                    <td style={{ textAlign: 'center' }}>{student.quizzesTaken}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`badge ${student.averagePercentage >= 50 ? 'badge-success' : 'badge-danger'}`}>
                        {student.averagePercentage}%
                      </span>
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

export default Results;
